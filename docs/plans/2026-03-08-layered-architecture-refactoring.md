# 分层架构重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将当前 Fastify 后端从扁平路由架构重构为清晰的分层架构 (Controller + Service + Repository)

**Architecture:** 采用经典的三层架构：Controller 处理 HTTP 请求/响应，Service 处理业务逻辑，Repository 处理数据访问。Routes 只负责路由定义和中间件绑定。

**Tech Stack:** Fastify 5.x, TypeScript, Prisma, Zod

---

## 任务清单概览

### Phase 1: 基础架构搭建
- Task 1: 创建目录结构
- Task 2: 创建基础 Service 抽象类
- Task 3: 创建 HTTP 响应工具函数

### Phase 2: Quotation 模块重构（作为示例）
- Task 4: 创建 QuotationRepository
- Task 5: 创建 QuotationService
- Task 6: 创建 QuotationController
- Task 7: 重构 QuotationRoutes

### Phase 3: 其他核心模块重构
- Task 8: 重构 User 模块
- Task 9: 重构 Customer 模块
- Task 10: 重构 Material 模块
- Task 11: 重构 Packaging 模块

### Phase 4: 清理与验证
- Task 12: 删除旧代码
- Task 13: 运行类型检查
- Task 14: 运行开发服务器验证

---

## Phase 1: 基础架构搭建

### Task 1: 创建目录结构

**Files:**
- Create directories: `apps/api/src/controllers/`, `apps/api/src/services/`, `apps/api/src/repositories/`

**Steps:**

**Step 1: 创建目录**

Run:
```bash
mkdir -p apps/api/src/controllers apps/api/src/services apps/api/src/repositories
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: create layered architecture directory structure"
```

---

### Task 2: 创建基础 Service 抽象类

**Files:**
- Create: `apps/api/src/services/base.service.ts`

**Steps:**

**Step 1: 实现基础 Service 类**

```typescript
import type { PrismaClient } from '@prisma/client'
import { prisma } from '@cost/database'

export abstract class BaseService {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }

  protected async withTransaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn as unknown as Parameters<PrismaClient['$transaction']>[0]) as Promise<T>
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/services/base.service.ts
git commit -m "feat: add base service class with prisma client and transaction support"
```

---

### Task 3: 创建 HTTP 响应工具函数

**Files:**
- Create: `apps/api/src/utils/http-response.ts`
- Modify: `apps/api/src/lib/response-helpers.ts` (合并到 utils)

**Steps:**

**Step 1: 创建统一的 HTTP 响应工具**

```typescript
import type { FastifyReply } from 'fastify'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function sendSuccess<T>(reply: FastifyReply, data: T, meta?: ApiResponse<T>['meta']) {
  const response: ApiResponse<T> = { success: true, data }
  if (meta) response.meta = meta
  return reply.send(response)
}

export function sendError(reply: FastifyReply, status: number, code: string, message: string) {
  return reply.code(status).send({
    success: false,
    error: { code, message }
  })
}

export function sendNotFound(reply: FastifyReply, resource: string) {
  return sendError(reply, 404, 'NOT_FOUND', `${resource}不存在`)
}

export function sendValidationError(reply: FastifyReply, message: string) {
  return sendError(reply, 400, 'VALIDATION_ERROR', message)
}

export function sendUnauthorized(reply: FastifyReply) {
  return sendError(reply, 401, 'UNAUTHORIZED', '未授权访问')
}

export function sendForbidden(reply: FastifyReply) {
  return sendError(reply, 403, 'FORBIDDEN', '禁止访问')
}
```

**Step 2: 更新原有导入**

检查并更新使用 `response-helpers.ts` 的文件，改为从 `utils/http-response.ts` 导入。

**Step 3: Commit**

```bash
git add apps/api/src/utils/http-response.ts
git commit -m "feat: add unified HTTP response utilities"
```

---

## Phase 2: Quotation 模块重构

### Task 4: 创建 QuotationRepository

**Files:**
- Create: `apps/api/src/repositories/quotation.repository.ts`

**Steps:**

