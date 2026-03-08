-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'purchaser', 'producer', 'reviewer', 'salesperson', 'readonly');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "RegulationStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CNY', 'USD');

-- CreateEnum
CREATE TYPE "ProcessUnit" AS ENUM ('piece', 'dozen');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('domestic', 'export');

-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('fcl20', 'fcl40', 'lcl');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('price_change', 'material_delete');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'processed', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'readonly',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regulations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RegulationStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "note" TEXT,
    "sales_person_id" TEXT,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "material_no" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'CNY',
    "manufacturer" TEXT,
    "category" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regulation_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "image_url" TEXT,
    "calculation_type" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_materials" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bom_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_configs" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "packaging_type" TEXT NOT NULL,
    "per_box" INTEGER NOT NULL,
    "per_carton" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_configs" (
    "id" TEXT NOT NULL,
    "packaging_config_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,4) NOT NULL,
    "unit" "ProcessUnit" NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_materials" (
    "id" TEXT NOT NULL,
    "packaging_config_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "price" DECIMAL(10,4) NOT NULL,
    "box_length" DECIMAL(10,2),
    "box_width" DECIMAL(10,2),
    "box_height" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "quotation_no" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "regulation_id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "packaging_config_id" TEXT NOT NULL,
    "sale_type" "SaleType" NOT NULL,
    "shipping_type" "ShippingType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "material_cost" DECIMAL(12,2) NOT NULL,
    "packaging_cost" DECIMAL(12,2) NOT NULL,
    "process_cost" DECIMAL(12,2) NOT NULL,
    "shipping_cost" DECIMAL(12,2) NOT NULL,
    "admin_fee" DECIMAL(12,2) NOT NULL,
    "vat" DECIMAL(12,2) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'draft',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_costs" (
    "id" TEXT NOT NULL,
    "packaging_config_id" TEXT NOT NULL,
    "sale_type" "SaleType" NOT NULL,
    "version" INTEGER NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "material_cost" DECIMAL(12,4) NOT NULL,
    "packaging_cost" DECIMAL(12,4) NOT NULL,
    "process_cost" DECIMAL(12,4) NOT NULL,
    "shipping_cost" DECIMAL(12,4) NOT NULL,
    "admin_fee" DECIMAL(12,4) NOT NULL,
    "vat" DECIMAL(12,4) NOT NULL,
    "total_cost" DECIMAL(12,4) NOT NULL,
    "set_by" TEXT NOT NULL,
    "set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "standard_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "material_id" TEXT NOT NULL,
    "old_price" DECIMAL(10,2),
    "new_price" DECIMAL(10,2),
    "affected_standard_costs" TEXT[],
    "triggered_by" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_by" TEXT,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "regulations_code_key" ON "regulations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_code_key" ON "customers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "materials_material_no_key" ON "materials"("material_no");

-- CreateIndex
CREATE UNIQUE INDEX "bom_materials_model_id_material_id_key" ON "bom_materials"("model_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_quotation_no_key" ON "quotations"("quotation_no");

-- CreateIndex
CREATE UNIQUE INDEX "standard_costs_packaging_config_id_sale_type_is_current_key" ON "standard_costs"("packaging_config_id", "sale_type", "is_current");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_regulation_id_fkey" FOREIGN KEY ("regulation_id") REFERENCES "regulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_materials" ADD CONSTRAINT "bom_materials_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_materials" ADD CONSTRAINT "bom_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_configs" ADD CONSTRAINT "packaging_configs_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_configs" ADD CONSTRAINT "process_configs_packaging_config_id_fkey" FOREIGN KEY ("packaging_config_id") REFERENCES "packaging_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_materials" ADD CONSTRAINT "packaging_materials_packaging_config_id_fkey" FOREIGN KEY ("packaging_config_id") REFERENCES "packaging_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_regulation_id_fkey" FOREIGN KEY ("regulation_id") REFERENCES "regulations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_packaging_config_id_fkey" FOREIGN KEY ("packaging_config_id") REFERENCES "packaging_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standard_costs" ADD CONSTRAINT "standard_costs_packaging_config_id_fkey" FOREIGN KEY ("packaging_config_id") REFERENCES "packaging_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standard_costs" ADD CONSTRAINT "standard_costs_set_by_fkey" FOREIGN KEY ("set_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
