import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import type { Logger } from 'pino'

// 日志级别定义
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// 结构化日志配置
const loggerConfig = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
        messageFormat: '{msg} [{reqId}]',
      },
    },
    level: process.env.LOG_LEVEL || 'debug',
  },
  production: {
    level: process.env.LOG_LEVEL || 'info',
    // 生产环境使用 JSON 格式，便于日志收集系统解析
    formatters: {
      level: (label: string) => ({ level: label }),
    },
  },
}

import pino from 'pino'

// 创建 Pino 日志实例
export const createLogger = (env: string = process.env.NODE_ENV || 'development') => {
  const config = env === 'production' ? loggerConfig.production : loggerConfig.development
  return pino(config)
}

// 请求日志中间件
export const requestLogger = fp(async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // 记录请求开始时间
    request.requestStartTime = Date.now()

    // 生成请求 ID
    const reqId = request.id

    fastify.log.info({
      reqId,
      method: request.method,
      url: request.url,
      query: request.query,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }, 'Request started')
  })

  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
    const duration = Date.now() - (request.requestStartTime || Date.now())
    const reqId = request.id

    // 根据状态码确定日志级别
    const statusCode = reply.statusCode
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'

    const logData = {
      reqId,
      method: request.method,
      url: request.url,
      statusCode,
      duration: `${duration}ms`,
      responseSize: payload ? JSON.stringify(payload).length : 0,
    }

    if (logLevel === 'error') {
      fastify.log.error(logData, 'Request failed')
    } else if (logLevel === 'warn') {
      fastify.log.warn(logData, 'Request warning')
    } else {
      fastify.log.info(logData, 'Request completed')
    }

    return payload
  })
})

// 错误日志记录器 - 兼容 Fastify 和 Pino logger
export const logError = (
  logger: FastifyInstance['log'] | Logger,
  error: Error,
  context: {
    reqId?: string
    method?: string
    url?: string
    userId?: string
    [key: string]: unknown
  } = {}
) => {
  const logData = {
    ...context,
    error: {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
  }

  // 使用 error 方法记录
  if ('error' in logger) {
    (logger as FastifyInstance['log']).error(logData, error.message || 'An error occurred')
  } else {
    (logger as Logger).error(logData, error.message || 'An error occurred')
  }
}

// 性能日志记录器
export const logPerformance = (
  logger: FastifyInstance['log'] | Logger,
  operation: string,
  duration: number,
  metadata: Record<string, unknown> = {}
) => {
  const logData = {
    type: 'performance',
    operation,
    duration: `${duration}ms`,
    ...metadata,
  }

  if ('info' in logger) {
    (logger as FastifyInstance['log']).info(logData, `Performance: ${operation} took ${duration}ms`)
  } else {
    (logger as Logger).info(logData, `Performance: ${operation} took ${duration}ms`)
  }
}

// 业务日志记录器
export const logBusiness = (
  logger: FastifyInstance['log'] | Logger,
  action: string,
  metadata: Record<string, unknown> = {}
) => {
  const logData = {
    type: 'business',
    action,
    ...metadata,
  }

  if ('info' in logger) {
    (logger as FastifyInstance['log']).info(logData, `Business: ${action}`)
  } else {
    (logger as Logger).info(logData, `Business: ${action}`)
  }
}

// 安全日志记录器
export const logSecurity = (
  logger: FastifyInstance['log'] | Logger,
  event: string,
  metadata: Record<string, unknown> = {}
) => {
  const logData = {
    type: 'security',
    event,
    ...metadata,
  }

  if ('warn' in logger) {
    (logger as FastifyInstance['log']).warn(logData, `Security: ${event}`)
  } else {
    (logger as Logger).warn(logData, `Security: ${event}`)
  }
}

// 扩展 FastifyRequest 类型
declare module 'fastify' {
  interface FastifyRequest {
    requestStartTime?: number
  }
}

export default requestLogger
