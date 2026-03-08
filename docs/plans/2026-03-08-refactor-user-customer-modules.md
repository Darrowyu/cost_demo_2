# User 和 Customer 模块重构计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 User 和 Customer 模块从 routes 文件中提取，重构为 Repository → Service → Controller → Routes 三层架构

**Architecture:** 每层职责单一：Repository 负责数据访问，Service 负责业务逻辑，Controller 负责 HTTP 请求处理，Routes 仅做路由定义

**Tech Stack:** TypeScript, Fastify, Prisma, Zod, bcryptjs

---

## 前置依赖

- `apps/api/src/utils/http-response.ts` - sendSuccess, sendError, sendNotFound
- `apps/api/src/lib/schemas.ts` - Zod schemas 和 formatZodError
- `apps/api/src/services/base.service.ts` - BaseService 基类

---

## Task 1: 创建 User Repository

**Files:**
- Create: `apps/api/src/repositories/user.repository.ts`

**Step 1: 创建 UserRepository 类**

```typescript
import { prisma } from '@cost/database'
import type { Prisma, User } from '@cost/database'

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const USER_SELECT_FIELDS = {
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const

export class UserRepository {
  async findMany(params: PaginationParams): Promise<PaginatedResult<Pick<User, keyof typeof USER_SELECT_FIELDS>>> {
    const skip = (params.page - 1) * params.pageSize
    const take = params.pageSize

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: USER_SELECT_FIELDS,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ])

    return {
      data: users,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    }
  }

  async count(): Promise<number> {
    return prisma.user.count()
  }

  async findById(id: string): Promise<Pick<User, keyof typeof USER_SELECT_FIELDS> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: USER_SELECT_FIELDS,
    })
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } })
  }

  async create(data: Prisma.UserCreateInput): Promise<Pick<User, keyof typeof USER_SELECT_FIELDS>> {
    return prisma.user.create({
      data,
      select: USER_SELECT_FIELDS,
    })
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<Pick<User, keyof typeof USER_SELECT_FIELDS>> {
    return prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT_FIELDS,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  }
}

export const userRepository = new UserRepository()
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## Task 2: 创建 User Service

**Files:**
- Create: `apps/api/src/services/user.service.ts`

**Step 1: 创建 UserService 类**

```typescript
import bcrypt from 'bcryptjs'
import type { Prisma, Role, UserStatus } from '@cost/database'
import { BaseService } from './base.service.js'
import { userRepository, type PaginationParams, type PaginatedResult } from '../repositories/user.repository.js'
import type { User } from '@cost/database'

export interface CreateUserInput {
  username: string
  password: string
  name: string
  email: string
  role: Role
  status?: UserStatus
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: Role
  status?: UserStatus
}

const USER_SELECT_FIELDS = {
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const

type UserResult = Pick<User, keyof typeof USER_SELECT_FIELDS>

export class UserService extends BaseService {
  async getList(params: PaginationParams): Promise<PaginatedResult<UserResult>> {
    return userRepository.findMany(params)
  }

  async getById(id: string): Promise<UserResult | null> {
    return userRepository.findById(id)
  }

  async create(input: CreateUserInput): Promise<UserResult> {
    const hashedPassword = await bcrypt.hash(input.password, 10)

    const createData: Prisma.UserCreateInput = {
      username: input.username,
      password: hashedPassword,
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status || 'active',
    }

    return userRepository.create(createData)
  }

  async update(id: string, input: UpdateUserInput): Promise<UserResult> {
    const updateData: Prisma.UserUpdateInput = {
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
    }

    return userRepository.update(id, updateData)
  }

  async delete(id: string): Promise<void> {
    return userRepository.delete(id)
  }
}

export const userService = new UserService()
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## Task 3: 创建 User Controller

**Files:**
- Create: `apps/api/src/controllers/user.controller.ts`

**Step 1: 创建 UserController 类**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { createUserSchema, updateUserSchema, formatZodError } from '../lib/schemas.js'
import { sendSuccess, sendError, sendNotFound } from '../utils/http-response.js'
import { userService } from '../services/user.service.js'
import type { CreateUserInput, UpdateUserInput } from '../services/user.service.js'
import type { PaginationParams } from '../repositories/user.repository.js'

interface GetListQuery {
  page?: string
  pageSize?: string
}

interface GetByIdParams {
  id: string
}

export class UserController {
  async getList(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page = '1', pageSize = '20' } = request.query as GetListQuery

    const pagination: PaginationParams = {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    }

    const result = await userService.getList(pagination)
    return sendSuccess(reply, result.data, result.meta)
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as GetByIdParams

    const user = await userService.getById(id)
    if (!user) {
      return sendNotFound(reply, '用户')
    }

    return sendSuccess(reply, user)
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const validation = createUserSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    const input: CreateUserInput = validation.data
    const user = await userService.create(input)
    return sendSuccess(reply, user)
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as GetByIdParams
    const validation = updateUserSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    const input: UpdateUserInput = validation.data
    const user = await userService.update(id, input)
    return sendSuccess(reply, user)
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as GetByIdParams

    await userService.delete(id)
    return sendSuccess(reply, { message: '用户已删除' })
  }
}

