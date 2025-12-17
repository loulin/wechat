/**
 * 微信消息加解密工具
 *
 * 实现微信开放平台消息加解密算法
 * @see https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Scheme.html
 */

import { createCipheriv, createDecipheriv, randomBytes, type CipherGCMTypes } from 'node:crypto';

/** 加解密配置 */
export interface WechatCryptoOptions {
  /** 第三方平台/公众号的 appid */
  appid: string;
  /** 消息加解密 Key（43 个字符，Base64 编码后为 32 字节） */
  encodingAESKey: string;
  /** 消息校验 Token */
  token: string;
}

/**
 * 微信消息加解密工具
 *
 * 用于处理微信推送的加密消息
 */
export class WechatCrypto {
  private readonly appid: string;
  private readonly aesKey: Buffer;
  private readonly iv: Buffer;

  constructor(options: WechatCryptoOptions) {
    this.appid = options.appid;
    // Base64 解码 encodingAESKey（需要补上 '='）
    this.aesKey = Buffer.from(options.encodingAESKey + '=', 'base64');
    // IV 是 AES Key 的前 16 字节
    this.iv = this.aesKey.subarray(0, 16);
  }

  /**
   * 加密消息
   *
   * @param plaintext - 明文消息
   * @returns Base64 编码的密文
   */
  encrypt(plaintext: string): string {
    // 16 字节随机串
    const random = randomBytes(16);
    // 消息内容
    const msg = Buffer.from(plaintext);
    // 消息长度（4 字节网络字节序）
    const msgLen = Buffer.alloc(4);
    msgLen.writeUInt32BE(msg.length);
    // appid
    const appidBuf = Buffer.from(this.appid);

    // 拼接：random(16) + msgLen(4) + msg + appid
    const plain = Buffer.concat([random, msgLen, msg, appidBuf]);

    // PKCS7 填充
    const padLen = 32 - (plain.length % 32);
    const pad = Buffer.alloc(padLen, padLen);
    const padded = Buffer.concat([plain, pad]);

    // AES-256-CBC 加密
    const cipher = createCipheriv('aes-256-cbc' as CipherGCMTypes, this.aesKey, this.iv);
    cipher.setAutoPadding(false);

    const encrypted = Buffer.concat([cipher.update(padded), cipher.final()]);

    return encrypted.toString('base64');
  }

  /**
   * 解密消息
   *
   * @param ciphertext - Base64 编码的密文
   * @returns 解密后的明文消息
   * @throws 如果 appid 不匹配
   */
  decrypt(ciphertext: string): string {
    const encrypted = Buffer.from(ciphertext, 'base64');

    // AES-256-CBC 解密
    const decipher = createDecipheriv('aes-256-cbc' as CipherGCMTypes, this.aesKey, this.iv);
    decipher.setAutoPadding(false);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    // 去除 PKCS7 填充
    const padLen = decrypted[decrypted.length - 1]!;
    const unpadded = decrypted.subarray(0, decrypted.length - padLen);

    // 跳过 16 字节随机串
    // 读取消息长度（4 字节）
    const msgLen = unpadded.readUInt32BE(16);
    // 提取消息内容
    const msg = unpadded.subarray(20, 20 + msgLen);
    // 提取 appid
    const appid = unpadded.subarray(20 + msgLen).toString();

    // 验证 appid
    if (appid !== this.appid) {
      throw new Error(`AppID mismatch: expected ${this.appid}, got ${appid}`);
    }

    return msg.toString();
  }
}
