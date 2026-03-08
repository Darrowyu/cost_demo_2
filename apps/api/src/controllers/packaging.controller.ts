import type { FastifyRequest, FastifyReply } from 'fastify'
import { packagingService } from '../services/packaging.service.js'
import { sendSuccess, sendError, sendNotFound } from '../lib/response-helpers.js'

export class PackagingController {
  async getList(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as Record<string, string>
    const filter = {
      modelId: query.modelId,
    }
    const pagination = {
      page: parseInt(query.page || '1', 10),
      pageSize: parseInt(query.pageSize || '20', 10),
    }

    const result = await packagingService.getList(filter, pagination)
    return sendSuccess(reply, result.data, result.meta)
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const config = await packagingService.getById(id)
    if (!config) {
      return sendNotFound(reply, '包装配置')
    }
    return sendSuccess(reply, config)
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      modelId: string
      name: string
      packagingType: string
      perBox: number
      perCarton: number
    }

    try {
      const config = await packagingService.create(body)
      return sendSuccess(reply, config)
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_MODEL') {
        return sendError(reply, 400, 'INVALID_MODEL', '型号不存在')
      }
      throw error
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const body = request.body as {
      name?: string
      packagingType?: string
      perBox?: number
      perCarton?: number
    }

    try {
      const config = await packagingService.update(id, body)
      return sendSuccess(reply, config)
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '包装配置')
      }
      throw error
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      await packagingService.delete(id)
      return sendSuccess(reply, { message: '包装配置已删除' })
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '包装配置')
      }
      throw error
    }
  }

  async getProcesses(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const processes = await packagingService.getProcesses(id)
      return sendSuccess(reply, processes)
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '包装配置')
      }
      throw error
    }
  }

  async createProcess(request: FastifyRequest, reply: FastifyReply) {
    const { id: packagingConfigId } = request.params as { id: string }
    const body = request.body as {
      name: string
      price: number
      unit: string
      sortOrder?: number
    }

    try {
      const process = await packagingService.createProcess({
        packagingConfigId,
        name: body.name,
        price: body.price,
        unit: body.unit as 'piece' | 'dozen',
        sortOrder: body.sortOrder,
      })
      return sendSuccess(reply, process)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_CONFIG') {
          return sendError(reply, 400, 'INVALID_CONFIG', '包装配置不存在')
        }
      }
      throw error
    }
  }

  async updateProcess(request: FastifyRequest, reply: FastifyReply) {
    const { processId } = request.params as { processId: string }
    const body = request.body as {
      name?: string
      price?: number
      unit?: string
      sortOrder?: number
    }

    try {
      const process = await packagingService.updateProcess(processId, {
        name: body.name,
        price: body.price,
        unit: body.unit as 'piece' | 'dozen',
        sortOrder: body.sortOrder,
      })
      return sendSuccess(reply, process)
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '工序配置')
      }
      throw error
    }
  }

  async deleteProcess(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { processId } = request.params as { processId: string }
      await packagingService.deleteProcess(processId)
      return sendSuccess(reply, { message: '工序配置已删除' })
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '工序配置')
      }
      throw error
    }
  }

  async getMaterials(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }
      const materials = await packagingService.getMaterials(id)
      return sendSuccess(reply, materials)
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '包装配置')
      }
      throw error
    }
  }

  async createMaterial(request: FastifyRequest, reply: FastifyReply) {
    const { id: packagingConfigId } = request.params as { id: string }
    const body = request.body as {
      name: string
      quantity: number
      price: number
      boxLength?: number
      boxWidth?: number
      boxHeight?: number
    }

    try {
      const material = await packagingService.createMaterial({
        packagingConfigId,
        name: body.name,
        quantity: body.quantity,
        price: body.price,
        boxLength: body.boxLength,
        boxWidth: body.boxWidth,
        boxHeight: body.boxHeight,
      })
      return sendSuccess(reply, material)
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CONFIG') {
        return sendError(reply, 400, 'INVALID_CONFIG', '包装配置不存在')
      }
      throw error
    }
  }

  async updateMaterial(request: FastifyRequest, reply: FastifyReply) {
    const { materialId } = request.params as { materialId: string }
    const body = request.body as {
      name?: string
      quantity?: number
      price?: number
      boxLength?: number
      boxWidth?: number
      boxHeight?: number
    }

    try {
      const material = await packagingService.updateMaterial(materialId, {
        name: body.name,
        quantity: body.quantity,
        price: body.price,
        boxLength: body.boxLength,
        boxWidth: body.boxWidth,
        boxHeight: body.boxHeight,
      })
      return sendSuccess(reply, material)
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '包材配置')
      }
      throw error
    }
  }

  async deleteMaterial(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { materialId } = request.params as { materialId: string }
      await packagingService.deleteMaterial(materialId)
      return sendSuccess(reply, { message: '包材配置已删除' })
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return sendNotFound(reply, '包材配置')
      }
      throw error
    }
  }
}

export const packagingController = new PackagingController()
