# @weixin-sdk/mp

微信公众号 API SDK，支持链式调用和完整类型提示。

## 安装

```bash
pnpm add @weixin-sdk/mp
```

## 使用

```typescript
import { WechatMP } from '@weixin-sdk/mp';

const mp = new WechatMP({
  appid: 'wx...',
  secret: '...',
});

// 用户管理
const user = await mp.user.get('openid');
const users = await mp.user.list();

// 菜单管理
await mp.menu.create([{ type: 'click', name: '菜单', key: 'menu' }]);
await mp.menu.delete();

// 模板消息
await mp.template.send({
  touser: 'openid',
  template_id: 'template_id',
  data: { keyword1: { value: 'Hello' } },
});

// JS-SDK
const config = await mp.jssdk.getConfig('https://example.com');

// 素材管理
const count = await mp.media.getCount();

// 客服消息
await mp.customerService.sendText('openid', 'Hello!');
```

## API 模块

- `mp.user` - 用户管理 + 标签
- `mp.menu` - 菜单管理
- `mp.template` - 模板消息
- `mp.jssdk` - JS-SDK 配置
- `mp.media` - 素材管理
- `mp.customerService` - 客服消息

## License

MIT
