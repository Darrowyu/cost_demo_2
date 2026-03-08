import { prisma } from '@cost/database'

export interface CostCalculationInput {
  modelId: string
  packagingConfigId: string
  saleType: 'domestic' | 'export'
  shippingType: 'fcl20' | 'fcl40' | 'lcl'
  quantity: number
}

export interface CostCalculationResult {
  materialCost: number
  packagingCost: number
  processCost: number
  shippingCost: number
  adminFee: number
  vat: number
  totalCost: number
  unitCost: number
}

interface SystemConfigMap {
  fcl20Rate?: number
  fcl40Rate?: number
  lclBaseRate?: number
  adminFeeRate?: number
  vatRate?: number
}

async function getSystemConfig(): Promise<SystemConfigMap> {
  const config = await prisma.systemConfig.findMany()
  return Object.fromEntries(
    config.map((c: { key: string; value: unknown }) => [c.key, Number(c.value)])
  )
}

async function calculateMaterialCost(modelId: string, quantity: number): Promise<number> {
  const bomMaterials = await prisma.bomMaterial.findMany({
    where: { modelId },
    include: { material: true },
  })

  return bomMaterials.reduce((sum, bom) => {
    return sum + Number(bom.material.price) * Number(bom.quantity) * quantity
  }, 0)
}

async function getPackagingConfig(packagingConfigId: string) {
  return prisma.packagingConfig.findUnique({
    where: { id: packagingConfigId },
    include: {
      processConfigs: true,
      packagingMaterials: true,
    },
  })
}

interface PackagingMaterialItem {
  price: number | string | { toNumber(): number }
  quantity: number | string | { toNumber(): number }
}

function calculatePackagingCost(
  packagingMaterials: PackagingMaterialItem[],
  quantity: number
): number {
  return packagingMaterials.reduce(
    (sum, pm) => sum + Number(pm.price) * Number(pm.quantity) * quantity,
    0
  )
}

interface ProcessConfigItem {
  unit: string
  price: number | string | { toNumber(): number }
}

function calculateProcessCost(
  processConfigs: ProcessConfigItem[],
  quantity: number
): number {
  return processConfigs.reduce((sum, pc) => {
    const unitMultiplier = pc.unit === 'dozen' ? quantity / 12 : quantity
    return sum + Number(pc.price) * unitMultiplier
  }, 0)
}

function calculateShippingCost(
  shippingType: 'fcl20' | 'fcl40' | 'lcl',
  cartonCount: number,
  config: SystemConfigMap
): number {
  switch (shippingType) {
    case 'fcl20':
      return config.fcl20Rate ?? 3500
    case 'fcl40':
      return config.fcl40Rate ?? 5800
    case 'lcl':
      return (config.lclBaseRate ?? 45) * cartonCount
    default:
      return 0
  }
}

function calculateAdminFee(
  materialCost: number,
  packagingCost: number,
  processCost: number,
  adminFeeRate: number
): number {
  return (materialCost + packagingCost + processCost) * adminFeeRate
}

function calculateVat(
  materialCost: number,
  packagingCost: number,
  processCost: number,
  adminFee: number,
  vatRate: number,
  saleType: 'domestic' | 'export'
): number {
  if (saleType !== 'domestic') return 0
  return (materialCost + packagingCost + processCost + adminFee) * vatRate
}

export async function calculateCosts(input: CostCalculationInput): Promise<CostCalculationResult> {
  const { modelId, packagingConfigId, saleType, shippingType, quantity } = input

  const [config, materialCost, packagingConfig] = await Promise.all([
    getSystemConfig(),
    calculateMaterialCost(modelId, quantity),
    getPackagingConfig(packagingConfigId),
  ])

  if (!packagingConfig) {
    throw new Error('包装配置不存在')
  }

  const packagingCost = calculatePackagingCost(packagingConfig.packagingMaterials, quantity)
  const processCost = calculateProcessCost(packagingConfig.processConfigs, quantity)

  const cartonCount = Math.ceil(quantity / packagingConfig.perCarton)
  const shippingCost = calculateShippingCost(shippingType, cartonCount, config)

  const adminFeeRate = config.adminFeeRate ?? 0.1
  const adminFee = calculateAdminFee(materialCost, packagingCost, processCost, adminFeeRate)

  const vatRate = config.vatRate ?? 0.13
  const vat = calculateVat(materialCost, packagingCost, processCost, adminFee, vatRate, saleType)

  const totalCost = materialCost + packagingCost + processCost + shippingCost + adminFee + vat

  return {
    materialCost,
    packagingCost,
    processCost,
    shippingCost,
    adminFee,
    vat,
    totalCost,
    unitCost: totalCost / quantity,
  }
}
