/**
 * API 响应相关类型定义
 */

import type { WechatApiErrorResponse } from '../errors/wechat-error.js';

/** 微信 API 响应（成功或错误） */
export type WechatApiResult<T> = T | WechatApiErrorResponse;

/** 微信 API 成功响应的基础结构 */
export interface WechatApiSuccessResponse {
  errcode?: 0;
  errmsg?: 'ok';
}

/** 带分页的 API 响应 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  list: T[];
  /** 总数 */
  total_count: number;
}
