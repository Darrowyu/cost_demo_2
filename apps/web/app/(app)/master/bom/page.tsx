'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Trash2, Upload, Download, GripVertical, Copy } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { models, materials, getModelBom, bomMaterials } from '@/lib/data'

export default function BomPage() {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [newMaterial, setNewMaterial] = useState({ materialId: '', quantity: '' })
  const [copyTargetModelId, setCopyTargetModelId] = useState<string>('')

  const selectedModel = models.find((m) => m.id === selectedModelId)
  const modelBom = useMemo(() => getModelBom(selectedModelId), [selectedModelId])

  const availableMaterials = materials.filter(
    (m) => !modelBom.some((b) => b.materialId === m.id)
  )

  const totalMaterialCost = modelBom.reduce(
    (sum, item) => sum + (item.material?.price || 0) * item.quantity,
    0
  )

  const handleAddMaterial = () => {
    if (!newMaterial.materialId || !newMaterial.quantity) {
      toast.error('请选择原料并填写用量')
      return
    }
    toast.success('原料已添加到BOM')
    setAddDialogOpen(false)
    setNewMaterial({ materialId: '', quantity: '' })
  }

  const handleCopyBom = () => {
    if (!copyTargetModelId) {
      toast.error('请选择目标型号')
      return
    }
    toast.success('BOM已复制')
    setCopyDialogOpen(false)
    setCopyTargetModelId('')
  }

  const handleDeleteItem = () => {
    toast.success('原料已从BOM移除')
    setDeleteDialogOpen(false)
    setDeletingItemId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">BOM管理</h1>
          <p className="text-sm text-muted-foreground">
            管理产品的物料清单
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
        {/* 型号选择 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>选择型号</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {models.map((model) => {
                const bomCount = bomMaterials.filter((b) => b.modelId === model.id).length
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                      selectedModelId === model.id ? 'border-foreground bg-muted/50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.series}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{bomCount}种</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* BOM配置 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedModel?.name} BOM配置</CardTitle>
                <CardDescription>
                  共 {modelBom.length} 种原料，单件原料成本 ¥{totalMaterialCost.toFixed(2)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCopyDialogOpen(true)}>
                  <Copy className="mr-2 size-4" />
                  复制到其他型号
                </Button>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  添加原料
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>料号</TableHead>
                    <TableHead>原料名称</TableHead>
                    <TableHead>单位</TableHead>
                    <TableHead className="text-right">用量</TableHead>
                    <TableHead className="text-right">单价</TableHead>
                    <TableHead className="text-right">小计</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelBom.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        暂未配置BOM，点击"添加原料"开始配置
                      </TableCell>
                    </TableRow>
                  ) : (
                    modelBom.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <GripVertical className="size-4 text-muted-foreground cursor-move" />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.material?.materialNo}</TableCell>
                        <TableCell className="font-medium">{item.material?.name}</TableCell>
                        <TableCell>{item.material?.unit}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={item.quantity}
                            className="h-8 w-20 text-right"
                            onChange={() => {}}
                          />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ¥{item.material?.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ¥{((item.material?.price || 0) * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => {
                              setDeletingItemId(item.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {modelBom.length > 0 && (
              <div className="mt-4 flex justify-end">
                <div className="rounded-lg bg-muted p-3 text-right">
                  <p className="text-sm text-muted-foreground">单件原料总成本</p>
                  <p className="text-xl font-bold">¥{totalMaterialCost.toFixed(2)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 添加原料弹窗 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加原料到 {selectedModel?.name}</DialogTitle>
            <DialogDescription>
              选择要添加的原料并设置用量
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>选择原料</Label>
              <Select
                value={newMaterial.materialId}
                onValueChange={(value) => setNewMaterial({ ...newMaterial, materialId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择原料" />
                </SelectTrigger>
                <SelectContent>
                  {availableMaterials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.materialNo} - {m.name} (¥{m.price}/{m.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>用量</Label>
              <Input
                type="number"
                placeholder="输入用量"
                value={newMaterial.quantity}
                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddMaterial}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 复制BOM弹窗 */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>复制BOM到其他型号</DialogTitle>
            <DialogDescription>
              将 {selectedModel?.name} 的BOM配置复制到其他型号
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>目标型号</Label>
              <Select
                value={copyTargetModelId}
                onValueChange={setCopyTargetModelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择目标型号" />
                </SelectTrigger>
                <SelectContent>
                  {models
                    .filter((m) => m.id !== selectedModelId)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} ({m.series})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              注意：复制会覆盖目标型号现有的BOM配置
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCopyBom}>
              确认复制
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认移除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要从BOM中移除这个原料吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
