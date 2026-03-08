'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Filter, Layers, Eye } from 'lucide-react'
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
import { models, regulations, getModelBom, getModelPackagingConfigs } from '@/lib/data'

const categories = ['半面罩', '口罩', '全面罩', '配件']
const series = ['D系列', 'P系列', 'N系列', 'X系列']

export default function ModelsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [regulationFilter, setRegulationFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<typeof models[0] | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    regulationId: '',
    category: '',
    series: '',
  })

  const filteredModels = models.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter
    const matchesRegulation = regulationFilter === 'all' || m.regulationId === regulationFilter
    return matchesSearch && matchesCategory && matchesRegulation
  })

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ name: '', regulationId: '', category: '', series: '' })
    setDialogOpen(true)
  }

  const handleEdit = (item: typeof models[0]) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      regulationId: item.regulationId,
      category: item.category,
      series: item.series,
    })
    setDialogOpen(true)
  }

  const handleViewDetail = (item: typeof models[0]) => {
    setEditingItem(item)
    setDetailDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.regulationId) {
      toast.error('请填写完整信息')
      return
    }
    toast.success(editingItem ? '型号已更新' : '型号已添加')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    toast.success('型号已删除')
    setDeleteDialogOpen(false)
  }

  const getRegulationName = (id: string) => {
    return regulations.find((r) => r.id === id)?.name || '-'
  }

  const selectedModelBom = editingItem ? getModelBom(editingItem.id) : []
  const selectedModelPackaging = editingItem ? getModelPackagingConfigs(editingItem.id) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">型号管理</h1>
          <p className="text-sm text-muted-foreground">
            管理产品型号和配置
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          新增型号
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>型号列表</CardTitle>
          <CardDescription>共 {filteredModels.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索型号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={regulationFilter} onValueChange={setRegulationFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="法规" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部法规</SelectItem>
                {regulations.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <TableHead>型号名称</TableHead>
                  <TableHead>法规标准</TableHead>
                  <TableHead>产品分类</TableHead>
                  <TableHead>产品系列</TableHead>
                  <TableHead>BOM数量</TableHead>
                  <TableHead>包装配置</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModels.map((item) => {
                    const bomCount = getModelBom(item.id).length
                    const packagingCount = getModelPackagingConfigs(item.id).length
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRegulationName(item.regulationId)}</Badge>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-muted-foreground">{item.series}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{bomCount} 种原料</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{packagingCount} 种配置</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetail(item)}>
                                <Eye className="mr-2 size-4" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Pencil className="mr-2 size-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/master/bom?modelId=${item.id}`}>
                                  <Layers className="mr-2 size-4" />
                                  配置BOM
                                </Link>
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
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑型号' : '新增型号'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改型号信息' : '添加新的产品型号'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>型号名称</Label>
              <Input
                placeholder="如：D-700"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>法规标准</Label>
              <Select
                value={formData.regulationId}
                onValueChange={(value) => setFormData({ ...formData, regulationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择法规" />
                </SelectTrigger>
                <SelectContent>
                  {regulations.filter((r) => r.status === 'active').map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name} - {r.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>产品分类</Label>
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
              <div className="space-y-2">
                <Label>产品系列</Label>
                <Select
                  value={formData.series}
                  onValueChange={(value) => setFormData({ ...formData, series: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择系列" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
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

      {/* 详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem?.name} 详情</DialogTitle>
            <DialogDescription>
              {editingItem?.series} · {editingItem?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">法规标准</span>
              <Badge variant="outline">{editingItem && getRegulationName(editingItem.regulationId)}</Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">BOM清单 ({selectedModelBom.length}种原料)</p>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>原料</TableHead>
                      <TableHead className="text-right">用量</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedModelBom.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.material?.name}</TableCell>
                        <TableCell className="text-right">{item.quantity} {item.material?.unit}</TableCell>
                      </TableRow>
                    ))}
                    {selectedModelBom.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          暂未配置BOM
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">包装配置 ({selectedModelPackaging.length}种)</p>
              <div className="space-y-2">
                {selectedModelPackaging.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border p-2">
                    <span>{item.name}</span>
                    <Badge variant="secondary">{item.packagingType}</Badge>
                  </div>
                ))}
                {selectedModelPackaging.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-2">暂未配置包装</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除型号 "{editingItem?.name}" 吗？此操作不可撤销。
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
