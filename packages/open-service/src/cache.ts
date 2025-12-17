/**
 * 缓存管理模块
 *
 * 使用 cache-manager v7 + @keyv/valkey (基于 iovalkey)
 */

import { createCache, type Cache } from 'cache-manager';
import { Keyv } from 'keyv';
import KeyvValkey from '@keyv/valkey';
import type { ClusterNode, RedisOptions } from 'ioredis';

export interface CacheOptions {
  /** 默认 TTL（秒） */
  ttl?: number;
  /** 键前缀 */
  namespace?: string;
}

export interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

export type RedisClientConfig = RedisConfig | RedisOptions | ClusterNode[];

let cacheInstance: Cache | undefined;
let keyvInstance: Keyv | undefined;

/**
 * 构建 Redis URI
 */
function buildRedisUri(config: RedisConfig): string {
  const auth = config.password ? `:${config.password}@` : '';
  const host = config.host || 'localhost';
  const port = config.port || 6379;
  const db = config.db || 0;
  return `redis://${auth}${host}:${port}/${db}`;
}

/**
 * 构建 Cluster URI 数组
 */
function buildClusterUris(nodes: ClusterNode[]): string[] {
  return nodes.map((node) => {
    if (typeof node === 'string') {
      return node;
    }
    const host = (node as { host?: string }).host || 'localhost';
    const port = (node as { port?: number }).port || 6379;
    return `redis://${host}:${port}`;
  });
}

/**
 * 创建或获取缓存实例
 *
 * @param client - Redis 连接配置
 * @param options - 缓存选项
 * @returns Cache 实例
 *
 * @example
 * ```ts
 * // 单节点
 * const cache = getCache({ host: 'localhost', port: 6379 });
 *
 * // Cluster 模式
 * const cache = getCache([{ host: 'node1', port: 6379 }, { host: 'node2', port: 6379 }]);
 * ```
 */
export function getCache(client: RedisClientConfig, options?: CacheOptions): Cache {
  if (cacheInstance) return cacheInstance;

  let connectionConfig: string | string[];

  if (Array.isArray(client)) {
    // Cluster 模式 - 使用第一个节点
    const uris = buildClusterUris(client);
    connectionConfig = uris[0] || 'redis://localhost:6379';
  } else {
    // 单节点模式
    connectionConfig = buildRedisUri(client as RedisConfig);
  }

  // 创建 Keyv Valkey 存储
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keyvValkey = new KeyvValkey(connectionConfig as any);
  keyvInstance = new Keyv({
    store: keyvValkey,
    namespace: options?.namespace,
  });

  // 创建 cache-manager 实例
  cacheInstance = createCache({
    stores: [keyvInstance],
    ttl: options?.ttl ? options.ttl * 1000 : undefined, // cache-manager v7 使用毫秒
  });

  return cacheInstance;
}

/**
 * 获取底层 Keyv 实例
 */
export function getKeyv(): Keyv | undefined {
  return keyvInstance;
}

/**
 * 重置缓存实例（主要用于测试）
 */
export function resetCache(): void {
  cacheInstance = undefined;
  keyvInstance = undefined;
}

export type { Cache };
