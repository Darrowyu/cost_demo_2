import { PrismaClient, Role, UserStatus, RegulationStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始种子数据...')

  // 清理现有数据
  await prisma.notification.deleteMany()
  await prisma.standardCost.deleteMany()
  await prisma.quotation.deleteMany()
  await prisma.processConfig.deleteMany()
  await prisma.packagingMaterial.deleteMany()
  await prisma.packagingConfig.deleteMany()
  await prisma.bomMaterial.deleteMany()
  await prisma.material.deleteMany()
  await prisma.model.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.regulation.deleteMany()
  await prisma.systemConfig.deleteMany()
  await prisma.user.deleteMany()

  console.log('已清理现有数据')

  // 创建用户
  const adminPassword = await bcrypt.hash('admin123', 10)
  const purchaserPassword = await bcrypt.hash('purchaser123', 10)
  const reviewerPassword = await bcrypt.hash('reviewer123', 10)

  const admin = await prisma.user.create({
    data: {
      id: '1',
      username: 'admin',
      password: adminPassword,
      name: '张明',
      email: 'admin@company.com',
      role: Role.admin,
      status: UserStatus.active,
      createdAt: new Date('2024-01-01'),
    },
  })

  const purchaser = await prisma.user.create({
    data: {
      id: '2',
      username: 'purchaser',
      password: purchaserPassword,
      name: '李采购',
      email: 'purchaser@company.com',
      role: Role.purchaser,
      status: UserStatus.active,
      createdAt: new Date('2024-01-01'),
    },
  })

  const reviewer = await prisma.user.create({
    data: {
      id: '3',
      username: 'reviewer',
      password: reviewerPassword,
      name: '王审核',
      email: 'reviewer@company.com',
      role: Role.reviewer,
      status: UserStatus.active,
      createdAt: new Date('2024-01-01'),
    },
  })

  console.log('已创建用户:', { admin: admin.name, purchaser: purchaser.name, reviewer: reviewer.name })

  // 创建法规
  const regulations = await prisma.regulation.createMany({
    data: [
      { id: '1', code: 'GB', name: 'GB', description: '中国国家标准', status: RegulationStatus.active },
      { id: '2', code: 'EN', name: 'EN', description: '欧洲标准', status: RegulationStatus.active },
      { id: '3', code: 'NIOSH', name: 'NIOSH', description: '美国NIOSH标准', status: RegulationStatus.active },
      { id: '4', code: 'AS/NZS', name: 'AS/NZS', description: '澳洲/新西兰标准', status: RegulationStatus.active },
    ],
  })

  console.log('已创建法规:', regulations.count)

  // 创建客户
  const customers = await prisma.customer.createMany({
    data: [
      { id: '1', code: 'VC001', name: '3M中国', region: '华东', note: '重点客户', createdBy: '1', updatedBy: '1' },
      { id: '2', code: 'VC002', name: 'Honeywell', region: '华北', note: '外资企业', createdBy: '1', updatedBy: '1' },
      { id: '3', code: 'VC003', name: '霍尼韦尔安全', region: '华南', createdBy: '1', updatedBy: '1' },
      { id: '4', code: 'VC004', name: 'MSA安全', region: '西南', createdBy: '1', updatedBy: '1' },
      { id: '5', code: 'VC005', name: '德尔格安全', region: '华中', createdBy: '1', updatedBy: '1' },
    ],
  })

  console.log('已创建客户:', customers.count)

  // 创建原材料
  const materials = await prisma.material.createMany({
    data: [
      { id: '1', materialNo: 'M001', name: '硅胶面罩主体', unit: '个', price: 12.5, currency: 'CNY', manufacturer: '国产A厂', category: '半面罩类' },
      { id: '2', materialNo: 'M002', name: '呼吸阀', unit: '个', price: 3.2, currency: 'CNY', manufacturer: '国产B厂', category: '半面罩类' },
      { id: '3', materialNo: 'M003', name: '头带组件', unit: '套', price: 4.8, currency: 'CNY', manufacturer: '进口C厂', category: '半面罩类' },
      { id: '4', materialNo: 'M004', name: '滤棉', unit: 'KG', price: 85, currency: 'CNY', manufacturer: '国产D厂', category: '口罩类' },
      { id: '5', materialNo: 'M005', name: '鼻夹', unit: '码', price: 0.15, currency: 'CNY', manufacturer: '国产E厂', category: '口罩类' },
      { id: '6', materialNo: 'M006', name: '耳带', unit: '码', price: 0.08, currency: 'CNY', manufacturer: '国产F厂', category: '口罩类' },
      { id: '7', materialNo: 'M007', name: '滤盒', unit: '个', price: 8.5, currency: 'CNY', manufacturer: '进口G厂', category: '半面罩类' },
      { id: '8', materialNo: 'M008', name: '密封垫', unit: '个', price: 1.2, currency: 'CNY', manufacturer: '国产H厂', category: '半面罩类' },
    ],
  })

  console.log('已创建原材料:', materials.count)

  // 创建型号
  const models = await prisma.model.createMany({
    data: [
      { id: '1', name: 'D-700', regulationId: '1', category: '半面罩', series: 'D系列', imageUrl: '/models/d700.png' },
      { id: '2', name: 'D-800', regulationId: '1', category: '半面罩', series: 'D系列', imageUrl: '/models/d800.png' },
      { id: '3', name: 'P-100', regulationId: '2', category: '口罩', series: 'P系列', imageUrl: '/models/p100.png' },
      { id: '4', name: 'P-200', regulationId: '2', category: '口罩', series: 'P系列', imageUrl: '/models/p200.png' },
      { id: '5', name: 'N-95', regulationId: '3', category: '口罩', series: 'N系列', imageUrl: '/models/n95.png' },
      { id: '6', name: 'D-900', regulationId: '1', category: '半面罩', series: 'D系列', imageUrl: '/models/d900.png' },
    ],
  })

  console.log('已创建型号:', models.count)

  // 创建BOM
  const boms = await prisma.bomMaterial.createMany({
    data: [
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
    ],
  })

  console.log('已创建BOM:', boms.count)

  // 创建包装配置
  const packagingConfigs = await prisma.packagingConfig.createMany({
    data: [
      { id: '1', modelId: '1', name: '标准单件装', packagingType: '单件', perBox: 50, perCarton: 200 },
      { id: '2', modelId: '1', name: '散装50只/盒', packagingType: '散装', perBox: 50, perCarton: 500 },
      { id: '3', modelId: '2', name: '标准单件装', packagingType: '单件', perBox: 40, perCarton: 160 },
      { id: '4', modelId: '3', name: '50只/盒', packagingType: '盒装', perBox: 50, perCarton: 1000 },
      { id: '5', modelId: '5', name: '20只/盒', packagingType: '盒装', perBox: 20, perCarton: 400 },
    ],
  })

  console.log('已创建包装配置:', packagingConfigs.count)

  // 创建工序配置
  const processConfigs = await prisma.processConfig.createMany({
    data: [
      { id: '1', packagingConfigId: '1', name: '组装', price: 0.5, unit: 'piece', sortOrder: 1 },
      { id: '2', packagingConfigId: '1', name: '检验', price: 0.2, unit: 'piece', sortOrder: 2 },
      { id: '3', packagingConfigId: '1', name: '包装', price: 0.3, unit: 'piece', sortOrder: 3 },
      { id: '4', packagingConfigId: '2', name: '组装', price: 0.45, unit: 'piece', sortOrder: 1 },
      { id: '5', packagingConfigId: '2', name: '散装打包', price: 0.15, unit: 'piece', sortOrder: 2 },
      { id: '6', packagingConfigId: '4', name: '裁切', price: 2.4, unit: 'dozen', sortOrder: 1 },
      { id: '7', packagingConfigId: '4', name: '焊接', price: 3.6, unit: 'dozen', sortOrder: 2 },
      { id: '8', packagingConfigId: '4', name: '包装', price: 1.2, unit: 'dozen', sortOrder: 3 },
    ],
  })

  console.log('已创建工序配置:', processConfigs.count)

  // 创建包材配置
  const packagingMaterials = await prisma.packagingMaterial.createMany({
    data: [
      { id: '1', packagingConfigId: '1', name: 'PE袋', quantity: 1, price: 0.08 },
      { id: '2', packagingConfigId: '1', name: '说明书', quantity: 1, price: 0.05 },
      { id: '3', packagingConfigId: '1', name: '小盒', quantity: 1, price: 0.35 },
      { id: '4', packagingConfigId: '1', name: '外箱', quantity: 0.02, price: 3.5, boxLength: 60, boxWidth: 40, boxHeight: 35 },
      { id: '5', packagingConfigId: '2', name: '内袋', quantity: 1, price: 0.03 },
      { id: '6', packagingConfigId: '2', name: '外箱', quantity: 0.002, price: 4.2, boxLength: 70, boxWidth: 50, boxHeight: 40 },
      { id: '7', packagingConfigId: '4', name: '内盒', quantity: 1, price: 0.12 },
      { id: '8', packagingConfigId: '4', name: '外箱', quantity: 0.05, price: 2.8, boxLength: 50, boxWidth: 35, boxHeight: 30 },
    ],
  })

  console.log('已创建包材配置:', packagingMaterials.count)

  // 创建系统配置
  await prisma.systemConfig.createMany({
    data: [
      { key: 'adminFeeRate', value: 0.1 },
      { key: 'vatRate', value: 0.13 },
      { key: 'exchangeRate', value: 7.2 },
      { key: 'fcl20Rate', value: 3500 },
      { key: 'fcl40Rate', value: 5800 },
      { key: 'lclBaseRate', value: 45 },
    ],
  })

  console.log('已创建系统配置')

  console.log('种子数据完成!')
  console.log('默认用户:')
  console.log('  admin / admin123')
  console.log('  purchaser / purchaser123')
  console.log('  reviewer / reviewer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
