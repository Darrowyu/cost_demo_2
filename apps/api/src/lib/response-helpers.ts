import type { FastifyReply } from 'fastify'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
  meta?: { page: number; pageSize: number; total: number; totalPages: number }
}

export function sendError(
  reply: FastifyReply,
  status: number,
  code: string,
  message: string
) {
  return reply.code(status).send({
    success: false,
    error: { code, message }
  })
}

export function sendSuccess<T>(reply: FastifyReply, data: T, meta?: ApiResponse<T>['meta']) {
  const response: ApiResponse<T> = { success: true, data }
  if (meta) response.meta = meta
  return reply.send(response)
}

export function sendNotFound(reply: FastifyReply, resource: string) {
  return sendError(reply, 404, 'NOT_FOUND', `${resource}不存在`)
}
