import type { FastifyRequest, FastifyReply } from 'fastify'

// JWT Payload 类型
export interface UserPayload {
  userId: string
  username: string
  role: string
}

// 扩展 Fastify 类型声明 - 使用 @fastify/jwt 推荐的方式
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserPayload
    user: UserPayload
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
