/**
 * 微信 OAuth 认证核心类
 */

import { HttpClient, WechatApiError } from '@weixin-sdk/core';
import type { OAuthConfig, OAuthAccessToken, WechatUserInfo, OAuthScope } from './types.js';

const OAUTH_BASE_URL = 'https://api.weixin.qq.com/sns';

/** 微信 OAuth 认证配置 */
export interface WechatAuthOptions extends OAuthConfig {
  /** 自定义 HTTP 客户端 */
  httpClient?: HttpClient;
}

/**
 * 微信 OAuth 认证
 *
 * 支持普通公众号和第三方平台代公众号授权
 */
export class WechatAuth {
  private readonly config: OAuthConfig;
  private readonly http: HttpClient;

  constructor(options: WechatAuthOptions) {
    this.config = options;
    this.http = options.httpClient ?? new HttpClient();
  }

  /**
   * 生成授权 URL
   *
   * @param redirectUri - 授权后回调地址
   * @param scope - 授权作用域
   * @param state - 自定义状态参数
   */
  getAuthorizeURL(redirectUri: string, scope: OAuthScope = 'snsapi_base', state = ''): string {
    const params = new URLSearchParams({
      appid: this.config.appid,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      state,
    });

    // 第三方平台代公众号授权
    if (this.config.componentAppid) {
      params.set('component_appid', this.config.componentAppid);
    }

    return `https://open.weixin.qq.com/connect/oauth2/authorize?${params}#wechat_redirect`;
  }

  /**
   * 通过 code 获取 Access Token
   *
   * @param code - 授权成功后获得的 code
   */
  async getAccessToken(code: string): Promise<OAuthAccessToken> {
    // 第三方平台代公众号授权
    if (this.config.componentAppid && this.config.getComponentAccessToken) {
      const componentAccessToken = await this.config.getComponentAccessToken();

      return this.http.get<OAuthAccessToken>(`${OAUTH_BASE_URL}/oauth2/component/access_token`, {
        appid: this.config.appid,
        code,
        grant_type: 'authorization_code',
        component_appid: this.config.componentAppid,
        component_access_token: componentAccessToken,
      });
    }

    // 普通公众号授权
    return this.http.get<OAuthAccessToken>(`${OAUTH_BASE_URL}/oauth2/access_token`, {
      appid: this.config.appid,
      secret: this.config.appsecret,
      code,
      grant_type: 'authorization_code',
    });
  }

  /**
   * 刷新 Access Token
   *
   * @param refreshToken - Refresh Token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthAccessToken> {
    // 第三方平台代公众号授权
    if (this.config.componentAppid && this.config.getComponentAccessToken) {
      const componentAccessToken = await this.config.getComponentAccessToken();

      return this.http.get<OAuthAccessToken>(`${OAUTH_BASE_URL}/oauth2/component/refresh_token`, {
        appid: this.config.appid,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        component_appid: this.config.componentAppid,
        component_access_token: componentAccessToken,
      });
    }

    // 普通公众号授权
    return this.http.get<OAuthAccessToken>(`${OAUTH_BASE_URL}/oauth2/refresh_token`, {
      appid: this.config.appid,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  /**
   * 获取用户信息
   *
   * @param accessToken - OAuth Access Token
   * @param openid - 用户 OpenID
   * @param lang - 语言
   */
  async getUserInfo(
    accessToken: string,
    openid: string,
    lang: 'zh_CN' | 'zh_TW' | 'en' = 'zh_CN',
  ): Promise<WechatUserInfo> {
    return this.http.get<WechatUserInfo>(`${OAUTH_BASE_URL}/userinfo`, {
      access_token: accessToken,
      openid,
      lang,
    });
  }

  /**
   * 检验 Access Token 是否有效
   *
   * @param accessToken - OAuth Access Token
   * @param openid - 用户 OpenID
   */
  async checkAccessToken(accessToken: string, openid: string): Promise<boolean> {
    try {
      await this.http.get(`${OAUTH_BASE_URL}/auth`, {
        access_token: accessToken,
        openid,
      });
      return true;
    } catch (error) {
      if (error instanceof WechatApiError) {
        return false;
      }
      throw error;
    }
  }
}
