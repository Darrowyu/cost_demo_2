'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil, Send, FileBarChart, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  quotations,
  getQuotationWithDetails,
  getModelBom,
  getPackagingMaterials,
  getPackagingProcessConfigs,
} from '@/lib/data'
import type { QuotationStatus } from '@/lib/types'

const statusConfig: Record<QuotationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: '草稿', variant: 'secondary' },
  submitted: { label: '待审核', variant: 'default' },
  approved: { label: '已通过', variant: 'outline' },
  rejected: { label: '已退回', variant: 'destructive' },
}

const saleTypeLabels = {
  domestic: '内销',
  export: '外销',
}

const shippingTypeLabels = {
  fcl20: '整柜20尺',
  fcl40: '整柜40尺',
  lcl: '拼箱',
}

export default function CostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const quotation = quotations.find((q) => q.id === id)

  if (!quotation) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">报价单不存在</p>
          <Button asChild className="mt-4">
            <Link href="/cost/records">返回列表</Link>
          </Button>
        </div>
      </div>
    )
  }

  const q = getQuotationWithDetails(quotation)
  const bom = getModelBom(q.modelId)
  const packagingMaterials = getPackagingMaterials(q.packagingConfigId)
  const processConfigs = getPackagingProcessConfigs(q.packagingConfigId)

  const canEdit = q.status === 'draft' || q.status === 'rejected'
  const canSubmit = q.status === 'draft' || q.status === 'rejected'

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cost/records">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{q.quotationNo}</h1>
              <Badge variant={statusConfig[q.status].variant}>
                {statusConfig[q.status].label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              创建于 {q.createdAt} · 更新于 {q.updatedAt}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/cost/${q.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                编辑
              </Link>
            </Button>
          )}
          {canSubmit && (
            <Button>
              <Send className="mr-2 size-4" />
              提交审核
            </Button>
          )}
        </div>
      </div>

      {/* 审核信息 */}
      {q.reviewedAt && (
        <Card className={q.status === 'approved' ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
          <CardContent className="flex items-start gap-3 py-4">
            {q.status === 'approved' ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : (
              <XCircle className="size-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {q.status === 'approved' ? '审核通过' : '审核退回'}
              </p>
              <p className="text-sm text-muted-foreground">
                {q.reviewedAt} · {q.reviewNote}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧信息 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 基础信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">客户</p>
                  <p className="font-medium">{q.customer?.name}</p>
                  <p className="text-xs text-muted-foreground">{q.customer?.code} · {q.customer?.region}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">法规/型号</p>
                  <p className="font-medium">{q.regulation?.name} / {q.model?.name}</p>
                  <p className="text-xs text-muted-foreground">{q.model?.series} · {q.model?.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">包装配置</p>
                  <p className="font-medium">{q.packagingConfig?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">销售类型</p>
                  <p className="font-medium">{saleTypeLabels[q.saleType]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">运输方式</p>
                  <p className="font-medium">{shippingTypeLabels[q.shippingType]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">数量</p>
                  <p className="font-medium">{q.quantity.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 原料清单 */}
          <Card>
            <CardHeader>
              <CardTitle>原料清单 (BOM)</CardTitle>
              <CardDescription>产品物料构成</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">料号</th>
                      <th className="px-3 py-2 text-left font-medium">名称</th>
                      <th className="px-3 py-2 text-right font-medium">用量</th>
                      <th className="px-3 py-2 text-right font-medium">单价</th>
                      <th className="px-3 py-2 text-right font-medium">小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-3 py-2 text-muted-foreground">{item.material?.materialNo}</td>
                        <td className="px-3 py-2">{item.material?.name}</td>
                        <td className="px-3 py-2 text-right">{item.quantity} {item.material?.unit}</td>
                        <td className="px-3 py-2 text-right">¥{item.material?.price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          ¥{((item.material?.price || 0) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 包材与工序 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>包材清单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {packagingMaterials.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-2">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">¥{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>工序清单</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {processConfigs.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border p-2">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">
                        ¥{item.price.toFixed(2)}/{item.unit === 'piece' ? '件' : '打'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 右侧费用汇总 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="size-5" />
                费用汇总
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">原料成本</span>
                  <span>¥{q.costs.materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">包材成本</span>
                  <span>¥{q.costs.packagingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">工序成本</span>
                  <span>¥{q.costs.processCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">运费</span>
                  <span>¥{q.costs.shippingCost.toLocaleString()}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">管销费用 (10%)</span>
                  <span>¥{q.costs.adminFee.toLocaleString()}</span>
                </div>
                {q.saleType === 'domestic' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">增值税 (13%)</span>
                    <span>¥{q.costs.vat.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-medium">总成本</span>
                <span className="text-xl font-bold">¥{q.costs.totalCost.toLocaleString()}</span>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">单件成本</span>
                  <span className="font-medium">¥{(q.costs.totalCost / q.quantity).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
