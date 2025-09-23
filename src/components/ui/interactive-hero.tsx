'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog-custom'
import { SmartAIAssistant } from '@/components/ai/smart-ai-assistant'
import { ChevronUp, ArrowUp, Package, FileText, Eye, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface InteractiveHeroProps {
  onReveal?: () => void
}

export function InteractiveHero({ onReveal }: InteractiveHeroProps) {
  const [dragProgress, setDragProgress] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartY(e.clientY)
    setCurrentY(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const deltaY = startY - e.clientY
    const progress = Math.min(Math.max(deltaY / 300, 0), 1)
    
    // 使用緩動函數讓拖拽更平滑
    const easedProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    
    setDragProgress(easedProgress)
    setCurrentY(e.clientY)
    
    if (progress >= 0.8 && !isRevealed) {
      setIsRevealed(true)
      onReveal?.()
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    
    if (dragProgress >= 0.3) {
      setIsRevealed(true)
      onReveal?.()
    } else {
      setDragProgress(0)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setStartY(touch.clientY)
    setCurrentY(touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    const deltaY = startY - touch.clientY
    const progress = Math.min(Math.max(deltaY / 300, 0), 1)
    
    // 使用緩動函數讓觸控更平滑
    const easedProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
    
    setDragProgress(easedProgress)
    setCurrentY(touch.clientY)
    
    if (progress >= 0.8 && !isRevealed) {
      setIsRevealed(true)
      onReveal?.()
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    if (dragProgress >= 0.3) {
      setIsRevealed(true)
      onReveal?.()
    } else {
      setDragProgress(0)
    }
  }

  // 防止頁面滾動
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isDragging])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景層 */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{
          transform: `translateY(${dragProgress * 100}%) scale(${1 + dragProgress * 0.05})`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 1 - dragProgress * 0.3,
          filter: `blur(${dragProgress * 2}px)`
        }}
      />
      
      {/* 背景裝飾層 */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"
        style={{
          transform: `translateY(${dragProgress * 100}%) rotate(${dragProgress * 5}deg)`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 1 - dragProgress * 0.5
        }}
      />
      
      {/* 內容層 */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translateY(${dragProgress * 100}%) scale(${1 - dragProgress * 0.1})`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 1 - dragProgress * 0.2
        }}
      >
        <div className="text-center text-white px-8 max-w-4xl">
          {/* 主標題 */}
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            style={{
              transform: `translateY(${dragProgress * -20}px)`,
              opacity: 1 - dragProgress * 0.3,
              transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            無處不在，無遠弗屆
          </h1>
          
          {/* 副標題 */}
          <p 
            className="text-xl md:text-2xl lg:text-3xl mb-12 text-slate-300"
            style={{
              transform: `translateY(${dragProgress * -15}px)`,
              opacity: 1 - dragProgress * 0.4,
              transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Made in Hong Kong
          </p>
          
          {/* 拖拽提示 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-slate-400">
              <ChevronUp className="w-6 h-6 animate-bounce" />
              <span className="text-lg">向上拖拽探索系統</span>
            </div>
            
            {/* 進度指示器 */}
            <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ 
                  width: `${dragProgress * 100}%`,
                  boxShadow: dragProgress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 系統內容層 */}
      <div 
        className="absolute inset-0 bg-white dark:bg-slate-900"
        style={{
          transform: `translateY(${100 - dragProgress * 100}%) scale(${0.95 + dragProgress * 0.05})`,
          transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 0.3 + dragProgress * 0.7
        }}
      >
        <div className="h-full overflow-y-auto">
          {/* 系統內容 */}
          <div className="container mx-auto px-4 py-8">
            {/* 系統標題 */}
            <div 
              className="text-center mb-12"
              style={{
                transform: `translateY(${(1 - dragProgress) * 50}px)`,
                opacity: 0.3 + dragProgress * 0.7,
                transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                EasyPack 膠囊配方管理系統
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                智能化膠囊生產管理，讓香港製造走向世界
              </p>
            </div>
            
            {/* 功能卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-blue-600" />
                    新增配方
                  </CardTitle>
                  <CardDescription>
                    建立新的膠囊配方與規格
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/orders/new">
                    <Button className="w-full">
                      開始建立
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-green-600" />
                    生產記錄
                  </CardTitle>
                  <CardDescription>
                    查看和管理所有生產記錄
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/orders">
                    <Button className="w-full">
                      查看記錄
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                    統計分析
                  </CardTitle>
                  <CardDescription>
                    原料使用統計與風險分析
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/reports">
                    <Button className="w-full">
                      查看統計
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            
            {/* AI 助手 */}
            <div className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <ArrowUp className="mr-2 h-5 w-5" />
                    啟動 AI 智能助手
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>EasyPack AI 智能助手</DialogTitle>
                  </DialogHeader>
                  <SmartAIAssistant 
                    orders={[]} 
                    pageData={{
                      currentPage: '/',
                      pageDescription: '首頁 - EasyPack 膠囊配方管理系統主頁',
                      timestamp: new Date().toISOString(),
                      ordersCount: 0,
                      hasCurrentOrder: false,
                      currentOrder: null,
                      recentOrders: []
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      
      {/* 拖拽區域 */}
      <div 
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  )
}
