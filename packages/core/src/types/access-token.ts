/**
 * Access Token 相关类型定义
 */

/** Access Token 基础结构 */
export interface AccessToken {
  /** Access Token 值 */
  accessToken: string;
  /** 过期时间戳（毫秒） */
  expireTime: number;
}

/** 带刷新令牌的 Access Token */
export interface RefreshableAccessToken extends AccessToken {
  /** 刷新令牌 */
  refreshToken: string;
}

/** Token 获取函数类型 */
export type GetTokenFn<T extends AccessToken = AccessToken> = () => Promise<T | null>;

/** Token 保存函数类型 */
export type SaveTokenFn<T extends AccessToken = AccessToken> = (token: T) => Promise<void>;

/** 网络延迟缓冲时间（秒） */
export const TOKEN_BUFFER_SECONDS = 10;

/**
 * 检查 Token 是否有效
 */
export function isTokenValid(token: AccessToken | null | undefined): boolean {
  if (!token) return false;
  return Date.now() < token.expireTime;
}

/**
 * 计算 Token 过期时间
 *
 * @param expiresIn - 有效期（秒）
 * @param buffer - 缓冲时间（秒），默认 10 秒
 */
export function calculateExpireTime(expiresIn: number, buffer = TOKEN_BUFFER_SECONDS): number {
  return Date.now() + (expiresIn - buffer) * 1000;
}
