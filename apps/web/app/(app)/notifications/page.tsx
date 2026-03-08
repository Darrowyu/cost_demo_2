'use client'

import { useState } from 'react'
import { Bell, Search, Filter, AlertTriangle, TrendingUp, Archive, CheckCircle2, Clock, Eye } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { notifications, getMaterialById, standardCosts, getStandardCostWithDetails } from '@/lib/data'
import type { NotificationStatus, NotificationType } from '@/lib/types'

const typeConfig: Record<NotificationType, { label: string; icon: typeof TrendingUp; color: string }> = {
  price_change: { label: '价格变更', icon: TrendingUp, color: 'text-amber-600' },
  material_delete: { label: '物料删除', icon: AlertTriangle, color: 'text-red-600' },
}

const statusConfig: Record<NotificationStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: '待处理', variant: 'default' },
  processed: { label: '已处理', variant: 'outline' },
  archived: { label: '已归档', variant: 'secondary' },
}

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [processDialogOpen, setProcessDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<typeof notifications[0] | null>(null)
  const [selectedStandardCostIds, setSelectedStandardCostIds] = useState<string[]>([])

  const notificationsWithDetails = notifications.map((n) => ({
    ...n,
    material: getMaterialById(n.materialId),
  }))

  const filteredNotifications = notificationsWithDetails.filter((n) => {
    const matchesSearch = n.material?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || n.type === typeFilter
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const pendingCount = notifications.filter((n) => n.status === 'pending').length
  const processedCount = notifications.filter((n) => n.status === 'processed').length

  const handleViewDetail = (notification: typeof notifications[0]) => {
    setSelectedNotification(notification)
    setDetailDialogOpen(true)
  }

  const handleProcess = (notification: typeof notifications[0]) => {
    setSelectedNotification(notification)
    setSelectedStandardCostIds([...notification.affectedStandardCosts])
    setProcessDialogOpen(true)
  }

  const handleConfirmProcess = (action: 'update_all' | 'update_selected' | 'skip') => {
    if (action === 'update_all') {
      toast.success('已更新所有受影响的标准成本')
    } else if (action === 'update_selected') {
      toast.success(`已更新 ${selectedStandardCostIds.length} 个标准成本`)
    } else {
      toast.info('已跳过处理')
    }
    setProcessDialogOpen(false)
    setSelectedNotification(null)
  }

  const handleArchive = (id: string) => {
    toast.success('通知已归档')
  }

  const affectedStandardCosts = selectedNotification
    ? standardCosts
        .filter((sc) => selectedNotification.affectedStandardCosts.includes(sc.id))
        .map(getStandardCostWithDetails)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">通知中心</h1>
          <p className="text-sm text-muted-foreground">
            物料变更通知的管理和处理
          </p>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <Clock className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">需要处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已处理</CardTitle>
            <CheckCircle2 className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{processedCount}</div>
            <p className="text-xs text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总通知</CardTitle>
            <Bell className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">历史记录</p>
          </CardContent>
        </Card>
      </div>

      {/* 通知列表 */}
      <Card>
        <CardHeader>
          <CardTitle>通知列表</CardTitle>
          <CardDescription>共 {filteredNotifications.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 筛选区域 */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索物料名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="price_change">价格变更</SelectItem>
                <SelectItem value="material_delete">物料删除</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="processed">已处理</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>类型</TableHead>
                  <TableHead>物料信息</TableHead>
                  <TableHead>变更内容</TableHead>
                  <TableHead>影响范围</TableHead>
                  <TableHead>触发时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      暂无通知
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((n) => {
                    const TypeIcon = typeConfig[n.type].icon
                    return (
                      <TableRow key={n.id}>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${typeConfig[n.type].color}`}>
                            <TypeIcon className="size-4" />
                            <span className="text-sm">{typeConfig[n.type].label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{n.material?.name}</p>
                            <p className="text-xs text-muted-foreground">{n.material?.materialNo}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {n.type === 'price_change' && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground line-through">¥{n.oldPrice?.toFixed(2)}</span>
                              <span className="font-medium text-amber-600">¥{n.newPrice?.toFixed(2)}</span>
                            </div>
                          )}
                          {n.type === 'material_delete' && (
                            <span className="text-red-600">物料已删除</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {n.affectedStandardCosts.length} 个标准成本
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{n.triggeredAt}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[n.status].variant}>
                            {statusConfig[n.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleViewDetail(n)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            {n.status === 'pending' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleProcess(n)}
                              >
                                处理
                              </Button>
                            )}
                            {n.status === 'processed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(n.id)}
                              >
                                <Archive className="mr-1 size-4" />
                                归档
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>通知详情</DialogTitle>
            <DialogDescription>
              {selectedNotification && typeConfig[selectedNotification.type].label}
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">物料</span>
                  <span className="font-medium">{getMaterialById(selectedNotification.materialId)?.name}</span>
                </div>
                {selectedNotification.type === 'price_change' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">原价格</span>
                      <span className="line-through">¥{selectedNotification.oldPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">新价格</span>
                      <span className="font-medium text-amber-600">¥{selectedNotification.newPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">变动幅度</span>
                      <span className={`font-medium ${(selectedNotification.newPrice || 0) > (selectedNotification.oldPrice || 0) ? 'text-red-600' : 'text-green-600'}`}>
                        {(((selectedNotification.newPrice || 0) - (selectedNotification.oldPrice || 0)) / (selectedNotification.oldPrice || 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">触发时间</span>
                  <span>{selectedNotification.triggeredAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">影响范围</span>
                  <span>{selectedNotification.affectedStandardCosts.length} 个标准成本</span>
                </div>
              </div>
              {selectedNotification.processedAt && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    已于 {selectedNotification.processedAt} 处理完成
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 处理弹窗 */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>处理通知</DialogTitle>
            <DialogDescription>
              选择如何处理此物料变更对标准成本的影响
            </DialogDescription>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 bg-amber-50">
                <p className="text-sm">
                  <span className="font-medium">{getMaterialById(selectedNotification.materialId)?.name}</span>
                  {' '}价格从 ¥{selectedNotification.oldPrice?.toFixed(2)} 变更为 ¥{selectedNotification.newPrice?.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>受影响的标准成本 ({affectedStandardCosts.length})</Label>
                <div className="rounded-md border max-h-[200px] overflow-y-auto">
                  {affectedStandardCosts.map((sc) => (
                    <div key={sc.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                      <Checkbox
                        checked={selectedStandardCostIds.includes(sc.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStandardCostIds([...selectedStandardCostIds, sc.id])
                          } else {
                            setSelectedStandardCostIds(selectedStandardCostIds.filter((id) => id !== sc.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{sc.model?.name} - {sc.packagingConfig?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          当前成本: ¥{sc.costs.totalCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => handleConfirmProcess('skip')}>
              暂不处理
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleConfirmProcess('update_selected')}
              disabled={selectedStandardCostIds.length === 0}
            >
              更新选中 ({selectedStandardCostIds.length})
            </Button>
            <Button onClick={() => handleConfirmProcess('update_all')}>
              更新全部
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
