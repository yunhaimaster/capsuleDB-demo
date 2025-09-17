import { test, expect } from '@playwright/test'

test.describe('膠囊配方管理系統', () => {
  test('首頁載入正常', async ({ page }) => {
    await page.goto('/')
    
    // 檢查標題
    await expect(page.getByRole('heading', { name: '膠囊配方管理系統' })).toBeVisible()
    
    // 檢查主要功能卡片
    await expect(page.getByText('新增配方')).toBeVisible()
    await expect(page.getByText('生產記錄')).toBeVisible()
    await expect(page.getByText('搜尋篩選')).toBeVisible()
    await expect(page.getByText('統計報表')).toBeVisible()
  })

  test('可以導航到新增配方頁面', async ({ page }) => {
    await page.goto('/')
    
    // 點擊新增配方按鈕
    await page.getByRole('link', { name: '新增配方' }).first().click()
    
    // 檢查是否導航到正確頁面
    await expect(page).toHaveURL('/orders/new')
    await expect(page.getByRole('heading', { name: '新增膠囊配方' })).toBeVisible()
  })

  test('可以導航到生產記錄頁面', async ({ page }) => {
    await page.goto('/')
    
    // 點擊檢視記錄按鈕
    await page.getByRole('link', { name: '檢視記錄' }).first().click()
    
    // 檢查是否導航到正確頁面
    await expect(page).toHaveURL('/orders')
    await expect(page.getByRole('heading', { name: '生產記錄管理' })).toBeVisible()
  })

  test('新增配方表單基本功能', async ({ page }) => {
    await page.goto('/orders/new')
    
    // 填寫基本資訊
    await page.getByLabel('客戶名稱').fill('測試客戶')
    await page.getByLabel('產品代號').fill('TEST-001')
    await page.getByLabel('生產數量').fill('1000')
    
    // 填寫原料資訊
    await page.getByPlaceholder('請輸入原料品名').fill('維生素C')
    await page.getByPlaceholder('0.00000').fill('500')
    
    // 檢查計算結果
    await expect(page.getByText('500.000 mg')).toBeVisible()
    await expect(page.getByText('500.000 g')).toBeVisible()
  })
})
