'use client'

import { useState, useMemo } from 'react'

interface UseListFiltersReturn<T> {
  searchTerm: string
  setSearchTerm: (value: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  filteredItems: T[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useListFilters<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[]
): UseListFiltersReturn<T> {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 搜索匹配
      const matchesSearch = searchFields.some((field) => {
        const value = item[field]
        return (
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })

      // 筛选器匹配
      const matchesFilters = Object.entries(filters).every(
        ([key, value]) => value === 'all' || item[key] === value
      )

      return matchesSearch && matchesFilters
    })
  }, [items, searchTerm, filters, searchFields])

  const setFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    filteredItems,
  }
}
