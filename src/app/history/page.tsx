'use client'

import { LiquidGlassFooter } from '@/components/ui/liquid-glass-footer'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'

export default function HistoryPage() {
  const versionHistory = [
    {
      version: 'v2.2.1',
      date: '2025年10月2日',
      type: '最新版本',
      typeColor: 'bg-green-100 text-green-800 border-green-200',
      features: [
        'Grok AI 回歸製粒分析，回應更自然貼地',
        '訂單 AI 助手 Modal 疊層再進化，所有裝置都能穩定顯示',
        '新增隱私政策與服務條款頁面，Footer 連結立即可用',
        'Footer 版權年份更新至 2025，細節同步最新狀態'
      ]
    },
    {
      version: 'v2.2.0',
      date: '2025年10月1日',
      type: '功能更新',
      typeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      features: [
        'AI 助手 Modal 玻璃化改版，新增手機折疊資訊晶片',
        'PDF 下載區改用 Liquid Glass 卡片，桌面排列一致',
        '導航列最大寬度調整，超寬螢幕仍保持左右留白',
        '登入頁整合 Liquid Glass 風格與品牌提示',
        'Footer 帳戶連結改為動態顯示登入/登出狀態'
      ]
    },
    {
      version: 'v2.0.0',
      date: '2025年9月29日',
      type: '功能更新',
      typeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      features: [
        '全站換上品牌背景動畫與 Liquid Glass 卡片',
        'AI 助手布局統一，新增建議提問及複製操作',
        'PDF 參考資料中心上線，提供風險清單及培訓手冊',
        '導航與 Footer 導入共用設定檔，移除舊頁面連結',
        '修復 iOS Safari 字體縮放造成畫面放大的問題',
        '調整訂單列表 hover 動畫與桌/手機排版'
      ]
    },
    {
      version: 'v1.0.8',
      date: '2025年9月28日',
      type: '穩定版本',
      typeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      features: [
        'AI 助手功能全面優化，移除 reasoning 參數提升性能',
        '新增用戶可選的深度推理模式，平衡速度與質量',
        '添加 AI 免責條款，提升用戶透明度和法律合規性',
        '統一 AI 設置按鈕樣式，保持界面一致性',
        '優化 AI 參數配置，32K tokens 極限設置確保最高質量',
        '新增參考資料下載功能，提供培訓手冊和風險清單',
        '修復訂單編輯功能和搜尋選單操作體驗',
        '整體用戶體驗優化和界面統一性提升'
      ]
    },
    {
      version: 'v1.0.7',
      date: '2025年9月27日',
      type: '穩定版本',
      typeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      features: [
        '全新玻璃質感介面設計',
        '修復系統部署和穩定性問題',
        '優化 AI 助手功能',
        '改善數據同步和處理流程',
        '簡化配方操作介面',
        '增強 AI 專業分析能力',
        '修復 AI 助手功能衝突',
        '優化日期顯示格式',
        '修復分頁功能問題',
        '解決按鈕重疊問題',
        '新增動畫效果和視覺元素',
        '支援深色和淺色模式',
        '新增中文字體翻譯功能',
        '優化手機操作體驗'
      ]
    },
    {
      version: 'v1.0.6',
      date: '2025年9月25日',
      type: '功能更新',
      typeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        '新增訂單搜尋和篩選功能',
        '優化數據庫查詢性能',
        '改進用戶界面響應速度',
        '新增批量操作功能',
        '修復已知錯誤和問題'
      ]
    },
    {
      version: 'v1.0.5',
      date: '2025年9月22日',
      type: '功能更新',
      typeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        '新增膠囊顏色選擇功能',
        '優化配方計算邏輯',
        '改進訂單管理界面',
        '新增數據導出功能',
        '增強系統穩定性'
      ]
    },
    {
      version: 'v1.0.4',
      date: '2025年9月20日',
      type: '功能更新',
      typeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        '新增 AI 智能配方分析',
        '優化訂單創建流程',
        '改進數據驗證機制',
        '新增客戶管理功能',
        '修復界面顯示問題'
      ]
    },
    {
      version: 'v1.0.3',
      date: '2025年9月18日',
      type: '功能更新',
      typeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        '新增原料數據庫',
        '優化配方計算精度',
        '改進用戶操作體驗',
        '新增訂單狀態追蹤',
        '修復數據同步問題'
      ]
    },
    {
      version: 'v1.0.2',
      date: '2025年9月15日',
      type: '功能更新',
      typeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        '新增訂單編輯功能',
        '優化數據庫結構',
        '改進錯誤處理機制',
        '新增用戶權限管理',
        '修復登入問題'
      ]
    },
    {
      version: 'v1.0.1',
      date: '2025年9月12日',
      type: '功能更新',
      typeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: [
        '新增訂單刪除功能',
        '優化界面布局',
        '改進數據驗證',
        '新增確認對話框',
        '修復初始版本問題'
      ]
    },
    {
      version: 'v1.0.0',
      date: '2025年9月10日',
      type: '初始版本',
      typeColor: 'bg-gray-100 text-gray-800 border-gray-200',
      features: [
        '系統基礎架構建立',
        '用戶認證系統',
        '訂單創建功能',
        '基本數據管理',
        '響應式界面設計'
      ]
    }
  ]

  return (
    <div className="min-h-screen logo-bg-animation flex flex-col">
      <LiquidGlassNav />
      
      {/* Main Content with padding for fixed nav */}
      <div className="pt-28 sm:pt-24 px-4 sm:px-6 md:px-8 space-y-8 floating-combined">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回首頁
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-2xl font-bold text-gray-800">
              版本更新歷史
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-sm">
            Easy Health 膠囊管理系統的完整更新記錄
          </p>
        </div>

        {/* Version History */}
        <div className="space-y-6">
          {versionHistory.map((version, index) => (
            <div key={version.version} className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-interactive">
              <div className="liquid-glass-content">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="icon-container icon-container-blue">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {version.version}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{version.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${version.typeColor}`}>
                    {version.type}
                  </span>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">更新內容：</h4>
                  <ul className="space-y-2">
                    {version.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1.5 flex-shrink-0">•</span>
                        <span className="text-sm text-gray-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            感謝您使用 Easy Health 膠囊管理系統
          </p>
          <p className="text-gray-400 text-xs mt-2">
            如有任何問題或建議，請聯繫技術支援團隊
          </p>
        </div>
      </div>

      <LiquidGlassFooter />
    </div>
  )
}

