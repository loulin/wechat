# @weixin-sdk/mp

## 0.1.0-beta.0

### Minor Changes

- # @weixin-sdk 首次发布

  微信 SDK Monorepo 首次发布，包含以下包：

  ## @weixin-sdk/core

  共享核心模块：
  - HTTP 客户端（基于原生 fetch）
  - 加解密工具
  - 错误处理
  - 类型定义

  ## @weixin-sdk/open

  微信开放平台第三方平台 SDK：
  - 授权流程
  - 代公众号调用
  - OAuth 2.0

  ## @weixin-sdk/open-service

  开放平台服务集成：
  - Redis 缓存
  - 分布式锁
  - Token 管理

  ## @weixin-sdk/mp

  公众号 API SDK（全新链式 API）：
  - 用户管理
  - 菜单管理
  - 模板消息
  - JS-SDK
  - 素材管理
  - 客服消息

  ## @weixin-sdk/auth

  Express OAuth 中间件：
  - 微信网页授权
  - 第三方平台代授权

### Patch Changes

- Updated dependencies
  - @weixin-sdk/core@0.1.0-beta.0
