/**
 * 微信 OAuth 认证类型定义
 */

/** OAuth 配置 */
export interface OAuthConfig {
  /** 公众号/小程序 AppID */
  appid: string;
  /** 公众号/小程序 AppSecret */
  appsecret: string;
  /** 第三方平台 AppID（代公众号授权时使用） */
  componentAppid?: string;
  /** 第三方平台 Access Token 获取函数 */
  getComponentAccessToken?: () => Promise<string>;
}

/** 微信用户信息 */
export interface WechatUserInfo {
  /** OpenID */
  openid: string;
  /** UnionID（需要绑定开放平台） */
  unionid?: string;
  /** 昵称 */
  nickname?: string;
  /** 头像 URL */
  headimgurl?: string;
  /** 性别 (0: 未知, 1: 男, 2: 女) */
  sex?: number;
  /** 省份 */
  province?: string;
  /** 城市 */
  city?: string;
  /** 国家 */
  country?: string;
  /** 用户特权信息 */
  privilege?: string[];
}

/** OAuth Access Token */
export interface OAuthAccessToken {
  /** Access Token */
  access_token: string;
  /** 有效期（秒） */
  expires_in: number;
  /** Refresh Token */
  refresh_token: string;
  /** OpenID */
  openid: string;
  /** 授权作用域 */
  scope: string;
  /** UnionID */
  unionid?: string;
}

/** 授权作用域 */
export type OAuthScope = 'snsapi_base' | 'snsapi_userinfo';
