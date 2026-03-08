import type { FastifyInstance } from 'fastify'
import { prisma } from '@cost/database'

export const dashboardRoutes = async (app: FastifyInstance) => {
  // GET /api/v1/dashboard/stats
  app.get('/stats', { onRequest: [app.authenticate] }, async () => {
    // 获取基础统计数据
    const [
      totalQuotations,
      totalCustomers,
      totalModels,
      pendingReviews,
    ] = await Promise.all([
      prisma.quotation.count(),
      prisma.customer.count(),
      prisma.model.count(),
      prisma.quotation.count({ where: { status: 'submitted' } }),
    ])

    // 获取最近6周的报价单趋势
    const weeks: { week: string; count: number }[] = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() - i * 7)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const count = await prisma.quotation.count({
        where: {
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
        },
      })

      const weekNum = Math.ceil(
        (startOfWeek.getTime() - new Date(startOfWeek.getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      )

      weeks.push({
        week: `第${weekNum}周`,
        count,
      })
    }

    // 获取法规统计
    const regulations = await prisma.regulation.findMany({
      select: {
        name: true,
        _count: {
          select: { models: true },
        },
      },
    })

    const regulationStats = regulations.map((r: { name: string; _count: { models: number } }) => ({
      name: r.name,
      count: r._count.models,
    }))

    // 获取热门型号（按报价单数量）
    const topModels = await prisma.model.findMany({
      select: {
        name: true,
        _count: {
          select: { quotations: true },
        },
      },
      orderBy: {
        quotations: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    const topModelsFormatted = topModels.map((m: { name: string; _count: { quotations: number } }) => ({
      name: m.name,
      count: m._count.quotations,
    }))

    return {
      success: true,
      data: {
        totalQuotations,
        totalCustomers,
        totalModels,
        pendingReviews,
        quotationsTrend: weeks,
        regulationStats,
        topModels: topModelsFormatted,
      },
    }
  })
}
