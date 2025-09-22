'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog-custom'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, Eye, FileText, Plus, RotateCcw, ArrowUp, Copy, Download, Settings, MessageSquare, History, Trash2, Minimize2, Maximize2 } from 'lucide-react'
import { useAIAssistant } from '@/hooks/use-ai-assistant'

interface SmartAIAssistantProps {
  orders?: any[]
  currentOrder?: any
  pageData?: any
}

export function SmartAIAssistant({ orders = [], currentOrder, pageData }: SmartAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
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
    exportConversation
  } = useAIAssistant({
    orders: orders,
    currentOrder: currentOrder,
    context: pageData
  })

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed bottom-4 right-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-lg"
        >
          <Bot className="w-4 h-4 mr-2" />
          AI 助手
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`max-w-4xl max-h-[90vh] ${isMinimized ? 'max-w-sm' : ''}`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold flex items-center">
            <Bot className="w-5 h-5 mr-2 text-emerald-600" />
            Smart AI 助手
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewChat}
              title="新對話（保存當前對話）"
              className="text-xs"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="對話歷史"
              className="text-xs"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinimize}
              title={isMinimized ? "展開" : "最小化"}
              className="text-xs"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              title="清除對話（不保存）"
              className="text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              title="關閉"
              className="text-xs"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {isMinimized ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              AI 助手已最小化
            </p>
            <Button
              onClick={() => {
                toggleMinimize()
                setTimeout(() => {
                  setInput('繼續對話...')
                }, 100)
              }}
              size="sm"
              className="w-full"
            >
              繼續對話
            </Button>
          </div>
        ) : (
          <div className="flex h-[600px]">
            {/* 聊天歷史側邊欄 */}
            {showSettings && (
              <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">對話歷史</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <button
                        onClick={() => loadChatHistory(index)}
                        className="flex-1 text-left text-xs truncate"
                      >
                        對話 {index + 1}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteChatHistory(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 主要聊天區域 */}
            <div className="flex-1 flex flex-col">
              {/* 消息顯示區域 */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>我是您的智能 AI 助手，可以幫助您分析膠囊生產數據。</p>
                    <p className="text-sm mt-2">請輸入您的問題開始對話。</p>
                    
                    {/* 初始建議問題 */}
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">您可以問我：</p>
                      <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                        <button
                          onClick={() => setInput('顯示所有未完工的生產訂單')}
                          className="text-sm text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border"
                        >
                          "顯示所有未完工的生產訂單"
                        </button>
                        <button
                          onClick={() => setInput('哪個客戶的膠囊訂單最多？')}
                          className="text-sm text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border"
                        >
                          "哪個客戶的膠囊訂單最多？"
                        </button>
                        <button
                          onClick={() => setInput('最近一週的膠囊生產情況如何？')}
                          className="text-sm text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border"
                        >
                          "最近一週的膠囊生產情況如何？"
                        </button>
                        <button
                          onClick={() => setInput('分析膠囊灌裝的生產效率')}
                          className="text-sm text-left p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border"
                        >
                          "分析膠囊灌裝的生產效率"
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {message.role === 'assistant' ? (
                              <MarkdownRenderer content={message.content} />
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content)}
                              className="text-xs opacity-70 hover:opacity-100"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* 顯示建議問題 */}
                        {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">相關問題：</p>
                            <div className="grid grid-cols-1 gap-1">
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => setInput(suggestion)}
                                  className="text-xs text-left p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                >
                                  "{suggestion}"
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 輸入區域 */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="輸入您的問題..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                {/* 功能按鈕 */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={scrollToTop}
                      title="回到頂部"
                      className="text-xs"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportConversation}
                      title="導出對話"
                      className="text-xs"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {messages.length} 條消息
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}