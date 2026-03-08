import type { FastifyRequest, FastifyReply } from 'fastify'
import { createCustomerSchema, updateCustomerSchema, formatZodError } from '../lib/schemas.js'
import { sendSuccess, sendError, sendNotFound } from '../utils/http-response.js'
import { customerService } from '../services/customer.service.js'
import type { CreateCustomerInput, UpdateCustomerInput } from '../services/customer.service.js'
import type { CustomerFilter } from '../repositories/customer.repository.js'
import type { PaginationParams } from '../repositories/user.repository.js'
import type { UserPayload } from '../types/fastify.js'

interface GetListQuery {
  page?: string
  pageSize?: string
  search?: string
}

interface GetByIdParams {
  id: string
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

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as UserPayload).userId
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

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = (request.user as UserPayload).userId
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
