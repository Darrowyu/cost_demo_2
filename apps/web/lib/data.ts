import type {
  User,
  Regulation,
  Customer,
  Material,
  Model,
  PackagingConfig,
  ProcessConfig,
  PackagingMaterial,
  Quotation,
  StandardCost,
  Notification,
  SystemConfig,
  DashboardStats,
  BomMaterial,
} from './types'

// ==================== 当前用户 ====================
export const currentUser: User = {
  id: '1',
  username: 'admin',
  name: '张明',
  email: 'admin@company.com',
  role: 'admin',
  status: 'active',
  createdAt: '2024-01-01',
}

// ==================== 法规 ====================
export const regulations: Regulation[] = [
  { id: '1', name: 'GB', description: '中国国家标准', status: 'active' },
  { id: '2', name: 'EN', description: '欧洲标准', status: 'active' },
  { id: '3', name: 'NIOSH', description: '美国NIOSH标准', status: 'active' },
  { id: '4', name: 'AS/NZS', description: '澳洲/新西兰标准', status: 'active' },
]

// ==================== 客户 ====================
export const customers: Customer[] = [
  { id: '1', code: 'VC001', name: '3M中国', region: '华东', note: '重点客户' },
  { id: '2', code: 'VC002', name: 'Honeywell', region: '华北', note: '外资企业' },
  { id: '3', code: 'VC003', name: '霍尼韦尔安全', region: '华南' },
  { id: '4', code: 'VC004', name: 'MSA安全', region: '西南' },
  { id: '5', code: 'VC005', name: '德尔格安全', region: '华中' },
]

// ==================== 原料 ====================
export const materials: Material[] = [
  { id: '1', materialNo: 'M001', name: '硅胶面罩主体', unit: '个', price: 12.5, currency: 'CNY', manufacturer: '国产A厂', category: '半面罩类' },
  { id: '2', materialNo: 'M002', name: '呼吸阀', unit: '个', price: 3.2, currency: 'CNY', manufacturer: '国产B厂', category: '半面罩类' },
  { id: '3', materialNo: 'M003', name: '头带组件', unit: '套', price: 4.8, currency: 'CNY', manufacturer: '进口C厂', category: '半面罩类' },
  { id: '4', materialNo: 'M004', name: '滤棉', unit: 'KG', price: 85, currency: 'CNY', manufacturer: '国产D厂', category: '口罩类' },
  { id: '5', materialNo: 'M005', name: '鼻夹', unit: '码', price: 0.15, currency: 'CNY', manufacturer: '国产E厂', category: '口罩类' },
  { id: '6', materialNo: 'M006', name: '耳带', unit: '码', price: 0.08, currency: 'CNY', manufacturer: '国产F厂', category: '口罩类' },
  { id: '7', materialNo: 'M007', name: '滤盒', unit: '个', price: 8.5, currency: 'CNY', manufacturer: '进口G厂', category: '半面罩类' },
  { id: '8', materialNo: 'M008', name: '密封垫', unit: '个', price: 1.2, currency: 'CNY', manufacturer: '国产H厂', category: '半面罩类' },
]

// ==================== 型号 ====================
export const models: Model[] = [
  { id: '1', name: 'D-700', regulationId: '1', category: '半面罩', series: 'D系列', imageUrl: '/models/d700.png' },
  { id: '2', name: 'D-800', regulationId: '1', category: '半面罩', series: 'D系列', imageUrl: '/models/d800.png' },
  { id: '3', name: 'P-100', regulationId: '2', category: '口罩', series: 'P系列', imageUrl: '/models/p100.png' },
  { id: '4', name: 'P-200', regulationId: '2', category: '口罩', series: 'P系列', imageUrl: '/models/p200.png' },
  { id: '5', name: 'N-95', regulationId: '3', category: '口罩', series: 'N系列', imageUrl: '/models/n95.png' },
  { id: '6', name: 'D-900', regulationId: '1', category: '半面罩', series: 'D系列', imageUrl: '/models/d900.png' },
]

