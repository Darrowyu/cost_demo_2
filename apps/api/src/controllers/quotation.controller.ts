import type { FastifyRequest, FastifyReply } from 'fastify'
import { quotationService } from '../services/quotation.service.js'
import { createQuotationSchema, updateQuotationSchema, calculateQuotationSchema, formatZodError } from '../lib/schemas.js'
import { sendError, sendSuccess } from '../lib/response-helpers.js'
import type { QuotationStatus } from '@cost/database'

interface GetListQuery {
  page?: string
  pageSize?: string
  status?: string
  customerId?: string
  modelId?: string
}

interface GetByIdParams {
  id: string
}

interface SubmitApproveRejectParams {
  id: string
}

interface ApproveRejectBody {
  note?: string
}

function getUserId(request: FastifyRequest): string {
  return request.user.userId
}

export class QuotationController {
  getList = async (request: FastifyRequest, reply: FastifyReply) => {
    const {
      page = '1',
      pageSize = '20',
      status = '',
      customerId = '',
      modelId = '',
    } = request.query as GetListQuery

    const result = await quotationService.getList({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      status: status as QuotationStatus | undefined,
      customerId: customerId || undefined,
      modelId: modelId || undefined,
    })

    return sendSuccess(reply, result.quotations, {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    })
  }

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as GetByIdParams

    const quotation = await quotationService.getById(id)
    if (!quotation) {
      return sendError(reply, 404, 'NOT_FOUND', '报价单不存在')
    }

    return sendSuccess(reply, quotation)
  }

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request)
    const validation = createQuotationSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    const quotation = await quotationService.create(userId, validation.data)
    return sendSuccess(reply, quotation)
  }

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as GetByIdParams
    const validation = updateQuotationSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    try {
      const quotation = await quotationService.update(id, validation.data)
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return sendError(reply, 404, 'NOT_FOUND', '报价单不存在')
        }
        if (error.message === 'INVALID_STATUS') {
          return sendError(reply, 400, 'INVALID_STATUS', '只能修改草稿状态的报价单')
        }
      }
      throw error
    }
  }

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as GetByIdParams

    try {
      await quotationService.delete(id)
      return sendSuccess(reply, { message: '报价单已删除' })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return sendError(reply, 404, 'NOT_FOUND', '报价单不存在')
        }
        if (error.message === 'INVALID_STATUS') {
          return sendError(reply, 400, 'INVALID_STATUS', '已审核通过的报价单不能删除')
        }
      }
      throw error
    }
  }

  submit = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as SubmitApproveRejectParams

    try {
      const quotation = await quotationService.submit(id)
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return sendError(reply, 404, 'NOT_FOUND', '报价单不存在')
        }
        if (error.message === 'INVALID_STATUS') {
          return sendError(reply, 400, 'INVALID_STATUS', '只能提交草稿状态的报价单')
        }
      }
      throw error
    }
  }

  approve = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request)
    const { id } = request.params as SubmitApproveRejectParams
    const { note } = request.body as ApproveRejectBody

    try {
      const quotation = await quotationService.approve(id, { userId, note })
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return sendError(reply, 404, 'NOT_FOUND', '报价单不存在')
        }
        if (error.message === 'INVALID_STATUS') {
          return sendError(reply, 400, 'INVALID_STATUS', '只能审核已提交的报价单')
        }
      }
      throw error
    }
  }

  reject = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request)
    const { id } = request.params as SubmitApproveRejectParams
    const { note } = request.body as ApproveRejectBody

    try {
      const quotation = await quotationService.reject(id, { userId, note })
      return sendSuccess(reply, quotation)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return sendError(reply, 404, 'NOT_FOUND', '报价单不存在')
        }
        if (error.message === 'INVALID_STATUS') {
          return sendError(reply, 400, 'INVALID_STATUS', '只能审核已提交的报价单')
        }
      }
      throw error
    }
  }

  calculate = async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = calculateQuotationSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    try {
      const result = await quotationService.calculate(validation.data)
      return sendSuccess(reply, result)
    } catch (error) {
      if (error instanceof Error && error.message === '包装配置不存在') {
        return sendError(reply, 400, 'INVALID_CONFIG', '包装配置不存在')
      }
      throw error
    }
  }
}

export const quotationController = new QuotationController()
