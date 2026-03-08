import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

import { Toaster } from '@/components/ui/sonner'
import { QueryProvider } from '@/providers/query-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: '成本分析管理系统',
  description: '制造业成本核算与报价管理平台',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
