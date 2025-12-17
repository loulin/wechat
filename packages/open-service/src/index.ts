/**
 * 微信开放平台第三方平台服务 SDK
 *
 * @packageDocumentation
 */

export { ComponentService, default } from './service.js';
export type { ComponentServiceConfig, ComponentServiceOptions } from './service.js';

export { getCache, resetCache, type CacheOptions, type RedisClientConfig } from './cache.js';
export {
  LockManager,
  getLockManager,
  resetLockManager,
  type Lock,
  type LockOptions,
} from './lock.js';

// Re-export from @weixin-sdk/open
export type {
  ComponentConfig,
  ComponentAccessToken,
  AuthorizerAccessToken,
} from '@weixin-sdk/open';
