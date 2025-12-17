# @weixin-sdk/open

微信开放平台第三方平台 SDK。

## 安装

```bash
pnpm add @weixin-sdk/open
```

## 使用

```typescript
import { WechatComponent } from '@weixin-sdk/open';

const component = new WechatComponent(
  {
    appid: 'wx...',
    appsecret: '...',
    token: '...',
    encodingAESKey: '...',
  },
  {
    getComponentTicket: async () => ticket,
    getToken: async () => token,
    saveToken: async (token) => { ... },
  }
);

// 获取授权链接
const authUrl = component.getAuthorizationURL('https://callback.com');

// 使用授权码获取授权信息
const auth = await component.queryAuth(authCode);

// 代公众号调用 API
const accessToken = await component.getAuthorizerToken(authorizerAppid, refreshToken);

// 代公众号 OAuth
const oauthUrl = component.getOAuthAuthorizeURL(authorizerAppid, 'https://callback.com');
```

## License

MIT
