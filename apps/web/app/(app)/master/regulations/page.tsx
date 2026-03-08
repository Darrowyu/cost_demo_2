'use client'

import { useState } from 'react'
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Power, PowerOff } from 'lucide-react'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { regulations } from '@/lib/data'

export default function RegulationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<typeof regulations[0] | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  const filteredRegulations = regulations.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({ name: '', description: '' })
    setDialogOpen(true)
  }

  const handleEdit = (item: typeof regulations[0]) => {
    setEditingItem(item)
    setFormData({ name: item.name, description: item.description })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('请填写法规名称')
      return
    }
    toast.success(editingItem ? '法规已更新' : '法规已添加')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    toast.success('法规已删除')
    setDeleteDialogOpen(false)
  }

  const handleToggleStatus = (item: typeof regulations[0]) => {
    toast.success(item.status === 'active' ? '法规已禁用' : '法规已启用')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">法规管理</h1>
          <p className="text-sm text-muted-foreground">
            管理产品适用的法规标准
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          新增法规
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>法规列表</CardTitle>
          <CardDescription>共 {filteredRegulations.length} 条记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索法规..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>法规名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegulations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegulations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.description}</TableCell>
                      <TableCell>
                        {item.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">启用</Badge>
                        ) : (
                          <Badge variant="secondary">禁用</Badge>
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
                            <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                              {item.status === 'active' ? (
                                <>
                                  <PowerOff className="mr-2 size-4" />
                                  禁用
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 size-4" />
                                  启用
                                </>
                              )}
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
            <DialogTitle>{editingItem ? '编辑法规' : '新增法规'}</DialogTitle>
            <DialogDescription>
              {editingItem ? '修改法规信息' : '添加新的法规标准'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>法规名称</Label>
              <Input
                placeholder="如：GB、EN、NIOSH"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                placeholder="法规标准的描述说明"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              确定要删除法规 "{editingItem?.name}" 吗？此操作不可撤销。
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
