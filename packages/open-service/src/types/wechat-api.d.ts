/**
 * wechat-api 类型声明
 */
declare module 'wechat-api' {
  export interface AccessToken {
    accessToken: string;
    expireTime: number;
    refreshToken?: string;
  }

  export namespace AccessToken {
    function isValid(this: AccessToken): boolean;
  }

  type Callback<T> = (err: Error | null, result?: T) => void;

  export interface APIOptions {
    getToken?: (callback: Callback<AccessToken>) => void;
    saveToken?: (token: AccessToken, callback: Callback<void>) => void;
  }

  class API {
    constructor(
      appid: string,
      appsecret?: string | null,
      getToken?: (callback: Callback<AccessToken>) => void,
      saveToken?: (token: AccessToken, callback: Callback<void>) => void,
    );

    appid: string;
    token?: AccessToken;

    static AccessToken: new (
      accessToken: string,
      expireTime: number,
      refreshToken?: string,
    ) => AccessToken & { isValid(): boolean };

    getAccessToken(callback: Callback<AccessToken>): void;
    getToken(callback: Callback<AccessToken | undefined>): void;
    saveToken(token: AccessToken, callback: Callback<void>): void;

    // Promisified versions (动态添加)
    getTokenAsync?: () => Promise<AccessToken | undefined>;
    saveTokenAsync?: (token: AccessToken) => Promise<void>;

    // 其他常用 API 方法
    getUser(openid: string, callback: Callback<unknown>): void;
    batchGetUsers(openids: string[], callback: Callback<unknown>): void;
    createMenu(menu: unknown, callback: Callback<unknown>): void;
    getMenu(callback: Callback<unknown>): void;
    removeMenu(callback: Callback<unknown>): void;
    sendText(openid: string, text: string, callback: Callback<unknown>): void;
    sendImage(openid: string, mediaId: string, callback: Callback<unknown>): void;
    sendVoice(openid: string, mediaId: string, callback: Callback<unknown>): void;
    sendVideo(
      openid: string,
      mediaId: string,
      thumbMediaId: string,
      callback: Callback<unknown>,
    ): void;
    sendMusic(openid: string, music: unknown, callback: Callback<unknown>): void;
    sendNews(openid: string, articles: unknown[], callback: Callback<unknown>): void;

    // JS-SDK
    getJsConfig(param: unknown, callback: Callback<unknown>): void;
    getTicket(type: string, callback: Callback<unknown>): void;
  }

  export = API;
}

declare module 'wechat-api/lib/util' {
  export function wrapper<T>(
    callback: (err: Error | null, data?: T, res?: unknown) => void,
  ): (err: Error | null, data?: T, res?: unknown) => void;
  export function postJSON(data: unknown): {
    method: string;
    data: string;
    headers: Record<string, string>;
    dataType: string;
  };
  export function make<T>(proto: T, name: string, fn: (...args: unknown[]) => void): void;
}
