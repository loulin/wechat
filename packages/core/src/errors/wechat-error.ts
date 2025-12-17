/**
 * 微信 API 错误类
 */

/** 微信 API 错误响应结构 */
export interface WechatApiErrorResponse {
  errcode: number;
  errmsg: string;
}

/**
 * 检查是否为微信 API 错误响应
 */
export function isWechatError(result: unknown): result is WechatApiErrorResponse {
  return (
    typeof result === 'object' &&
    result !== null &&
    'errcode' in result &&
    (result as WechatApiErrorResponse).errcode !== 0
  );
}

/**
 * 微信 API 错误
 *
 * 封装微信 API 返回的错误信息
 */
export class WechatApiError extends Error {
  /** 错误码 */
  readonly code: number;

  /** 原始错误消息 */
  readonly originalMessage: string;

  constructor(code: number, message: string) {
    super(`[${code}] ${message}`);
    this.name = 'WechatApiError';
    this.code = code;
    this.originalMessage = message;

    // 保持原型链
    Object.setPrototypeOf(this, WechatApiError.prototype);
  }

  /**
   * 从 API 响应创建错误
   */
  static fromResponse(response: WechatApiErrorResponse): WechatApiError {
    return new WechatApiError(response.errcode, response.errmsg);
  }

  /**
   * 转换为 JSON
   */
  toJSON(): { code: number; message: string; name: string } {
    return {
      name: this.name,
      code: this.code,
      message: this.originalMessage,
    };
  }
}
