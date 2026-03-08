'use client'

import { useState } from 'react'
import {
  Users,
  Shield,
  Settings,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Key,
  Upload,
  Download,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { systemConfig } from '@/lib/data'
import type { Role } from '@/lib/types'

// Mock data for users
const users = [
  { id: '1', username: 'admin', name: '张明', email: 'admin@company.com', role: 'admin' as Role, status: 'active', createdAt: '2024-01-01' },
  { id: '2', username: 'reviewer1', name: '李华', email: 'lihua@company.com', role: 'reviewer' as Role, status: 'active', createdAt: '2024-01-15' },
  { id: '3', username: 'sales1', name: '王芳', email: 'wangfang@company.com', role: 'salesperson' as Role, status: 'active', createdAt: '2024-02-01' },
  { id: '4', username: 'purchase1', name: '赵强', email: 'zhaoqiang@company.com', role: 'purchaser' as Role, status: 'active', createdAt: '2024-02-15' },
  { id: '5', username: 'producer1', name: '刘伟', email: 'liuwei@company.com', role: 'producer' as Role, status: 'inactive', createdAt: '2024-03-01' },
]

const roles = [
  { code: 'admin', name: '管理员', description: '系统最高权限', isSystem: true, userCount: 1 },
  { code: 'purchaser', name: '采购', description: '原料采购管理', isSystem: true, userCount: 1 },
  { code: 'producer', name: '生产', description: '生产管理', isSystem: true, userCount: 1 },
  { code: 'reviewer', name: '审核', description: '审核成本分析', isSystem: true, userCount: 1 },
  { code: 'salesperson', name: '业务员', description: '业务报价', isSystem: true, userCount: 1 },
  { code: 'readonly', name: '只读', description: '仅查看权限', isSystem: true, userCount: 0 },
]

const roleLabels: Record<string, string> = {
  admin: '管理员',
  purchaser: '采购',
  producer: '生产',
  reviewer: '审核',
  salesperson: '业务员',
  readonly: '只读',
}

export default function SystemPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null)
  const [userFormData, setUserFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: '' as Role,
    password: '',
  })
  const [configFormData, setConfigFormData] = useState({
    adminFeeRate: (systemConfig.adminFeeRate * 100).toString(),
    vatRate: (systemConfig.vatRate * 100).toString(),
    exchangeRate: systemConfig.exchangeRate.toString(),
    fcl20Rate: systemConfig.fcl20Rate.toString(),
    fcl40Rate: systemConfig.fcl40Rate.toString(),
    lclBaseRate: systemConfig.lclBaseRate.toString(),
  })

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = () => {
    setEditingUser(null)
    setUserFormData({ username: '', name: '', email: '', role: '' as Role, password: '' })
    setUserDialogOpen(true)
  }

  const handleEditUser = (user: typeof users[0]) => {
    setEditingUser(user)
    setUserFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    })
    setUserDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (!userFormData.username || !userFormData.name || !userFormData.role) {
      toast.error('请填写完整信息')
      return
    }
    if (!editingUser && !userFormData.password) {
      toast.error('请设置密码')
      return
    }
    toast.success(editingUser ? '用户已更新' : '用户已添加')
    setUserDialogOpen(false)
  }

  const handleDeleteUser = () => {
    toast.success('用户已删除')
    setDeleteDialogOpen(false)
    setEditingUser(null)
  }

  const handleResetPassword = () => {
    toast.success('密码重置邮件已发送')
    setResetPasswordDialogOpen(false)
    setEditingUser(null)
  }

  const handleToggleUserStatus = (user: typeof users[0]) => {
    toast.success(user.status === 'active' ? '用户已禁用' : '用户已启用')
  }

  const handleSaveConfig = () => {
    toast.success('系统配置已保存')
    setConfigDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">系统管理</h1>
        <p className="text-sm text-muted-foreground">
          管理用户、角色和系统配置
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="size-4" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="size-4" />
            角色管理
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="size-4" />
            系统配置
          </TabsTrigger>
        </TabsList>

        {/* 用户管理 */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>用户列表</CardTitle>
                  <CardDescription>共 {filteredUsers.length} 个用户</CardDescription>
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
                  <Button onClick={handleAddUser}>
                    <Plus className="mr-2 size-4" />
                    新增用户
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户..."
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
                      <TableHead>用户名</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.username}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{roleLabels[user.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">启用</Badge>
                          ) : (
                            <Badge variant="secondary">禁用</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Pencil className="mr-2 size-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingUser(user)
                                  setResetPasswordDialogOpen(true)
                                }}
                              >
                                <Key className="mr-2 size-4" />
                                重置密码
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.status === 'active' ? (
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
                                  setEditingUser(user)
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 角色管理 */}
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>角色列表</CardTitle>
                  <CardDescription>系统预设角色（不可删除）</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色代码</TableHead>
                      <TableHead>角色名称</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>用户数</TableHead>
                      <TableHead>类型</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.code}>
                        <TableCell className="font-mono text-sm">{role.code}</TableCell>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-muted-foreground">{role.description}</TableCell>
                        <TableCell>{role.userCount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">系统预设</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 系统配置 */}
        <TabsContent value="config">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 费率配置 */}
            <Card>
              <CardHeader>
                <CardTitle>费率配置</CardTitle>
                <CardDescription>管销费率和税率设置</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">管销费率</p>
                    <p className="text-sm text-muted-foreground">计算管销费用的百分比</p>
                  </div>
                  <span className="text-xl font-bold">{systemConfig.adminFeeRate * 100}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">增值税率</p>
                    <p className="text-sm text-muted-foreground">内销时的增值税百分比</p>
                  </div>
                  <span className="text-xl font-bold">{systemConfig.vatRate * 100}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">汇率</p>
                    <p className="text-sm text-muted-foreground">CNY/USD汇率</p>
                  </div>
                  <span className="text-xl font-bold">{systemConfig.exchangeRate}</span>
                </div>
              </CardContent>
            </Card>

            {/* 运费配置 */}
            <Card>
              <CardHeader>
                <CardTitle>运费配置</CardTitle>
                <CardDescription>各类运输方式的基础运费</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">整柜20尺 (FCL 20)</p>
                    <p className="text-sm text-muted-foreground">20尺集装箱运费</p>
                  </div>
                  <span className="text-xl font-bold">¥{systemConfig.fcl20Rate.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">整柜40尺 (FCL 40)</p>
                    <p className="text-sm text-muted-foreground">40尺集装箱运费</p>
                  </div>
                  <span className="text-xl font-bold">¥{systemConfig.fcl40Rate.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">拼箱 (LCL)</p>
                    <p className="text-sm text-muted-foreground">每立方米运费</p>
                  </div>
                  <span className="text-xl font-bold">¥{systemConfig.lclBaseRate}/CBM</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Button onClick={() => setConfigDialogOpen(true)}>
              <Settings className="mr-2 size-4" />
              修改配置
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* 新增/编辑用户弹窗 */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? '编辑用户' : '新增用户'}</DialogTitle>
            <DialogDescription>
              {editingUser ? '修改用户信息' : '添加新的系统用户'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input
                  placeholder="登录用户名"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>姓名</Label>
                <Input
                  placeholder="真实姓名"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input
                type="email"
                placeholder="email@company.com"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value as Role })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.code} value={r.code}>
                      {r.name} - {r.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>初始密码</Label>
                <Input
                  type="password"
                  placeholder="设置初始密码"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveUser}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改配置弹窗 */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>修改系统配置</DialogTitle>
            <DialogDescription>
              修改费率和运费配置
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>管销费率 (%)</Label>
                <Input
                  type="number"
                  value={configFormData.adminFeeRate}
                  onChange={(e) => setConfigFormData({ ...configFormData, adminFeeRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>增值税率 (%)</Label>
                <Input
                  type="number"
                  value={configFormData.vatRate}
                  onChange={(e) => setConfigFormData({ ...configFormData, vatRate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>汇率 (CNY/USD)</Label>
              <Input
                type="number"
                value={configFormData.exchangeRate}
                onChange={(e) => setConfigFormData({ ...configFormData, exchangeRate: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>FCL 20尺运费</Label>
                <Input
                  type="number"
                  value={configFormData.fcl20Rate}
                  onChange={(e) => setConfigFormData({ ...configFormData, fcl20Rate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>FCL 40尺运费</Label>
                <Input
                  type="number"
                  value={configFormData.fcl40Rate}
                  onChange={(e) => setConfigFormData({ ...configFormData, fcl40Rate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>LCL拼箱运费 (/CBM)</Label>
              <Input
                type="number"
                value={configFormData.lclBaseRate}
                onChange={(e) => setConfigFormData({ ...configFormData, lclBaseRate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveConfig}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除用户确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除用户 "{editingUser?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 重置密码确认弹窗 */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重置密码</AlertDialogTitle>
            <AlertDialogDescription>
              确定要重置用户 "{editingUser?.name}" 的密码吗？系统将发送重置邮件到用户邮箱。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              发送重置邮件
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
