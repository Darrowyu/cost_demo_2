// ==================== 用户与权限 ====================
export type Role = 'admin' | 'purchaser' | 'producer' | 'reviewer' | 'salesperson' | 'readonly'

export interface User {
  id: string
  username: string
  name: string
  email: string
  role: Role
  status: 'active' | 'inactive'
  createdAt: string
}

// ==================== 基础数据 ====================
export interface Regulation {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
}

export interface Customer {
  id: string
  code: string
  name: string
  region: string
  note?: string
  salesPersonId?: string
}

export interface Material {
  id: string
  materialNo: string
  name: string
  unit: string
  price: number
  currency: 'CNY' | 'USD'
  manufacturer?: string
  category: string
  note?: string
}

export interface Model {
  id: string
  name: string
  regulationId: string
  category: string
  series: string
  calculationType?: Record<string, unknown>
  imageUrl?: string
}

export interface BomMaterial {
  id: string
  modelId: string
  materialId: string
  material?: Material
  quantity: number
  sortOrder: number
}

export interface PackagingConfig {
  id: string
  modelId: string
  name: string
  packagingType: string
  layerConfig?: Record<string, number>
}

export interface ProcessConfig {
  id: string
  packagingConfigId: string
  name: string
  price: number
  unit: 'piece' | 'dozen'
  sortOrder: number
}

export interface PackagingMaterial {
  id: string
  packagingConfigId: string
  name: string
  quantity: number
  price: number
  boxVolume?: { length: number; width: number; height: number }
}

// ==================== 成本与报价 ====================
export type QuotationStatus = 'draft' | 'submitted' | 'approved' | 'rejected'
export type SaleType = 'domestic' | 'export'
export type ShippingType = 'fcl20' | 'fcl40' | 'lcl'

export interface CostBreakdown {
  materialCost: number
  packagingCost: number
  processCost: number
  shippingCost: number
  adminFee: number
  vat: number
  totalCost: number
}

export interface Quotation {
  id: string
  quotationNo: string
  customerId: string
  customer?: Customer
  regulationId: string
  regulation?: Regulation
  modelId: string
  model?: Model
  packagingConfigId: string
  packagingConfig?: PackagingConfig
  saleType: SaleType
  shippingType: ShippingType
  quantity: number
  costs: CostBreakdown
  status: QuotationStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
}

export interface StandardCost {
  id: string
  packagingConfigId: string
  packagingConfig?: PackagingConfig
  model?: Model
  saleType: SaleType
  version: number
  isCurrent: boolean
  costs: CostBreakdown
  setBy: string
  setAt: string
}

// ==================== 通知 ====================
export type NotificationType = 'price_change' | 'material_delete'
export type NotificationStatus = 'pending' | 'processed' | 'archived'

export interface Notification {
  id: string
  type: NotificationType
  status: NotificationStatus
  materialId: string
  material?: Material
  oldPrice?: number
  newPrice?: number
  affectedStandardCosts: string[]
  triggeredBy: string
  triggeredAt: string
  processedBy?: string
  processedAt?: string
}

// ==================== 系统配置 ====================
export interface SystemConfig {
  adminFeeRate: number
  vatRate: number
  exchangeRate: number
  fcl20Rate: number
  fcl40Rate: number
  lclBaseRate: number
}

// ==================== 统计数据 ====================
export interface DashboardStats {
  totalQuotations: number
  totalCustomers: number
  totalModels: number
  pendingReviews: number
  quotationsTrend: { week: string; count: number }[]
  regulationStats: { name: string; count: number }[]
  topModels: { name: string; count: number }[]
}
