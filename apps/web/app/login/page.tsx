'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import { Calculator, Eye, EyeOff, Loader2, Shield, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({})

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {}

    if (!username.trim()) {
      newErrors.username = '请输入用户名'
    }

    if (!password) {
      newErrors.password = '请输入密码'
    } else if (password.length < 6) {
      newErrors.password = '密码长度至少6位'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (rememberMe) {
      localStorage.setItem('remember_username', username)
    } else {
      localStorage.removeItem('remember_username')
    }

    login({ username, password })
  }

  // 恢复记住的用户名
  useEffect(() => {
    const saved = localStorage.getItem('remember_username')
    if (saved) {
      setUsername(saved)
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌区 - 桌面端显示 */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 group-hover:bg-primary/30 transition-colors">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CostPro</h1>
              <p className="text-xs text-slate-400">成本分析管理系统</p>
            </div>
          </Link>
        </div>

        {/* 中间内容 */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            精准核算
            <span className="text-primary"> 高效决策</span>
          </h2>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            专业的制造业成本分析管理平台，帮助企业实现精细化成本管控，提升报价效率与准确性。
          </p>

          {/* 特性列表 */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">智能成本分析</p>
                <p className="text-sm text-slate-400">多维度成本核算与对比</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">多级审核流程</p>
                <p className="text-sm text-slate-400">规范的报价审批机制</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="relative z-10 text-sm text-slate-500">
          <p>© 2026 CostPro</p>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* 移动端 Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Calculator className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">CostPro</h1>
            <p className="text-sm text-muted-foreground">成本分析管理系统</p>
          </div>

          {/* 登录标题 */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">欢迎回来</h2>
            <p className="text-sm text-muted-foreground">
              请输入您的账号信息登录系统
            </p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 用户名 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                用户名
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (errors.username) setErrors({ ...errors, username: undefined })
                  }}
                  className={cn(
                    'h-11 transition-all',
                    errors.username && 'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isLoggingIn}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  密码
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  className={cn(
                    'h-11 pr-10 transition-all',
                    errors.password && 'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isLoggingIn}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* 记住我 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoggingIn}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  记住用户名
                </Label>
              </div>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium"
              disabled={isLoggingIn}
              size="lg"
            >
              {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
          </form>

          {/* 测试账号提示 */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              测试账号
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">管理员</span>
                <code className="px-2 py-0.5 bg-background rounded text-xs font-mono">
                  admin / admin123
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">采购员</span>
                <code className="px-2 py-0.5 bg-background rounded text-xs font-mono">
                  purchaser / purchaser123
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
