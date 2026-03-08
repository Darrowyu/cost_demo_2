import type { FastifyInstance } from 'fastify'
import { materialController } from '../controllers/material.controller.js'

export const materialRoutes = async (app: FastifyInstance) => {
  app.get('/', { onRequest: [app.authenticate] }, materialController.getList)
  app.get('/:id', { onRequest: [app.authenticate] }, materialController.getById)
  app.post('/', { onRequest: [app.authenticate] }, materialController.create)
  app.put('/:id', { onRequest: [app.authenticate] }, materialController.update)
  app.delete('/:id', { onRequest: [app.authenticate] }, materialController.delete)
}
