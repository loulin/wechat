# 贡献指南

感谢你对 @weixin-sdk 的关注！

## 环境要求

- Node.js >= 22.0.0
- pnpm >= 9.15.0

## 开发设置

```bash
# 克隆仓库
git clone https://github.com/loulin/wechat.git
cd wechat

# 安装依赖
pnpm install

# 构建所有包
pnpm build
```

## 开发命令

```bash
# 开发模式（监听变化）
pnpm dev

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 类型检查
pnpm typecheck

# 格式化代码
pnpm format
```

## 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `chore:` 构建/工具变更
- `refactor:` 重构
- `test:` 测试相关

## 创建变更集

在提交更改前，请创建 changeset：

```bash
pnpm changeset
```

选择受影响的包和变更类型（patch/minor/major）。

## 发布流程（维护者）

1. 进入预发布模式（beta）：

   ```bash
   pnpm changeset pre enter beta
   ```

2. 更新版本号：

   ```bash
   pnpm changeset version
   ```

3. 提交版本更新：

   ```bash
   git add -A
   git commit -m "chore: release packages"
   ```

4. 发布到 npm：

   ```bash
   pnpm publish -r --access public --tag beta
   ```

5. 退出预发布模式（发布正式版时）：
   ```bash
   pnpm changeset pre exit
   ```

## 项目结构

```
packages/
├── core/           # 共享核心模块
├── mp/             # 公众号 API
├── open/           # 开放平台 SDK
├── open-service/   # 开放平台服务
├── auth/           # OAuth 中间件
├── tsconfig/       # 共享 TS 配置
└── eslint-config/  # 共享 ESLint 配置
```

## License

MIT
