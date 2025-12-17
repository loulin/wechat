# @weixin-sdk/open-service

微信开放平台服务集成，提供缓存、分布式锁和 Token 管理。

## 安装

```bash
pnpm add @weixin-sdk/open-service
```

## 使用

```typescript
import { ComponentService } from '@weixin-sdk/open-service';

const service = new ComponentService(
  {
    appid: 'wx...',
    appsecret: '...',
    token: '...',
  },
  {
    client: { host: 'localhost', port: 6379 },
  },
);

// 获取 WechatComponent 实例（带缓存和分布式锁）
const component = service.getComponent();

// 处理授权回调
const auth = await service.auth(code);

// 获取授权方 Token（自动缓存和续期）
const token = await service.getAuthorizerToken(authorizerAppid);

// 获取代调用 API 实例
const api = service.api(authorizerAppid);

// 获取代授权 OAuth 实例
const oauth = service.oauth(authorizerAppid);
```

## 功能

- **缓存管理** - 基于 Redis/Valkey 的 Token 缓存
- **分布式锁** - 防止并发刷新 Token
- **API 代理** - 代公众号调用微信 API
- **OAuth 代理** - 代公众号进行网页授权

## License

MIT
