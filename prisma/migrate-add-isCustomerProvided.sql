-- 添加 isCustomerProvided 字段到 ingredients 表
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "isCustomerProvided" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ingredients" ADD COLUMN IF NOT EXISTS "isCustomerSupplied" BOOLEAN NOT NULL DEFAULT true;

-- 添加缺失的字段到 production_orders 表
ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "productName" TEXT NOT NULL DEFAULT '未命名產品';
ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "capsuleColor" TEXT;
ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "capsuleSize" TEXT;
ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "capsuleType" TEXT;
ALTER TABLE "production_orders" ADD COLUMN IF NOT EXISTS "customerService" TEXT;

-- 移除舊的 productCode 字段（如果存在）
ALTER TABLE "production_orders" DROP COLUMN IF EXISTS "productCode";
