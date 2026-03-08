import type { FastifyInstance } from 'fastify'
import { prisma, type RegulationStatus } from '@cost/database'
import { createRegulationSchema, updateRegulationSchema, formatZodError } from '../lib/schemas.js'
import { sendError } from '../lib/response-helpers.js'

export const regulationRoutes = async (app: FastifyInstance) => {
  // GET /api/v1/regulations
  app.get('/', { onRequest: [app.authenticate] }, async () => {
    const regulations = await prisma.regulation.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: regulations }
  })

  // GET /api/v1/regulations/:id
  app.get('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const regulation = await prisma.regulation.findUnique({
      where: { id },
    })

    if (!regulation) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: '法规不存在' },
      })
    }

    return { success: true, data: regulation }
  })

  // POST /api/v1/regulations
  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const validation = createRegulationSchema.safeParse(request.body)
    if (!validation.success) return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    const { code, name, description, status } = validation.data

    const regulation = await prisma.regulation.create({
      data: {
        code,
        name,
        description,
        status: (status || 'active') as RegulationStatus,
      },
    })

    return { success: true, data: regulation }
  })

  // PUT /api/v1/regulations/:id
  app.put('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const validation = updateRegulationSchema.safeParse(request.body)
    if (!validation.success) return sendError(reply, 400, 'VALIDATION_ERROR', formatZodError(validation.error))
    const { code, name, description, status } = validation.data

    const regulation = await prisma.regulation.update({
      where: { id },
      data: {
        code,
        name,
        description,
        status: status as RegulationStatus | undefined,
      },
    })

    return { success: true, data: regulation }
  })

  // DELETE /api/v1/regulations/:id
  app.delete('/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await prisma.regulation.delete({ where: { id } })

    return { success: true, data: { message: '法规已删除' } }
  })
}
