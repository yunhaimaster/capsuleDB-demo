-- EasyPack 數據庫初始化腳本
-- 創建數據庫和基本配置

-- 設置時區
SET timezone = 'Asia/Hong_Kong';

-- 創建擴展（如果需要）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 設置搜索路徑
SET search_path = public;

-- 添加註釋
COMMENT ON DATABASE capsuledb IS 'EasyPack 膠囊配方管理系統數據庫';

-- 創建自定義函數（如果需要）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
