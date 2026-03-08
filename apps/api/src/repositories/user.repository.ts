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
