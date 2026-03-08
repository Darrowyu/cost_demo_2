import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '@cost/database'
import { loginSchema } from '../lib/schemas.js'

export const authRoutes = async (app: FastifyInstance) => {
  // POST /api/v1/auth/login
  app.post('/login', async (request, reply) => {
    const validation = loginSchema.safeParse(request.body)
    if (!validation.success) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0].message },
      })
    }
    const { username, password } = validation.data

    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user || user.status !== 'active') {
      return reply.code(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' },
      })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return reply.code(401).send({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误' },
      })
    }

    const token = await reply.jwtSign({
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    }
  })

  // GET /api/v1/auth/me
  app.get('/me', { onRequest: [app.authenticate] }, async (request) => {
    const userId = request.user.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    return { success: true, data: user }
  })

  // POST /api/v1/auth/logout
  app.post('/logout', { onRequest: [app.authenticate] }, async () => {
    return { success: true, data: { message: 'Logged out successfully' } }
  })
}
