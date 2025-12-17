/**
 * 微信签名工具
 */

import { createHash, type BinaryLike } from 'node:crypto';

/** 签名配置 */
export interface SignOptions {
  /** 时间戳 */
  timestamp: string;
  /** 随机字符串 */
  nonce: string;
  /** Token */
  token: string;
  /** 加密消息（可选） */
  encrypt?: string;
}

/**
 * 生成 SHA1 签名
 *
 * @param params - 待签名参数
 */
export function sign(options: SignOptions): string {
  const { timestamp, nonce, token, encrypt } = options;

  const params = encrypt ? [token, timestamp, nonce, encrypt] : [token, timestamp, nonce];

  // 字典序排序后拼接
  const str = params.sort().join('');

  return sha1(str);
}

/**
 * 验证签名
 *
 * @param signature - 待验证的签名
 * @param options - 签名参数
 */
export function verifySign(signature: string, options: SignOptions): boolean {
  return sign(options) === signature;
}

/**
 * 计算 SHA1 哈希
 */
function sha1(data: BinaryLike): string {
  return createHash('sha1').update(data).digest('hex');
}
