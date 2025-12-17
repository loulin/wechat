/**
 * 微信开放平台第三方平台服务
 *
 * 提供缓存、分布式锁和微信 API 集成
 */

import { promisify } from 'util';
import { WechatComponent } from '@weixin-sdk/open';
import type { ComponentConfig, ComponentAccessToken } from '@weixin-sdk/open';
import API from 'wechat-api';
import OAuth from 'wechat-oauth';
import WechatStrategy from 'passport-wechat';
import type { WechatStrategyOptions, VerifyFunction } from 'passport-wechat';
import createDebug from 'debug';
import type { Cache } from 'cache-manager';

import { getCache, type CacheOptions, type RedisClientConfig } from './cache.js';
import { getLockManager, type LockOptions, type LockManager } from './lock.js';

const debug = createDebug('wechat-component-service');

// TTL 常量（秒）
const COMPONENT_TICKET_TTL = 600 + 10;
const COMPONENT_TOKEN_TTL = 7200 - 10;
const AUTHORIZER_INFO_TTL = 3600 * 24 * 30;
const AUTHORIZER_TOKEN_TTL = 7200 - 10;

/** 授权方 Token */
interface AuthorizerToken {
  accessToken: string;
  refreshToken: string;
  expireTime: number;
}

/** ComponentService 配置 */
export interface ComponentServiceConfig extends ComponentConfig {
  /** 第三方平台 appid */
  appid: string;
  /** 第三方平台 appsecret */
  appsecret: string;
  /** 第三方平台 token */
  token: string;
  /** 第三方平台 encodingAESKey */
  encodingAESKey?: string;
}

/** ComponentService 选项 */
export interface ComponentServiceOptions {
  /** Redis 客户端配置 */
  client: RedisClientConfig;
  /** 缓存选项 */
  cacheOptions?: CacheOptions;
  /** 锁选项 */
  lockOptions?: LockOptions;
}

/**
 * 将授权信息映射为 Token 对象
 */
function mapToken(authorizationInfo: {
  authorizer_access_token: string;
  authorizer_refresh_token: string;
  expires_in: number;
}): AuthorizerToken {
  return {
    accessToken: authorizationInfo.authorizer_access_token,
    refreshToken: authorizationInfo.authorizer_refresh_token,
    expireTime: Date.now() + (authorizationInfo.expires_in - 10) * 1000,
  };
}

/**
 * 微信开放平台第三方平台服务类
 *
 * 整合缓存、分布式锁和微信 API 调用
 */
export class ComponentService {
  private readonly config: ComponentServiceConfig;
  private readonly cache: Cache;
  private readonly lockManager: LockManager;
  private component?: WechatComponent;
  private readonly apiMap: Map<string, API> = new Map();
  private readonly oAuthMap: Map<string, OAuth> = new Map();
  private readonly strategyMap: Map<string, WechatStrategy> = new Map();

  constructor(config: ComponentServiceConfig, options: ComponentServiceOptions) {
    if (!config.appid || !config.token || !config.appsecret) {
      throw new Error('Missing required parameters: {appid, token, appsecret}');
    }

    this.config = config;
    this.cache = getCache(options.client, options.cacheOptions);
    this.lockManager = getLockManager(options.client, options.lockOptions);
  }

  /**
   * 获取 WechatComponent 实例
   */
  getComponent(): WechatComponent {
    if (this.component) return this.component;

    const { appid } = this.config;
    const cacheKey = `wechat:component:${appid}:ticket`;
    const cacheTokenKey = `wechat:component:${appid}:token`;

    this.component = new WechatComponent(
      {
        appid: this.config.appid,
        appsecret: this.config.appsecret,
        token: this.config.token,
        encodingAESKey: this.config.encodingAESKey,
      },
      {
        getComponentTicket: async () => {
          const ticket = await this.cache.get<string>(cacheKey);
          return ticket || '';
        },
        getToken: async () => {
          const token = await this.cache.get<ComponentAccessToken>(cacheTokenKey);
          return token ?? null;
        },
        saveToken: async (token) => {
          await this.cache.set(cacheTokenKey, token, COMPONENT_TOKEN_TTL * 1000);
        },
      },
    );

    // 包装 getAccessToken 以添加分布式锁
    const originalGetAccessToken = this.component.getAccessToken.bind(this.component);
    this.component.getAccessToken = async () => {
      const lockKey = `wechat:component:${appid}:lock`;

      return this.lockManager.using(
        lockKey,
        async () => {
          // 先检查缓存中是否有有效的 token
          const cached = await this.cache.get<ComponentAccessToken>(cacheTokenKey);
          if (cached && Date.now() < cached.expireTime) {
            return cached;
          }

          debug(`component(appid: ${appid}) get new access token from wechat server`);
          return originalGetAccessToken();
        },
        1000,
      );
    };

    return this.component;
  }

