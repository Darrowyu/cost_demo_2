import { z } from 'zod'

// ==================== 通用验证规则 ====================

const idSchema = z.string().uuid('无效的ID格式')

const emailSchema = z.string().email('邮箱格式不正确')

const positiveDecimalSchema = z.number().nonnegative('数值不能为负数')

const positiveIntSchema = z.number().int().positive('必须是正整数')

// ==================== Auth Schemas ====================

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少6位'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ==================== User Schemas ====================

export const userRoleSchema = z.enum(['admin', 'purchaser', 'producer', 'reviewer', 'salesperson', 'readonly'])

export const userStatusSchema = z.enum(['active', 'inactive'])

export const createUserSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(50, '用户名最多50字符'),
  password: z.string().min(6, '密码至少6位').max(100, '密码最多100字符'),
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最多50字符'),
  email: emailSchema,
  role: userRoleSchema,
  status: userStatusSchema.optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最多50字符').optional(),
  email: emailSchema.optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

// ==================== Regulation Schemas ====================

export const regulationStatusSchema = z.enum(['active', 'inactive'])

export const createRegulationSchema = z.object({
  code: z.string().min(1, '法规代码不能为空').max(50, '法规代码最多50字符'),
  name: z.string().min(1, '法规名称不能为空').max(100, '法规名称最多100字符'),
  description: z.string().max(500, '描述最多500字符').optional(),
  status: regulationStatusSchema.optional(),
})

export const updateRegulationSchema = z.object({
  code: z.string().min(1, '法规代码不能为空').max(50, '法规代码最多50字符').optional(),
  name: z.string().min(1, '法规名称不能为空').max(100, '法规名称最多100字符').optional(),
  description: z.string().max(500, '描述最多500字符').optional(),
  status: regulationStatusSchema.optional(),
})

export type CreateRegulationInput = z.infer<typeof createRegulationSchema>
export type UpdateRegulationInput = z.infer<typeof updateRegulationSchema>

// ==================== Customer Schemas ====================

export const createCustomerSchema = z.object({
  code: z.string().min(1, '客户代码不能为空').max(50, '客户代码最多50字符'),
  name: z.string().min(1, '客户名称不能为空').max(100, '客户名称最多100字符'),
  region: z.string().min(1, '地区不能为空').max(100, '地区最多100字符'),
  note: z.string().max(1000, '备注最多1000字符').optional(),
})

export const updateCustomerSchema = z.object({
  code: z.string().min(1, '客户代码不能为空').max(50, '客户代码最多50字符').optional(),
  name: z.string().min(1, '客户名称不能为空').max(100, '客户名称最多100字符').optional(),
  region: z.string().min(1, '地区不能为空').max(100, '地区最多100字符').optional(),
  note: z.string().max(1000, '备注最多1000字符').optional(),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>

// ==================== Material Schemas ====================

export const currencySchema = z.enum(['CNY', 'USD'])

export const createMaterialSchema = z.object({
  materialNo: z.string().min(1, '物料编号不能为空').max(50, '物料编号最多50字符'),
  name: z.string().min(1, '物料名称不能为空').max(100, '物料名称最多100字符'),
  unit: z.string().min(1, '单位不能为空').max(20, '单位最多20字符'),
  price: positiveDecimalSchema,
  currency: currencySchema.optional(),
  manufacturer: z.string().max(100, '制造商最多100字符').optional(),
  category: z.string().min(1, '分类不能为空').max(50, '分类最多50字符'),
  note: z.string().max(1000, '备注最多1000字符').optional(),
})

export const updateMaterialSchema = z.object({
  materialNo: z.string().min(1, '物料编号不能为空').max(50, '物料编号最多50字符').optional(),
  name: z.string().min(1, '物料名称不能为空').max(100, '物料名称最多100字符').optional(),
  unit: z.string().min(1, '单位不能为空').max(20, '单位最多20字符').optional(),
  price: positiveDecimalSchema.optional(),
  currency: currencySchema.optional(),
  manufacturer: z.string().max(100, '制造商最多100字符').optional(),
  category: z.string().min(1, '分类不能为空').max(50, '分类最多50字符').optional(),
  note: z.string().max(1000, '备注最多1000字符').optional(),
})

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>

// ==================== Quotation Schemas ====================

export const saleTypeSchema = z.enum(['domestic', 'export'])

export const shippingTypeSchema = z.enum(['fcl20', 'fcl40', 'lcl'])

export const createQuotationSchema = z.object({
  customerId: idSchema,
  regulationId: idSchema,
  modelId: idSchema,
  packagingConfigId: idSchema,
  saleType: saleTypeSchema,
  shippingType: shippingTypeSchema,
  quantity: positiveIntSchema,
  materialCost: positiveDecimalSchema,
  packagingCost: positiveDecimalSchema,
  processCost: positiveDecimalSchema,
  shippingCost: positiveDecimalSchema,
  adminFee: positiveDecimalSchema,
  vat: positiveDecimalSchema,
  totalCost: positiveDecimalSchema,
})

export const updateQuotationSchema = z.object({
  customerId: idSchema.optional(),
  regulationId: idSchema.optional(),
  modelId: idSchema.optional(),
  packagingConfigId: idSchema.optional(),
  saleType: saleTypeSchema.optional(),
  shippingType: shippingTypeSchema.optional(),
  quantity: positiveIntSchema.optional(),
  materialCost: positiveDecimalSchema.optional(),
  packagingCost: positiveDecimalSchema.optional(),
  processCost: positiveDecimalSchema.optional(),
  shippingCost: positiveDecimalSchema.optional(),
  adminFee: positiveDecimalSchema.optional(),
  vat: positiveDecimalSchema.optional(),
  totalCost: positiveDecimalSchema.optional(),
})

export const calculateQuotationSchema = z.object({
  modelId: idSchema,
  packagingConfigId: idSchema,
  saleType: saleTypeSchema,
  shippingType: shippingTypeSchema,
  quantity: positiveIntSchema,
})

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>
export type CalculateQuotationInput = z.infer<typeof calculateQuotationSchema>

// ==================== 验证辅助函数 ====================

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.errors[0].message }
}

export function formatZodError(error: z.ZodError): string {
  return error.errors[0].message
}
