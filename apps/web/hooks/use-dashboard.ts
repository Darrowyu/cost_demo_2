'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api'

export function useDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats()
      return response.data
    },
  })

  return {
    stats: data,
    isLoading,
    error,
  }
}
