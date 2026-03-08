'use client'

import { useState } from 'react'
import { Search, Filter, Star, History, MoreHorizontal } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { standardCosts, getStandardCostWithDetails, models } from '@/lib/data'

const saleTypeLabels = {
  domestic: '内销',
  export: '外销',
}

export default function StandardCostPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [saleTypeFilter, setSaleTypeFilter] = useState<string>('all')
  const [selectedCost, setSelectedCost] = useState<string | null>(null)

  const allStandardCosts = standardCosts.map(getStandardCostWithDetails)

  const filteredCosts = allStandardCosts.filter((sc) => {
    const matchesSearch =
      sc.model?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sc.packagingConfig?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSaleType = saleTypeFilter === 'all' || sc.saleType === saleTypeFilter
    return matchesSearch && matchesSaleType
  })

  const currentCosts = filteredCosts.filter((sc) => sc.isCurrent)
  const historyCosts = filteredCosts.filter((sc) => !sc.isCurrent)

  const selectedCostData = selectedCost
    ? allStandardCosts.find((sc) => sc.id === selectedCost)
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">标准成本管理</h1>
        <p className="text-sm text-muted-foreground">
          管理各型号包装配置的标准成本基准
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>当前标准成本</CardTitle>
          <CardDescription>作为报价基准的标准成本版本</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 筛选区域 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索型号或包装配置..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={saleTypeFilter} onValueChange={setSaleTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="销售类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="domestic">内销</SelectItem>
                <SelectItem value="export">外销</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 当前标准成本表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>型号</TableHead>
                  <TableHead>包装配置</TableHead>
                  <TableHead>销售类型</TableHead>
                  <TableHead className="text-right">原料成本</TableHead>
                  <TableHead className="text-right">包材成本</TableHead>
                  <TableHead className="text-right">工序成本</TableHead>
                  <TableHead className="text-right">单件总成本</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>设置时间</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  currentCosts.map((sc) => (
                    <TableRow key={sc.id}>
                      <TableCell className="font-medium">{sc.model?.name}</TableCell>
                      <TableCell>{sc.packagingConfig?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{saleTypeLabels[sc.saleType]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">¥{sc.costs.materialCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">¥{sc.costs.packagingCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">¥{sc.costs.processCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">¥{sc.costs.totalCost.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          V{sc.version}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{sc.setAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedCost(sc.id)}>
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="mr-2 size-4" />
                              查看历史版本
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 历史版本 */}
      {historyCosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史版本</CardTitle>
            <CardDescription>已被替换的标准成本版本</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>型号</TableHead>
                    <TableHead>包装配置</TableHead>
                    <TableHead>销售类型</TableHead>
                    <TableHead className="text-right">单件总成本</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>设置时间</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyCosts.map((sc) => (
                    <TableRow key={sc.id} className="text-muted-foreground">
                      <TableCell>{sc.model?.name}</TableCell>
                      <TableCell>{sc.packagingConfig?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{saleTypeLabels[sc.saleType]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">¥{sc.costs.totalCost.toFixed(2)}</TableCell>
                      <TableCell>V{sc.version}</TableCell>
                      <TableCell>{sc.setAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCost(sc.id)}
                        >
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详情弹窗 */}
      <Dialog open={!!selectedCost} onOpenChange={() => setSelectedCost(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>标准成本详情</DialogTitle>
            <DialogDescription>
              {selectedCostData?.model?.name} - {selectedCostData?.packagingConfig?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCostData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">版本</span>
                <div className="flex items-center gap-2">
                  {selectedCostData.isCurrent && (
                    <Badge variant="default">当前版本</Badge>
                  )}
                  <span className="font-medium">V{selectedCostData.version}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">销售类型</span>
                <span>{saleTypeLabels[selectedCostData.saleType]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">设置时间</span>
                <span>{selectedCostData.setAt}</span>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium mb-3">成本构成</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">原料成本</span>
                  <span>¥{selectedCostData.costs.materialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">包材成本</span>
                  <span>¥{selectedCostData.costs.packagingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">工序成本</span>
                  <span>¥{selectedCostData.costs.processCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">运费</span>
                  <span>¥{selectedCostData.costs.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">管销费用</span>
                  <span>¥{selectedCostData.costs.adminFee.toFixed(2)}</span>
                </div>
                {selectedCostData.saleType === 'domestic' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">增值税</span>
                    <span>¥{selectedCostData.costs.vat.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>单件总成本</span>
                  <span>¥{selectedCostData.costs.totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
