'use client'

import { useState } from 'react'
import { Plus, X, BarChart3 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { quotations, getQuotationWithDetails } from '@/lib/data'
import type { QuotationStatus } from '@/lib/types'

const statusConfig: Record<QuotationStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: '草稿', variant: 'secondary' },
  submitted: { label: '待审核', variant: 'default' },
  approved: { label: '已通过', variant: 'outline' },
  rejected: { label: '已退回', variant: 'destructive' },
}

export default function CostComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const allQuotations = quotations.map(getQuotationWithDetails)
  const selectedQuotations = selectedIds
    .map((id) => allQuotations.find((q) => q.id === id))
    .filter(Boolean)

  const availableQuotations = allQuotations.filter((q) => !selectedIds.includes(q.id))

  const handleAdd = (id: string) => {
    if (selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleRemove = (id: string) => {
    setSelectedIds(selectedIds.filter((sid) => sid !== id))
  }

  // 准备图表数据
  const chartData = [
    {
      name: '原料成本',
      ...Object.fromEntries(selectedQuotations.map((q, i) => [`q${i}`, q!.costs.materialCost])),
    },
    {
      name: '包材成本',
      ...Object.fromEntries(selectedQuotations.map((q, i) => [`q${i}`, q!.costs.packagingCost])),
    },
    {
      name: '工序成本',
      ...Object.fromEntries(selectedQuotations.map((q, i) => [`q${i}`, q!.costs.processCost])),
    },
    {
      name: '运费',
      ...Object.fromEntries(selectedQuotations.map((q, i) => [`q${i}`, q!.costs.shippingCost])),
    },
    {
      name: '管销费用',
      ...Object.fromEntries(selectedQuotations.map((q, i) => [`q${i}`, q!.costs.adminFee])),
    },
  ]

  const colors = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">成本对比</h1>
        <p className="text-sm text-muted-foreground">
          选择多个报价单进行成本对比分析
        </p>
      </div>

      {/* 选择区域 */}
      <Card>
        <CardHeader>
          <CardTitle>选择对比项</CardTitle>
          <CardDescription>最多选择4个报价单进行对比</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {selectedQuotations.map((q) => (
              <div
                key={q!.id}
                className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{q!.quotationNo}</p>
                  <p className="text-xs text-muted-foreground">
                    {q!.model?.name} · {q!.customer?.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => handleRemove(q!.id)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}

            {selectedIds.length < 4 && (
              <Select onValueChange={handleAdd}>
                <SelectTrigger className="w-[200px]">
                  <Plus className="mr-2 size-4" />
                  <SelectValue placeholder="添加报价单" />
                </SelectTrigger>
                <SelectContent>
                  {availableQuotations.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      <div className="flex items-center gap-2">
                        <span>{q.quotationNo}</span>
                        <span className="text-muted-foreground">
                          {q.model?.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedQuotations.length >= 2 && (
        <>
          {/* 对比表格 */}
          <Card>
            <CardHeader>
              <CardTitle>成本明细对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">项目</th>
                      {selectedQuotations.map((q) => (
                        <th key={q!.id} className="px-4 py-3 text-right font-medium min-w-[150px]">
                          <div className="flex flex-col items-end gap-1">
                            <span>{q!.quotationNo}</span>
                            <Badge variant={statusConfig[q!.status].variant} className="text-xs">
                              {statusConfig[q!.status].label}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">客户</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">{q!.customer?.name}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">型号</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">{q!.model?.name}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">数量</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">{q!.quantity.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="px-4 py-3 font-medium" colSpan={selectedQuotations.length + 1}>成本构成</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">原料成本</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">¥{q!.costs.materialCost.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">包材成本</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">¥{q!.costs.packagingCost.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">工序成本</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">¥{q!.costs.processCost.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">运费</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">¥{q!.costs.shippingCost.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">管销费用</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">¥{q!.costs.adminFee.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-muted-foreground">增值税</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right">¥{q!.costs.vat.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr className="bg-muted/50 font-medium">
                      <td className="px-4 py-3">总成本</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right text-base">¥{q!.costs.totalCost.toLocaleString()}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">单件成本</td>
                      {selectedQuotations.map((q) => (
                        <td key={q!.id} className="px-4 py-3 text-right font-medium">
                          ¥{(q!.costs.totalCost / q!.quantity).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* 图表对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5" />
                可视化对比
              </CardTitle>
              <CardDescription>各成本项柱状图对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={Object.fromEntries(
                  selectedQuotations.map((q, i) => [
                    `q${i}`,
                    { label: q!.quotationNo, color: colors[i] },
                  ])
                )}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {selectedQuotations.map((q, i) => (
                      <Bar
                        key={q!.id}
                        dataKey={`q${i}`}
                        name={q!.quotationNo}
                        fill={colors[i]}
                        radius={[0, 4, 4, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      )}

      {selectedQuotations.length < 2 && (
        <Card>
          <CardContent className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <BarChart3 className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">请至少选择2个报价单进行对比</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
