/**
 * JS-SDK API
 */

import { createHash, randomBytes } from 'node:crypto';
import type { WechatMP } from '../client.js';
import type { JssdkConfig } from '../types.js';

/** Ticket 缓存 */
interface TicketCache {
  ticket: string;
  expireTime: number;
}

/**
 * JS-SDK API
 */
export class JssdkAPI {
  private ticketCache: TicketCache | null = null;

  constructor(private client: WechatMP) {}

  /**
   * 获取 JS-SDK ticket
   */
  async getTicket(): Promise<string> {
    // 检查缓存
    if (this.ticketCache && Date.now() < this.ticketCache.expireTime) {
      return this.ticketCache.ticket;
    }

    const result = await this.client.get<{
      ticket: string;
      expires_in: number;
    }>('/cgi-bin/ticket/getticket', { type: 'jsapi' });

    this.ticketCache = {
      ticket: result.ticket,
      expireTime: Date.now() + (result.expires_in - 10) * 1000,
    };

    return result.ticket;
  }

  /**
   * 生成 JS-SDK 配置
   *
   * @param url - 当前页面 URL（不含 # 及其后面部分）
   */
  async getConfig(url: string): Promise<JssdkConfig> {
    const ticket = await this.getTicket();
    const nonceStr = randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);

    const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
    const signature = createHash('sha1').update(str).digest('hex');

    return {
      appId: (this.client as unknown as { options: { appid: string } }).options.appid,
      timestamp,
      nonceStr,
      signature,
    };
  }
}
