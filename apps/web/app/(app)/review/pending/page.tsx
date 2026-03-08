'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Check, X, Clock, AlertCircle } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { quotations, getQuotationWithDetails } from '@/lib/data'

const saleTypeLabels = {
  domestic: '内销',
  export: '外销',
}

export default function PendingReviewPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approveNote, setApproveNote] = useState('')
  const [setAsStandard, setSetAsStandard] = useState(false)

  const pendingQuotations = quotations
    .filter((q) => q.status === 'submitted')
    .map(getQuotationWithDetails)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingQuotations.map((q) => q.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    }
  }

  const handleApprove = (id: string) => {
    setCurrentId(id)
    setApproveNote('')
    setSetAsStandard(false)
    setApproveDialogOpen(true)
  }

  const handleReject = (id: string) => {
    setCurrentId(id)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  const confirmApprove = () => {
    toast.success('报价单已批准')
    setApproveDialogOpen(false)
    setCurrentId(null)
  }

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('请填写退回原因')
      return
    }
    toast.success('报价单已退回')
    setRejectDialogOpen(false)
    setCurrentId(null)
    setRejectReason('')
  }

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) {
      toast.error('请选择要批准的报价单')
      return
    }
    toast.success(`已批准 ${selectedIds.length} 个报价单`)
    setSelectedIds([])
  }

  const currentQuotation = currentId
    ? pendingQuotations.find((q) => q.id === currentId)
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">待审核</h1>
          <p className="text-sm text-muted-foreground">
            审核业务员提交的报价单
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Button onClick={handleBatchApprove}>
            <Check className="mr-2 size-4" />
            批量批准 ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* 统计信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingQuotations.length}</div>
            <p className="text-xs text-muted-foreground">需要处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日已审</CardTitle>
            <Check className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">已处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均处理时间</CardTitle>
            <AlertCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">本周平均</p>
          </CardContent>
        </Card>
      </div>

      {/* 待审核列表 */}
      <Card>
        <CardHeader>
          <CardTitle>待审核列表</CardTitle>
          <CardDescription>共 {pendingQuotations.length} 条待审核记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedIds.length === pendingQuotations.length && pendingQuotations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>报价编号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>法规/型号</TableHead>
                  <TableHead>销售类型</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">总成本</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      暂无待审核记录
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingQuotations.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(q.id)}
                          onCheckedChange={(checked) => handleSelect(q.id, checked as boolean)}
                        />
                      </TableCell>
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
                      <TableCell className="text-right">{q.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{q.costs.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{q.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" asChild>
                            <Link href={`/cost/${q.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(q.id)}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleReject(q.id)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 批准弹窗 */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批准报价单</DialogTitle>
            <DialogDescription>
              确认批准 {currentQuotation?.quotationNo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">客户</span>
                <span>{currentQuotation?.customer?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">型号</span>
                <span>{currentQuotation?.model?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">总成本</span>
                <span className="font-medium">¥{currentQuotation?.costs.totalCost.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>审核意见（可选）</Label>
              <Textarea
                placeholder="填写审核意见..."
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setAsStandard"
                checked={setAsStandard}
                onCheckedChange={(checked) => setSetAsStandard(checked as boolean)}
              />
              <label htmlFor="setAsStandard" className="text-sm">
                同时设为当前标准成本
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={confirmApprove}>
              确认批准
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 退回弹窗 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>退回报价单</DialogTitle>
            <DialogDescription>
              确认退回 {currentQuotation?.quotationNo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">客户</span>
                <span>{currentQuotation?.customer?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">型号</span>
                <span>{currentQuotation?.model?.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>退回原因（必填）</Label>
              <Textarea
                placeholder="请填写退回原因..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              确认退回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
