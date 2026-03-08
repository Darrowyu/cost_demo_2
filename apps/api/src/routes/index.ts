import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth.routes.js'
import { userRoutes } from './users.routes.js'
import { regulationRoutes } from './regulations.routes.js'
import { customerRoutes } from './customers.routes.js'
import { materialRoutes } from './materials.routes.js'
import { modelRoutes } from './models.routes.js'
import { bomRoutes } from './bom.routes.js'
import { packagingRoutes } from './packaging.routes.js'
import { quotationRoutes } from './quotations.routes.js'
import { standardCostRoutes } from './standard-costs.routes.js'
import { notificationRoutes } from './notifications.routes.js'
import { dashboardRoutes } from './dashboard.routes.js'

export const routes = async (app: FastifyInstance) => {
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(userRoutes, { prefix: '/users' })
  await app.register(regulationRoutes, { prefix: '/regulations' })
  await app.register(customerRoutes, { prefix: '/customers' })
  await app.register(materialRoutes, { prefix: '/materials' })
  await app.register(modelRoutes, { prefix: '/models' })
  await app.register(bomRoutes, { prefix: '/bom' })
  await app.register(packagingRoutes, { prefix: '/packaging-configs' })
  await app.register(quotationRoutes, { prefix: '/quotations' })
  await app.register(standardCostRoutes, { prefix: '/standard-costs' })
  await app.register(notificationRoutes, { prefix: '/notifications' })
  await app.register(dashboardRoutes, { prefix: '/dashboard' })
}
