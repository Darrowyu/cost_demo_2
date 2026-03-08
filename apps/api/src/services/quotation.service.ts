import { QuotationStatus, type Prisma } from '@cost/database'
import { BaseService } from './base.service.js'
import { quotationRepository } from '../repositories/quotation.repository.js'
import { calculateCosts, type CostCalculationInput, type CostCalculationResult } from '../utils/cost-calculator.js'
import type { CreateQuotationInput, UpdateQuotationInput } from '../lib/schemas.js'

interface ListQuotationsParams {
  page: number
  pageSize: number
  status?: QuotationStatus
  customerId?: string
  modelId?: string
}

interface ListQuotationsResult {
  quotations: Awaited<ReturnType<typeof quotationRepository.findMany>>
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface ApproveRejectInput {
  userId: string
  note?: string
}

export class QuotationService extends BaseService {
  async getList(params: ListQuotationsParams): Promise<ListQuotationsResult> {
    const { page, pageSize, status, customerId, modelId } = params

    const filter = { status, customerId, modelId }
    const pagination = { page, pageSize }

    const [quotations, total] = await Promise.all([
      quotationRepository.findMany(filter, pagination),
      quotationRepository.count(filter),
    ])

    return {
      quotations,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getById(id: string) {
    return quotationRepository.findById(id)
  }

  async generateQuotationNo(): Promise<string> {
    const year = new Date().getFullYear()
    const lastQuotation = await quotationRepository.findLastByYear(year)

    const seq = lastQuotation
      ? parseInt(lastQuotation.quotationNo.split('-')[2] ?? '0', 10) + 1
      : 1

    return `QT-${year}-${seq.toString().padStart(4, '0')}`
  }

  async create(userId: string, input: CreateQuotationInput) {
    const quotationNo = await this.generateQuotationNo()

    const data: Prisma.QuotationCreateInput = {
      quotationNo,
      customer: { connect: { id: input.customerId } },
      regulation: { connect: { id: input.regulationId } },
      model: { connect: { id: input.modelId } },
      packagingConfig: { connect: { id: input.packagingConfigId } },
      saleType: input.saleType,
      shippingType: input.shippingType,
      quantity: input.quantity,
      materialCost: input.materialCost,
      packagingCost: input.packagingCost,
      processCost: input.processCost,
      shippingCost: input.shippingCost,
      adminFee: input.adminFee,
      vat: input.vat,
      totalCost: input.totalCost,
      status: 'draft',
      creator: { connect: { id: userId } },
    }

    return quotationRepository.create(data)
  }

  async update(id: string, input: UpdateQuotationInput) {
    const existing = await quotationRepository.findByIdBasic(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }
    if (existing.status !== 'draft') {
      throw new Error('INVALID_STATUS')
    }

    const data: Prisma.QuotationUpdateInput = {}
    if (input.customerId) data.customer = { connect: { id: input.customerId } }
    if (input.regulationId) data.regulation = { connect: { id: input.regulationId } }
    if (input.modelId) data.model = { connect: { id: input.modelId } }
    if (input.packagingConfigId) data.packagingConfig = { connect: { id: input.packagingConfigId } }
    if (input.saleType) data.saleType = input.saleType
    if (input.shippingType) data.shippingType = input.shippingType
    if (input.quantity !== undefined) data.quantity = input.quantity
    if (input.materialCost !== undefined) data.materialCost = input.materialCost
    if (input.packagingCost !== undefined) data.packagingCost = input.packagingCost
    if (input.processCost !== undefined) data.processCost = input.processCost
    if (input.shippingCost !== undefined) data.shippingCost = input.shippingCost
    if (input.adminFee !== undefined) data.adminFee = input.adminFee
    if (input.vat !== undefined) data.vat = input.vat
    if (input.totalCost !== undefined) data.totalCost = input.totalCost

    return quotationRepository.update(id, data)
  }

  async delete(id: string) {
    const existing = await quotationRepository.findByIdBasic(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }
    if (existing.status === 'approved') {
      throw new Error('INVALID_STATUS')
    }

    return quotationRepository.delete(id)
  }

  async submit(id: string) {
    const existing = await quotationRepository.findByIdBasic(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }
    if (existing.status !== 'draft') {
      throw new Error('INVALID_STATUS')
    }

    return quotationRepository.update(id, { status: 'submitted' })
  }

  async approve(id: string, input: ApproveRejectInput) {
    const { userId, note } = input

    const existing = await quotationRepository.findByIdBasic(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }
    if (existing.status !== 'submitted') {
      throw new Error('INVALID_STATUS')
    }

    return quotationRepository.updateWithReviewer(id, {
      status: 'approved',
      reviewer: { connect: { id: userId } },
      reviewedAt: new Date(),
      reviewNote: note,
    })
  }

  async reject(id: string, input: ApproveRejectInput) {
    const { userId, note } = input

    const existing = await quotationRepository.findByIdBasic(id)
    if (!existing) {
      throw new Error('NOT_FOUND')
    }
    if (existing.status !== 'submitted') {
      throw new Error('INVALID_STATUS')
    }

    return quotationRepository.updateWithReviewer(id, {
      status: 'rejected',
      reviewer: { connect: { id: userId } },
      reviewedAt: new Date(),
      reviewNote: note,
    })
  }

  async calculate(input: CostCalculationInput): Promise<CostCalculationResult> {
    return calculateCosts(input)
  }
}

export const quotationService = new QuotationService()
