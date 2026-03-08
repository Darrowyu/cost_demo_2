import { prisma, type Prisma } from '@cost/database'

export interface MaterialFilter {
  search?: string
  category?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export class MaterialRepository {
  async findMany(filter: MaterialFilter, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.pageSize
    const where = this.buildWhereClause(filter)

    return prisma.material.findMany({
      where,
      skip,
      take: pagination.pageSize,
      orderBy: { createdAt: 'desc' },
    })
  }

  async count(filter: MaterialFilter) {
    const where = this.buildWhereClause(filter)
    return prisma.material.count({ where })
  }

  async findById(id: string) {
    return prisma.material.findUnique({ where: { id } })
  }

  async findByMaterialNo(materialNo: string) {
    return prisma.material.findFirst({
      where: { materialNo: { equals: materialNo, mode: 'insensitive' } },
    })
  }

  async create(data: Prisma.MaterialCreateInput) {
    return prisma.material.create({ data })
  }

  async update(id: string, data: Prisma.MaterialUpdateInput) {
    return prisma.material.update({ where: { id }, data })
  }

  async delete(id: string) {
    return prisma.material.delete({ where: { id } })
  }

  private buildWhereClause(filter: MaterialFilter): Prisma.MaterialWhereInput {
    const where: Prisma.MaterialWhereInput = {}

    if (filter.category) {
      where.category = filter.category
    }

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { materialNo: { contains: filter.search, mode: 'insensitive' } },
      ]
    }

    return where
  }
}

export const materialRepository = new MaterialRepository()
