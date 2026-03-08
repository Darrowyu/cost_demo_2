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
