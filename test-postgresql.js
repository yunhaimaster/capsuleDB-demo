// PostgreSQL 連接測試腳本
const { PrismaClient } = require('@prisma/client')

async function testPostgreSQL() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 測試 PostgreSQL 連接...')
    
    // 測試基本連接
    await prisma.$connect()
    console.log('✅ PostgreSQL 連接成功')
    
    // 測試數據庫版本
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 數據庫版本:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1])
    
    // 測試表是否存在
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📋 數據庫表數量:', tables.length)
    
    if (tables.length > 0) {
      console.log('📝 現有表:')
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`)
      })
    }
    
    // 測試 v2.0 新表
    const v2Tables = ['ai_recipes', 'ingredient_prices', 'product_efficacies', 'work_orders', 'qc_files', 'product_databases', 'ad_copies']
    console.log('🚀 檢查 v2.0 表...')
    
    for (const tableName of v2Tables) {
      const tableExists = tables.some(table => table.table_name === tableName)
      console.log(`  ${tableExists ? '✅' : '❌'} ${tableName}`)
    }
    
    console.log('🎉 PostgreSQL 測試完成！')
    
  } catch (error) {
    console.error('❌ PostgreSQL 測試失敗:', error.message)
    
    if (error.message.includes('connect')) {
      console.log('\n💡 可能的解決方案:')
      console.log('1. 確保 PostgreSQL 服務正在運行')
      console.log('2. 檢查 DATABASE_URL 是否正確')
      console.log('3. 運行: npm run postgres:up')
      console.log('4. 運行: npm run db:deploy')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testPostgreSQL()
