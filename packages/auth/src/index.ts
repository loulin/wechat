/**
 * 微信 OAuth 认证 Express 中间件
 *
 * 提供微信公众号/开放平台 OAuth 认证功能
 *
 * @packageDocumentation
 */

export { WechatAuth, type WechatAuthOptions } from './auth.js';
export { wechatAuthMiddleware, type AuthMiddlewareOptions } from './middleware.js';
export * from './types.js';
