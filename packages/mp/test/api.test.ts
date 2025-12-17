import { describe, it, expect } from 'vitest';
import { WechatMP } from '../src/index.js';

describe('WechatMP', () => {
  describe('constructor', () => {
    it('should create instance with appid and secret', () => {
      const mp = new WechatMP({
        appid: 'wx1234567890',
        secret: 'testsecret',
      });
      expect(mp).toBeDefined();
    });

    it('should throw error without appid or secret', () => {
      expect(() => new WechatMP({ appid: '', secret: '' })).toThrow(
        'appid and secret are required',
      );
    });
  });

  describe('API modules', () => {
    const mp = new WechatMP({
      appid: 'wx1234567890',
      secret: 'testsecret',
    });

    it('should have user API', () => {
      expect(mp.user).toBeDefined();
      expect(mp.user.tags).toBeDefined();
      expect(typeof mp.user.get).toBe('function');
      expect(typeof mp.user.list).toBe('function');
      expect(typeof mp.user.batchGet).toBe('function');
    });

    it('should have menu API', () => {
      expect(mp.menu).toBeDefined();
      expect(typeof mp.menu.create).toBe('function');
      expect(typeof mp.menu.get).toBe('function');
      expect(typeof mp.menu.delete).toBe('function');
    });

    it('should have template API', () => {
      expect(mp.template).toBeDefined();
      expect(typeof mp.template.send).toBe('function');
      expect(typeof mp.template.list).toBe('function');
    });

    it('should have jssdk API', () => {
      expect(mp.jssdk).toBeDefined();
      expect(typeof mp.jssdk.getTicket).toBe('function');
      expect(typeof mp.jssdk.getConfig).toBe('function');
    });

    it('should have media API', () => {
      expect(mp.media).toBeDefined();
      expect(typeof mp.media.getCount).toBe('function');
      expect(typeof mp.media.list).toBe('function');
    });

    it('should have customerService API', () => {
      expect(mp.customerService).toBeDefined();
      expect(typeof mp.customerService.send).toBe('function');
      expect(typeof mp.customerService.sendText).toBe('function');
    });
  });
});
