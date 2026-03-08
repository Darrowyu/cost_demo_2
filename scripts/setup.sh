#!/bin/bash
set -e

echo "========================================"
echo "成本管理系统 - 初始化脚本"
echo "========================================"

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "正在安装 pnpm..."
    npm install -g pnpm
fi

echo ""
echo "1. 安装依赖..."
pnpm install

echo ""
echo "2. 配置环境变量..."
if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "已创建 apps/api/.env，请编辑配置数据库连接"
fi

if [ ! -f "packages/database/prisma/.env" ]; then
    cp packages/database/prisma/.env.example packages/database/prisma/.env
    echo "已创建 packages/database/prisma/.env"
fi

echo ""
echo "3. 生成 Prisma Client..."
pnpm db:generate

echo ""
echo "========================================"
echo "初始化完成!"
echo "========================================"
echo ""
echo "下一步:"
echo "1. 编辑 apps/api/.env 配置数据库连接"
echo "2. 确保 PostgreSQL 已启动"
echo "3. 运行 pnpm db:migrate 创建数据库表"
echo "4. 运行 pnpm db:seed 导入初始数据"
echo "5. 运行 pnpm dev 启动开发服务器"
echo ""
echo "默认账号:"
echo "  admin / admin123"
echo "  purchaser / purchaser123"
echo "  reviewer / reviewer123"