  /**
   * 保存 component_verify_ticket
   *
   * @param appid - 第三方平台 appid
   * @param ticket - ticket 值
   */
  async saveTicket(appid: string, ticket: string): Promise<void> {
    const cacheKey = `wechat:component:${appid}:ticket`;
    await this.cache.set(cacheKey, ticket, COMPONENT_TICKET_TTL * 1000);
  }

  /**
   * 处理授权成功后的回调
   *
   * @param code - 授权码
   */
  async auth(code: string) {
    const component = this.getComponent();
    const auth = await component.queryAuth(code);
    const authorizerAppid = auth.authorization_info.authorizer_appid;

    // 在授权的公众号或小程序具备 API 权限时，才会有 token
    if (auth.authorization_info.authorizer_access_token) {
      const authorizerTokenKey = `wechat:${authorizerAppid}:token`;
      const token = mapToken(auth.authorization_info);
      await this.cache.set(authorizerTokenKey, token, AUTHORIZER_TOKEN_TTL * 1000);
    }

    return auth;
  }

  /**
   * 获取授权方的 access_token
   *
   * @param authorizerAppid - 授权方 appid
   * @param refreshToken - 刷新令牌（可选）
   */
  async getAuthorizerToken(
    authorizerAppid: string,
    refreshToken?: string,
  ): Promise<AuthorizerToken | null> {
    const authorizerTokenKey = `wechat:${authorizerAppid}:token`;
    let finalRefreshToken = refreshToken;

    // 先尝试从缓存获取
    let token = await this.cache.get<AuthorizerToken>(authorizerTokenKey);
    if (token && Date.now() < token.expireTime) {
      return token;
    }

    const component = this.getComponent();

    // 如果没有提供 refreshToken，尝试从授权方信息中获取
    if (!finalRefreshToken) {
      const authorizerCacheKey = `wechat:${authorizerAppid}:authorizer`;
      const authorizer = await this.cache.wrap<
        Awaited<ReturnType<WechatComponent['getAuthorizerInfo']>>
      >(
        authorizerCacheKey,
        async () => component.getAuthorizerInfo(authorizerAppid),
        AUTHORIZER_INFO_TTL * 1000,
      );

      debug(`wechat(appid: ${authorizerAppid}) get refreshToken from authorizer info`);
      finalRefreshToken = authorizer.authorization_info.authorizer_refresh_token;
    }

    // 在授权的公众号或小程序具备 API 权限时，才会有 token
    if (!finalRefreshToken) {
      return null;
    }

    // 使用分布式锁防止并发刷新
    const lockKey = `wechat:${authorizerAppid}:lock`;

    return this.lockManager.using(
      lockKey,
      async () => {
        // 再次检查缓存（可能已被其他进程刷新）
        token = await this.cache.get<AuthorizerToken>(authorizerTokenKey);
        if (token && Date.now() < token.expireTime) {
          return token;
        }

        const authorizationInfo = await component.getAuthorizerToken(
          authorizerAppid,
          finalRefreshToken!,
        );

        debug(`wechat(appid: ${authorizerAppid}) get new authorizer token from wechat server`);

        const newToken = mapToken({
          authorizer_access_token: authorizationInfo.authorizer_access_token,
          authorizer_refresh_token: authorizationInfo.authorizer_refresh_token,
          expires_in: authorizationInfo.expires_in,
        });

        await this.cache.set(authorizerTokenKey, newToken, AUTHORIZER_TOKEN_TTL * 1000);
        return newToken;
      },
      1000,
    );
  }

  /**
   * 获取授权方信息
   *
   * @param authorizerAppid - 授权方 appid
   */
  async getAuthorizerInfo(authorizerAppid: string) {
    const component = this.getComponent();
    const authorizerCacheKey = `wechat:${authorizerAppid}:authorizer`;

    return this.cache.wrap(
      authorizerCacheKey,
      async () => component.getAuthorizerInfo(authorizerAppid),
      AUTHORIZER_INFO_TTL * 1000,
    );
  }