// ==================== BOM ====================
export const bomMaterials: BomMaterial[] = [
  { id: '1', modelId: '1', materialId: '1', quantity: 1, sortOrder: 1 },
  { id: '2', modelId: '1', materialId: '2', quantity: 1, sortOrder: 2 },
  { id: '3', modelId: '1', materialId: '3', quantity: 1, sortOrder: 3 },
  { id: '4', modelId: '1', materialId: '7', quantity: 2, sortOrder: 4 },
  { id: '5', modelId: '2', materialId: '1', quantity: 1, sortOrder: 1 },
  { id: '6', modelId: '2', materialId: '2', quantity: 2, sortOrder: 2 },
  { id: '7', modelId: '2', materialId: '3', quantity: 1, sortOrder: 3 },
  { id: '8', modelId: '3', materialId: '4', quantity: 0.05, sortOrder: 1 },
  { id: '9', modelId: '3', materialId: '5', quantity: 0.1, sortOrder: 2 },
  { id: '10', modelId: '3', materialId: '6', quantity: 0.2, sortOrder: 3 },
]

// ==================== 包装配置 ====================
export const packagingConfigs: PackagingConfig[] = [
  { id: '1', modelId: '1', name: '标准单件装', packagingType: '单件', layerConfig: { perBox: 50, perCarton: 200 } },
  { id: '2', modelId: '1', name: '散装50只/盒', packagingType: '散装', layerConfig: { perBox: 50, perCarton: 500 } },
  { id: '3', modelId: '2', name: '标准单件装', packagingType: '单件', layerConfig: { perBox: 40, perCarton: 160 } },
  { id: '4', modelId: '3', name: '50只/盒', packagingType: '盒装', layerConfig: { perBox: 50, perCarton: 1000 } },
  { id: '5', modelId: '5', name: '20只/盒', packagingType: '盒装', layerConfig: { perBox: 20, perCarton: 400 } },
]

// ==================== 工序配置 ====================
export const processConfigs: ProcessConfig[] = [
  { id: '1', packagingConfigId: '1', name: '组装', price: 0.5, unit: 'piece', sortOrder: 1 },
  { id: '2', packagingConfigId: '1', name: '检验', price: 0.2, unit: 'piece', sortOrder: 2 },
  { id: '3', packagingConfigId: '1', name: '包装', price: 0.3, unit: 'piece', sortOrder: 3 },
  { id: '4', packagingConfigId: '2', name: '组装', price: 0.45, unit: 'piece', sortOrder: 1 },
  { id: '5', packagingConfigId: '2', name: '散装打包', price: 0.15, unit: 'piece', sortOrder: 2 },
  { id: '6', packagingConfigId: '4', name: '裁切', price: 2.4, unit: 'dozen', sortOrder: 1 },
  { id: '7', packagingConfigId: '4', name: '焊接', price: 3.6, unit: 'dozen', sortOrder: 2 },
  { id: '8', packagingConfigId: '4', name: '包装', price: 1.2, unit: 'dozen', sortOrder: 3 },
]

// ==================== 包材配置 ====================
export const packagingMaterials: PackagingMaterial[] = [
  { id: '1', packagingConfigId: '1', name: 'PE袋', quantity: 1, price: 0.08 },
  { id: '2', packagingConfigId: '1', name: '说明书', quantity: 1, price: 0.05 },
  { id: '3', packagingConfigId: '1', name: '小盒', quantity: 1, price: 0.35 },
  { id: '4', packagingConfigId: '1', name: '外箱', quantity: 0.02, price: 3.5, boxVolume: { length: 60, width: 40, height: 35 } },
  { id: '5', packagingConfigId: '2', name: '内袋', quantity: 1, price: 0.03 },
  { id: '6', packagingConfigId: '2', name: '外箱', quantity: 0.002, price: 4.2, boxVolume: { length: 70, width: 50, height: 40 } },
  { id: '7', packagingConfigId: '4', name: '内盒', quantity: 1, price: 0.12 },
  { id: '8', packagingConfigId: '4', name: '外箱', quantity: 0.05, price: 2.8, boxVolume: { length: 50, width: 35, height: 30 } },
]