**Step 1: 从现有路由提取数据访问逻辑**

从 `quotations.routes.ts` 中提取所有 Prisma 调用：
- `prisma.quotation.findMany()`
- `prisma.quotation.findUnique()`
- `prisma.quotation.create()`
- `prisma.quotation.update()`
- `prisma.quotation.delete()`
- `prisma.quotation.count()`

**Step 2: 实现 Repository**

```typescript
import { prisma, type QuotationStatus, type Prisma } from '@cost/database'

export interface QuotationFilter {
  status?: QuotationStatus
  customerId?: string
  modelId?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export class QuotationRepository {
  async findMany(filter: QuotationFilter, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.pageSize
    const where: Prisma.QuotationWhereInput = {}

    if (filter.status) where.status = filter.status
    if (filter.customerId) where.customerId = filter.customerId
    if (filter.modelId) where.modelId = filter.modelId

    return prisma.quotation.findMany({
      where,
      skip,
      take: pagination.pageSize,
      include: this.defaultInclude(),
      orderBy: { createdAt: 'desc' }
    })
  }

  async count(filter: QuotationFilter) {
    const where: Prisma.QuotationWhereInput = {}
    if (filter.status) where.status = filter.status
    if (filter.customerId) where.customerId = filter.customerId
    if (filter.modelId) where.modelId = filter.modelId

    return prisma.quotation.count({ where })
  }

  async findById(id: string) {
    return prisma.quotation.findUnique({
      where: { id },
      include: this.detailedInclude()
    })
  }

  async findByQuotationNo(quotationNo: string) {
    return prisma.quotation.findFirst({
      where: { quotationNo: { startsWith: quotationNo } },
      orderBy: { quotationNo: 'desc' }
    })
  }

  async create(data: Prisma.QuotationCreateInput) {
    return prisma.quotation.create({
      data,
      include: this.defaultInclude()
    })
  }

  async update(id: string, data: Prisma.QuotationUpdateInput) {
    return prisma.quotation.update({
      where: { id },
      data,
      include: this.defaultInclude()
    })
  }

  async delete(id: string) {
    return prisma.quotation.delete({ where: { id } })
  }

  private defaultInclude() {
    return {
      customer: true,
      regulation: true,
      model: true,
      packagingConfig: true,
    } as const
  }

  private detailedInclude() {
    return {
      customer: true,
      regulation: true,
      model: true,
      packagingConfig: {
        include: {
          processConfigs: true,
          packagingMaterials: true,
        }
      },
      creator: { select: { id: true, name: true } },
      reviewer: { select: { id: true, name: true } },
    } as const
  }
}

export const quotationRepository = new QuotationRepository()
```

**Step 3: Commit**

```bash
git add apps/api/src/repositories/quotation.repository.ts
git commit -m "feat: add QuotationRepository with CRUD operations"
```

---

### Task 5: 创建 QuotationService

**Files:**
- Create: `apps/api/src/services/quotation.service.ts`

**Steps:**

**Step 1: 从路由提取业务逻辑**

从 `quotations.routes.ts` 提取：
- 报价单号生成逻辑
- 成本计算逻辑
- 状态流转验证
- 权限检查

**Step 2: 实现 Service**

