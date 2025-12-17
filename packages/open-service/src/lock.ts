/**
 * 分布式锁模块
 *
 * 使用 ioredis + Lua 脚本实现简单的分布式锁
 * 替代 redlock 库，适用于简单的锁场景
 */

import Redis from 'ioredis';
import type { RedisOptions, Cluster, ClusterNode } from 'ioredis';
import { randomUUID } from 'crypto';

export interface LockOptions {
  /** 锁的默认超时时间（毫秒） */
  lockTimeout?: number;
  /** 获取锁的重试次数 */
  retryCount?: number;
  /** 重试间隔（毫秒） */
  retryDelay?: number;
}

export interface Lock {
  /** 锁的唯一标识 */
  key: string;
  /** 锁的值（用于安全释放） */
  value: string;
  /** 释放锁 */
  unlock: () => Promise<boolean>;
}

// Lua 脚本：安全释放锁（只有持有者才能释放）
const UNLOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

// Lua 脚本：延长锁的过期时间
const EXTEND_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("pexpire", KEYS[1], ARGV[2])
  else
    return 0
  end
`;

const DEFAULT_LOCK_TIMEOUT = 10000; // 10 秒
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 200; // 200ms

/**
 * 分布式锁管理器
 */
export class LockManager {
  private redis: Redis | Cluster;
  private options: Required<LockOptions>;

  constructor(client: Redis | Cluster | RedisOptions | ClusterNode[], options?: LockOptions) {
    // 检查是否是 Redis-like 对象（有 set 和 eval 方法）
    const isRedisLike = (obj: unknown): obj is Redis | Cluster => {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof (obj as Redis).set === 'function' &&
        typeof (obj as Redis).eval === 'function'
      );
    };

    if (isRedisLike(client)) {
      this.redis = client;
    } else if (Array.isArray(client)) {
      this.redis = new Redis.Cluster(client as ClusterNode[]);
    } else {
      this.redis = new Redis(client as RedisOptions);
    }

    this.options = {
      lockTimeout: options?.lockTimeout ?? DEFAULT_LOCK_TIMEOUT,
      retryCount: options?.retryCount ?? DEFAULT_RETRY_COUNT,
      retryDelay: options?.retryDelay ?? DEFAULT_RETRY_DELAY,
    };
  }

  /**
   * 获取锁
   *
   * @param key - 锁的键名
   * @param timeout - 锁的超时时间（毫秒），默认使用构造函数的配置
   * @returns Lock 对象，如果获取失败返回 null
   */
  async acquire(key: string, timeout?: number): Promise<Lock | null> {
    const lockTimeout = timeout ?? this.options.lockTimeout;
    const value = randomUUID();

    for (let i = 0; i <= this.options.retryCount; i++) {
      // 尝试获取锁：SET key value NX PX timeout
      const result = await this.redis.set(key, value, 'PX', lockTimeout, 'NX');

      if (result === 'OK') {
        return {
          key,
          value,
          unlock: () => this.release(key, value),
        };
      }

      // 如果不是最后一次尝试，等待后重试
      if (i < this.options.retryCount) {
        await this.sleep(this.options.retryDelay);
      }
    }

    return null;
  }

  /**
   * 释放锁
   *
   * @param key - 锁的键名
   * @param value - 锁的值（确保只有持有者能释放）
   * @returns 是否成功释放
   */
  async release(key: string, value: string): Promise<boolean> {
    const result = await this.redis.eval(UNLOCK_SCRIPT, 1, key, value);
    return result === 1;
  }

  /**
   * 延长锁的过期时间
   *
   * @param key - 锁的键名
   * @param value - 锁的值
   * @param timeout - 新的超时时间（毫秒）
   * @returns 是否成功延长
   */
  async extend(key: string, value: string, timeout: number): Promise<boolean> {
    const result = await this.redis.eval(EXTEND_SCRIPT, 1, key, value, timeout.toString());
    return result === 1;
  }

  /**
   * 使用锁执行操作（自动获取和释放锁）
   *
   * @param key - 锁的键名
   * @param fn - 要执行的函数
   * @param timeout - 锁的超时时间（毫秒）
   * @returns 函数的返回值
   * @throws 如果无法获取锁
   */
  async using<T>(key: string, fn: () => Promise<T>, timeout?: number): Promise<T> {
    const lock = await this.acquire(key, timeout);

    if (!lock) {
      throw new Error(`Failed to acquire lock: ${key}`);
    }

    try {
      return await fn();
    } finally {
      await lock.unlock();
    }
  }

  /**
   * 关闭 Redis 连接
   */
  async quit(): Promise<void> {
    await this.redis.quit();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

let lockManagerInstance: LockManager | undefined;

/**
 * 获取或创建锁管理器实例
 */
export function getLockManager(
  client: Redis | Cluster | RedisOptions | ClusterNode[],
  options?: LockOptions,
): LockManager {
  if (lockManagerInstance) return lockManagerInstance;
  lockManagerInstance = new LockManager(client, options);
  return lockManagerInstance;
}

/**
 * 重置锁管理器实例（主要用于测试）
 */
export function resetLockManager(): void {
  lockManagerInstance = undefined;
}

export { Redis };
export type { Cluster };
