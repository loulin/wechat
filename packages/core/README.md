# @weixin-sdk/core

微信 SDK 共享核心模块。

## 安装

```bash
pnpm add @weixin-sdk/core
```

## 功能

- **HTTP 客户端** - 基于原生 fetch，自动处理微信 API 错误
- **加解密工具** - 消息加解密、签名验证
- **错误处理** - 统一的微信 API 错误类型
- **类型定义** - Access Token、API 响应等

## 使用

```typescript
import { HttpClient, WechatApiError, sign, verifySign } from '@weixin-sdk/core';

// HTTP 客户端
const http = new HttpClient({ baseURL: 'https://api.weixin.qq.com' });
const result = await http.get('/cgi-bin/token', { ... });

// 签名验证
const isValid = verifySign(signature, { timestamp, nonce, token });
```

## License

MIT
