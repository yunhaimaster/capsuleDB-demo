'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, RotateCcw, ArrowUp, Copy, Download, MessageSquare, History, Trash2, Minimize2, Maximize2, RefreshCw } from 'lucide-react'
import { ProductionOrder } from '@/types'
import { useAIAssistant } from '@/hooks/use-ai-assistant'
import { AIPoweredBadge } from '@/components/ui/ai-powered-badge'
import { AIDisclaimer, AIDisclaimerCompact } from '@/components/ui/ai-disclaimer'
import { AISettings } from '@/components/ui/ai-settings'
import { AIThinkingIndicator, AIThinkingSteps } from '@/components/ui/ai-thinking-indicator'

interface OrderAIAssistantProps {
  order: ProductionOrder
  onModalReplace?: () => void
}

export function OrderAIAssistant({ order, onModalReplace }: OrderAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [enableReasoning, setEnableReasoning] = useState(false)
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    isThinking,
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
    enableReasoning: enableReasoning,
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
        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-md hover:shadow-lg transition-all duration-200 relative z-10 liquid-glass-card-interactive h-10 px-4"
        onClick={() => {
          setIsOpen(true)
          if (onModalReplace) {
            // 使用 setTimeout 確保 Order AI 模態框先打開
            setTimeout(() => {
              onModalReplace()
            }, 50)
          }
        }}
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
        animateFrom="button"
        headerButtons={
          <div className="flex items-center space-x-2">
            <AISettings 
              enableReasoning={enableReasoning}
              onToggleReasoning={setEnableReasoning}
            />
            <button
              className="liquid-glass-modal-close"
              onClick={clearChat}
            title="重設對話"
            type="button"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          </div>
        }
      >
        
        <AIDisclaimerCompact />
        
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-3" ref={messagesContainerRef}>
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
                      {message.content && (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>複製</span>
                          </button>
                          <button
                            onClick={() => {
                              setInput(`請重新回答：${message.content}`)
                            }}
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>重新回答</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <AIThinkingSteps isThinking={isThinking} enableReasoning={enableReasoning} />
                </div>
              </div>
            )}
            {isLoading && !isThinking && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <AIThinkingIndicator isThinking={isLoading} enableReasoning={enableReasoning} />
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
              className="flex-1 bg-transparent border-white/20 text-white placeholder:text-gray-300 focus:border-purple-400"
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </LiquidGlassModal>
    </div>
  )
}
