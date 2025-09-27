'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, RotateCcw, ArrowUp, Copy, Download, MessageSquare, History, Trash2, Minimize2, Maximize2 } from 'lucide-react'
import { ProductionOrder } from '@/types'
import { useAIAssistant } from '@/hooks/use-ai-assistant'
import { AIPoweredBadge } from '@/components/ui/ai-powered-badge'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'

interface OrderAIAssistantProps {
  order: ProductionOrder
}

export function OrderAIAssistant({ order }: OrderAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  
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
    orders: [order],
    context: {
      currentPage: '/orders/[id]',
      pageDescription: '訂單詳情頁面 - 查看特定膠囊訂單的詳細信息',
      timestamp: new Date().toISOString(),
      ordersCount: 1,
      hasCurrentOrder: true,
      currentOrder: order
    },
    initialAssistantMessage: {
      content: '您好！我是 Easy Health 訂單分析助手，專門針對當前膠囊配方訂單提供深入分析。請選擇下列專業問題之一或直接輸入您的問題：',
      suggestions: [
        '分析配方成分堆積密度，計算粉劑容積，對比膠囊殼容積，評估填充可行性並提供建議。',
        '分析原料流動性、黏性、結塊風險，評估製粒必要性（0-100分），推薦流動性改善輔料及用量。',
        '分析成分顏色混合效果，預測粉劑顏色，評估膠囊染色風險（0-100分）及預防措施。',
        '分析配方在港陸歐美的法規合規性，提供申報要求、標籤規範、成分限量清單。'
      ]
    }
  })

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div>
      <Button 
        variant="default"
        size="sm"
        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-md hover:shadow-lg transition-all duration-200 relative z-10 liquid-glass-card-interactive"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">AI 助手</span>
        <span className="sm:hidden">AI</span>
      </Button>
      <LiquidGlassModal
        isOpen={isOpen}
        onClose={handleClose}
        title="AI 訂單分析助手"
        size="xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
            <span className="text-base sm:text-lg">AI 訂單分析助手</span>
          </div>
          <div className="flex items-center space-x-2">
            <AIPoweredBadge />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>專業分析：</strong> 我可以分析當前膠囊配方的技術細節，包括成分堆積密度、流動性評估、顏色混合效果和法規合規性。
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-3" ref={messagesContainerRef}>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.role === 'assistant' ? (
                    <div>
                      <MarkdownRenderer content={message.content} />
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">建議問題：</p>
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
                              className="block w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700 hover:text-blue-800 transition-colors"
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
          
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的問題..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </LiquidGlassModal>
    </div>
  )
}
