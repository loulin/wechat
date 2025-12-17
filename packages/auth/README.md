# @weixin-sdk/auth

微信 OAuth 认证 Express 中间件。

## 安装

```bash
pnpm add @weixin-sdk/auth
```

## 使用

```typescript
import express from 'express';
import { WechatAuth, createWechatAuthMiddleware } from '@weixin-sdk/auth';

const app = express();

// 创建认证实例
const auth = new WechatAuth({
  appid: 'wx...',
  appsecret: '...',
});

// 使用中间件
app.use(
  '/auth',
  createWechatAuthMiddleware(auth, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  }),
);

// 或手动处理
app.get('/login', (req, res) => {
  const url = auth.getAuthorizeURL('https://example.com/callback', 'snsapi_userinfo');
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  const token = await auth.getAccessToken(code);
  const user = await auth.getUserInfo(token.access_token, token.openid);
  // ...
});
```

## 第三方平台代授权

```typescript
const auth = new WechatAuth({
  appid: authorizerAppid,
  appsecret: '_',
  componentAppid: 'wxcomponent...',
  getComponentAccessToken: async () => componentAccessToken,
});
```

## License

MIT
