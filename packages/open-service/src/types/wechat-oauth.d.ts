/**
 * wechat-oauth 类型声明
 */
declare module 'wechat-oauth' {
  export interface OAuthToken {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    openid: string;
    scope: string;
    create_at?: number;
  }

  export interface UserInfo {
    openid: string;
    nickname: string;
    sex: number;
    province: string;
    city: string;
    country: string;
    headimgurl: string;
    privilege: string[];
    unionid?: string;
  }

  type Callback<T> = (err: Error | null, result?: T) => void;

  class OAuth {
    constructor(
      appid: string,
      appsecret?: string | null,
      getToken?: (openid: string, callback: Callback<OAuthToken>) => void,
      saveToken?: (openid: string, token: OAuthToken, callback: Callback<void>) => void,
    );

    request(url: string, opts: unknown, callback: Callback<unknown>): void;

    getAuthorizeURL(redirect: string, state?: string, scope?: string): string;
    getAccessToken(code: string, callback: Callback<{ data: OAuthToken }>): void;
    refreshAccessToken(refreshToken: string, callback: Callback<{ data: OAuthToken }>): void;
    getUser(openid: string, callback: Callback<UserInfo>): void;
    getUserByCode(code: string, callback: Callback<UserInfo>): void;
    verifyToken(openid: string, accessToken: string, callback: Callback<boolean>): void;
    saveToken(openid: string, token: OAuthToken, callback: Callback<void>): void;
    getToken(openid: string, callback: Callback<OAuthToken>): void;
  }

  export = OAuth;
}