  /**
   * 获取代授权方调用微信 API 的实例
   *
   * @param authorizerAppid - 授权方 appid
   */
  api(authorizerAppid: string): API {
    const cached = this.apiMap.get(authorizerAppid);
    if (cached) return cached;

    const api = new API(authorizerAppid);
    const getAuthorizerToken = this.getAuthorizerToken.bind(this);

    api.getAccessToken = function (callback) {
      (async () => {
        try {
          // 添加 promisify 支持
          if (!api.getTokenAsync) {
            api.getTokenAsync = promisify(api.getToken.bind(api));
          }
          if (!api.saveTokenAsync) {
            api.saveTokenAsync = promisify(api.saveToken.bind(api));
          }

          const cached = await api.getTokenAsync();
          const refreshToken = cached?.refreshToken;
          const token = await getAuthorizerToken(authorizerAppid, refreshToken ?? undefined);

          if (token) {
            await api.saveTokenAsync({
              accessToken: token.accessToken,
              expireTime: token.expireTime,
              refreshToken: token.refreshToken,
            });
          }

          callback(
            null,
            token
              ? {
                  accessToken: token.accessToken,
                  expireTime: token.expireTime,
                  refreshToken: token.refreshToken,
                }
              : undefined,
          );
        } catch (e) {
          callback(e as Error);
        }
      })();
    };

    this.apiMap.set(authorizerAppid, api);
    return api;
  }

  /**
   * 获取代授权方进行 OAuth 的实例
   *
   * @param authorizerAppid - 授权方 appid
   */
  oauth(authorizerAppid: string): OAuth {
    const cached = this.oAuthMap.get(authorizerAppid);
    if (cached) return cached;

    const oauth = new OAuth(authorizerAppid);
    const component = this.getComponent();

    // 重写获取 access_token 方法
    oauth.getAccessToken = async (code: string, callback) => {
      try {
        const token = await component.getOAuthAccessToken(authorizerAppid, code);
        oauth.saveToken(token.openid, token, (err) => callback(err, { data: token }));
      } catch (e) {
        callback(e as Error);
      }
    };

    // 重写刷新 access_token 方法
    oauth.refreshAccessToken = async (refreshToken: string, callback) => {
      try {
        const token = await component.refreshOAuthAccessToken(authorizerAppid, refreshToken);
        oauth.saveToken(token.openid, token, (err) => callback(err, { data: token }));
      } catch (e) {
        callback(e as Error);
      }
    };

    // 重写获取授权 URL 方法
    oauth.getAuthorizeURL = (redirect: string, state?: string, scope?: string) => {
      return component.getOAuthAuthorizeURL(
        authorizerAppid,
        redirect,
        (scope as 'snsapi_base' | 'snsapi_userinfo') || 'snsapi_base',
        state,
      );
    };

    this.oAuthMap.set(authorizerAppid, oauth);
    return oauth;
  }

  /**
   * 获取 Passport 策略
   *
   * @param opts - 策略选项或授权方 appid
   * @param verify - 验证函数
   */
  strategy(opts: string | WechatStrategyOptions, verify?: VerifyFunction): WechatStrategy {
    let authorizerAppid: string;
    let options: WechatStrategyOptions;

    if (typeof opts === 'string') {
      authorizerAppid = opts;
      options = {
        appID: authorizerAppid,
        appSecret: '_',
      };
    } else {
      authorizerAppid = opts.appID;
      options = opts;
    }

    const cached = this.strategyMap.get(authorizerAppid);
    if (cached) return cached;

    const defaultVerify: VerifyFunction = (
      _accessToken,
      _refreshToken,
      profile,
      _expiresIn,
      done,
    ) => done(null, profile);

    const strategy = new WechatStrategy(
      {
        ...options,
        name: authorizerAppid,
        client: 'wechat',
        scope: 'snsapi_userinfo',
      },
      verify || defaultVerify,
    );

    // 使用我们的 OAuth 实例
    strategy._oauth = this.oauth(authorizerAppid);

    this.strategyMap.set(authorizerAppid, strategy);
    return strategy;
  }
}

export default ComponentService;
