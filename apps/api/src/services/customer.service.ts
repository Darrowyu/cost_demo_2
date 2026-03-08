import type { Customer, Prisma } from '@cost/database'
import { BaseService } from './base.service.js'
import { customerRepository, type CustomerFilter } from '../repositories/customer.repository.js'
import type { PaginationParams, PaginatedResult } from '../repositories/user.repository.js'

export interface CreateCustomerInput {
  code: string
  name: string
  region: string
  note?: string
  createdBy: string
}

export interface UpdateCustomerInput {
  code?: string
  name?: string
  region?: string
  note?: string
  updatedBy: string
}

export class CustomerService extends BaseService {
  async getList(filter: CustomerFilter, params: PaginationParams): Promise<PaginatedResult<Customer>> {
    return customerRepository.findMany(filter, params)
  }

  async getById(id: string): Promise<Customer | null> {
    return customerRepository.findById(id)
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const { createdBy, ...data } = input

    const createData: Prisma.CustomerCreateInput = {
      ...data,
      createdByUser: { connect: { id: createdBy } },
      updatedByUser: { connect: { id: createdBy } },
    }

    return customerRepository.create(createData)
  }

  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const { updatedBy, ...data } = input

    const updateData: Prisma.CustomerUpdateInput = {
      ...data,
      updatedByUser: { connect: { id: updatedBy } },
    }

    return customerRepository.update(id, updateData)
  }

  async delete(id: string): Promise<void> {
    return customerRepository.delete(id)
  }
}

export const customerService = new CustomerService()
