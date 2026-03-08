'use client'

import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Send,
} from 'lucide-react'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { quotations, regulations, getQuotationWithDetails } from '@/lib/data'
import type { QuotationStatus } from '@/lib/types'
import { useListFilters } from '@/hooks/use-filters'

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

export default function CostRecordsPage() {
  const allQuotations = quotations.map(getQuotationWithDetails)
  const { searchTerm, setSearchTerm, filters, setFilter, filteredItems: filteredQuotations } = useListFilters(
    allQuotations,
    ['quotationNo']
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">成本记录</h1>
          <p className="text-sm text-muted-foreground">
            查看和管理所有报价单记录
          </p>
        </div>
        <Button asChild>
          <Link href="/cost/new">
            <Plus className="mr-2 size-4" />
            新增成本分析
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>报价单列表</CardTitle>
          <CardDescription>共 {filteredQuotations.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 筛选区域 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索报价编号或客户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filters.status || 'all'} onValueChange={(value) => setFilter('status', value)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="submitted">待审核</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已退回</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.regulationId || 'all'} onValueChange={(value) => setFilter('regulationId', value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="法规" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部法规</SelectItem>
                {regulations.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>报价编号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>法规/型号</TableHead>
                  <TableHead>销售类型</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">总成本</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQuotations.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.quotationNo}</TableCell>
                      <TableCell>{q.customer?.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{q.regulation?.name}</span>
                          <span className="text-xs text-muted-foreground">{q.model?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{saleTypeLabels[q.saleType]}</TableCell>
                      <TableCell className="text-right">{q.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{q.costs.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[q.status].variant}>
                          {statusConfig[q.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{q.createdAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/cost/${q.id}`}>
                                <Eye className="mr-2 size-4" />
                                查看详情
                              </Link>
                            </DropdownMenuItem>
                            {(q.status === 'draft' || q.status === 'rejected') && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link href={`/cost/${q.id}/edit`}>
                                    <Pencil className="mr-2 size-4" />
                                    编辑
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Send className="mr-2 size-4" />
                                  提交审核
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 size-4" />
                              删除
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
    </div>
  )
}
