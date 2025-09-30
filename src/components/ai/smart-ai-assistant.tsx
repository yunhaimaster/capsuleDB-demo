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
import { AIDisclaimer, AIDisclaimerCompact } from '@/components/ui/ai-disclaimer'
import { AISettings } from '@/components/ui/ai-settings'
import { AIThinkingIndicator, AIThinkingSteps } from '@/components/ui/ai-thinking-indicator'
import { AIRealReasoning, AIReasoningIndicator } from '@/components/ui/ai-real-reasoning'

interface SmartAIAssistantProps {
  orders: ProductionOrder[]
  currentOrder?: ProductionOrder | null
  pageData?: any
  showOnPages?: string[]
}

export function SmartAIAssistant({ orders, currentOrder, pageData, showOnPages = ['/orders'] }: SmartAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [enableReasoning, setEnableReasoning] = useState(false)
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
    orders: orders,
    currentOrder: currentOrder,
    context: pageData,
    enableReasoning: enableReasoning,
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
    setIsFullscreen(false)
  }

  return (
    <div>
      {/* 浮動 Smart AI 按鈕 */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button 
          variant="outline" 
          size="lg"
          className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 liquid-glass-card-interactive rounded-full h-14 w-14 sm:h-auto sm:w-auto sm:rounded-lg ${isOpen ? 'scale-95 opacity-70 pointer-events-none' : 'scale-100 opacity-100 hover:scale-[1.02]'}`}
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
        className="ai-chat-modal"
        size={isFullscreen ? 'full' : 'xl'}
        animateFrom="button"
        fullscreen={isFullscreen}
        headerButtons={
          <div className="flex items-center space-x-2">
            <button
              className="liquid-glass-modal-close"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? '還原視窗' : '全屏顯示'}
              type="button"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
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
        
        <div className={`flex flex-col gap-4 ${isFullscreen ? 'h-[70vh]' : 'max-h-[70vh]'}`}>
          <div className="flex-1 overflow-y-auto space-y-3" ref={messagesContainerRef}>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-gray-50 border border-gray-200 text-gray-700' 
                    : 'bg-gray-50 border border-gray-200 text-gray-700'
                }`}>
                  {message.role === 'assistant' ? (
                    <div>
                      {/* 真實思考過程 */}
                      <AIRealReasoning 
                        reasoning={message.reasoning} 
                        enableReasoning={enableReasoning} 
                      />
                      
                      <MarkdownRenderer content={message.content} whiteText={false} />
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
                              className="block w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
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
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>複製</span>
                          </button>
                          <button
                            onClick={() => {
                              // 找到對應的用戶問題
                              const messageIndex = messages.findIndex(msg => msg.id === message.id)
                              if (messageIndex > 0) {
                                const userMessage = messages[messageIndex - 1]
                                if (userMessage && userMessage.role === 'user') {
                                  setInput(userMessage.content)
                                } else {
                                  setInput('請重新回答這個問題')
                                }
                              } else {
                                setInput('請重新回答這個問題')
                              }
                            }}
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-700 hover:text-gray-900 transition-colors"
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
            {isLoading && isThinking && enableReasoning && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <AIReasoningIndicator isReasoning={isThinking} enableReasoning={enableReasoning} />
                </div>
              </div>
            )}
            {isLoading && isThinking && !enableReasoning && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <AIThinkingIndicator isThinking={isThinking} enableReasoning={enableReasoning} />
                </div>
              </div>
            )}
            {isLoading && !isThinking && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <AIThinkingIndicator isThinking={isLoading} enableReasoning={false} />
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
              className="flex-1 bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white/80"
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
