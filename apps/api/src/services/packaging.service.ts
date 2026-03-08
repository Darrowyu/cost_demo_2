import { BaseService } from './base.service.js'
import { packagingRepository, type PackagingConfigFilter, type PaginationParams } from '../repositories/packaging.repository.js'

export interface CreatePackagingConfigInput {
  modelId: string
  name: string
  packagingType: string
  perBox: number
  perCarton: number
}

export interface UpdatePackagingConfigInput {
  name?: string
  packagingType?: string
  perBox?: number
  perCarton?: number
}

export interface CreateProcessInput {
  packagingConfigId: string
  name: string
  price: number
  unit: 'piece' | 'dozen'
  sortOrder?: number
}

export interface UpdateProcessInput {
  name?: string
  price?: number
  unit?: 'piece' | 'dozen'
  sortOrder?: number
}

export interface CreatePackagingMaterialInput {
  packagingConfigId: string
  name: string
  quantity: number
  price: number
  boxLength?: number
  boxWidth?: number
  boxHeight?: number
}

export interface UpdatePackagingMaterialInput {
  name?: string
  quantity?: number
  price?: number
  boxLength?: number
  boxWidth?: number
  boxHeight?: number
}

export class PackagingService extends BaseService {
  private repository = packagingRepository

  async getList(filter: PackagingConfigFilter, pagination: PaginationParams) {
    const [configs, total] = await Promise.all([
      this.repository.findMany(filter, pagination),
      this.repository.count(filter),
    ])

    return {
      data: configs,
      meta: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize),
      },
    }
  }

  async getById(id: string) {
    return this.repository.findById(id)
  }

  async create(input: CreatePackagingConfigInput) {
    const model = await this.prisma.model.findUnique({
      where: { id: input.modelId },
    })

    if (!model) {
      throw new Error('INVALID_MODEL')
    }

    return this.repository.create({
      model: { connect: { id: input.modelId } },
      name: input.name,
      packagingType: input.packagingType,
      perBox: input.perBox,
      perCarton: input.perCarton,
    })
  }

  async update(id: string, input: UpdatePackagingConfigInput) {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }

    return this.repository.update(id, {
      name: input.name,
      packagingType: input.packagingType,
      perBox: input.perBox,
      perCarton: input.perCarton,
    })
  }

  async delete(id: string) {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }

    await this.repository.delete(id)
  }

  async getProcesses(packagingConfigId: string) {
    const config = await this.repository.findById(packagingConfigId)
    if (!config) {
      throw new Error('NOT_FOUND')
    }

    return this.repository.findProcesses(packagingConfigId)
  }

  async createProcess(input: CreateProcessInput) {
    const config = await this.repository.findById(input.packagingConfigId)
    if (!config) {
      throw new Error('INVALID_CONFIG')
    }

    const lastItem = await this.repository.findLastProcessBySortOrder(input.packagingConfigId)
    const sortOrder = input.sortOrder ?? (lastItem ? lastItem.sortOrder + 1 : 1)

    return this.repository.createProcess({
      packagingConfig: { connect: { id: input.packagingConfigId } },
      name: input.name,
      price: input.price,
      unit: input.unit,
      sortOrder,
    })
  }

  async updateProcess(id: string, input: UpdateProcessInput) {
    const existing = await this.repository.findProcessById(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }

    return this.repository.updateProcess(id, {
      name: input.name,
      price: input.price,
      unit: input.unit,
      sortOrder: input.sortOrder,
    })
  }

  async deleteProcess(id: string) {
    const existing = await this.repository.findProcessById(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }

    await this.repository.deleteProcess(id)
  }

  async getMaterials(packagingConfigId: string) {
    const config = await this.repository.findById(packagingConfigId)
    if (!config) {
      throw new Error('NOT_FOUND')
    }

    return this.repository.findMaterials(packagingConfigId)
  }

  async createMaterial(input: CreatePackagingMaterialInput) {
    const config = await this.repository.findById(input.packagingConfigId)
    if (!config) {
      throw new Error('INVALID_CONFIG')
    }

    return this.repository.createMaterial({
      packagingConfig: { connect: { id: input.packagingConfigId } },
      name: input.name,
      quantity: input.quantity,
      price: input.price,
      boxLength: input.boxLength,
      boxWidth: input.boxWidth,
      boxHeight: input.boxHeight,
    })
  }

  async updateMaterial(id: string, input: UpdatePackagingMaterialInput) {
    const existing = await this.repository.findMaterialById(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }

    return this.repository.updateMaterial(id, {
      name: input.name,
      quantity: input.quantity,
      price: input.price,
      boxLength: input.boxLength,
      boxWidth: input.boxWidth,
      boxHeight: input.boxHeight,
    })
  }

  async deleteMaterial(id: string) {
    const existing = await this.repository.findMaterialById(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }

    await this.repository.deleteMaterial(id)
  }
}

export const packagingService = new PackagingService()
