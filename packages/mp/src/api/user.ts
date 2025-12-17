/**
 * 用户管理 API
 */

import type { WechatMP } from '../client.js';
import type { UserInfo, UserListResult, Tag } from '../types.js';

/**
 * 用户标签 API
 */
export class UserTagsAPI {
  constructor(private client: WechatMP) {}

  /**
   * 获取所有标签
   */
  async list(): Promise<{ tags: Tag[] }> {
    return this.client.get('/cgi-bin/tags/get');
  }

  /**
   * 创建标签
   */
  async create(name: string): Promise<{ tag: Tag }> {
    return this.client.post('/cgi-bin/tags/create', { tag: { name } });
  }

  /**
   * 编辑标签
   */
  async update(id: number, name: string): Promise<void> {
    await this.client.post('/cgi-bin/tags/update', { tag: { id, name } });
  }

  /**
   * 删除标签
   */
  async delete(id: number): Promise<void> {
    await this.client.post('/cgi-bin/tags/delete', { tag: { id } });
  }

  /**
   * 获取标签下的用户列表
   */
  async getUsers(tagId: number, nextOpenid?: string): Promise<UserListResult> {
    return this.client.post('/cgi-bin/user/tag/get', {
      tagid: tagId,
      next_openid: nextOpenid ?? '',
    });
  }

  /**
   * 批量为用户打标签
   */
  async batchTag(openidList: string[], tagId: number): Promise<void> {
    await this.client.post('/cgi-bin/tags/members/batchtagging', {
      openid_list: openidList,
      tagid: tagId,
    });
  }

  /**
   * 批量为用户取消标签
   */
  async batchUntag(openidList: string[], tagId: number): Promise<void> {
    await this.client.post('/cgi-bin/tags/members/batchuntagging', {
      openid_list: openidList,
      tagid: tagId,
    });
  }

  /**
   * 获取用户身上的标签列表
   */
  async getTagsOfUser(openid: string): Promise<{ tagid_list: number[] }> {
    return this.client.post('/cgi-bin/tags/getidlist', { openid });
  }
}

/**
 * 用户管理 API
 */
export class UserAPI {
  /** 用户标签管理 */
  readonly tags: UserTagsAPI;

  constructor(private client: WechatMP) {
    this.tags = new UserTagsAPI(client);
  }

  /**
   * 获取用户基本信息
   *
   * @param openid - 用户 OpenID
   * @param lang - 语言，默认 zh_CN
   */
  async get(openid: string, lang: 'zh_CN' | 'zh_TW' | 'en' = 'zh_CN'): Promise<UserInfo> {
    return this.client.get('/cgi-bin/user/info', { openid, lang });
  }

  /**
   * 批量获取用户信息
   *
   * @param openids - OpenID 列表
   * @param lang - 语言
   */
  async batchGet(
    openids: string[],
    lang: 'zh_CN' | 'zh_TW' | 'en' = 'zh_CN',
  ): Promise<{ user_info_list: UserInfo[] }> {
    return this.client.post('/cgi-bin/user/info/batchget', {
      user_list: openids.map((openid) => ({ openid, lang })),
    });
  }

  /**
   * 获取关注者列表
   *
   * @param nextOpenid - 第一个拉取的 OpenID，不填默认从头开始
   */
  async list(nextOpenid?: string): Promise<UserListResult> {
    return this.client.get('/cgi-bin/user/get', {
      next_openid: nextOpenid ?? '',
    });
  }

  /**
   * 设置用户备注名
   */
  async updateRemark(openid: string, remark: string): Promise<void> {
    await this.client.post('/cgi-bin/user/info/updateremark', { openid, remark });
  }

  /**
   * 获取公众号的黑名单列表
   */
  async getBlacklist(beginOpenid?: string): Promise<UserListResult> {
    return this.client.post('/cgi-bin/tags/members/getblacklist', {
      begin_openid: beginOpenid ?? '',
    });
  }

  /**
   * 拉黑用户
   */
  async batchBlacklist(openidList: string[]): Promise<void> {
    await this.client.post('/cgi-bin/tags/members/batchblacklist', {
      openid_list: openidList,
    });
  }

  /**
   * 取消拉黑用户
   */
  async batchUnblacklist(openidList: string[]): Promise<void> {
    await this.client.post('/cgi-bin/tags/members/batchunblacklist', {
      openid_list: openidList,
    });
  }
}
