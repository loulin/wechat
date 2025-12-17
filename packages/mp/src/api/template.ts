/**
 * 模板消息 API
 */

import type { WechatMP } from '../client.js';
import type { TemplateMessageRequest } from '../types.js';

/** 模板信息 */
export interface Template {
  template_id: string;
  title: string;
  primary_industry: string;
  deputy_industry: string;
  content: string;
  example: string;
}

/**
 * 模板消息 API
 */
export class TemplateAPI {
  constructor(private client: WechatMP) {}

  /**
   * 设置所属行业
   */
  async setIndustry(industryId1: string, industryId2: string): Promise<void> {
    await this.client.post('/cgi-bin/template/api_set_industry', {
      industry_id1: industryId1,
      industry_id2: industryId2,
    });
  }

  /**
   * 获取设置的行业信息
   */
  async getIndustry(): Promise<{
    primary_industry: { first_class: string; second_class: string };
    secondary_industry: { first_class: string; second_class: string };
  }> {
    return this.client.get('/cgi-bin/template/get_industry');
  }

  /**
   * 获得模板 ID
   */
  async addTemplate(templateIdShort: string): Promise<{ template_id: string }> {
    return this.client.post('/cgi-bin/template/api_add_template', {
      template_id_short: templateIdShort,
    });
  }

  /**
   * 获取模板列表
   */
  async list(): Promise<{ template_list: Template[] }> {
    return this.client.get('/cgi-bin/template/get_all_private_template');
  }

  /**
   * 删除模板
   */
  async delete(templateId: string): Promise<void> {
    await this.client.post('/cgi-bin/template/del_private_template', {
      template_id: templateId,
    });
  }

  /**
   * 发送模板消息
   */
  async send(message: TemplateMessageRequest): Promise<{ msgid: number }> {
    return this.client.post('/cgi-bin/message/template/send', message);
  }
}
