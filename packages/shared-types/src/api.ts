// API 请求/响应类型定义

// ==================== 通用类型 ====================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    totalPages?: number
  }
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ==================== 认证模块 ====================
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    name: string
    email: string
    role: string
  }
}

// ==================== 用户模块 ====================
export interface CreateUserRequest {
  username: string
  password: string
  name: string
  email: string
  role: string
  status?: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: string
  status?: string
}

// ==================== 基础数据模块 ====================
export interface CreateRegulationRequest {
  code: string
  name: string
  description?: string
  status?: string
}

export interface CreateCustomerRequest {
  code: string
  name: string
  region: string
  note?: string
}

export interface UpdateCustomerRequest {
  code?: string
  name?: string
  region?: string
  note?: string
}

export interface CreateMaterialRequest {
  materialNo: string
  name: string
  unit: string
  price: number
  currency?: string
  manufacturer?: string
  category: string
  note?: string
}

export interface UpdateMaterialRequest {
  materialNo?: string
  name?: string
  unit?: string
  price?: number
  currency?: string
  manufacturer?: string
  category?: string
  note?: string
}

export interface CreateModelRequest {
  name: string
  regulationId: string
  category: string
  series: string
  imageUrl?: string
}

export interface UpdateModelRequest {
  name?: string
  regulationId?: string
  category?: string
  series?: string
  imageUrl?: string
}

// ==================== BOM 模块 ====================
export interface CreateBomMaterialRequest {
  modelId: string
  materialId: string
  quantity: number
  sortOrder?: number
}

export interface UpdateBomMaterialRequest {
  quantity?: number
  sortOrder?: number
}

// ==================== 包装配置模块 ====================
export interface CreatePackagingConfigRequest {
  modelId: string
  name: string
  packagingType: string
  perBox: number
  perCarton: number
}

export interface UpdatePackagingConfigRequest {
  name?: string
  packagingType?: string
  perBox?: number
  perCarton?: number
}

export interface CreateProcessConfigRequest {
  packagingConfigId: string
  name: string
  price: number
  unit: string
  sortOrder?: number
}

export interface UpdateProcessConfigRequest {
  name?: string
  price?: number
  unit?: string
  sortOrder?: number
}

export interface CreatePackagingMaterialRequest {
  packagingConfigId: string
  name: string
  quantity: number
  price: number
  boxLength?: number
  boxWidth?: number
  boxHeight?: number
}

export interface UpdatePackagingMaterialRequest {
  name?: string
  quantity?: number
  price?: number
  boxLength?: number
  boxWidth?: number
  boxHeight?: number
}

// ==================== 成本计算模块 ====================
export interface CalculateCostRequest {
  modelId: string
  packagingConfigId: string
  saleType: string
  shippingType: string
  quantity: number
}

export interface CostBreakdownDto {
  materialCost: number
  packagingCost: number
  processCost: number
  shippingCost: number
  adminFee: number
  vat: number
  totalCost: number
}

export interface CalculateCostResponse extends CostBreakdownDto {
  unitCost: number
}

// ==================== 报价单模块 ====================
export interface CreateQuotationRequest {
  customerId: string
  regulationId: string
  modelId: string
  packagingConfigId: string
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
}

export interface UpdateQuotationRequest {
  customerId?: string
  regulationId?: string
  modelId?: string
  packagingConfigId?: string
  saleType?: string
  shippingType?: string
  quantity?: number
  materialCost?: number
  packagingCost?: number
  processCost?: number
  shippingCost?: number
  adminFee?: number
  vat?: number
  totalCost?: number
}

export interface SubmitQuotationRequest {
  // 提交报价单，状态变为 submitted
}

export interface ReviewQuotationRequest {
  approved: boolean
  note?: string
}

// ==================== 标准成本模块 ====================
export interface CreateStandardCostRequest {
  packagingConfigId: string
  saleType: string
  materialCost: number
  packagingCost: number
  processCost: number
  shippingCost: number
  adminFee: number
  vat: number
  totalCost: number
}

// ==================== 通知模块 ====================
export interface ProcessNotificationRequest {
  // 处理通知
}

// ==================== 仪表盘模块 ====================
export interface DashboardStatsDto {
  totalQuotations: number
  totalCustomers: number
  totalModels: number
  pendingReviews: number
  quotationsTrend: { week: string; count: number }[]
  regulationStats: { name: string; count: number }[]
  topModels: { name: string; count: number }[]
}

// ==================== 系统配置模块 ====================
export interface SystemConfigDto {
  adminFeeRate: number
  vatRate: number
  exchangeRate: number
  fcl20Rate: number
  fcl40Rate: number
  lclBaseRate: number
}

export interface UpdateSystemConfigRequest {
  adminFeeRate?: number
  vatRate?: number
  exchangeRate?: number
  fcl20Rate?: number
  fcl40Rate?: number
  lclBaseRate?: number
}
