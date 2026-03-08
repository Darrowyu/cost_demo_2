'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { LoginResponse } from '@cost/shared-types'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  // 获取当前用户信息
  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.me()
      return response.data
    },
    enabled: isAuthenticated,
    retry: false,
  })

  // 登录
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const loginData = response.data
      if (loginData?.user && loginData?.token) {
        setAuth(loginData.user, loginData.token)
        localStorage.setItem('token', loginData.token)
        toast.success('登录成功')
        router.push('/')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || '登录失败')
    },
  })

  // 登出
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth()
      localStorage.removeItem('token')
      queryClient.clear()
      toast.success('已退出登录')
      router.push('/login')
    },
    onError: () => {
      // 即使API调用失败也清除本地状态
      clearAuth()
      localStorage.removeItem('token')
      queryClient.clear()
      router.push('/login')
    },
  })

  return {
    user: userData || user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