```typescript
import { BaseService } from './base.service.js'
import { quotationRepository, type QuotationFilter, type PaginationParams } from '../repositories/quotation.repository.js'
import { calculateCosts } from '../utils/cost-calculator.js'
import type { CreateQuotationInput, UpdateQuotationInput, CalculateQuotationInput } from '../lib/schemas.js'

export class QuotationService extends BaseService {
  private repository = quotationRepository

  async getList(filter: QuotationFilter, pagination: PaginationParams) {
    const [quotations, total] = await Promise.all([
      this.repository.findMany(filter, pagination),
      this.repository.count(filter)
    ])

    return {
      data: quotations,
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize)
      }
    }
  }

  async getById(id: string) {
    return this.repository.findById(id)
  }

  async create(userId: string, input: CreateQuotationInput) {
    const quotationNo = await this.generateQuotationNo()

    return this.repository.create({
      ...input,
      quotationNo,
      status: 'draft',
      createdBy: userId,
    })
  }

  async update(id: string, input: UpdateQuotationInput) {
    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('NOT_FOUND')
    if (existing.status !== 'draft') throw new Error('INVALID_STATUS')

    return this.repository.update(id, input)
  }

  async delete(id: string) {
    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('NOT_FOUND')
    if (existing.status === 'approved') throw new Error('CANNOT_DELETE_APPROVED')

    await this.repository.delete(id)
  }

  async submit(id: string) {
    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('NOT_FOUND')
    if (existing.status !== 'draft') throw new Error('INVALID_STATUS')

    return this.repository.update(id, { status: 'submitted' })
  }

  async approve(id: string, userId: string, note?: string) {
    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('NOT_FOUND')
    if (existing.status !== 'submitted') throw new Error('INVALID_STATUS')

    return this.repository.update(id, {
      status: 'approved',
      reviewedBy: userId,
      reviewedAt: new Date(),
      reviewNote: note
    })
  }

  async reject(id: string, userId: string, note?: string) {
    const existing = await this.repository.findById(id)
    if (!existing) throw new Error('NOT_FOUND')
    if (existing.status !== 'submitted') throw new Error('INVALID_STATUS')

    return this.repository.update(id, {
      status: 'rejected',
      reviewedBy: userId,
      reviewedAt: new Date(),
      reviewNote: note
    })
  }

  async calculate(input: CalculateQuotationInput) {
    return calculateCosts(input)
  }

  private async generateQuotationNo(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `QT-${year}-`

    const lastQuotation = await this.repository.findByQuotationNo(prefix)
    const seq = lastQuotation
      ? parseInt(lastQuotation.quotationNo.split('-')[2]) + 1
      : 1

    return `${prefix}${seq.toString().padStart(4, '0')}`
  }
}

export const quotationService = new QuotationService()
```

**Step 3: Commit**

```bash
git add apps/api/src/services/quotation.service.ts
git commit -m "feat: add QuotationService with business logic"
```

---

### Task 6: 创建 QuotationController

**Files:**
- Create: `apps/api/src/controllers/quotation.controller.ts`

**Steps:**

**Step 1: 实现 Controller**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { quotationService } from '../services/quotation.service.js'
import { sendSuccess, sendError, sendNotFound } from '../utils/http-response.js'
import { createQuotationSchema, updateQuotationSchema, calculateQuotationSchema, formatZodError } from '../lib/schemas.js'
import type { QuotationStatus } from '@cost/database'

export class QuotationController {
  async getList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as Record<string, string>
    const filter = {
      status: query.status as QuotationStatus | undefined,
      customerId: query.customerId,
      modelId: query.modelId
    }
    const pagination = {
      page: parseInt(query.page || '1', 10),
      pageSize: parseInt(query.pageSize || '20', 10)
    }

