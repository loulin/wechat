import { describe, it, expect } from 'vitest';
import {
  WechatApiError,
  isWechatError,
  sign,
  verifySign,
  isTokenValid,
  calculateExpireTime,
} from '../src/index.js';

describe('WechatApiError', () => {
  it('should create error with code and message', () => {
    const error = new WechatApiError(40001, 'access_token 无效');
    expect(error.code).toBe(40001);
    expect(error.originalMessage).toBe('access_token 无效');
    expect(error.message).toBe('[40001] access_token 无效');
    expect(error.name).toBe('WechatApiError');
  });

  it('should serialize to JSON', () => {
    const error = new WechatApiError(42001, 'token 超时');
    const json = error.toJSON();
    expect(json).toEqual({
      name: 'WechatApiError',
      code: 42001,
      message: 'token 超时',
    });
  });
});

describe('isWechatError', () => {
  it('should return true for error response', () => {
    expect(isWechatError({ errcode: 40001, errmsg: 'error' })).toBe(true);
  });

  it('should return false for success response', () => {
    expect(isWechatError({ errcode: 0, errmsg: 'ok' })).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(isWechatError(null)).toBe(false);
    expect(isWechatError('string')).toBe(false);
  });
});

describe('sign', () => {
  it('should generate consistent signature', () => {
    const options = {
      timestamp: '1234567890',
      nonce: 'abc123',
      token: 'testtoken',
    };
    const sig1 = sign(options);
    const sig2 = sign(options);
    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(40); // SHA1 hex length
  });

  it('should verify signature correctly', () => {
    const options = {
      timestamp: '1234567890',
      nonce: 'abc123',
      token: 'testtoken',
    };
    const sig = sign(options);
    expect(verifySign(sig, options)).toBe(true);
    expect(verifySign('wrongsig', options)).toBe(false);
  });
});

describe('Token utilities', () => {
  it('isTokenValid should check expireTime', () => {
    expect(isTokenValid(null)).toBe(false);
    expect(isTokenValid(undefined)).toBe(false);
    expect(isTokenValid({ accessToken: 'test', expireTime: Date.now() - 1000 })).toBe(false);
    expect(isTokenValid({ accessToken: 'test', expireTime: Date.now() + 10000 })).toBe(true);
  });

  it('calculateExpireTime should compute correct timestamp', () => {
    const now = Date.now();
    const expireTime = calculateExpireTime(7200);
    // Should be roughly 7200 - 10 = 7190 seconds from now
    expect(expireTime).toBeGreaterThan(now + 7180 * 1000);
    expect(expireTime).toBeLessThan(now + 7200 * 1000);
  });
});
