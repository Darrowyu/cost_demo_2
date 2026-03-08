'use client'

import Link from 'next/link'
import {
  FileText,
  Users,
  Boxes,
  ClipboardCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useDashboard } from '@/hooks/use-dashboard'
import { useQuotations } from '@/hooks/use-quotations'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: '草稿', variant: 'secondary' },
  submitted: { label: '待审核', variant: 'default' },
  approved: { label: '已通过', variant: 'outline' },
  rejected: { label: '已退回', variant: 'destructive' },
}

const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa']

export default function DashboardPage() {
  const { stats, isLoading: isStatsLoading } = useDashboard()
  const { quotations, isLoading: isQuotationsLoading } = useQuotations({ page: 1, pageSize: 5 })

  const recentQuotations = quotations.slice(0, 5)

  if (isStatsLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">仪表盘</h1>
          <p className="text-sm text-muted-foreground">
            系统概览与快捷操作
          </p>
        </div>
        <Button asChild>
          <Link href="/cost/new">
            <Plus className="mr-2 size-4" />
            新增成本分析
          </Link>
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">报价单总数</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuotations || 0}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline size-3" />
              系统累计
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">客户总数</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">活跃客户</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">产品型号</CardTitle>
            <Boxes className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalModels || 0}</div>
            <p className="text-xs text-muted-foreground">在用型号</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <ClipboardCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingReviews || 0}</div>
            <p className="text-xs text-muted-foreground">需要处理</p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* 周报价趋势 */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>周报价统计</CardTitle>
            <CardDescription>近6周报价单创建数量趋势</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: '报价单数', color: 'hsl(var(--foreground))' },
              }}
              className="h-[240px] w-full"
            >
              <BarChart data={stats?.quotationsTrend || []}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-foreground" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 法规分布 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>法规分布</CardTitle>
            <CardDescription>各法规标准产品型号占比</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: '数量' },
              }}
              className="h-[240px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={stats?.regulationStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(stats?.regulationStats || []).map((_: { name: string; count: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 底部区域 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 最近报价单 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>最近报价单</CardTitle>
              <CardDescription>最近创建的报价记录</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cost/records">
                查看全部
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isQuotationsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuotations.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{q.quotationNo}</span>
                        <Badge variant={statusLabels[q.status]?.variant || 'secondary'}>
                          {statusLabels[q.status]?.label || q.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {q.customer?.name} · {q.model?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ¥{Number(q.totalCost || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {recentQuotations.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    暂无报价单
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 热门型号 */}
        <Card>
          <CardHeader>
            <CardTitle>型号排行</CardTitle>
            <CardDescription>使用频率最高的产品型号</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.topModels || []).map((model: { name: string; count: number }, index: number) => (
                <div key={model.name} className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-sm text-muted-foreground">{model.count}次</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-foreground transition-all"
                        style={{ width: `${(model.count / ((stats?.topModels?.[0]?.count || 1))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(stats?.topModels || []).length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  暂无数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
