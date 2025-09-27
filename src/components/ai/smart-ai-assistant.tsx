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

interface SmartAIAssistantProps {
  orders: ProductionOrder[]
  currentOrder?: ProductionOrder | null
  pageData?: any
}

export function SmartAIAssistant({ orders, currentOrder, pageData }: SmartAIAssistantProps) {
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
    orders: orders,
    currentOrder: currentOrder,
    context: pageData,
    initialAssistantMessage: {
      content: '您好！我是 Smart AI 助手，專門協助您分析生產數據、優化配方、提供質量建議。請選擇以下問題開始，或直接輸入您的問題：',
      suggestions: [
        '分析當前生產數據趨勢，識別異常值和改進機會。',
        '優化膠囊配方，提供成本效益分析和質量提升建議。',
        '評估生產工藝參數，建議最佳化配置方案。',
        '提供質量控制建議，包括檢測方法和標準制定。'
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
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
            <span className="text-base sm:text-lg">Smart AI 助手</span>
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
          <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
            <strong>智能助手：</strong> 我可以幫助您分析生產數據、優化配方、提供質量建議，並回答任何與膠囊生產相關的問題。
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </LiquidGlassModal>
    </div>
  )
}
