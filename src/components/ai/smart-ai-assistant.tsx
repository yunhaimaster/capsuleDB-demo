'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, RotateCcw, ArrowUp, Copy, Download, MessageSquare, History, Trash2, Minimize2, Maximize2, RefreshCw, ChevronDown } from 'lucide-react'
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
  const [enableReasoning, setEnableReasoning] = useState(false)
  const [isMobileMeta, setIsMobileMeta] = useState(false)
  const [isMetaExpanded, setIsMetaExpanded] = useState(false)
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
  }

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      setIsMobileMeta(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setIsMetaExpanded(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isMobileMeta) {
      setIsMetaExpanded(false)
    }
  }, [isMobileMeta])

  const metaClassName = `ai-modal-meta ${isMobileMeta ? 'mobile-condensed' : ''} ${isMobileMeta && isMetaExpanded ? 'expanded' : ''}`

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
        
        <div className="ai-modal-shell" style={{ height: '60vh' }}>
          <div className={metaClassName}>
            {isMobileMeta ? (
              <>
                <button
                  type="button"
                  className="mobile-chip-toggle"
                  onClick={() => setIsMetaExpanded(prev => !prev)}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-[rgba(18,42,64,0.9)]">AI 助手資訊</span>
                    <span className="text-[11px] text-[rgba(18,42,64,0.6)]">{messages.length} 條訊息</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMetaExpanded ? 'rotate-180' : ''}`} />
                </button>
                <div className="mobile-chip-details">
                  <div className="flex items-center gap-2 mb-2">
                    <AIPoweredBadge />
                    <span className="text-xs text-[rgba(18,42,64,0.7)]">Smart AI 助手 · 實時分析</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[rgba(18,42,64,0.6)]">
                    <span className="px-2 py-1 rounded-full bg-white/80 border border-white/60">{messages.length} 條訊息</span>
                    {isLoading && (
                      <div className="flex items-center gap-1">
                        <AIThinkingIndicator isThinking={true} enableReasoning={enableReasoning} />
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <AIPoweredBadge />
                  <span className="text-sm text-[rgba(18,42,64,0.75)]">Smart AI 助手 · 實時分析</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[rgba(18,42,64,0.6)]">
                  <span className="px-2 py-1 rounded-full bg-white/70 border border-white/50 shadow-sm">{messages.length} 條訊息</span>
                  {isLoading && <AIThinkingIndicator isThinking={true} enableReasoning={enableReasoning} />}
                </div>
              </>
            )}
          </div>

          <div className="ai-modal-stream" ref={messagesContainerRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`ai-message ${message.role === 'user' ? 'ai-message-user' : 'ai-message-assistant'}`}
              >
                <div className="ai-message-content">
                  {message.role === 'assistant' && (
                    <AIRealReasoning reasoning={message.reasoning} enableReasoning={enableReasoning} />
                  )}
                  <MarkdownRenderer content={message.content} whiteText={message.role === 'user'} />

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[rgba(18,42,64,0.65)]">建議問題</p>
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
                          className="ai-suggestion-button"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.content && (
                    <div className="ai-message-actions">
                      <button
                        onClick={() => copyMessage(message.content)}
                        className="ai-message-action-btn"
                      >
                        <Copy className="w-3 h-3" />
                        <span>複製</span>
                      </button>
                      <button
                        onClick={() => {
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
                        className="ai-message-action-btn"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>重新回答</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && isThinking && enableReasoning && (
              <div className="ai-message ai-message-assistant">
                <AIReasoningIndicator isReasoning={isThinking} enableReasoning={enableReasoning} />
              </div>
            )}
            {isLoading && isThinking && !enableReasoning && (
              <div className="ai-message ai-message-assistant">
                <AIThinkingIndicator isThinking={isThinking} enableReasoning={enableReasoning} />
              </div>
            )}
            {isLoading && !isThinking && (
              <div className="ai-message ai-message-assistant">
                <AIThinkingIndicator isThinking={isLoading} enableReasoning={false} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-modal-input-row">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="輸入您的問題，或選擇建議問題快速開始"
              className="ai-modal-input"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="ai-modal-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </LiquidGlassModal>
    </div>
  )
}
