'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { quotationApi } from '@/lib/api'
import { toast } from 'sonner'
import type { Quotation, UpdateQuotationRequest } from '@cost/shared-types'

interface QuotationFilters {
  page?: number
  pageSize?: number
  status?: string
  customerId?: string
  modelId?: string
}

export function useQuotations(filters: QuotationFilters = {}) {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['quotations', filters],
    queryFn: async () => {
      const response = await quotationApi.getList(filters)
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: quotationApi.create,
    onSuccess: () => {
      toast.success('报价单创建成功')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotationRequest }) =>
      quotationApi.update(id, data),
    onSuccess: () => {
      toast.success('报价单更新成功')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: quotationApi.delete,
    onSuccess: () => {
      toast.success('报价单已删除')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const submitMutation = useMutation({
    mutationFn: quotationApi.submit,
    onSuccess: () => {
      toast.success('报价单已提交审核')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '提交失败')
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      quotationApi.approve(id, note),
    onSuccess: () => {
      toast.success('报价单已批准')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '审核失败')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      quotationApi.reject(id, note),
    onSuccess: () => {
      toast.success('报价单已拒绝')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '操作失败')
    },
  })

  const calculateMutation = useMutation({
    mutationFn: quotationApi.calculate,
    onError: (error: Error) => {
      toast.error(error.message || '计算失败')
    },
  })

  return {
    quotations: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    submit: submitMutation.mutate,
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    calculate: calculateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSubmitting: submitMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCalculating: calculateMutation.isPending,
    calculatedResult: calculateMutation.data?.data,
  }
}

export function useQuotation(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const response = await quotationApi.getById(id)
      return response.data
    },
    enabled: !!id,
  })

  return {
    quotation: data,
    isLoading,
    error,
  }
}
