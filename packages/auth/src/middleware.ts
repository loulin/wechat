/**
 * Express 中间件
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { WechatAuth, type WechatAuthOptions } from './auth.js';
import type { OAuthScope, WechatUserInfo, OAuthAccessToken } from './types.js';

/** 中间件配置 */
export interface AuthMiddlewareOptions extends WechatAuthOptions {
  /** 授权成功后回调路径 */
  callbackPath: string;
  /** 授权作用域 */
  scope?: OAuthScope;
  /** 自定义状态参数生成函数 */
  getState?: (req: Request) => string;
  /** 授权成功回调 */
  onSuccess?: (
    req: Request,
    res: Response,
    token: OAuthAccessToken,
    user?: WechatUserInfo,
  ) => void | Promise<void>;
  /** 授权失败回调 */
  onError?: (req: Request, res: Response, error: Error) => void | Promise<void>;
  /** 是否获取用户信息（仅 snsapi_userinfo 有效） */
  fetchUserInfo?: boolean;
}

/**
 * 声明 Express Request 扩展
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      wechatAuth?: {
        token: OAuthAccessToken;
        user?: WechatUserInfo;
      };
    }
  }
}

/**
 * 创建微信 OAuth 认证中间件
 *
 * @example
 * ```ts
 * app.use('/auth/wechat', wechatAuthMiddleware({
 *   appid: 'wx...',
 *   appsecret: '...',
 *   callbackPath: '/callback',
 *   scope: 'snsapi_userinfo',
 *   fetchUserInfo: true,
 *   onSuccess: (req, res, token, user) => {
 *     // 处理登录逻辑
 *     res.redirect('/');
 *   },
 * }));
 * ```
 */
export function wechatAuthMiddleware(options: AuthMiddlewareOptions): RequestHandler {
  const auth = new WechatAuth(options);
  const {
    callbackPath,
    scope = 'snsapi_base',
    getState = () => '',
    onSuccess,
    onError,
    fetchUserInfo = scope === 'snsapi_userinfo',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 回调处理
      if (req.path === callbackPath) {
        const { code } = req.query;

        if (!code || typeof code !== 'string') {
          throw new Error('Missing authorization code');
        }

        // 获取 Access Token
        const token = await auth.getAccessToken(code);

        // 获取用户信息（如果需要且 scope 为 snsapi_userinfo）
        let user: WechatUserInfo | undefined;
        if (fetchUserInfo && token.scope.includes('snsapi_userinfo')) {
          user = await auth.getUserInfo(token.access_token, token.openid);
        }

        // 存储到 request 对象
        req.wechatAuth = { token, user };

        // 调用成功回调
        if (onSuccess) {
          await onSuccess(req, res, token, user);
          return;
        }

        next();
        return;
      }

      // 发起授权
      const redirectUri = `${req.protocol}://${req.get('host')}${req.baseUrl}${callbackPath}`;
      const state = getState(req);
      const authorizeUrl = auth.getAuthorizeURL(redirectUri, scope, state);

      res.redirect(authorizeUrl);
    } catch (error) {
      if (onError && error instanceof Error) {
        await onError(req, res, error);
        return;
      }
      next(error);
    }
  };
}
