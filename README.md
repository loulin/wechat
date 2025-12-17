# @weixin-sdk

微信 Node.js SDK Monorepo - 提供微信全平台 API 集成

[![CI](https://github.com/loulin/wechat/actions/workflows/ci.yml/badge.svg)](https://github.com/loulin/wechat/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 包列表

| 包名                                                | 描述                 | NPM |
| --------------------------------------------------- | -------------------- | --- |
| [@weixin-sdk/core](./packages/core)                 | 共享核心模块         | -   |
| [@weixin-sdk/mp](./packages/mp)                     | 公众号/服务号 API    | -   |
| [@weixin-sdk/open](./packages/open)                 | 开放平台第三方平台   | -   |
| [@weixin-sdk/open-service](./packages/open-service) | 开放平台服务集成     | -   |
| [@weixin-sdk/auth](./packages/auth)                 | Express OAuth 中间件 | -   |

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm（推荐）
pnpm add @weixin-sdk/mp

# 使用 npm
npm install @weixin-sdk/mp
```

### 示例

```typescript
import { WechatAuth } from '@weixin-sdk/auth';

const auth = new WechatAuth({
  appid: 'wx...',
  appsecret: '...',
});

// 获取授权 URL
const url = auth.getAuthorizeURL('https://example.com/callback', 'snsapi_userinfo');

// 处理回调
const token = await auth.getAccessToken(code);
const user = await auth.getUserInfo(token.access_token, token.openid);
```

## 🛠️ 开发

查看 [贡献指南](./CONTRIBUTING.md) 了解开发和发布流程。

```bash
pnpm install   # 安装依赖
pnpm build     # 构建
pnpm test      # 测试
pnpm lint      # 代码检查
```

## 📖 文档

文档开发中...

## 📄 许可证

MIT © [Lin Lou](https://github.com/loulin)
