'use client'

import { useState, useMemo } from 'react'
import { Plus, MoreHorizontal, Pencil, Trash2, Upload, Download, Package } from 'lucide-react'
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
import { models, packagingConfigs, packagingMaterials, getPackagingMaterials } from '@/lib/data'

export default function PackagingPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '')
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<typeof packagingMaterials[0] | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    boxLength: '',
    boxWidth: '',
    boxHeight: '',
  })

  const selectedModel = models.find((m) => m.id === selectedModelId)
  const modelPackagingConfigs = packagingConfigs.filter((p) => p.modelId === selectedModelId)

  const currentPackagingId = selectedPackagingId && modelPackagingConfigs.some((p) => p.id === selectedPackagingId)
    ? selectedPackagingId
    : modelPackagingConfigs[0]?.id || ''

  const selectedPackaging = packagingConfigs.find((p) => p.id === currentPackagingId)
  const currentPackagingMaterials = useMemo(
    () => getPackagingMaterials(currentPackagingId),
    [currentPackagingId]
  )

  const totalPackagingCost = currentPackagingMaterials.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ name: '', quantity: '', price: '', boxLength: '', boxWidth: '', boxHeight: '' })
    setDialogOpen(true)
  }

  const handleEdit = (item: typeof packagingMaterials[0]) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      boxLength: item.boxVolume?.length.toString() || '',
      boxWidth: item.boxVolume?.width.toString() || '',
      boxHeight: item.boxVolume?.height.toString() || '',
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.quantity || !formData.price) {
      toast.error('请填写完整信息')
      return
    }
    toast.success(editingItem ? '包材已更新' : '包材已添加')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    toast.success('包材已删除')
    setDeleteDialogOpen(false)
    setEditingItem(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">包材管理</h1>
          <p className="text-sm text-muted-foreground">
            管理包装材料配置和定价
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
                    const materialCount = packagingMaterials.filter((p) => p.packagingConfigId === config.id).length
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
                        <span className="text-xs text-muted-foreground">{materialCount}种包材</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 包材配置 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedModel?.name} - {selectedPackaging?.name || '未选择'}
                </CardTitle>
                <CardDescription>
                  共 {currentPackagingMaterials.length} 种包材，单件包材成本 ¥{totalPackagingCost.toFixed(2)}
                </CardDescription>
              </div>
              <Button onClick={handleAdd} disabled={!currentPackagingId}>
                <Plus className="mr-2 size-4" />
                添加包材
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>包材名称</TableHead>
                    <TableHead className="text-right">用量</TableHead>
                    <TableHead className="text-right">单价</TableHead>
                    <TableHead className="text-right">小计</TableHead>
                    <TableHead>外箱材积</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPackagingMaterials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {currentPackagingId ? '暂无包材配置，点击"添加包材"开始配置' : '请先选择包装配置'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPackagingMaterials.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="size-4 text-muted-foreground" />
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">¥{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {item.boxVolume ? (
                            <Badge variant="outline">
                              {item.boxVolume.length}x{item.boxVolume.width}x{item.boxVolume.height}cm
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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

            {currentPackagingMaterials.length > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="rounded-lg bg-muted p-3 text-right">
                  <p className="text-sm text-muted-foreground">单件包材总成本</p>
                  <p className="text-xl font-bold">¥{totalPackagingCost.toFixed(2)}</p>
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
            <DialogTitle>{editingItem ? '编辑包材' : '添加包材'}</DialogTitle>
            <DialogDescription>
              {selectedModel?.name} - {selectedPackaging?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>包材名称</Label>
              <Input
                placeholder="如：PE袋、说明书、外箱"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>用量</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>单价</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>外箱材积（可选，用于运费计算）</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  type="number"
                  placeholder="长(cm)"
                  value={formData.boxLength}
                  onChange={(e) => setFormData({ ...formData, boxLength: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="宽(cm)"
                  value={formData.boxWidth}
                  onChange={(e) => setFormData({ ...formData, boxWidth: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="高(cm)"
                  value={formData.boxHeight}
                  onChange={(e) => setFormData({ ...formData, boxHeight: e.target.value })}
                />
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
              确定要删除包材 "{editingItem?.name}" 吗？此操作不可撤销。
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
