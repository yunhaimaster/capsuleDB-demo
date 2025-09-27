'use client'

import { useState } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { LiquidGlassModal, useLiquidGlassModal, LiquidGlassConfirmModal, LiquidGlassInfoModal } from '@/components/ui/liquid-glass-modal'
import { LiquidGlassHeader, LiquidGlassPageHeader } from '@/components/ui/liquid-glass-header'
import { Button } from '@/components/ui/button'
import { Plus, Settings, Info, Trash2, CheckCircle } from 'lucide-react'

export default function LiquidGlassDemoPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [useBrandLogoBg, setUseBrandLogoBg] = useState(false)
  
  // Modal hooks
  const confirmModal = useLiquidGlassModal()
  const infoModal = useLiquidGlassModal()
  const customModal = useLiquidGlassModal()

  const handleDelete = () => {
    confirmModal.openModal()
  }

  const handleInfo = () => {
    infoModal.openModal()
  }

  const handleCustomModal = () => {
    customModal.openModal()
  }

  return (
    <div className={`min-h-screen ${useBrandLogoBg ? 'brand-logo-bg-animation' : 'animated-gradient-bg-subtle'}`}>
      {/* Liquid Glass Navigation */}
      <LiquidGlassNav 
        links={[
          { href: '/', label: '首頁' },
          { href: '/orders', label: '訂單' },
          { href: '/liquid-glass-demo', label: 'Liquid Glass 展示', active: true }
        ]}
      />

      {/* Main Content with padding for fixed nav */}
      <div className="pt-20">
        {/* Page Header */}
        <LiquidGlassPageHeader
          title="Liquid Glass 組件展示"
          subtitle="展示 iOS 26 風格的 Liquid Glass 導航、模態框和標題組件"
          actions={
            <div className="flex gap-2">
              <Button
                onClick={() => setUseBrandLogoBg(!useBrandLogoBg)}
                variant={useBrandLogoBg ? "default" : "outline"}
                size="sm"
                className="liquid-glass-card-interactive"
              >
                <Settings className="h-4 w-4 mr-2" />
                {useBrandLogoBg ? '切換到漸變背景' : '切換到品牌 Logo 背景'}
              </Button>
              <Button
                onClick={handleInfo}
                variant="outline"
                className="liquid-glass-card-interactive"
              >
                <Info className="h-4 w-4 mr-2" />
                功能說明
              </Button>
              <Button
                onClick={handleCustomModal}
                className="liquid-glass-nav-cta"
              >
                <Plus className="h-4 w-4 mr-2" />
                開啟模態框
              </Button>
            </div>
          }
        />

        {/* Demo Sections */}
        <div className="max-w-6xl mx-auto px-4 pb-8">
          {/* Navigation Demo */}
          <section className="mb-8">
            <div className="liquid-glass-card liquid-glass-card-elevated">
              <div className="liquid-glass-content">
                <h2 className="text-2xl font-bold mb-4">導航組件展示</h2>
                <p className="mb-6 opacity-90">
                  上方展示了 Liquid Glass 導航欄，具有以下特性：
                </p>
                <ul className="space-y-2 mb-6 opacity-90">
                  <li>• 滾動時透明度自動調整</li>
                  <li>• 響應式設計，支援手機和桌面</li>
                  <li>• 流暢的懸停動畫效果</li>
                  <li>• 完整的鍵盤導航支援</li>
                  <li>• 無障礙功能（ARIA 標籤、焦點管理）</li>
                </ul>
                <div className="flex gap-4">
                  <Button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    variant="outline"
                  >
                    回到頂部
                  </Button>
                  <Button
                    onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                    variant="outline"
                  >
                    滾動測試
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Modal Demo */}
          <section className="mb-8">
            <div className="liquid-glass-card liquid-glass-card-brand">
              <div className="liquid-glass-content">
                <h2 className="text-2xl font-bold mb-4">模態框組件展示</h2>
                <p className="mb-6 opacity-90">
                  點擊下方按鈕體驗不同類型的 Liquid Glass 模態框：
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={handleCustomModal}
                    className="liquid-glass-card-interactive"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    自定義模態框
                  </Button>
                  <Button
                    onClick={handleInfo}
                    variant="outline"
                    className="liquid-glass-card-interactive"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    資訊模態框
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="liquid-glass-card-interactive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    確認模態框
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="liquid-glass-card liquid-glass-card-interactive">
                <div className="liquid-glass-content">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-500 rounded-xl mr-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">無障礙設計</h3>
                  </div>
                  <p className="opacity-90">
                    完整的 ARIA 標籤支援、鍵盤導航、螢幕閱讀器相容性，確保所有用戶都能正常使用。
                  </p>
                </div>
              </div>

              <div className="liquid-glass-card liquid-glass-card-interactive">
                <div className="liquid-glass-content">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-500 rounded-xl mr-4">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">響應式設計</h3>
                  </div>
                  <p className="opacity-90">
                    完美適配桌面、平板和手機設備，使用 CSS Grid 和 Flexbox 實現靈活佈局。
                  </p>
                </div>
              </div>

              <div className="liquid-glass-card liquid-glass-card-interactive">
                <div className="liquid-glass-content">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-500 rounded-xl mr-4">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">漸進增強</h3>
                  </div>
                  <p className="opacity-90">
                    支援現代瀏覽器的 backdrop-filter，並為不支援的瀏覽器提供優雅降級。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Scroll Test Section */}
          <section className="mb-8">
            <div className="liquid-glass-card">
              <div className="liquid-glass-content">
                <h2 className="text-2xl font-bold mb-4">滾動效果測試</h2>
                <p className="mb-6 opacity-90">
                  滾動頁面以查看導航欄的透明度變化效果。導航欄會根據滾動位置自動調整背景透明度和模糊效果。
                </p>
                <div className="h-96 bg-gradient-to-b from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <p className="text-lg font-medium opacity-70">滾動測試區域</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      <LiquidGlassModal
        isOpen={customModal.isOpen}
        onClose={customModal.closeModal}
        title="自定義模態框"
        size="lg"
      >
        <div className="space-y-6">
          <p>這是一個自定義的 Liquid Glass 模態框，展示了以下特性：</p>
          <ul className="space-y-2">
            <li>• 流暢的進入和退出動畫</li>
            <li>• 背景模糊效果</li>
            <li>• 響應式設計</li>
            <li>• 鍵盤導航支援（ESC 關閉）</li>
            <li>• 焦點管理</li>
            <li>• 點擊背景關閉</li>
          </ul>
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="font-medium">提示：</p>
            <p>在手機設備上，模態框會從底部滑入，模擬原生應用體驗。</p>
          </div>
        </div>
      </LiquidGlassModal>

      <LiquidGlassInfoModal
        isOpen={infoModal.isOpen}
        onClose={infoModal.closeModal}
        title="功能說明"
        message="Liquid Glass 組件系統提供了現代化的 iOS 26 風格介面，包含導航欄、模態框和標題組件。所有組件都經過精心設計，確保無障礙性、響應式設計和漸進增強。"
      />

      <LiquidGlassConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={() => console.log('Confirmed!')}
        title="確認刪除"
        message="您確定要刪除此項目嗎？此操作無法撤銷。"
        confirmText="刪除"
        cancelText="取消"
        variant="danger"
      />
    </div>
  )
}
