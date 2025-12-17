/**
 * passport-wechat 类型声明
 */
declare module 'passport-wechat' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  import type OAuth from 'wechat-oauth';

  export interface WechatStrategyOptions {
    name?: string;
    appID: string;
    appSecret: string;
    client?: 'wechat' | 'web';
    callbackURL?: string;
    scope?: 'snsapi_base' | 'snsapi_userinfo';
    state?: string;
    getToken?: (openid: string, callback: (err: Error | null, token?: unknown) => void) => void;
    saveToken?: (openid: string, token: unknown, callback: (err: Error | null) => void) => void;
  }

  export interface WechatProfile {
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

  export type VerifyCallback = (
    err: Error | null,
    user?: Express.User | false,
    info?: object,
  ) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: WechatProfile,
    expiresIn: number,
    done: VerifyCallback,
  ) => void;

  class WechatStrategy extends PassportStrategy {
    constructor(options: WechatStrategyOptions, verify: VerifyFunction);

    name: string;
    _oauth: OAuth;

    authenticate(req: Express.Request, options?: unknown): void;
  }

  export = WechatStrategy;
}
