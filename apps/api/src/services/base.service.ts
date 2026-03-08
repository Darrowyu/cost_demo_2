import { prisma, type PrismaClient } from '@cost/database'

export abstract class BaseService {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }
}
