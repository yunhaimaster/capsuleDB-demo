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
      
      <DialogContent className={`max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] ${isMinimized ? 'max-w-sm' : ''}`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4">
          <DialogTitle className="text-base sm:text-lg font-semibold flex items-center">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
            Smart AI 助手
          </DialogTitle>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewChat}
              title="新對話（保存當前對話）"
              className="h-8 w-8 p-0 text-xs"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="對話歷史"
              className="h-8 w-8 p-0 text-xs"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinimize}
              title={isMinimized ? "展開" : "最小化"}
              className="h-8 w-8 p-0 text-xs"
            >
              {isMinimized ? <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              title="清除對話（不保存）"
              className="h-8 w-8 p-0 text-xs"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              title="關閉"
              className="h-8 w-8 p-0 text-xs"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </DialogHeader>

        {isMinimized ? (
          <div className="p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
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
              className="w-full text-xs sm:text-sm"
            >
              繼續對話
            </Button>
          </div>
        ) : (
          <div className="flex h-[400px] sm:h-[500px] md:h-[600px]">
            {/* 聊天歷史側邊欄 */}
            {showSettings && (
              <div className="w-48 sm:w-56 md:w-64 border-r border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-medium">對話歷史</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                
                <div className="space-y-1 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
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
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
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
                className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8">
                    <Bot className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">我是您的智能 AI 助手，可以幫助您分析膠囊生產數據。</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Powered by OpenAI GPT-5 Mini</p>
                    <p className="text-xs sm:text-sm mt-2">請輸入您的問題開始對話。</p>
                    
                    {/* 初始建議問題 */}
                    <div className="mt-4 sm:mt-6">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">相關問題：</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {pageData?.currentPage === '/' && (
                          <>
                            <button
                              onClick={() => setInput('顯示所有未完工的生產訂單')}
                              className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-purple-800 dark:text-purple-200 mb-1">訂單管理</p>
                              <p className="text-purple-600 dark:text-purple-300">"顯示所有未完工的生產訂單"</p>
                            </button>
                            <button
                              onClick={() => setInput('哪個客戶的膠囊訂單最多？')}
                              className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">客戶分析</p>
                              <p className="text-blue-600 dark:text-blue-300">"哪個客戶的膠囊訂單最多？"</p>
                            </button>
                            <button
                              onClick={() => setInput('最近一週的膠囊生產情況如何？')}
                              className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-green-800 dark:text-green-200 mb-1">生產統計</p>
                              <p className="text-green-600 dark:text-green-300">"最近一週的膠囊生產情況如何？"</p>
                            </button>
                            <button
                              onClick={() => setInput('分析膠囊灌裝的生產效率')}
                              className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">效率分析</p>
                              <p className="text-orange-600 dark:text-orange-300">"分析膠囊灌裝的生產效率"</p>
                            </button>
                          </>
                        )}
                        {pageData?.currentPage === '/orders' && (
                          <>
                            <button
                              onClick={() => setInput('篩選未完工的膠囊訂單')}
                              className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-purple-800 dark:text-purple-200 mb-1">訂單篩選</p>
                              <p className="text-purple-600 dark:text-purple-300">"篩選未完工的膠囊訂單"</p>
                            </button>
                            <button
                              onClick={() => setInput('按客戶分組顯示膠囊訂單')}
                              className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">客戶分組</p>
                              <p className="text-blue-600 dark:text-blue-300">"按客戶分組顯示膠囊訂單"</p>
                            </button>
                            <button
                              onClick={() => setInput('找出生產數量最多的膠囊訂單')}
                              className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-green-800 dark:text-green-200 mb-1">數量分析</p>
                              <p className="text-green-600 dark:text-green-300">"找出生產數量最多的膠囊訂單"</p>
                            </button>
                            <button
                              onClick={() => setInput('顯示有製程問題的膠囊訂單')}
                              className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">問題分析</p>
                              <p className="text-orange-600 dark:text-orange-300">"顯示有製程問題的膠囊訂單"</p>
                            </button>
                          </>
                        )}
                        {pageData?.currentPage === '/orders/new' && (
                          <>
                            <button
                              onClick={() => setInput('膠囊規格如何選擇？')}
                              className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-purple-800 dark:text-purple-200 mb-1">規格選擇</p>
                              <p className="text-purple-600 dark:text-purple-300">"膠囊規格如何選擇？"</p>
                            </button>
                            <button
                              onClick={() => setInput('膠囊原料配比有什麼建議？')}
                              className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">配比建議</p>
                              <p className="text-blue-600 dark:text-blue-300">"膠囊原料配比有什麼建議？"</p>
                            </button>
                            <button
                              onClick={() => setInput('膠囊生產數量如何計算？')}
                              className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-green-800 dark:text-green-200 mb-1">數量計算</p>
                              <p className="text-green-600 dark:text-green-300">"膠囊生產數量如何計算？"</p>
                            </button>
                            <button
                              onClick={() => setInput('膠囊大小和顏色搭配指南')}
                              className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-3 rounded-lg text-left transition-colors cursor-pointer"
                            >
                              <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">搭配指南</p>
                              <p className="text-orange-600 dark:text-orange-300">"膠囊大小和顏色搭配指南"</p>
                            </button>
                          </>
                        )}
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
                              <p className="whitespace-pre-wrap text-white">{message.content}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content)}
                              className="text-xs opacity-70 hover:opacity-100 text-white hover:text-white"
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
                
                {/* 正在回答的提示 */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI 正在思考中...</span>
                      </div>
                    </div>
                  </div>
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