'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Search, Filter, CheckCircle2, XCircle } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { quotations, getQuotationWithDetails } from '@/lib/data'

const saleTypeLabels = {
  domestic: '内销',
  export: '外销',
}

export default function CompletedReviewPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [resultFilter, setResultFilter] = useState<string>('all')

  const completedQuotations = quotations
    .filter((q) => q.status === 'approved' || q.status === 'rejected')
    .map(getQuotationWithDetails)

  const filteredQuotations = completedQuotations.filter((q) => {
    const matchesSearch =
      q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesResult =
      resultFilter === 'all' ||
      (resultFilter === 'approved' && q.status === 'approved') ||
      (resultFilter === 'rejected' && q.status === 'rejected')
    return matchesSearch && matchesResult
  })

  const approvedCount = completedQuotations.filter((q) => q.status === 'approved').length
  const rejectedCount = completedQuotations.filter((q) => q.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">已审核</h1>
        <p className="text-sm text-muted-foreground">
          查看已审核的报价单记录
        </p>
      </div>

      {/* 统计信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已审核总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedQuotations.length}</div>
            <p className="text-xs text-muted-foreground">历史记录</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已通过</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              {completedQuotations.length > 0
                ? `${((approvedCount / completedQuotations.length) * 100).toFixed(0)}%`
                : '0%'} 通过率
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已退回</CardTitle>
            <XCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">需重新提交</p>
          </CardContent>
        </Card>
      </div>

      {/* 已审核列表 */}
      <Card>
        <CardHeader>
          <CardTitle>已审核列表</CardTitle>
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
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="审核结果" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部结果</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已退回</SelectItem>
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
                  <TableHead className="text-right">总成本</TableHead>
                  <TableHead>审核结果</TableHead>
                  <TableHead>审核时间</TableHead>
                  <TableHead>审核意见</TableHead>
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
                      <TableCell>
                        <Badge variant="outline">{saleTypeLabels[q.saleType]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{q.costs.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {q.status === 'approved' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle2 className="mr-1 size-3" />
                            已通过
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 size-3" />
                            已退回
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{q.reviewedAt}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {q.reviewNote || '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                          <Link href={`/cost/${q.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
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
