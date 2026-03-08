import type { FastifyInstance } from 'fastify'
import { quotationController } from '../controllers/quotation.controller.js'

export const quotationRoutes = async (app: FastifyInstance) => {
  app.get('/', { onRequest: [app.authenticate] }, quotationController.getList)
  app.get('/:id', { onRequest: [app.authenticate] }, quotationController.getById)
  app.post('/', { onRequest: [app.authenticate] }, quotationController.create)
  app.put('/:id', { onRequest: [app.authenticate] }, quotationController.update)
  app.delete('/:id', { onRequest: [app.authenticate] }, quotationController.delete)
  app.post('/:id/submit', { onRequest: [app.authenticate] }, quotationController.submit)
  app.post('/:id/approve', { onRequest: [app.authenticate] }, quotationController.approve)
  app.post('/:id/reject', { onRequest: [app.authenticate] }, quotationController.reject)
  app.post('/calculate', { onRequest: [app.authenticate] }, quotationController.calculate)
}