    const result = await quotationService.getList(filter, pagination)
    return sendSuccess(reply, result.data, result.meta)
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const quotation = await quotationService.getById(request.params.id)
    if (!quotation) return sendNotFound(reply, '报价单')
    return sendSuccess(reply, quotation)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const validation = createQuotationSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    const userId = request.user.userId
    const quotation = await quotationService.create(userId, validation.data)
    return sendSuccess(reply, quotation)
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params
    const validation = updateQuotationSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    try {
      const quotation = await quotationService.update(id, validation.data)
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') return sendNotFound(reply, '报价单')
        if (error.message === 'INVALID_STATUS') return sendError(reply, 400, 'INVALID_STATUS', '只能修改草稿状态的报价单')
      }
      throw error
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      await quotationService.delete(request.params.id)
      return sendSuccess(reply, { message: '报价单已删除' })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') return sendNotFound(reply, '报价单')
        if (error.message === 'CANNOT_DELETE_APPROVED') return sendError(reply, 400, 'INVALID_STATUS', '已审核通过的报价单不能删除')
      }
      throw error
    }
  }

  async submit(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const quotation = await quotationService.submit(request.params.id)
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') return sendNotFound(reply, '报价单')
        if (error.message === 'INVALID_STATUS') return sendError(reply, 400, 'INVALID_STATUS', '只能提交草稿状态的报价单')
      }
      throw error
    }
  }

  async approve(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params
    const { note } = request.body as { note?: string }
    const userId = request.user.userId

    try {
      const quotation = await quotationService.approve(id, userId, note)
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') return sendNotFound(reply, '报价单')
        if (error.message === 'INVALID_STATUS') return sendError(reply, 400, 'INVALID_STATUS', '只能审核已提交的报价单')
      }
      throw error
    }
  }

  async reject(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params
    const { note } = request.body as { note?: string }
    const userId = request.user.userId

    try {
      const quotation = await quotationService.reject(id, userId, note)
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') return sendNotFound(reply, '报价单')
        if (error.message === 'INVALID_STATUS') return sendError(reply, 400, 'INVALID_STATUS', '只能审核已提交的报价单')
      }
      throw error
    }
  }

  async calculate(request: FastifyRequest, reply: FastifyReply) {
    const validation = calculateQuotationSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    const result = await quotationService.calculate(validation.data)
    return sendSuccess(reply, result)
  }
}

export const quotationController = new QuotationController()
```

**Step 2: Commit**

```bash
git add apps/api/src/controllers/quotation.controller.ts
git commit -m "feat: add QuotationController handling HTTP requests"
```

---

### Task 7: 重构 QuotationRoutes

**Files:**
- Modify: `apps/api/src/routes/quotations.routes.ts`

**Steps:**

**Step 1: 简化路由文件**

```typescript
import type { FastifyInstance } from 'fastify'
import { quotationController } from '../controllers/quotation.controller.js'

export const quotationRoutes = async (app: FastifyInstance) => {
  app.get('/', { onRequest: [app.authenticate] }, quotationController.getList)
  app.get('/:id', { onRequest: [app.authenticate] }, quotationController.getById)
  app.post('/', { onRequest: [app.authenticate] }, quotationController.create)
  app.put('/:id', { onRequest: [app.authenticate] }, quotationController.update)
  app.delete('/:id', { onRequest: [app.authenticate] }, quotationController.delete)
  app.post('/:id/submit', { onRequest: [app.authenticate] }, quotationController.submit)
  app.post('/:id/approve', { onRequest: [app.authenticate] }, quotationController.approve)
  app.post('/:id/reject', { onRequest: [app.authenticate] }, quotationController.reject)
  app.post('/calculate', { onRequest: [app.authenticate] }, quotationController.calculate)
}
```

**Step 2: Commit**

```bash
git add apps/api/src/routes/quotations.routes.ts
git commit -m "refactor: simplify quotation routes using controller"
```

---

## Phase 3: 其他模块重构

按照 Task 4-7 相同的模式，重构以下模块：

### Task 8: 重构 User 模块
- Create: `apps/api/src/repositories/user.repository.ts`
- Create: `apps/api/src/services/user.service.ts`
- Create: `apps/api/src/controllers/user.controller.ts`
- Modify: `apps/api/src/routes/users.routes.ts`

### Task 9: 重构 Customer 模块
- Create: `apps/api/src/repositories/customer.repository.ts`
- Create: `apps/api/src/services/customer.service.ts`
- Create: `apps/api/src/controllers/customer.controller.ts`
- Modify: `apps/api/src/routes/customers.routes.ts`

### Task 10: 重构 Material 模块
- Create: `apps/api/src/repositories/material.repository.ts`
- Create: `apps/api/src/services/material.service.ts`
- Create: `apps/api/src/controllers/material.controller.ts`
- Modify: `apps/api/src/routes/materials.routes.ts`

### Task 11: 重构 Packaging 模块
- Create: `apps/api/src/repositories/packaging.repository.ts`
- Create: `apps/api/src/services/packaging.service.ts`
- Create: `apps/api/src/controllers/packaging.controller.ts`
- Modify: `apps/api/src/routes/packaging.routes.ts`

---

## Phase 4: 清理与验证

### Task 12: 创建成本计算工具

**Files:**
- Create: `apps/api/src/utils/cost-calculator.ts`

从 `quotations.routes.ts` 提取成本计算逻辑：

```typescript
import { prisma } from '@cost/database'
import type { CalculateQuotationInput } from '../lib/schemas.js'

