import { prisma, type Prisma } from '@cost/database'

export interface PackagingConfigFilter {
  modelId?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export class PackagingRepository {
  private readonly packagingConfigInclude = {
    model: true,
    processConfigs: {
      orderBy: { sortOrder: 'asc' } as const,
    },
    packagingMaterials: true,
  } as const

  private readonly packagingConfigListInclude = {
    model: true,
  } as const

  async findMany(filter: PackagingConfigFilter, pagination: PaginationParams) {
    const skip = (pagination.page - 1) * pagination.pageSize
    const where = this.buildWhereClause(filter)

    return prisma.packagingConfig.findMany({
      where,
      skip,
      take: pagination.pageSize,
      include: this.packagingConfigListInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async count(filter: PackagingConfigFilter) {
    const where = this.buildWhereClause(filter)
    return prisma.packagingConfig.count({ where })
  }

  async findById(id: string) {
    return prisma.packagingConfig.findUnique({
      where: { id },
      include: this.packagingConfigInclude,
    })
  }

  async create(data: Prisma.PackagingConfigCreateInput) {
    return prisma.packagingConfig.create({ data })
  }

  async update(id: string, data: Prisma.PackagingConfigUpdateInput) {
    return prisma.packagingConfig.update({
      where: { id },
      data,
    })
  }

  async delete(id: string) {
    return prisma.packagingConfig.delete({ where: { id } })
  }

  async findProcesses(packagingConfigId: string) {
    return prisma.processConfig.findMany({
      where: { packagingConfigId },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async findProcessById(id: string) {
    return prisma.processConfig.findUnique({ where: { id } })
  }

  async createProcess(data: Prisma.ProcessConfigCreateInput) {
    return prisma.processConfig.create({ data })
  }

  async updateProcess(id: string, data: Prisma.ProcessConfigUpdateInput) {
    return prisma.processConfig.update({
      where: { id },
      data,
    })
  }

  async deleteProcess(id: string) {
    return prisma.processConfig.delete({ where: { id } })
  }

  async findLastProcessBySortOrder(packagingConfigId: string) {
    return prisma.processConfig.findFirst({
      where: { packagingConfigId },
      orderBy: { sortOrder: 'desc' },
    })
  }

  async findMaterials(packagingConfigId: string) {
    return prisma.packagingMaterial.findMany({
      where: { packagingConfigId },
    })
  }

  async findMaterialById(id: string) {
    return prisma.packagingMaterial.findUnique({ where: { id } })
  }

  async createMaterial(data: Prisma.PackagingMaterialCreateInput) {
    return prisma.packagingMaterial.create({ data })
  }

  async updateMaterial(id: string, data: Prisma.PackagingMaterialUpdateInput) {
    return prisma.packagingMaterial.update({
      where: { id },
      data,
    })
  }

  async deleteMaterial(id: string) {
    return prisma.packagingMaterial.delete({ where: { id } })
  }

  private buildWhereClause(filter: PackagingConfigFilter): Prisma.PackagingConfigWhereInput {
    const where: Prisma.PackagingConfigWhereInput = {}

    if (filter.modelId) {
      where.modelId = filter.modelId
    }

    return where
  }
}

export const packagingRepository = new PackagingRepository()
