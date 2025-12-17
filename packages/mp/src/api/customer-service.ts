/**
 * 客服消息 API
 */

import type { WechatMP } from '../client.js';

/** 客服账号信息 */
export interface KfAccount {
  kf_account: string;
  kf_nick: string;
  kf_id: number;
  kf_headimgurl?: string;
}

/** 客服消息基础结构 */
interface BaseMessage {
  touser: string;
}

/** 文本消息 */
interface TextMessage extends BaseMessage {
  msgtype: 'text';
  text: { content: string };
}

/** 图片消息 */
interface ImageMessage extends BaseMessage {
  msgtype: 'image';
  image: { media_id: string };
}

/** 语音消息 */
interface VoiceMessage extends BaseMessage {
  msgtype: 'voice';
  voice: { media_id: string };
}

/** 视频消息 */
interface VideoMessage extends BaseMessage {
  msgtype: 'video';
  video: {
    media_id: string;
    thumb_media_id?: string;
    title?: string;
    description?: string;
  };
}

/** 音乐消息 */
interface MusicMessage extends BaseMessage {
  msgtype: 'music';
  music: {
    title?: string;
    description?: string;
    musicurl: string;
    hqmusicurl?: string;
    thumb_media_id: string;
  };
}

/** 图文消息 */
interface NewsMessage extends BaseMessage {
  msgtype: 'news';
  news: {
    articles: Array<{
      title: string;
      description: string;
      url: string;
      picurl?: string;
    }>;
  };
}

/** 小程序卡片消息 */
interface MiniprogramMessage extends BaseMessage {
  msgtype: 'miniprogrampage';
  miniprogrampage: {
    title: string;
    appid: string;
    pagepath: string;
    thumb_media_id: string;
  };
}

export type CustomerMessage =
  | TextMessage
  | ImageMessage
  | VoiceMessage
  | VideoMessage
  | MusicMessage
  | NewsMessage
  | MiniprogramMessage;

/**
 * 客服消息 API
 */
export class CustomerServiceAPI {
  constructor(private client: WechatMP) {}

  /**
   * 获取所有客服账号
   */
  async list(): Promise<{ kf_list: KfAccount[] }> {
    return this.client.get('/cgi-bin/customservice/getkflist');
  }

  /**
   * 获取在线客服列表
   */
  async getOnlineList(): Promise<{ kf_online_list: KfAccount[] }> {
    return this.client.get('/cgi-bin/customservice/getonlinekflist');
  }

  /**
   * 添加客服账号
   */
  async add(kfAccount: string, nickname: string): Promise<void> {
    await this.client.post('/customservice/kfaccount/add', {
      kf_account: kfAccount,
      nickname,
    });
  }

  /**
   * 修改客服账号
   */
  async update(kfAccount: string, nickname: string): Promise<void> {
    await this.client.post('/customservice/kfaccount/update', {
      kf_account: kfAccount,
      nickname,
    });
  }

  /**
   * 删除客服账号
   */
  async delete(kfAccount: string): Promise<void> {
    await this.client.get('/customservice/kfaccount/del', {
      kf_account: kfAccount,
    });
  }

  /**
   * 发送客服消息
   */
  async send(message: CustomerMessage): Promise<void> {
    await this.client.post('/cgi-bin/message/custom/send', message);
  }

  /**
   * 发送文本消息（便捷方法）
   */
  async sendText(touser: string, content: string): Promise<void> {
    await this.send({ touser, msgtype: 'text', text: { content } });
  }

  /**
   * 发送图片消息（便捷方法）
   */
  async sendImage(touser: string, mediaId: string): Promise<void> {
    await this.send({ touser, msgtype: 'image', image: { media_id: mediaId } });
  }

  /**
   * 客服输入状态
   */
  async typing(touser: string, command: 'Typing' | 'CancelTyping' = 'Typing'): Promise<void> {
    await this.client.post('/cgi-bin/message/custom/typing', { touser, command });
  }
}
