import type { FastifyInstance, FastifyRequest } from 'fastify'
import { prisma, type NotificationStatus } from '@cost/database'

export const notificationRoutes = async (app: FastifyInstance) => {
  const getUserId = (request: FastifyRequest) => request.user.userId

  // GET /api/v1/notifications
  app.get('/', { onRequest: [app.authenticate] }, async (request) => {
    const { page = '1', pageSize = '20', status = '' } = request.query as Record<string, string>

    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10)
    const take = parseInt(pageSize, 10)

    const where = status ? { status: status as NotificationStatus } : {}

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        include: {
          material: true,
          processor: {
            select: { id: true, name: true },
          },
        },
        orderBy: { triggeredAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ])

    return {
      success: true,
      data: notifications,
      meta: {
        page: parseInt(page, 10),
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    }
  })

  // GET /api/v1/notifications/unread-count
  app.get('/unread-count', { onRequest: [app.authenticate] }, async () => {
    const count = await prisma.notification.count({
      where: { status: 'pending' as NotificationStatus },
    })

    return { success: true, data: { count } }
  })

  // PUT /api/v1/notifications/:id/process
  app.put('/:id/process', { onRequest: [app.authenticate] }, async (request, reply) => {
    const userId = getUserId(request)
    const { id } = request.params as { id: string }

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return reply.code(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: '通知不存在' },
      })
    }

    if (notification.status !== 'pending') {
      return reply.code(400).send({
        success: false,
        error: { code: 'INVALID_STATUS', message: '该通知已处理' },
      })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        status: 'processed',
        processedBy: userId,
        processedAt: new Date(),
      },
      include: {
        material: true,
        processor: {
          select: { id: true, name: true },
        },
      },
    })

    return { success: true, data: updated }
  })
}
