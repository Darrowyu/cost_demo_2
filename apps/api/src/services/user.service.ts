import bcrypt from 'bcryptjs'
import type { Prisma, Role, UserStatus } from '@cost/database'
import { BaseService } from './base.service.js'
import { userRepository, type PaginationParams, type PaginatedResult } from '../repositories/user.repository.js'
import type { User } from '@cost/database'

export interface CreateUserInput {
  username: string
  password: string
  name: string
  email: string
  role: Role
  status?: UserStatus
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: Role
  status?: UserStatus
}

const USER_SELECT_FIELDS = {
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const

type UserResult = Pick<User, keyof typeof USER_SELECT_FIELDS>

export class UserService extends BaseService {
  async getList(params: PaginationParams): Promise<PaginatedResult<UserResult>> {
    return userRepository.findMany(params)
  }

  async getById(id: string): Promise<UserResult | null> {
    return userRepository.findById(id)
  }

  async create(input: CreateUserInput): Promise<UserResult> {
    const hashedPassword = await bcrypt.hash(input.password, 10) // 密码加密

    const createData: Prisma.UserCreateInput = {
      username: input.username,
      password: hashedPassword,
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status || 'active',
    }

    return userRepository.create(createData)
  }

  async update(id: string, input: UpdateUserInput): Promise<UserResult> {
    const updateData: Prisma.UserUpdateInput = {
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
    }

    return userRepository.update(id, updateData)
  }

  async delete(id: string): Promise<void> {
    return userRepository.delete(id)
  }
}

export const userService = new UserService()
