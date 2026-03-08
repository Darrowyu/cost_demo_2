import type { FastifyInstance } from 'fastify'
import { userController } from '../controllers/user.controller.js'

export const userRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/', { onRequest: [app.authenticate] }, userController.getList.bind(userController))
  app.get('/:id', { onRequest: [app.authenticate] }, userController.getById.bind(userController))
  app.post('/', { onRequest: [app.authenticate] }, userController.create.bind(userController))
  app.put('/:id', { onRequest: [app.authenticate] }, userController.update.bind(userController))
  app.delete('/:id', { onRequest: [app.authenticate] }, userController.delete.bind(userController))
}
