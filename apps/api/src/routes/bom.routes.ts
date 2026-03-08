import type { FastifyInstance } from 'fastify'
import { prisma } from '@cost/database'

export const bomRoutes = async (app: FastifyInstance) => {
  // GET /api/v1/bom?modelId=:id
  app.get('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { modelId } = request.query as { modelId?: string }

    if (!modelId) {
      return reply.code(400).send({
        success: false,
        error: { code: 'MISSING_PARAM', message: '缺少modelId参数' },
      })
    }

    const bomMaterials = await prisma.bomMaterial.findMany({
      where: { modelId },
      include: {
        material: true,
        model: true,
      },
      orderBy: { sortOrder: 'asc' },
    })

    return { success: true, data: bomMaterials }
  })

  // POST /api/v1/bom
  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { modelId, materialId, quantity, sortOrder } = request.body as {
      modelId: string
      materialId: string
      quantity: number
      sortOrder?: number
    }

    // 验证型号和原材料是否存在
    const [model, material] = await Promise.all([
      prisma.model.findUnique({ where: { id: modelId } }),
      prisma.material.findUnique({ where: { id: materialId } }),
    ])

    if (!model) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_MODEL', message: '型号不存在' },
      })
    }

    if (!material) {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_MATERIAL', message: '原材料不存在' },
      })
    }

    // 获取当前最大sortOrder
    const lastItem = await prisma.bomMaterial.findFirst({
      where: { modelId },
      orderBy: { sortOrder: 'desc' },
    })

    const bomMaterial = await prisma.bomMaterial.create({
      data: {
        modelId,
        materialId,
        quantity,
        sortOrder: sortOrder ?? (lastItem ? lastItem.sortOrder + 1 : 1),
      },
      include: {
        material: true,
        model: true,
      },
    })

    return { success: true, data: bomMaterial }
  })

  // PUT /api/v1/bom/:id
  app.put('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { quantity, sortOrder } = request.body as {
      quantity?: number
      sortOrder?: number
    }

    const bomMaterial = await prisma.bomMaterial.update({
      where: { id },
      data: {
        quantity,
        sortOrder,
      },
      include: {
        material: true,
        model: true,
      },
    })

    return { success: true, data: bomMaterial }
  })

  // DELETE /api/v1/bom/:id
  app.delete('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.bomMaterial.delete({ where: { id } })

    return { success: true, data: { message: 'BOM物料已删除' } }
  })
}
