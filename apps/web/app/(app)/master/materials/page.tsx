'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Upload, Download, History, Filter } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
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
import { useMaterials } from '@/hooks'
import type { Material } from '@cost/shared-types'

const categories = ['半面罩类', '口罩类', '配件类', '包装类']
const units = ['个', '码', 'KG', '套', '卷', '包']
const currencies = ['CNY', 'USD']

export default function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { materials, isLoading, create, update, delete: deleteMaterial, isCreating, isUpdating, isDeleting } = useMaterials({
    search: searchTerm,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Material | null>(null)
  const [formData, setFormData] = useState({
    materialNo: '',
    name: '',
    unit: '',
    price: '',
    currency: 'CNY' as 'CNY' | 'USD',
    manufacturer: '',
    category: '',
    note: '',
  })

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      materialNo: '',
      name: '',
      unit: '',
      price: '',
      currency: 'CNY',
      manufacturer: '',
      category: '',
      note: '',
    })
    setDialogOpen(true)
  }

  const handleEdit = (item: Material) => {
    setEditingItem(item)
    setFormData({
      materialNo: item.materialNo,
      name: item.name,
      unit: item.unit,
      price: item.price.toString(),
      currency: (item.currency as 'CNY' | 'USD') || 'CNY',
      manufacturer: item.manufacturer || '',
      category: item.category || '',
      note: item.note || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.materialNo.trim() || !formData.name.trim() || !formData.price) {
      toast.error('请填写完整信息')
      return
    }

    const data = {
      materialNo: formData.materialNo.trim(),
      name: formData.name.trim(),
      unit: formData.unit,
      price: parseFloat(formData.price),
      currency: formData.currency,
      manufacturer: formData.manufacturer.trim() || undefined,
      category: formData.category,
      note: formData.note.trim() || undefined,
    }

    if (editingItem) {
      update({ id: editingItem.id, data })
    } else {
      create(data)
    }
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (editingItem) {
      deleteMaterial(editingItem.id)
    }
    setDeleteDialogOpen(false)
    setEditingItem(null)
  }

  const handleViewHistory = (item: Material) => {
    setEditingItem(item)
    setHistoryDialogOpen(true)
  }

  const priceHistory = [
    { date: '2026-03-07', price: 12.5, operator: '张明' },
    { date: '2026-02-15', price: 11.8, operator: '李华' },
    { date: '2026-01-10', price: 11.5, operator: '张明' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">原料管理</h1>
          <p className="text-sm text-muted-foreground">
            管理原材料数据和价格
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
          <Button onClick={handleAdd}>
            <Plus className="mr-2 size-4" />
            新增原料
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>原料列表</CardTitle>
          <CardDescription>共 {materials.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索料号或名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 size-4" />
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>料号</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead>制造商</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.materialNo}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.currency === 'CNY' ? '¥' : '$'}{item.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.manufacturer || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
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
                            <DropdownMenuItem onClick={() => handleViewHistory(item)}>
                              <History className="mr-2 size-4" />
                              价格历史
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
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑原料' : '新增原料'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改原料信息' : '添加新的原料'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>料号</Label>
                <Input
                  placeholder="如：M001"
                  value={formData.materialNo}
                  onChange={(e) => setFormData({ ...formData, materialNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>名称</Label>
              <Input
                placeholder="原料名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>单位</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="单位" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="space-y-2">
                <Label>币种</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value as 'CNY' | 'USD' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>制造商</Label>
              <Input
                placeholder="选填"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                placeholder="选填"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 价格历史弹窗 */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>价格变更历史</DialogTitle>
            <DialogDescription>
              {editingItem?.name} ({editingItem?.materialNo})
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead>操作人</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right font-medium">¥{item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{item.operator}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除原料 "{editingItem?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
