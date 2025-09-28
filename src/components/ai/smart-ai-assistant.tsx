'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, RotateCcw, ArrowUp, Copy, Download, MessageSquare, History, Trash2, Minimize2, Maximize2, RefreshCw } from 'lucide-react'
import { ProductionOrder } from '@/types'
import { useAIAssistant } from '@/hooks/use-ai-assistant'
import { AIPoweredBadge } from '@/components/ui/ai-powered-badge'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'

interface SmartAIAssistantProps {
  orders: ProductionOrder[]
  currentOrder?: ProductionOrder | null
  pageData?: any
  showOnPages?: string[]
}

export function SmartAIAssistant({ orders, currentOrder, pageData, showOnPages = ['/orders'] }: SmartAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  // 檢查當前頁面是否應該顯示 Smart AI
  const shouldShow = showOnPages.some(page => pathname.startsWith(page))
  
  if (!shouldShow) {
    return null
  }
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    isMinimized,
    showSettings,
    setShowSettings,
    chatHistory,
    messagesEndRef,
    messagesContainerRef,
    handleSendMessage,
    handleKeyPress,
    clearChat,
    startNewChat,
    loadChatHistory,
    deleteChatHistory,
    toggleMinimize,
    scrollToTop,
    copyMessage,
    exportConversation,
    retryLastMessage
  } = useAIAssistant({
    orders: orders,
    currentOrder: currentOrder,
    context: pageData,
    initialAssistantMessage: {
      content: '您好！我是 Smart AI 助手，專門協助您分析訂單數據、客戶統計和生產效率。請選擇以下問題開始，或直接輸入您的問題：',
      suggestions: [
        '顯示所有未完工的生產訂單',
        '哪個客戶的膠囊訂單最多?',
        '最近一週的膠囊生產情況如何?',
        '分析膠囊灌裝的生產效率'
      ]
    }
  })

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div>
      {/* 浮動 Smart AI 按鈕 */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button 
          variant="outline" 
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 liquid-glass-card-interactive rounded-full h-14 w-14 sm:h-auto sm:w-auto sm:rounded-lg"
          onClick={() => setIsOpen(true)}
        >
          <Bot className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Smart AI</span>
          <span className="sm:hidden">AI</span>
        </Button>
      </div>
      <LiquidGlassModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Smart AI 助手"
        size="xl"
        animateFrom="button"
        headerButtons={
          <button
            className="liquid-glass-modal-close"
            onClick={clearChat}
            title="重設對話"
            type="button"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        }
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-400" />
            <span className="text-base sm:text-lg text-white">Smart AI 助手</span>
          </div>
          <div className="flex items-center space-x-2">
            <AIPoweredBadge />
          </div>
        </div>
        
        <div className="flex flex-col h-full">
          {/* 固定介紹區域 */}
          <div className="text-sm text-gray-200 bg-transparent border border-white/20 p-3 rounded-lg backdrop-blur-sm mb-4">
            <strong className="text-white">智能助手：</strong> 我可以幫助您分析生產數據、優化配方、提供質量建議，並回答任何與膠囊生產相關的問題。
          </div>
          
          {/* 可滾動的對話區域 */}
          <div 
            className="flex-1 overflow-y-auto space-y-3 min-h-0" 
            ref={messagesContainerRef}
            onWheel={(e) => e.stopPropagation()}
          >
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-transparent border border-white/20 text-white backdrop-blur-sm' 
                    : 'bg-transparent border border-white/20 text-white backdrop-blur-sm'
                }`}>
                  {message.role === 'assistant' ? (
                    <div>
                      <MarkdownRenderer content={message.content} whiteText={true} />
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-200">建議問題：</p>
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (suggestion === '重試') {
                                  retryLastMessage()
                                } else {
                                  setInput(suggestion)
                                }
                              }}
                              className="block w-full text-left p-2 text-sm bg-transparent hover:bg-white/10 rounded border border-white/20 text-gray-200 hover:text-white transition-colors backdrop-blur-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI 正在思考...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* 固定輸入區域 */}
          <div className="flex space-x-2 mt-4 pt-4 border-t border-white/10">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的問題..."
              className="flex-1 bg-transparent border-white/20 text-white placeholder:text-gray-300 focus:border-blue-400"
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </LiquidGlassModal>
    </div>
  )
}
