import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 公开路由（不需要登录）
const publicRoutes = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 公开路由直接放行
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 客户端存储token在localStorage，服务器端无法直接访问
  // 这里只做简单检查，实际认证由API层处理
  // 如果要严格认证，需要通过API验证token有效性

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有路径，排除静态文件和API路由
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
