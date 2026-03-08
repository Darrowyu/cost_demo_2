'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calculator,
  ClipboardCheck,
  Database,
  Bell,
  Settings,
  FileText,
  ListChecks,
  BarChart3,
  Users,
  Package,
  Boxes,
  Layers,
  BookOpen,
  Wrench,
  ChevronRight,
  LogOut,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const roleLabels: Record<string, string> = {
  admin: '管理员',
  purchaser: '采购',
  producer: '生产',
  reviewer: '审核',
  salesperson: '业务员',
  readonly: '只读',
}

const navigation = [
  {
    title: '概览',
    items: [
      { title: '仪表盘', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: '成本管理',
    items: [
      {
        title: '成本分析',
        icon: Calculator,
        items: [
          { title: '新增成本分析', href: '/cost/new' },
          { title: '成本记录', href: '/cost/records' },
          { title: '成本对比', href: '/cost/compare' },
        ],
      },
      { title: '标准成本', href: '/cost/standard', icon: BarChart3 },
    ],
  },
  {
    title: '审核管理',
    items: [
      { title: '待审核', href: '/review/pending', icon: ClipboardCheck },
      { title: '已审核', href: '/review/completed', icon: ListChecks },
    ],
  },
  {
    title: '基础数据',
    items: [
      { title: '法规管理', href: '/master/regulations', icon: BookOpen },
      { title: '客户管理', href: '/master/customers', icon: Users },
      { title: '原料管理', href: '/master/materials', icon: Package },
      { title: '型号管理', href: '/master/models', icon: Boxes },
      { title: 'BOM管理', href: '/master/bom', icon: Layers },
      { title: '工序管理', href: '/master/processes', icon: Wrench },
      { title: '包材管理', href: '/master/packaging', icon: FileText },
    ],
  },
  {
    title: '系统',
    items: [
      { title: '通知中心', href: '/notifications', icon: Bell },
      { title: '系统管理', href: '/system', icon: Settings },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout, isLoggingOut } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Calculator className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">成本分析系统</span>
            <span className="text-xs text-muted-foreground">Cost Management</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) =>
                  'items' in item ? (
                    <Collapsible key={item.title} asChild defaultOpen className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                  <Link href={subItem.href}>{subItem.title}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {user?.name?.slice(0, 2) || '用户'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{user?.name || '用户'}</span>
            <span className="truncate text-xs text-muted-foreground">{roleLabels[user?.role || 'readonly']}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => logout()}
            disabled={isLoggingOut}
            title={isLoggingOut ? '退出中...' : '退出登录'}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
