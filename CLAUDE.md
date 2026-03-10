# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 成本分析管理系统

制造业成本核算与报价管理平台，前后端分离架构。

---

## 常用命令

### 开发启动
```bash
pnpm dev              # 同时启动前后端
pnpm dev:api          # 仅启动后端 (http://localhost:3003)
pnpm dev:web          # 仅启动前端 (http://localhost:3002)
```

### 数据库操作
```bash
pnpm db:generate      # 生成 Prisma Client
pnpm db:migrate       # 创建/运行迁移
pnpm db:seed          # 运行种子数据
pnpm db:studio        # 打开 Prisma Studio
```

### 代码质量
```bash
pnpm build            # 构建所有应用
pnpm lint             # 运行 ESLint
pnpm typecheck        # TypeScript 类型检查
```

### 测试
```bash
# 后端测试
pnpm --filter=api test              # 运行所有测试
pnpm --filter=api test:watch        # 监视模式
pnpm --filter=api test -- src/services/user.service.test.ts  # 单文件

# 前端测试
pnpm --filter=web test
pnpm --filter=web test:watch
```

---

## 项目结构

Monorepo 使用 pnpm workspace + Turbo 管理。

```
apps/
  api/                  # Fastify 后端 (端口 3003)
    src/
      controllers/      # HTTP 请求处理器
      services/         # 业务逻辑层
      repositories/     # 数据访问层 (Prisma)
      routes/           # 路由定义
      plugins/          # Fastify 插件
      types/            # 类型定义
    .env.example        # 必需: JWT_SECRET, DATABASE_URL

  web/                  # Next.js 16 前端 (端口 3002)
    app/
      (app)/            # 认证后路由组
        cost/           # 成本分析模块
        master/         # 基础数据模块
        review/         # 审核管理
        notifications/  # 通知中心
        system/         # 系统配置
      login/            # 登录页
    components/         # React 组件
    hooks/              # 自定义 hooks
    stores/             # Zustand 状态管理
    providers/          # React providers

packages/
  database/             # Prisma schema 和 client
    prisma/
      schema.prisma     # 数据模型定义
      seed.ts           # 种子数据

  shared-types/         # 前后端共享类型
    src/index.ts        # User, Customer, Quotation 等类型
```

---

## 后端架构

采用分层架构，依赖关系：`controllers → services → repositories`

### 目录职责

- **controllers**: HTTP 层，处理请求/响应，调用 services
- **services**: 业务逻辑层，包含核心业务规则，不直接访问数据库
- **repositories**: 数据访问层，封装 Prisma 查询
- **plugins**: Fastify 插件（错误处理、日志、认证装饰器）

### 认证

JWT Bearer Token 认证，通过 `app.authenticate` 装饰器保护路由。

```typescript
// 保护路由示例
app.get('/protected', { preHandler: [app.authenticate] }, handler)
```

### API 文档

Swagger UI 在 `/documentation` 提供，运行时自动可访问。

---

## 前端架构

### 路由结构

使用 Next.js App Router，认证路由放在 `(app)` 组内。

```
app/
  (app)/layout.tsx     # 带侧边栏的认证布局
  login/page.tsx       # 登录页（独立布局）
```

### 状态管理

- **服务端状态**: TanStack Query (React Query)
- **客户端状态**: Zustand（stores 目录）

### 组件规范

- UI 组件在 `components/ui/`，基于 Radix UI
- 业务组件在 `components/` 根目录
- 使用 `cn()` 工具合并 Tailwind 类名

---

## 环境变量

### 后端 (apps/api/.env)
```
DATABASE_URL="postgresql://user:pass@localhost:5432/cost_management"
JWT_SECRET="your-secret"
PORT=3003
```

### 数据库 (packages/database/prisma/.env)
```
DATABASE_URL="postgresql://user:pass@localhost:5432/cost_management"
```

---

## 默认账号

- 管理员: `admin` / `admin123`
- 采购员: `purchaser` / `purchaser123`
- 审核员: `reviewer` / `reviewer123`

---

## 技术栈版本

- Node.js: 20+
- pnpm: 9.0.0
- Next.js: 16.1.6
- React: 19.2.4
- Fastify: 5.0.0
- Prisma: 6.0.0
- TypeScript: 5.7.0
- Tailwind CSS: 4.2.0
