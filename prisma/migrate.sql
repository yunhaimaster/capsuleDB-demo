-- 創建 production_orders 表
CREATE TABLE IF NOT EXISTS "production_orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productionQuantity" INTEGER NOT NULL,
    "unitWeightMg" DOUBLE PRECISION NOT NULL,
    "batchTotalWeightMg" DOUBLE PRECISION NOT NULL,
    "completionDate" TIMESTAMP(3),
    "processIssues" TEXT,
    "qualityNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerService" TEXT,
    "actualProductionQuantity" INTEGER,
    "materialYieldQuantity" INTEGER,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- 創建 ingredients 表
CREATE TABLE IF NOT EXISTS "ingredients" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "unitContentMg" DOUBLE PRECISION NOT NULL,
    "isCustomerProvided" BOOLEAN NOT NULL DEFAULT true,
    "isCustomerSupplied" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- 添加外鍵約束
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ingredients_orderId_fkey'
    ) THEN
        ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
