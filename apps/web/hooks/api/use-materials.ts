'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { materialApi } from '@/lib/api'
import { toast } from 'sonner'
import type { Material, CreateMaterialRequest, UpdateMaterialRequest } from '@cost/shared-types'

interface MaterialFilters {
  page?: number
  pageSize?: number
  category?: string
  search?: string
}

export function useMaterials(filters: MaterialFilters = {}) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['materials', filters],
    queryFn: async () => {
      const response = await materialApi.getList(filters)
      return response
    },
  })

  const createMutation = useMutation({
    mutationFn: materialApi.create,
    onSuccess: () => {
      toast.success('原料创建成功')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialRequest }) =>
      materialApi.update(id, data),
    onSuccess: () => {
      toast.success('原料更新成功')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: materialApi.delete,
    onSuccess: () => {
      toast.success('原料已删除')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  return {
    materials: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useMaterial(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['material', id],
    queryFn: async () => {
      const response = await materialApi.getById(id)
      return response.data
    },
    enabled: !!id,
  })

  return {
    material: data,
    isLoading,
    error,
  }
}