// ==================== 报价单 ====================
export const quotations: Quotation[] = [
  {
    id: '1',
    quotationNo: 'QT-2026-0001',
    customerId: '1',
    regulationId: '1',
    modelId: '1',
    packagingConfigId: '1',
    saleType: 'domestic',
    shippingType: 'fcl20',
    quantity: 10000,
    costs: { materialCost: 285000, packagingCost: 4800, processCost: 10000, shippingCost: 2500, adminFee: 29980, vat: 38974, totalCost: 371254 },
    status: 'approved',
    createdBy: '1',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-02',
    reviewedBy: '2',
    reviewedAt: '2026-03-02',
    reviewNote: '价格合理，批准通过',
  },
  {
    id: '2',
    quotationNo: 'QT-2026-0002',
    customerId: '2',
    regulationId: '2',
    modelId: '2',
    packagingConfigId: '3',
    saleType: 'export',
    shippingType: 'fcl40',
    quantity: 20000,
    costs: { materialCost: 520000, packagingCost: 12000, processCost: 18000, shippingCost: 4800, adminFee: 55000, vat: 0, totalCost: 609800 },
    status: 'submitted',
    createdBy: '1',
    createdAt: '2026-03-05',
    updatedAt: '2026-03-05',
  },
  {
    id: '3',
    quotationNo: 'QT-2026-0003',
    customerId: '3',
    regulationId: '1',
    modelId: '1',
    packagingConfigId: '2',
    saleType: 'domestic',
    shippingType: 'lcl',
    quantity: 5000,
    costs: { materialCost: 142500, packagingCost: 1650, processCost: 3000, shippingCost: 1200, adminFee: 14715, vat: 19130, totalCost: 182195 },
    status: 'draft',
    createdBy: '1',
    createdAt: '2026-03-06',
    updatedAt: '2026-03-06',
  },
  {
    id: '4',
    quotationNo: 'QT-2026-0004',
    customerId: '4',
    regulationId: '3',
    modelId: '5',
    packagingConfigId: '5',
    saleType: 'export',
    shippingType: 'lcl',
    quantity: 50000,
    costs: { materialCost: 112500, packagingCost: 8500, processCost: 30000, shippingCost: 3500, adminFee: 15050, vat: 0, totalCost: 169550 },
    status: 'rejected',
    createdBy: '1',
    createdAt: '2026-03-04',
    updatedAt: '2026-03-05',
    reviewedBy: '2',
    reviewedAt: '2026-03-05',
    reviewNote: '运费计算有误，请重新核算',
  },
]

// ==================== 标准成本 ====================
export const standardCosts: StandardCost[] = [
  {
    id: '1',
    packagingConfigId: '1',
    saleType: 'domestic',
    version: 2,
    isCurrent: true,
    costs: { materialCost: 28.5, packagingCost: 0.48, processCost: 1.0, shippingCost: 0.25, adminFee: 2.998, vat: 3.897, totalCost: 37.125 },
    setBy: '2',
    setAt: '2026-03-02',
  },
  {
    id: '2',
    packagingConfigId: '1',
    saleType: 'domestic',
    version: 1,
    isCurrent: false,
    costs: { materialCost: 27.0, packagingCost: 0.45, processCost: 0.95, shippingCost: 0.22, adminFee: 2.84, vat: 3.69, totalCost: 35.15 },
    setBy: '2',
    setAt: '2026-02-15',
  },
  {
    id: '3',
    packagingConfigId: '1',
    saleType: 'export',
    version: 1,
    isCurrent: true,
    costs: { materialCost: 28.5, packagingCost: 0.48, processCost: 1.0, shippingCost: 0.35, adminFee: 2.998, vat: 0, totalCost: 33.328 },
    setBy: '2',
    setAt: '2026-03-01',
  },
  {
    id: '4',
    packagingConfigId: '3',
    saleType: 'export',
    version: 1,
    isCurrent: true,
    costs: { materialCost: 26.0, packagingCost: 0.6, processCost: 0.9, shippingCost: 0.24, adminFee: 2.75, vat: 0, totalCost: 30.49 },
    setBy: '2',
    setAt: '2026-02-20',
  },
]

