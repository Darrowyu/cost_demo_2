import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { routes } from './routes/index.js'
import { errorHandler } from './plugins/error-handler.js'
import { requestLogger } from './plugins/logger.js'
import cachePlugin from './plugins/cache.js'
import { closeRedisConnection } from './config/redis.js'
import type { FastifyRequest, FastifyReply } from 'fastify'

const app = fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  genReqId: () => {
    // 生成唯一请求 ID
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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

  // Register Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Cost Management API',
        description: '成本核算系统 API 文档',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3003',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Auth', description: '认证相关接口' },
        { name: 'Users', description: '用户管理接口' },
        { name: 'Regulations', description: '法规管理接口' },
        { name: 'Customers', description: '客户管理接口' },
        { name: 'Materials', description: '物料管理接口' },
        { name: 'Models', description: '型号管理接口' },
        { name: 'BOM', description: 'BOM 管理接口' },
        { name: 'Packaging', description: '包装配置接口' },
        { name: 'Quotations', description: '报价单接口' },
        { name: 'StandardCosts', description: '标准成本接口' },
        { name: 'Notifications', description: '通知接口' },
        { name: 'Dashboard', description: '仪表盘接口' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token 认证',
          },
        },
      },
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
    staticCSP: true,
  })

  // Register plugins
  await app.register(cachePlugin) // 缓存插件

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

  // 注册请求日志中间件
  await app.register(requestLogger)

  // 注册错误处理器
  await app.register(errorHandler)

  // Auth decorator
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      app.log.warn({
        reqId: request.id,
        url: request.url,
        error: err instanceof Error ? err.message : 'Unknown error',
      }, 'Authentication failed')

      reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
        timestamp: new Date().toISOString(),
        requestId: request.id,
        path: request.url,
      })
    }
  })

  // Register routes
  await app.register(routes, { prefix: '/api/v1' })

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }
  })

  // Start server
  try {
    const port = parseInt(process.env.PORT || '3003', 10)
    const host = process.env.HOST || '0.0.0.0'

    await app.listen({ port, host })
    app.log.info(`Server listening on http://${host}:${port}`)
    app.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

init()

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  app.log.info('SIGTERM received, closing server...')
  await closeRedisConnection() // 关闭 Redis 连接
  await app.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  app.log.info('SIGINT received, closing server...')
  await closeRedisConnection() // 关闭 Redis 连接
  await app.close()
  process.exit(0)
})

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  app.log.fatal({
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  }, 'Uncaught exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  app.log.error({
    reason,
    promise: promise.toString(),
  }, 'Unhandled rejection')
})
