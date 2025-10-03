'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LiquidGlassModal } from '@/components/ui/liquid-glass-modal'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, RotateCcw, ArrowUp, Copy, Download, MessageSquare, History, Trash2, Minimize2, Maximize2, RefreshCw } from 'lucide-react'
import { ProductionOrder } from '@/types'
import { useAIAssistant } from '@/hooks/use-ai-assistant'
import { AIDisclaimer, AIDisclaimerCompact } from '@/components/ui/ai-disclaimer'
import { AISettings } from '@/components/ui/ai-settings'
import { AIThinkingIndicator, AIThinkingSteps } from '@/components/ui/ai-thinking-indicator'
import { AIRealReasoning, AIReasoningIndicator } from '@/components/ui/ai-real-reasoning'

interface OrderAIAssistantProps {
  order: ProductionOrder
  onModalReplace?: () => void
  onClose?: () => void
  isOpen?: boolean
}

export function OrderAIAssistant({ order, onModalReplace, onClose, isOpen: externalIsOpen }: OrderAIAssistantProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
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
        '分析填充可行性',
        '分析製粒必要性',
        '分析成分顏色與膠囊染色風險',
        '分析文件與標籤合規性',
        '分析配方功效與廣告用語合規建議'
      ]
    }
  })

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }


  return (
    <>
      <Button 
        variant="default"
        className={`bg-purple-600 hover:bg-purple-700 text-white border-purple-600 shadow-md hover:shadow-lg transition-all duration-500 relative z-[2100] liquid-glass-card-interactive h-10 px-4 ${isOpen ? 'scale-95 opacity-70 pointer-events-none' : 'scale-100 opacity-100'}`}
        onClick={() => {
          if (externalIsOpen === undefined) {
            setInternalIsOpen(true)
          }
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
    </>
  )
}
