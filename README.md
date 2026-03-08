# 成本分析管理系统

前后端分离的制造业成本核算与报价管理平台。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 + React 19 + TypeScript |
| 后端 | Fastify 5 + TypeScript |
| ORM | Prisma 6 |
| 数据库 | PostgreSQL 16 |
| 状态管理 | Zustand |
| 数据获取 | TanStack Query |

## 项目结构

```
cost-management-system/
├── apps/
│   ├── web/              # Next.js 前端
│   └── api/              # Fastify 后端
├── packages/
│   ├── database/         # Prisma schema 和 client
│   └── shared-types/     # 共享类型定义
├── turbo.json            # Monorepo 配置
└── pnpm-workspace.yaml   # pnpm workspace 配置
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
# 后端环境变量
cp apps/api/.env.example apps/api/.env

# 数据库环境变量
cp packages/database/prisma/.env.example packages/database/prisma/.env
```

编辑 `.env` 文件配置数据库连接：

```
DATABASE_URL="postgresql://用户名:密码@localhost:5432/cost_management?schema=public"
JWT_SECRET="your-jwt-secret"
```

### 3. 数据库初始化

```bash
# 创建迁移
pnpm db:migrate

# 运行种子数据
pnpm db:seed
```

### 4. 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm dev:api  # 后端 http://localhost:3001
pnpm dev:web  # 前端 http://localhost:3000
```

### 5. 默认登录账号

- 管理员: `admin` / `admin123`
- 采购员: `purchaser` / `purchaser123`
- 审核员: `reviewer` / `reviewer123`

## 常用命令

```bash
# 开发
pnpm dev              # 启动所有服务
pnpm dev:api          # 仅启动后端
pnpm dev:web          # 仅启动前端

# 数据库
pnpm db:migrate       # 创建/运行迁移
pnpm db:seed          # 运行种子数据
pnpm db:studio        # 打开 Prisma Studio

# 构建
pnpm build            # 构建所有应用
pnpm typecheck        # 类型检查
```

## API 文档

后端 API 运行在 `http://localhost:3001/api/v1`

主要端点：

- `POST /auth/login` - 登录
- `GET /auth/me` - 获取当前用户
- `GET /dashboard/stats` - 仪表盘统计
- `GET /quotations` - 报价单列表
- `POST /quotations` - 创建报价单
- `POST /quotations/:id/submit` - 提交审核
- `POST /quotations/:id/approve` - 审核通过
- `POST /quotations/:id/reject` - 审核拒绝

## 功能模块

- **仪表盘** - 统计数据、图表、最近报价单
- **成本分析** - 新建、记录、对比、标准成本
- **审核管理** - 待审核、已审核
- **基础数据** - 法规、客户、原材料、型号、BOM、工序、包材
- **通知中心** - 价格变动通知
- **系统配置** - 费率设置

## 许可证

MIT
