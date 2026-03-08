'use client'

import { Bell, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger />

      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索..."
            className="h-9 pl-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <Badge className="absolute -right-1 -top-1 size-5 rounded-full p-0 text-[10px]">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