export const userController = new UserController()
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## Task 4: 重构 User Routes

**Files:**
- Modify: `apps/api/src/routes/users.routes.ts`

**Step 1: 替换 routes 为简化版本**

```typescript
import type { FastifyInstance } from 'fastify'
import { userController } from '../controllers/user.controller.js'

export const userRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/', { onRequest: [app.authenticate] }, userController.getList.bind(userController))
  app.get('/:id', { onRequest: [app.authenticate] }, userController.getById.bind(userController))
  app.post('/', { onRequest: [app.authenticate] }, userController.create.bind(userController))
  app.put('/:id', { onRequest: [app.authenticate] }, userController.update.bind(userController))
  app.delete('/:id', { onRequest: [app.authenticate] }, userController.delete.bind(userController))
}
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## Task 5: 创建 Customer Repository

**Files:**
- Create: `apps/api/src/repositories/customer.repository.ts`

**Step 1: 创建 CustomerRepository 类**

```typescript
import { prisma } from '@cost/database'
import type { Prisma, Customer } from '@cost/database'
import type { PaginationParams, PaginatedResult } from './user.repository.js'

export interface CustomerFilter {
  search?: string
}

export class CustomerRepository {
  async findMany(filter: CustomerFilter, params: PaginationParams): Promise<PaginatedResult<Customer>> {
    const skip = (params.page - 1) * params.pageSize
    const take = params.pageSize

    const where = this.buildWhereClause(filter)

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ])

    return {
      data: customers,
      meta: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    }
  }

  async count(filter: CustomerFilter): Promise<number> {
    const where = this.buildWhereClause(filter)
    return prisma.customer.count({ where })
  }

  async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { id } })
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({ data })
  }

  async update(id: string, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return prisma.customer.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.customer.delete({ where: { id } })
  }

  private buildWhereClause(filter: CustomerFilter): Prisma.CustomerWhereInput {
    if (!filter.search) return {}

    return {
      OR: [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
      ],
    }
  }
}

export const customerRepository = new CustomerRepository()
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## Task 6: 创建 Customer Service

**Files:**
- Create: `apps/api/src/services/customer.service.ts`

**Step 1: 创建 CustomerService 类**

```typescript
import type { Customer } from '@cost/database'
import { BaseService } from './base.service.js'
import { customerRepository, type CustomerFilter } from '../repositories/customer.repository.js'
import type { PaginationParams, PaginatedResult } from '../repositories/user.repository.js'

export interface CreateCustomerInput {
  code: string
  name: string
  region: string
  note?: string
  createdBy: string
}

export interface UpdateCustomerInput {
  code?: string
  name?: string
  region?: string
  note?: string
  updatedBy: string
}

export class CustomerService extends BaseService {
  async getList(filter: CustomerFilter, params: PaginationParams): Promise<PaginatedResult<Customer>> {
    return customerRepository.findMany(filter, params)
  }

  async getById(id: string): Promise<Customer | null> {
    return customerRepository.findById(id)
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const { createdBy, ...data } = input

    return customerRepository.create({
      ...data,
      createdBy,
      updatedBy: createdBy,
    })
  }

  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const { updatedBy, ...data } = input

    return customerRepository.update(id, {
      ...data,
      updatedBy,
    })
  }

  async delete(id: string): Promise<void> {
    return customerRepository.delete(id)
  }
}

export const customerService = new CustomerService()
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## Task 7: 创建 Customer Controller

**Files:**
- Create: `apps/api/src/controllers/customer.controller.ts`

**Step 1: 创建 CustomerController 类**

```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import { createCustomerSchema, updateCustomerSchema, formatZodError } from '../lib/schemas.js'
import { sendSuccess, sendError, sendNotFound } from '../utils/http-response.js'
import { customerService } from '../services/customer.service.js'
import type { CreateCustomerInput, UpdateCustomerInput } from '../services/customer.service.js'
import type { CustomerFilter } from '../repositories/customer.repository.js'
import type { PaginationParams } from '../repositories/user.repository.js'

