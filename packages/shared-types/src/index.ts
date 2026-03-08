export * from './api.js'

// ==================== 基础实体类型 ====================

export interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface Customer {
  id: string
  code: string
  name: string
  region: string
  note?: string
  createdAt: string
  updatedAt?: string
}

export interface Regulation {
  id: string
  code: string
  name: string
  description?: string
  status: string
  createdAt: string
  updatedAt?: string
}

export interface Material {
  id: string
  materialNo: string
  name: string
  unit: string
  price: number
  currency: string
  manufacturer?: string
  category?: string
  createdAt: string
  updatedAt?: string
}

export interface Model {
  id: string
  name: string
  regulationId: string
  category?: string
  series?: string
  imageUrl?: string
  createdAt: string
  updatedAt?: string
}

export interface Quotation {
  id: string
  quotationNo: string
  customerId: string
  customer?: Customer
  modelId: string
  model?: Model
  packagingConfigId: string
  packagingConfig?: unknown
  saleType: string
  shippingType: string
  quantity: number
  materialCost: number
  packagingCost: number
  processCost: number
  shippingCost: number
  adminFee: number
  vat: number
  totalCost: number
  status: string
  createdBy: string
  reviewedBy?: string
  reviewNote?: string
  createdAt: string
  updatedAt?: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ListResponse<T> {
  data: T[]
  meta: PaginationMeta
}
