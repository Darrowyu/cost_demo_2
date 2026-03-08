'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Upload, Download } from 'lucide-react'
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
import { customers } from '@/lib/data'
import { useListFilters } from '@/hooks/use-filters'

const regions = ['华东', '华北', '华南', '西南', '华中', '西北', '东北']

export default function CustomersPage() {
  const { searchTerm, setSearchTerm, filters, setFilter, filteredItems: filteredCustomers } = useListFilters(
    customers,
    ['code', 'name']
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<typeof customers[0] | null>(null)
  const [formData, setFormData] = useState({ code: '', name: '', region: '', note: '' })

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ code: '', name: '', region: '', note: '' })
    setDialogOpen(true)
  }

  const handleEdit = (item: typeof customers[0]) => {
    setEditingItem(item)
    setFormData({ code: item.code, name: item.name, region: item.region, note: item.note || '' })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('请填写完整信息')
      return
    }
    toast.success(editingItem ? '客户已更新' : '客户已添加')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    toast.success('客户已删除')
    setDeleteDialogOpen(false)
  }

  const handleExport = () => {
    toast.success('导出成功')
  }

  const handleImport = () => {
    toast.info('请选择Excel文件导入')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">客户管理</h1>
          <p className="text-sm text-muted-foreground">
            管理客户信息和区域划分
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="mr-2 size-4" />
            导入
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 size-4" />
            导出
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 size-4" />
            新增客户
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>客户列表</CardTitle>
          <CardDescription>共 {filteredCustomers.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索客户代码或名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filters.region || 'all'} onValueChange={(value) => setFilter('region', value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="区域" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部区域</SelectItem>
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>客户代码</TableHead>
                  <TableHead>客户名称</TableHead>
                  <TableHead>所属区域</TableHead>
                  <TableHead>备注</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.code}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.region}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.note || '-'}</TableCell>
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
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '编辑客户' : '新增客户'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改客户信息' : '添加新的客户'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>客户代码</Label>
              <Input
                placeholder="如：VC001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>客户名称</Label>
              <Input
                placeholder="客户全称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>所属区域</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => setFormData({ ...formData, region: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择区域" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              确定要删除客户 "{editingItem?.name}" 吗？此操作不可撤销。
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
