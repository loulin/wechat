/**
 * 菜单管理 API
 */

import type { WechatMP } from '../client.js';
import type { Menu, MenuButton } from '../types.js';

/**
 * 菜单管理 API
 */
export class MenuAPI {
  constructor(private client: WechatMP) {}

  /**
   * 创建自定义菜单
   */
  async create(buttons: MenuButton[]): Promise<void> {
    await this.client.post('/cgi-bin/menu/create', { button: buttons });
  }

  /**
   * 获取自定义菜单配置
   */
  async get(): Promise<{ menu: Menu }> {
    return this.client.get('/cgi-bin/menu/get');
  }

  /**
   * 删除自定义菜单
   */
  async delete(): Promise<void> {
    await this.client.get('/cgi-bin/menu/delete');
  }

  /**
   * 获取自定义菜单配置（包含默认菜单和个性化菜单）
   */
  async getCurrentSelfMenuInfo(): Promise<{
    is_menu_open: 0 | 1;
    selfmenu_info: { button: MenuButton[] };
  }> {
    return this.client.get('/cgi-bin/get_current_selfmenu_info');
  }

  /**
   * 创建个性化菜单
   */
  async addConditional(
    buttons: MenuButton[],
    matchrule: {
      tag_id?: string;
      client_platform_type?: string;
      language?: string;
    },
  ): Promise<{ menuid: string }> {
    return this.client.post('/cgi-bin/menu/addconditional', {
      button: buttons,
      matchrule,
    });
  }

  /**
   * 删除个性化菜单
   */
  async deleteConditional(menuId: string): Promise<void> {
    await this.client.post('/cgi-bin/menu/delconditional', { menuid: menuId });
  }

  /**
   * 测试个性化菜单匹配结果
   */
  async tryMatch(userId: string): Promise<{ button: MenuButton[] }> {
    return this.client.post('/cgi-bin/menu/trymatch', { user_id: userId });
  }
}