interface GetListQuery {
  page?: string
  pageSize?: string
  search?: string
}

interface GetByIdParams {
  id: string
}

interface FastifyRequestWithUser extends FastifyRequest {
  user: { userId: string }
}

export class CustomerController {
  async getList(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { page = '1', pageSize = '20', search = '' } = request.query as GetListQuery

    const filter: CustomerFilter = { search }
    const pagination: PaginationParams = {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    }

    const result = await customerService.getList(filter, pagination)
    return sendSuccess(reply, result.data, result.meta)
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as GetByIdParams

    const customer = await customerService.getById(id)
    if (!customer) {
      return sendNotFound(reply, '客户')
    }

    return sendSuccess(reply, customer)
  }

  async create(request: FastifyRequestWithUser, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId
    const validation = createCustomerSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    const input: CreateCustomerInput = {
      ...validation.data,
      createdBy: userId,
    }
    const customer = await customerService.create(input)
    return sendSuccess(reply, customer)
  }

  async update(request: FastifyRequestWithUser, reply: FastifyReply): Promise<void> {
    const userId = request.user.userId
    const { id } = request.params as GetByIdParams
    const validation = updateCustomerSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    const input: UpdateCustomerInput = {
      ...validation.data,
      updatedBy: userId,
    }
    const customer = await customerService.update(id, input)
    return sendSuccess(reply, customer)
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as GetByIdParams

    await customerService.delete(id)
    return sendSuccess(reply, { message: '客户已删除' })
  }
}

export const customerController = new CustomerController()
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## Task 8: 重构 Customer Routes

**Files:**
- Modify: `apps/api/src/routes/customers.routes.ts`

**Step 1: 替换 routes 为简化版本**

```typescript
import type { FastifyInstance } from 'fastify'
import { customerController } from '../controllers/customer.controller.js'

export const customerRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/', { onRequest: [app.authenticate] }, customerController.getList.bind(customerController))
  app.get('/:id', { onRequest: [app.authenticate] }, customerController.getById.bind(customerController))
  app.post('/', { onRequest: [app.authenticate] }, customerController.create.bind(customerController))
  app.put('/:id', { onRequest: [app.authenticate] }, customerController.update.bind(customerController))
  app.delete('/:id', { onRequest: [app.authenticate] }, customerController.delete.bind(customerController))
}
```

**Step 2: 运行类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

---

## 最终验证

**Step 1: 完整类型检查**

```bash
cd D:\Darrow\Code\Project\WIP\Cost_demo_2 && pnpm run typecheck --filter api
```

Expected: 无错误

**Step 2: 检查文件结构**

确认以下文件已创建：
- `apps/api/src/repositories/user.repository.ts`
- `apps/api/src/repositories/customer.repository.ts`
- `apps/api/src/services/user.service.ts`
- `apps/api/src/services/customer.service.ts`
- `apps/api/src/controllers/user.controller.ts`
- `apps/api/src/controllers/customer.controller.ts`
- `apps/api/src/routes/users.routes.ts` (已修改)
- `apps/api/src/routes/customers.routes.ts` (已修改)

---

## 变更摘要

1. **新增 Repository 层** - 封装所有 Prisma 查询逻辑
2. **新增 Service 层** - 处理业务逻辑（密码加密、审计字段等）
3. **新增 Controller 层** - 处理 HTTP 请求/响应和验证
4. **简化 Routes** - 仅保留路由定义，委托给 Controller
5. **类型安全** - 所有参数和返回值都有明确类型定义
