/**
 * HTTP 客户端抽象层
 *
 * 提供统一的 HTTP 请求接口，支持微信 API 错误处理
 */

import { WechatApiError, isWechatError } from '../errors/index.js';
import type { WechatApiResult } from '../types/index.js';

/** HTTP 客户端配置 */
export interface HttpClientOptions {
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
  /** 基础 URL */
  baseURL?: string;
}

/** HTTP 响应结构 */
export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/** HTTP 请求配置 */
export interface RequestOptions extends RequestInit {
  /** 请求参数（GET 请求） */
  params?: Record<string, string>;
}

/**
 * 微信 API HTTP 客户端
 *
 * 封装了微信 API 的通用请求逻辑，包括：
 * - 统一的错误处理
 * - JSON 序列化/反序列化
 * - 请求超时处理
 */
export class HttpClient {
  private readonly options: HttpClientOptions;

  constructor(options: HttpClientOptions = {}) {
    this.options = {
      timeout: 30000,
      ...options,
    };
  }

  /**
   * 构建完整 URL
   */
  private buildURL(path: string, params?: Record<string, string>): string {
    let url = this.options.baseURL ? `${this.options.baseURL}${path}` : path;

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }

    return url;
  }

  /**
   * 发起 HTTP 请求
   */
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const fullURL = this.buildURL(url, params);

    const response = await fetch(fullURL, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers,
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      throw new WechatApiError(
        response.status,
        `HTTP Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as WechatApiResult<T>;

    if (isWechatError(data)) {
      throw new WechatApiError(data.errcode, data.errmsg);
    }

    return data as T;
  }

  /**
   * GET 请求
   */
  async get<T>(url: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(url, { method: 'GET', params });
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, body?: unknown, params?: Record<string, string>): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      params,
    });
  }
}
