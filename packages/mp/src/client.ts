/**
 * 微信公众号 SDK 客户端
 */

import { HttpClient, WechatApiError, calculateExpireTime, isTokenValid } from '@weixin-sdk/core';
import createDebug from 'debug';
import type { AccessToken, WechatMPOptions } from './types.js';
import { UserAPI } from './api/user.js';
import { MenuAPI } from './api/menu.js';
import { TemplateAPI } from './api/template.js';
import { JssdkAPI } from './api/jssdk.js';
import { MediaAPI } from './api/media.js';
import { CustomerServiceAPI } from './api/customer-service.js';

const debug = createDebug('weixin-sdk:mp');

const API_BASE = 'https://api.weixin.qq.com';

/** Token 缓冲时间（秒） */
const TOKEN_BUFFER = 10;

/**
 * 微信公众号 SDK
 *
 * @example
 * ```typescript
 * const mp = new WechatMP({
 *   appid: 'wx...',
 *   secret: '...',
 * });
 *
 * // 获取用户信息
 * const user = await mp.user.get('openid');
 *
 * // 发送模板消息
 * await mp.template.send({
 *   touser: 'openid',
 *   template_id: 'template_id',
 *   data: { ... }
 * });
 * ```
 */
export class WechatMP {
  private readonly http: HttpClient;
  private readonly options: WechatMPOptions;
  private tokenCache: AccessToken | null = null;

  /** 用户管理 */
  readonly user: UserAPI;
  /** 菜单管理 */
  readonly menu: MenuAPI;
  /** 模板消息 */
  readonly template: TemplateAPI;
  /** JS-SDK */
  readonly jssdk: JssdkAPI;
  /** 素材管理 */
  readonly media: MediaAPI;
  /** 客服消息 */
  readonly customerService: CustomerServiceAPI;

  constructor(options: WechatMPOptions) {
    if (!options.appid || !options.secret) {
      throw new Error('appid and secret are required');
    }

    this.options = options;
    this.http = new HttpClient({ baseURL: API_BASE });

    // 初始化子 API
    this.user = new UserAPI(this);
    this.menu = new MenuAPI(this);
    this.template = new TemplateAPI(this);
    this.jssdk = new JssdkAPI(this);
    this.media = new MediaAPI(this);
    this.customerService = new CustomerServiceAPI(this);
  }

  /**
   * 获取 Access Token
   */
  async getAccessToken(): Promise<string> {
    // 尝试从外部缓存获取
    if (this.options.getToken) {
      const cached = await this.options.getToken();
      if (cached && isTokenValid(cached)) {
        return cached.accessToken;
      }
    }

    // 尝试从内存缓存获取
    if (this.tokenCache && isTokenValid(this.tokenCache)) {
      return this.tokenCache.accessToken;
    }

    // 请求新 Token
    const token = await this.refreshAccessToken();
    return token.accessToken;
  }

  /**
   * 刷新 Access Token
   */
  async refreshAccessToken(): Promise<AccessToken> {
    const { appid, secret } = this.options;

    const result = await this.http.get<{
      access_token: string;
      expires_in: number;
    }>('/cgi-bin/token', {
      grant_type: 'client_credential',
      appid,
      secret,
    });

    const token: AccessToken = {
      accessToken: result.access_token,
      expireTime: calculateExpireTime(result.expires_in, TOKEN_BUFFER),
    };

    debug('refreshed access token, expires at %d', token.expireTime);

    // 保存到缓存
    this.tokenCache = token;
    if (this.options.saveToken) {
      await this.options.saveToken(token);
    }

    return token;
  }

  /**
   * 发起 API 请求（自动携带 access_token）
   */
  async request<T>(method: 'GET' | 'POST', path: string, data?: object): Promise<T> {
    const accessToken = await this.getAccessToken();

    try {
      if (method === 'GET') {
        return await this.http.get<T>(path, { access_token: accessToken, ...data });
      } else {
        return await this.http.post<T>(path, data, { access_token: accessToken });
      }
    } catch (error) {
      // Token 过期重试
      if (error instanceof WechatApiError && [40001, 40014, 42001].includes(error.code)) {
        debug('token expired, refreshing and retrying');
        await this.refreshAccessToken();
        const newToken = await this.getAccessToken();

        if (method === 'GET') {
          return await this.http.get<T>(path, { access_token: newToken, ...data });
        } else {
          return await this.http.post<T>(path, data, { access_token: newToken });
        }
      }
      throw error;
    }
  }

  /**
   * GET 请求
   */
  get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>('GET', path, params);
  }

  /**
   * POST 请求
   */
  post<T>(path: string, data?: object): Promise<T> {
    return this.request<T>('POST', path, data);
  }
}
