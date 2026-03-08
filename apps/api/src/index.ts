import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { routes } from './routes/index.js'
import { errorHandler } from './plugins/error-handler.js'
import type { FastifyRequest, FastifyReply } from 'fastify'

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
})

// 初始化函数
async function init() {
  // 检查必需的环境变量
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL']
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      app.log.error(`Missing required environment variable: ${envVar}`)
      process.exit(1)
    }
  }

  // Register plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
    credentials: true,
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET!, // 已检查过，可以安全使用 !
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  })

  // Error handler
  app.setErrorHandler(errorHandler)

  // Auth decorator
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
      })
    }
  })

  // Register routes
  await app.register(routes, { prefix: '/api/v1' })

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Start server
  try {
    const port = parseInt(process.env.PORT || '3003', 10)
    const host = process.env.HOST || '0.0.0.0'

    await app.listen({ port, host })
    app.log.info(`Server listening on http://${host}:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

init()

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  app.log.info('SIGTERM received, closing server...')
  await app.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  app.log.info('SIGINT received, closing server...')
  await app.close()
  process.exit(0)
})
