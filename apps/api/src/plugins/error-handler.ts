import type { FastifyInstance, FastifyError } from 'fastify'

export const errorHandler = (
  error: FastifyError,
  _request: unknown,
  reply: { code: (n: number) => { send: (d: unknown) => void } }
) => {
  // Prisma errors
  if (error.code?.startsWith('P')) {
    const prismaErrors: Record<string, { status: number; message: string }> = {
      P2002: { status: 409, message: '记录已存在' },
      P2003: { status: 400, message: '外键约束失败' },
      P2025: { status: 404, message: '记录不存在' },
    }

    const prismaError = prismaErrors[error.code]
    if (prismaError) {
      return reply.code(prismaError.status).send({
        success: false,
        error: {
          code: error.code,
          message: prismaError.message,
        },
      })
    }
  }

  // Validation errors
  if (error.validation) {
    return reply.code(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    })
  }

  // Default error response
  reply.code(error.statusCode || 500).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
    },
  })
}
