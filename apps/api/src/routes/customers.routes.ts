import type { FastifyInstance } from 'fastify'
import { customerController } from '../controllers/customer.controller.js'

export const customerRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/', { onRequest: [app.authenticate] }, customerController.getList.bind(customerController))
  app.get('/:id', { onRequest: [app.authenticate] }, customerController.getById.bind(customerController))
  app.post('/', { onRequest: [app.authenticate] }, customerController.create.bind(customerController))
  app.put('/:id', { onRequest: [app.authenticate] }, customerController.update.bind(customerController))
  app.delete('/:id', { onRequest: [app.authenticate] }, customerController.delete.bind(customerController))
}