export async function calculateCosts(input: CalculateQuotationInput) {
  const { modelId, packagingConfigId, saleType, shippingType, quantity } = input

  const config = await prisma.systemConfig.findMany()
  const configMap = Object.fromEntries(
    config.map((c) => [c.key, Number(c.value)])
  )

  const bomMaterials = await prisma.bomMaterial.findMany({
    where: { modelId },
    include: { material: true }
  })

  const materialCost = bomMaterials.reduce((sum, bom) => {
    return sum + Number(bom.material.price) * Number(bom.quantity) * quantity
  }, 0)

  const packagingConfig = await prisma.packagingConfig.findUnique({
    where: { id: packagingConfigId },
    include: { processConfigs: true, packagingMaterials: true }
  })

  if (!packagingConfig) throw new Error('INVALID_CONFIG')

  const packagingCost = packagingConfig.packagingMaterials.reduce(
    (sum, pm) => sum + Number(pm.price) * Number(pm.quantity) * quantity,
    0
  )

  const processCost = packagingConfig.processConfigs.reduce((sum, pc) => {
    const unitMultiplier = pc.unit === 'dozen' ? quantity / 12 : quantity
    return sum + Number(pc.price) * unitMultiplier
  }, 0)

  let shippingCost = 0
  const cartonCount = Math.ceil(quantity / packagingConfig.perCarton)

  switch (shippingType) {
    case 'fcl20':
      shippingCost = configMap.fcl20Rate || 3500
      break
    case 'fcl40':
      shippingCost = configMap.fcl40Rate || 5800
      break
    case 'lcl':
      shippingCost = (configMap.lclBaseRate || 45) * cartonCount
      break
  }

  const adminFee = (materialCost + packagingCost + processCost) * (configMap.adminFeeRate || 0.1)
  const vat = saleType === 'domestic'
    ? (materialCost + packagingCost + processCost + adminFee) * (configMap.vatRate || 0.13)
    : 0

  const totalCost = materialCost + packagingCost + processCost + shippingCost + adminFee + vat

  return {
    materialCost,
    packagingCost,
    processCost,
    shippingCost,
    adminFee,
    vat,
    totalCost,
    unitCost: totalCost / quantity
  }
}
```

### Task 13: 运行类型检查

```bash
pnpm run typecheck
```

Expected: All packages pass typecheck

### Task 14: 运行开发服务器验证

```bash
pnpm run dev
```

Expected: Both frontend (3000) and backend (3001) start successfully

---

## 验证清单

- [ ] All repositories created with proper CRUD methods
- [ ] All services created with business logic
- [ ] All controllers created with HTTP handling
- [ ] All routes simplified to route definitions only
- [ ] Type check passes for all packages
- [ ] Development server starts without errors
- [ ] API endpoints work correctly (test with login, CRUD operations)

---

## 架构变化总结

### 重构前
```
routes/
├── quotations.routes.ts (400+ 行，包含所有逻辑)
├── users.routes.ts (200+ 行)
└── ...
```

### 重构后
```
repositories/
├── quotation.repository.ts (数据访问)
├── user.repository.ts
└── ...

services/
├── quotation.service.ts (业务逻辑)
├── user.service.ts
└── ...

controllers/
├── quotation.controller.ts (HTTP 处理)
├── user.controller.ts
└── ...

routes/
├── quotations.routes.ts (10 行，仅路由定义)
├── users.routes.ts
└── ...
```

### 职责分离
- **Repository**: 数据库访问，Prisma 查询
- **Service**: 业务逻辑，事务管理，业务规则验证
- **Controller**: HTTP 请求/响应处理，输入验证，错误响应
- **Routes**: 路由定义，中间件绑定
