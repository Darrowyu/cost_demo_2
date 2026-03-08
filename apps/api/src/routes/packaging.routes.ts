import type { FastifyInstance } from 'fastify'
import { packagingController } from '../controllers/packaging.controller.js'

export const packagingRoutes = async (app: FastifyInstance) => {
  // 包装配置 CRUD
  app.get('/', { onRequest: [app.authenticate] }, packagingController.getList)
  app.get('/:id', { onRequest: [app.authenticate] }, packagingController.getById)
  app.post('/', { onRequest: [app.authenticate] }, packagingController.create)
  app.put('/:id', { onRequest: [app.authenticate] }, packagingController.update)
  app.delete('/:id', { onRequest: [app.authenticate] }, packagingController.delete)

  // 工序配置
  app.get('/:id/processes', { onRequest: [app.authenticate] }, packagingController.getProcesses)
  app.post('/:id/processes', { onRequest: [app.authenticate] }, packagingController.createProcess)
  app.put('/processes/:processId', { onRequest: [app.authenticate] }, packagingController.updateProcess)
  app.delete('/processes/:processId', { onRequest: [app.authenticate] }, packagingController.deleteProcess)

  // 包材配置
  app.get('/:id/materials', { onRequest: [app.authenticate] }, packagingController.getMaterials)
  app.post('/:id/materials', { onRequest: [app.authenticate] }, packagingController.createMaterial)
  app.put('/materials/:materialId', { onRequest: [app.authenticate] }, packagingController.updateMaterial)
  app.delete('/materials/:materialId', { onRequest: [app.authenticate] }, packagingController.deleteMaterial)
}