// ==================== 通知 ====================
export const notifications: Notification[] = [
  {
    id: '1',
    type: 'price_change',
    status: 'pending',
    materialId: '1',
    oldPrice: 11.8,
    newPrice: 12.5,
    affectedStandardCosts: ['1', '2', '3'],
    triggeredBy: '3',
    triggeredAt: '2026-03-07',
  },
  {
    id: '2',
    type: 'price_change',
    status: 'processed',
    materialId: '4',
    oldPrice: 80,
    newPrice: 85,
    affectedStandardCosts: [],
    triggeredBy: '3',
    triggeredAt: '2026-03-05',
    processedBy: '2',
    processedAt: '2026-03-06',
  },
]

// ==================== 系统配置 ====================
export const systemConfig: SystemConfig = {
  adminFeeRate: 0.1,
  vatRate: 0.13,
  exchangeRate: 7.2,
  fcl20Rate: 3500,
  fcl40Rate: 5800,
  lclBaseRate: 45,
}

// ==================== 仪表盘统计 ====================
export const dashboardStats: DashboardStats = {
  totalQuotations: 156,
  totalCustomers: 42,
  totalModels: 28,
  pendingReviews: 5,
  quotationsTrend: [
    { week: '第9周', count: 12 },
    { week: '第10周', count: 18 },
    { week: '第11周', count: 15 },
    { week: '第12周', count: 22 },
    { week: '第13周', count: 19 },
    { week: '第14周', count: 25 },
  ],
  regulationStats: [
    { name: 'GB', count: 68 },
    { name: 'EN', count: 45 },
    { name: 'NIOSH', count: 28 },
    { name: 'AS/NZS', count: 15 },
  ],
  topModels: [
    { name: 'D-700', count: 45 },
    { name: 'D-800', count: 38 },
    { name: 'P-100', count: 32 },
    { name: 'N-95', count: 28 },
    { name: 'D-900', count: 13 },
  ],
}

// ==================== 辅助函数 ====================
export function getRegulationById(id: string) {
  return regulations.find((r) => r.id === id)
}

export function getCustomerById(id: string) {
  return customers.find((c) => c.id === id)
}

export function getModelById(id: string) {
  return models.find((m) => m.id === id)
}

export function getMaterialById(id: string) {
  return materials.find((m) => m.id === id)
}

export function getPackagingConfigById(id: string) {
  return packagingConfigs.find((p) => p.id === id)
}

export function getModelPackagingConfigs(modelId: string) {
  return packagingConfigs.filter((p) => p.modelId === modelId)
}

export function getPackagingProcessConfigs(packagingConfigId: string) {
  return processConfigs.filter((p) => p.packagingConfigId === packagingConfigId)
}

export function getPackagingMaterials(packagingConfigId: string) {
  return packagingMaterials.filter((p) => p.packagingConfigId === packagingConfigId)
}

export function getModelBom(modelId: string) {
  return bomMaterials
    .filter((b) => b.modelId === modelId)
    .map((b) => ({ ...b, material: getMaterialById(b.materialId) }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getQuotationWithDetails(quotation: Quotation) {
  return {
    ...quotation,
    customer: getCustomerById(quotation.customerId),
    regulation: getRegulationById(quotation.regulationId),
    model: getModelById(quotation.modelId),
    packagingConfig: getPackagingConfigById(quotation.packagingConfigId),
  }
}

export function getStandardCostWithDetails(standardCost: StandardCost) {
  const packagingConfig = getPackagingConfigById(standardCost.packagingConfigId)
  return {
    ...standardCost,
    packagingConfig,
    model: packagingConfig ? getModelById(packagingConfig.modelId) : undefined,
  }
}
