import type { FastifyRequest, FastifyReply } from 'fastify'
import { materialService } from '../services/material.service.js'
import { sendSuccess, sendError, sendNotFound } from '../lib/response-helpers.js'
import { createMaterialSchema, updateMaterialSchema, formatZodError } from '../lib/schemas.js'

export class MaterialController {
  async getList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as Record<string, string>
    const filter = {
      search: query.search,
      category: query.category,
    }
    const pagination = {
      page: parseInt(query.page || '1', 10),
      pageSize: parseInt(query.pageSize || '20', 10),
    }

    const result = await materialService.getList(filter, pagination)
    return sendSuccess(reply, result.data, result.meta)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const material = await materialService.getById(id)
    if (!material) {
      return sendNotFound(reply, '原材料')
    }
    return sendSuccess(reply, material)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const validation = createMaterialSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    try {
      const material = await materialService.create(validation.data)
      return sendSuccess(reply, material)
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_MATERIAL_NO') {
        return sendError(reply, 409, 'DUPLICATE', '物料编号已存在')
      }
      throw error
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const validation = updateMaterialSchema.safeParse(request.body)
    if (!validation.success) {
      return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    }

    try {
      const material = await materialService.update(id, validation.data)
      return sendSuccess(reply, material)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return sendNotFound(reply, '原材料')
        }
        if (error.message === 'DUPLICATE_MATERIAL_NO') {
          return sendError(reply, 409, 'DUPLICATE', '物料编号已存在')
        }
      }
      throw error
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await materialService.delete(id)
      return sendSuccess(reply, { message: '原材料已删除' })
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '原材料')
      }
      throw error
    }
  }
}

export const materialController = new MaterialController()
