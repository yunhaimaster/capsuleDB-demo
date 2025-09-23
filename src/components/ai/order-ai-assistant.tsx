'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog-custom'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, RotateCcw, ArrowUp, Copy, Download, MessageSquare, History, Trash2, Minimize2, Maximize2 } from 'lucide-react'
import { ProductionOrder } from '@/types'
import { useAIAssistant } from '@/hooks/use-ai-assistant'

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
    exportConversation
  } = useAIAssistant({
    orders: [order],
    context: {
      currentPage: '/orders/[id]',
      pageDescription: '訂單詳情頁面 - 查看特定膠囊訂單的詳細信息',
      timestamp: new Date().toISOString(),
      ordersCount: 1,
      hasCurrentOrder: true,
      currentOrder: order,
      recentOrders: []
    }
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
          className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
        >
          <Bot className="h-4 w-4 mr-2" />
          詢問此訂單
        </Button>
      </DialogTrigger>
      <DialogContent className={`max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] flex flex-col ${isMinimized ? 'h-16' : ''}`}>
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
              <span className="text-base sm:text-lg">AI 訂單分析助手</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={startNewChat}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="新對話（保存當前對話）"
              >
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              {chatHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                  title="對話歷史"
                >
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
              {messages.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scrollToTop}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    title="回到頂部"
                  >
                    <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportConversation}
                    className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                    title="導出對話"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMinimize}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title={isMinimized ? "展開" : "最小化"}
              >
                {isMinimized ? <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="清除對話（不保存）"
              >
                <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                title="關閉"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {!isMinimized ? (
          <>
            {/* 對話歷史側邊欄 */}
            {showSettings && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-medium mb-3">對話歷史</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          對話 {index + 1} - {chat.length} 條消息
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {chat[0]?.content?.substring(0, 30)}...
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadChatHistory(index)}
                          className="h-6 w-6 p-0"
                          title="載入對話"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteChatHistory(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          title="刪除對話"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50 text-purple-600" />
                  <p className="text-lg font-medium mb-2">AI 訂單分析助手</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Powered by OpenAI GPT-5 Mini</p>
                  <p className="text-sm mb-4">針對當前訂單進行分析，您可以詢問：</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <button
                      onClick={() => setInput('這個訂單的原料配比如何？')}
                      className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <p className="font-medium text-purple-800 dark:text-purple-200 mb-1">訂單分析</p>
                      <p className="text-purple-600 dark:text-purple-300">"這個訂單的原料配比如何？"</p>
                    </button>
                    <button
                      onClick={() => setInput('這個單粒重量用這個大小的膠囊是否合理？')}
                      className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">重量計算</p>
                      <p className="text-blue-600 dark:text-blue-300">"這個單粒重量用這個大小的膠囊是否合理？"</p>
                    </button>
                    <button
                      onClick={() => setInput('有什麼生產注意事項？')}
                      className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <p className="font-medium text-green-800 dark:text-green-200 mb-1">生產建議</p>
                      <p className="text-green-600 dark:text-green-300">"有什麼生產注意事項？"</p>
                    </button>
                    <button
                      onClick={() => setInput('這個配方在大陸、香港、歐洲和美國的合法性如何？')}
                      className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">法規合規</p>
                      <p className="text-orange-600 dark:text-orange-300">"這個配方在大陸、香港、歐洲和美國的合法性如何？"</p>
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      當前訂單：{order.customerName} - {order.productName}
                    </p>
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
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {message.role === 'assistant' ? (
                            <MarkdownRenderer content={message.content} />
                          ) : (
                            <p className="whitespace-pre-wrap text-white">{message.content}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(message.content)}
                          className="ml-2 h-6 w-6 p-0 opacity-70 hover:opacity-100 text-white hover:text-white"
                          title="複製此消息"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
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
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI 正在分析訂單...</span>
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
                placeholder="詢問關於此訂單的任何問題..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          /* 最小化狀態顯示 */
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <Bot className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">AI 訂單助手已最小化</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {messages.length > 0 ? `當前對話：${messages.length} 條消息` : '點擊展開開始對話'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toggleMinimize() // 先展開
                    setTimeout(() => {
                      setInput('繼續對話...')
                    }, 100) // 延遲設置輸入
                  }}
                  className="text-xs"
                >
                  繼續對話
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMinimize}
                className="h-8 w-8 p-0"
                title="展開"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
