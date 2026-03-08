import type { FastifyInstance } from 'fastify'
import { prisma } from '@cost/database'
import { sendError } from '../lib/response-helpers.js'

export const modelRoutes = async (app: FastifyInstance) => {
  // 提取重复的include配置为常量
  const modelInclude = {
    regulation: true,
  } as const

  const bomInclude = {
    material: true,
  } as const

  // GET /api/v1/models
  app.get('/', { onRequest: [app.authenticate] }, async (request) => {
    const { page = '1', pageSize = '20', regulationId = '', search = '' } = request.query as Record<string, string>

    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const take = parseInt(pageSize, 10)

    const where: {
      regulationId?: string
      OR?: Array<{ name: { contains: string; mode: 'insensitive' } } | { category: { contains: string; mode: 'insensitive' } }>
    } = {}

    if (regulationId) where.regulationId = regulationId

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        skip,
        take,
        include: modelInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.model.count({ where }),
    ])

    return {
      success: true,
      data: models,
      meta: {
        page: parseInt(page, 10),
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    }
  })

  // GET /api/v1/models/:id
  app.get('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const model = await prisma.model.findUnique({
      where: { id },
      include: modelInclude,
    })

    if (!model) return sendError(reply, 404, 'NOT_FOUND', '型号不存在')

    return { success: true, data: model }
  })

  // GET /api/v1/models/:id/packaging-configs
  app.get('/:id/packaging-configs', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const model = await prisma.model.findUnique({
      where: { id },
    })

    if (!model) return sendError(reply, 404, 'NOT_FOUND', '型号不存在')

    const configs = await prisma.packagingConfig.findMany({
      where: { modelId: id },
    })

    return { success: true, data: configs }
  })

  // GET /api/v1/models/:id/bom
  app.get('/:id/bom', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const model = await prisma.model.findUnique({
      where: { id },
    })

    if (!model) return sendError(reply, 404, 'NOT_FOUND', '型号不存在')

    const bomMaterials = await prisma.bomMaterial.findMany({
      where: { modelId: id },
      include: bomInclude,
      orderBy: { sortOrder: 'asc' },
    })

    return { success: true, data: bomMaterials }
  })

  // POST /api/v1/models
  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { name, regulationId, category, series, imageUrl } = request.body as {
      name: string
      regulationId: string
      category: string
      series: string
      imageUrl?: string
    }

    const regulation = await prisma.regulation.findUnique({
      where: { id: regulationId },
    })

    if (!regulation) return sendError(reply, 400, 'INVALID_REGULATION', '法规不存在')

    const model = await prisma.model.create({
      data: {
        name,
        regulationId,
        category,
        series,
        imageUrl,
      },
    })

    return { success: true, data: model }
  })

  // PUT /api/v1/models/:id
  app.put('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { name, regulationId, category, series, imageUrl } = request.body as {
      name?: string
      regulationId?: string
      category?: string
      series?: string
      imageUrl?: string
    }

    if (regulationId) {
      const regulation = await prisma.regulation.findUnique({
        where: { id: regulationId },
      })

      if (!regulation) return sendError(reply, 400, 'INVALID_REGULATION', '法规不存在')
    }

    const model = await prisma.model.update({
      where: { id },
      data: {
        name,
        regulationId,
        category,
        series,
        imageUrl,
      },
    })

    return { success: true, data: model }
  })

  // DELETE /api/v1/models/:id
  app.delete('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.model.delete({ where: { id } })

    return { success: true, data: { message: '型号已删除' } }
  })
}
