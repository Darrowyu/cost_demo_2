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
