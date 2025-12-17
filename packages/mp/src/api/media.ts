/**
 * 素材管理 API
 */

import type { WechatMP } from '../client.js';
import type { MediaType } from '../types.js';

/** 素材统计 */
export interface MediaCount {
  voice_count: number;
  video_count: number;
  image_count: number;
  news_count: number;
}

/** 素材项 */
export interface MediaItem {
  media_id: string;
  name: string;
  update_time: number;
  url?: string;
}

/**
 * 素材管理 API
 */
export class MediaAPI {
  constructor(private client: WechatMP) {}

  /**
   * 获取素材总数
   */
  async getCount(): Promise<MediaCount> {
    return this.client.get('/cgi-bin/material/get_materialcount');
  }

  /**
   * 获取素材列表
   */
  async list(
    type: MediaType,
    offset = 0,
    count = 20,
  ): Promise<{
    total_count: number;
    item_count: number;
    item: MediaItem[];
  }> {
    return this.client.post('/cgi-bin/material/batchget_material', {
      type,
      offset,
      count,
    });
  }

  /**
   * 获取永久素材
   */
  async get(mediaId: string): Promise<unknown> {
    return this.client.post('/cgi-bin/material/get_material', {
      media_id: mediaId,
    });
  }

  /**
   * 删除永久素材
   */
  async delete(mediaId: string): Promise<void> {
    await this.client.post('/cgi-bin/material/del_material', {
      media_id: mediaId,
    });
  }

  /**
   * 获取临时素材
   */
  async getTemp(mediaId: string): Promise<unknown> {
    return this.client.get('/cgi-bin/media/get', { media_id: mediaId });
  }
}
