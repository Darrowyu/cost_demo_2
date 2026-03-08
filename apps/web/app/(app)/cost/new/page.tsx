'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  regulations,
  models,
  customers,
  getModelPackagingConfigs,
  getModelBom,
  getPackagingMaterials,
  getPackagingProcessConfigs,
  systemConfig,
} from '@/lib/data'
import type { SaleType, ShippingType } from '@/lib/types'

const steps = [
  { id: 1, title: '选择法规', description: '产品适用标准' },
  { id: 2, title: '选择型号', description: '产品型号与配置' },
  { id: 3, title: '客户信息', description: '填写客户资料' },
  { id: 4, title: '销售配置', description: '销售类型与运费' },
  { id: 5, title: '确认提交', description: '核对成本明细' },
]

export default function NewCostPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    regulationId: '',
    modelId: '',
    packagingConfigId: '',
    customerId: '',
    customerName: '',
    saleType: 'domestic' as SaleType,
    shippingType: 'fcl20' as ShippingType,
    quantity: 1000,
  })

  const selectedRegulation = regulations.find((r) => r.id === formData.regulationId)
  const filteredModels = models.filter((m) => m.regulationId === formData.regulationId)
  const selectedModel = models.find((m) => m.id === formData.modelId)
  const packagingConfigs = formData.modelId ? getModelPackagingConfigs(formData.modelId) : []
  const selectedPackagingConfig = packagingConfigs.find((p) => p.id === formData.packagingConfigId)
  const selectedCustomer = customers.find((c) => c.id === formData.customerId)

  // 成本计算
  const calculateCosts = () => {
    if (!formData.modelId || !formData.packagingConfigId) {
      return { materialCost: 0, packagingCost: 0, processCost: 0, shippingCost: 0, adminFee: 0, vat: 0, totalCost: 0 }
    }

    const bom = getModelBom(formData.modelId)
    const packagingMaterials = getPackagingMaterials(formData.packagingConfigId)
    const processConfigs = getPackagingProcessConfigs(formData.packagingConfigId)

    const materialCost = bom.reduce((sum, item) => sum + (item.material?.price || 0) * item.quantity, 0) * formData.quantity
    const packagingCost = packagingMaterials.reduce((sum, item) => sum + item.price * item.quantity, 0) * formData.quantity
    const processCost = processConfigs.reduce((sum, item) => {
      const price = item.unit === 'dozen' ? item.price / 12 : item.price
      return sum + price
    }, 0) * formData.quantity

    const shippingCost = formData.shippingType === 'fcl20'
      ? systemConfig.fcl20Rate
      : formData.shippingType === 'fcl40'
        ? systemConfig.fcl40Rate
        : systemConfig.lclBaseRate * Math.ceil(formData.quantity / 1000)

    const baseCost = materialCost + packagingCost + processCost
    const adminFee = baseCost * systemConfig.adminFeeRate
    const vat = formData.saleType === 'domestic' ? baseCost * systemConfig.vatRate : 0
    const totalCost = baseCost + adminFee + vat + shippingCost

    return { materialCost, packagingCost, processCost, shippingCost, adminFee, vat, totalCost }
  }

  const costs = calculateCosts()

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.regulationId
      case 2: return !!formData.modelId && !!formData.packagingConfigId
      case 3: return !!formData.customerId || !!formData.customerName
      case 4: return true
      case 5: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (currentStep < 5 && canProceed()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cost/records">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">新增成本分析</h1>
          <p className="text-sm text-muted-foreground">
            创建新的报价单
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 步骤导航 */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors',
                    currentStep === step.id && 'bg-muted',
                    step.id < currentStep && 'text-muted-foreground',
                    step.id > currentStep && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                      currentStep === step.id && 'border-foreground bg-foreground text-background',
                      step.id < currentStep && 'border-muted-foreground bg-muted-foreground text-background'
                    )}
                  >
                    {step.id < currentStep ? <Check className="size-4" /> : step.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* 表单区域 */}
        <div className="lg:col-span-2">
          {/* 步骤1: 选择法规 */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>选择法规标准</CardTitle>
                <CardDescription>请选择产品适用的法规标准</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.regulationId}
                  onValueChange={(value) => setFormData({ ...formData, regulationId: value, modelId: '', packagingConfigId: '' })}
                  className="grid gap-3"
                >
                  {regulations.filter((r) => r.status === 'active').map((regulation) => (
                    <label
                      key={regulation.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                        formData.regulationId === regulation.id && 'border-foreground bg-muted/50'
                      )}
                    >
                      <RadioGroupItem value={regulation.id} />
                      <div>
                        <p className="font-medium">{regulation.name}</p>
                        <p className="text-sm text-muted-foreground">{regulation.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* 步骤2: 选择型号 */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>选择产品型号</CardTitle>
                <CardDescription>
                  {selectedRegulation?.name} 标准下的产品型号
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>产品型号</Label>
                  <RadioGroup
                    value={formData.modelId}
                    onValueChange={(value) => setFormData({ ...formData, modelId: value, packagingConfigId: '' })}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {filteredModels.map((model) => (
                      <label
                        key={model.id}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
                          formData.modelId === model.id && 'border-foreground bg-muted/50'
                        )}
                      >
                        <RadioGroupItem value={model.id} />
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.series} · {model.category}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {formData.modelId && packagingConfigs.length > 0 && (
                  <div className="space-y-3">
                    <Label>包装配置</Label>
                    <RadioGroup
                      value={formData.packagingConfigId}
                      onValueChange={(value) => setFormData({ ...formData, packagingConfigId: value })}
                      className="grid gap-3"
                    >
                      {packagingConfigs.map((config) => (
                        <label
                          key={config.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50',
                            formData.packagingConfigId === config.id && 'border-foreground bg-muted/50'
                          )}
                        >
                          <RadioGroupItem value={config.id} />
                          <div>
                            <p className="font-medium">{config.name}</p>
                            <p className="text-xs text-muted-foreground">{config.packagingType}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 步骤3: 客户信息 */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>客户信息</CardTitle>
                <CardDescription>选择已有客户或填写新客户</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>选择客户</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value, customerName: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择已有客户" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} ({customer.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">或</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>新客户名称</Label>
                  <Input
                    placeholder="填写新客户名称"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value, customerId: '' })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步骤4: 销售配置 */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>销售配置</CardTitle>
                <CardDescription>设置销售类型和运输方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>销售类型</Label>
                  <RadioGroup
                    value={formData.saleType}
                    onValueChange={(value) => setFormData({ ...formData, saleType: value as SaleType })}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                        formData.saleType === 'domestic' && 'border-foreground bg-muted/50'
                      )}
                    >
                      <RadioGroupItem value="domestic" />
                      <div>
                        <p className="font-medium">内销</p>
                        <p className="text-xs text-muted-foreground">需计算增值税</p>
                      </div>
                    </label>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50',
                        formData.saleType === 'export' && 'border-foreground bg-muted/50'
                      )}
                    >
                      <RadioGroupItem value="export" />
                      <div>
                        <p className="font-medium">外销</p>
                        <p className="text-xs text-muted-foreground">免增值税</p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>运输方式</Label>
                  <RadioGroup
                    value={formData.shippingType}
                    onValueChange={(value) => setFormData({ ...formData, shippingType: value as ShippingType })}
                    className="grid gap-3"
                  >
                    <label
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50',
                        formData.shippingType === 'fcl20' && 'border-foreground bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="fcl20" />
                        <div>
                          <p className="font-medium">整柜 20尺</p>
                          <p className="text-xs text-muted-foreground">FCL 20</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">¥{systemConfig.fcl20Rate.toLocaleString()}</span>
                    </label>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50',
                        formData.shippingType === 'fcl40' && 'border-foreground bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="fcl40" />
                        <div>
                          <p className="font-medium">整柜 40尺</p>
                          <p className="text-xs text-muted-foreground">FCL 40</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">¥{systemConfig.fcl40Rate.toLocaleString()}</span>
                    </label>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50',
                        formData.shippingType === 'lcl' && 'border-foreground bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="lcl" />
                        <div>
                          <p className="font-medium">拼箱</p>
                          <p className="text-xs text-muted-foreground">LCL 按体积计算</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">¥{systemConfig.lclBaseRate}/CBM</span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>订单数量</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 步骤5: 确认提交 */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>确认信息</CardTitle>
                <CardDescription>请核对以下报价信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">法规标准</span>
                    <span className="font-medium">{selectedRegulation?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">产品型号</span>
                    <span className="font-medium">{selectedModel?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">包装配置</span>
                    <span className="font-medium">{selectedPackagingConfig?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">客户</span>
                    <span className="font-medium">{selectedCustomer?.name || formData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">销售类型</span>
                    <span className="font-medium">{formData.saleType === 'domestic' ? '内销' : '外销'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单数量</span>
                    <span className="font-medium">{formData.quantity.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 导航按钮 */}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
              上一步
            </Button>
            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                下一步
                <ChevronRight className="ml-2 size-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline">保存草稿</Button>
                <Button>提交审核</Button>
              </div>
            )}
          </div>
        </div>

        {/* 成本预览 */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>成本预览</CardTitle>
            <CardDescription>实时计算结果</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">原料成本</span>
                <span>¥{costs.materialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">包材成本</span>
                <span>¥{costs.packagingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">工序成本</span>
                <span>¥{costs.processCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">运费</span>
                <span>¥{costs.shippingCost.toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">管销费用</span>
                <span>¥{costs.adminFee.toLocaleString()}</span>
              </div>
              {formData.saleType === 'domestic' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">增值税</span>
                  <span>¥{costs.vat.toLocaleString()}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="font-medium">总成本</span>
              <span className="text-lg font-bold">¥{costs.totalCost.toLocaleString()}</span>
            </div>

            {formData.quantity > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">单件成本</span>
                  <span className="font-medium">¥{(costs.totalCost / formData.quantity).toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
