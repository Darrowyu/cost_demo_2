'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Upload, Download, GripVertical } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { models, packagingConfigs, processConfigs, getPackagingProcessConfigs } from '@/lib/data'

export default function ProcessesPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '')
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<typeof processConfigs[0] | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'piece' as 'piece' | 'dozen',
  })

  const selectedModel = models.find((m) => m.id === selectedModelId)
  const modelPackagingConfigs = packagingConfigs.filter((p) => p.modelId === selectedModelId)

  // Auto-select first packaging config when model changes
  const currentPackagingId = selectedPackagingId && modelPackagingConfigs.some((p) => p.id === selectedPackagingId)
    ? selectedPackagingId
    : modelPackagingConfigs[0]?.id || ''

  const selectedPackaging = packagingConfigs.find((p) => p.id === currentPackagingId)
  const currentProcessConfigs = useMemo(
    () => getPackagingProcessConfigs(currentPackagingId),
    [currentPackagingId]
  )

  const totalProcessCost = currentProcessConfigs.reduce((sum, item) => {
    const cost = item.unit === 'dozen' ? item.price / 12 : item.price
    return sum + cost
  }, 0)

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ name: '', price: '', unit: 'piece' })
    setDialogOpen(true)
  }

  const handleEdit = (item: typeof processConfigs[0]) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      unit: item.unit,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.price) {
      toast.error('请填写完整信息')
      return
    }
    toast.success(editingItem ? '工序已更新' : '工序已添加')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    toast.success('工序已删除')
    setDeleteDialogOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">工序管理</h1>
          <p className="text-sm text-muted-foreground">
            管理包装工序配置和定价
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('请选择Excel文件导入')}>
            <Upload className="mr-2 size-4" />
            导入
          </Button>
          <Button variant="outline" onClick={() => toast.success('导出成功')}>
            <Download className="mr-2 size-4" />
            导出
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 型号和包装选择 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>选择配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>型号</Label>
              <Select
                value={selectedModelId}
                onValueChange={(value) => {
                  setSelectedModelId(value)
                  setSelectedPackagingId('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择型号" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>包装配置</Label>
              <div className="space-y-2">
                {modelPackagingConfigs.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">该型号暂无包装配置</p>
                ) : (
                  modelPackagingConfigs.map((config) => {
                    const processCount = processConfigs.filter((p) => p.packagingConfigId === config.id).length
                    return (
                      <button
                        key={config.id}
                        onClick={() => setSelectedPackagingId(config.id)}
                        className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                          currentPackagingId === config.id ? 'border-foreground bg-muted/50' : ''
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{config.name}</p>
                          <p className="text-xs text-muted-foreground">{config.packagingType}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{processCount}道工序</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 工序配置 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedModel?.name} - {selectedPackaging?.name || '未选择'}
                </CardTitle>
                <CardDescription>
                  共 {currentProcessConfigs.length} 道工序，单件工序成本 ¥{totalProcessCost.toFixed(2)}
                </CardDescription>
              </div>
              <Button onClick={handleAdd} disabled={!currentPackagingId}>
                <Plus className="mr-2 size-4" />
                添加工序
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>工序名称</TableHead>
                    <TableHead className="text-right">单价</TableHead>
                    <TableHead>计价单位</TableHead>
                    <TableHead className="text-right">单件成本</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProcessConfigs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {currentPackagingId ? '暂无工序配置，点击"添加工序"开始配置' : '请先选择包装配置'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentProcessConfigs.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <GripVertical className="size-4 text-muted-foreground cursor-move" />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">¥{item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.unit === 'piece' ? '按件' : '按打'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{(item.unit === 'dozen' ? item.price / 12 : item.price).toFixed(4)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Pencil className="mr-2 size-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setEditingItem(item)
                                  setDeleteDialogOpen(true)
                                }}
                              >
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

            {currentProcessConfigs.length > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="rounded-lg bg-muted p-3 text-right">
                  <p className="text-sm text-muted-foreground">单件工序总成本</p>
                  <p className="text-xl font-bold">¥{totalProcessCost.toFixed(4)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑工序' : '添加工序'}</DialogTitle>
            <DialogDescription>
              {selectedModel?.name} - {selectedPackaging?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>工序名称</Label>
              <Input
                placeholder="如：组装、检验、包装"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>单价</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>计价单位</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value as 'piece' | 'dozen' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">按件</SelectItem>
                    <SelectItem value="dozen">按打 (12件)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除工序 "{editingItem?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
