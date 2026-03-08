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
  #defaultInclude = {
    customer: true,
    regulation: true,
    model: true,
    packagingConfig: true,
  } as const

  #detailedInclude = {
    customer: true,
    regulation: true,
    model: true,
    packagingConfig: {
      include: {
        processConfigs: true,
        packagingMaterials: true,
      },
    },
    creator: { select: { id: true, name: true } },
    reviewer: { select: { id: true, name: true } },
  } as const

  #listInclude = {
    customer: true,
    regulation: true,
    model: true,
    packagingConfig: true,
    creator: { select: { id: true, name: true } },
    reviewer: { select: { id: true, name: true } },
  } as const

  #buildWhere(filter: QuotationFilter): Prisma.QuotationWhereInput {
    const where: Prisma.QuotationWhereInput = {}
    if (filter.status) where.status = filter.status
    if (filter.customerId) where.customerId = filter.customerId
    if (filter.modelId) where.modelId = filter.modelId
    return where
  }

  async findMany(filter: QuotationFilter, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.pageSize
    const where = this.#buildWhere(filter)

    return prisma.quotation.findMany({
      where,
      skip,
      take: pagination.pageSize,
      include: this.#listInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async count(filter: QuotationFilter) {
    const where = this.#buildWhere(filter)
    return prisma.quotation.count({ where })
  }

  async findById(id: string) {
    return prisma.quotation.findUnique({
      where: { id },
      include: this.#detailedInclude,
    })
  }

  async findByIdBasic(id: string) {
    return prisma.quotation.findUnique({ where: { id } })
  }

  async findLastByYear(year: number) {
    return prisma.quotation.findFirst({
      where: { quotationNo: { startsWith: `QT-${year}` } },
      orderBy: { quotationNo: 'desc' },
    })
  }

  async create(data: Prisma.QuotationCreateInput) {
    return prisma.quotation.create({
      data,
      include: this.#defaultInclude,
    })
  }

  async update(id: string, data: Prisma.QuotationUpdateInput) {
    return prisma.quotation.update({
      where: { id },
      data,
      include: this.#defaultInclude,
    })
  }

  async updateWithReviewer(id: string, data: Prisma.QuotationUpdateInput) {
    return prisma.quotation.update({
      where: { id },
      data,
      include: {
        ...this.#defaultInclude,
        reviewer: { select: { id: true, name: true } },
      },
    })
  }

  async delete(id: string) {
    return prisma.quotation.delete({ where: { id } })
  }
}

export const quotationRepository = new QuotationRepository()
