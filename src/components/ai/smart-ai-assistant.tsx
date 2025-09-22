'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog-custom'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Bot, Send, Loader2, X, Eye, FileText, Plus, RotateCcw } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface SmartAIAssistantProps {
  orders?: any[]
  currentOrder?: any
  pageData?: any
}

export function SmartAIAssistant({ orders = [], currentOrder, pageData }: SmartAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  // 根據當前頁面生成上下文信息
  const getPageContext = () => {
    const context = {
      currentPage: pathname,
      timestamp: new Date().toISOString(),
      ordersCount: orders.length,
      hasCurrentOrder: !!currentOrder
    }

    let pageDescription = ''
    let suggestions: string[] = []

    switch (pathname) {
      case '/':
        pageDescription = '首頁 - 系統概覽和最近生產記錄'
        suggestions = [
          '顯示所有未完工的生產訂單',
          '哪個客戶的膠囊訂單最多？',
          '最近一週的膠囊生產情況如何？',
          '分析膠囊灌裝的生產效率'
        ]
        break
      case '/orders':
        pageDescription = '生產記錄管理頁面 - 查看和管理所有膠囊生產訂單'
        suggestions = [
          '篩選未完工的膠囊訂單',
          '按客戶分組顯示膠囊訂單',
          '找出生產數量最多的膠囊訂單',
          '顯示有製程問題的膠囊訂單'
        ]
        break
      case '/orders/new':
        pageDescription = '新增膠囊配方頁面 - 建立新的膠囊生產訂單'
        suggestions = [
          '膠囊規格如何選擇？',
          '膠囊原料配比有什麼建議？',
          '膠囊生產數量如何計算？',
          '膠囊大小和顏色搭配指南'
        ]
        break
      default:
        if (pathname.startsWith('/orders/') && pathname !== '/orders/new') {
          pageDescription = '訂單詳情頁面 - 查看特定膠囊訂單的詳細信息'
          suggestions = [
            '分析這個膠囊訂單的原料配比',
            '評估膠囊單粒重量是否合理',
            '檢查膠囊規格是否合適',
            '提供膠囊生產建議'
          ]
        }
    }

    return {
      ...context,
      pageDescription,
      suggestions,
      currentOrder: currentOrder || null,
      recentOrders: orders.slice(0, 5) // 最近5筆訂單
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const context = getPageContext()
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          orders: orders,
          context: context
        }),
      })

      if (!response.ok) {
        throw new Error('AI 助手暫時無法回應')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，AI 助手暫時無法回應。請稍後再試或聯繫 Victor。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const getPageIcon = () => {
    switch (pathname) {
      case '/':
        return <FileText className="h-4 w-4" />
      case '/orders':
        return <Eye className="h-4 w-4" />
      case '/orders/new':
        return <Plus className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const getPageTitle = () => {
    switch (pathname) {
      case '/':
        return '首頁 AI 助手'
      case '/orders':
        return '生產記錄 AI 助手'
      case '/orders/new':
        return '新增配方 AI 助手'
      default:
        if (pathname.startsWith('/orders/') && pathname !== '/orders/new') {
          return '訂單詳情 AI 助手'
        }
        return '智能 AI 助手'
    }
  }

  const context = getPageContext()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
        >
          {getPageIcon()}
          <span className="ml-2 hidden sm:inline">智能助手</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-blue-600" />
              {getPageTitle()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="h-8 w-8 p-0"
                title="清除對話"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
                title="關閉"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50 text-blue-600" />
              <p className="text-lg font-medium mb-2">智能 AI 助手</p>
              <p className="text-sm mb-4">{context.pageDescription}</p>
              
              {context.currentOrder && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">當前訂單</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    {context.currentOrder.customerName} - {context.currentOrder.productName}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {context.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded-lg text-left transition-colors cursor-pointer"
                  >
                    <p className="text-gray-700 dark:text-gray-300">"{suggestion}"</p>
                  </button>
                ))}
              </div>

              {context.ordersCount > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-300">
                    系統中共有 {context.ordersCount} 筆訂單可供分析
                  </p>
                </div>
              )}
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <MarkdownRenderer content={message.content} />
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI 正在分析當前頁面...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`詢問關於${context.pageDescription}的任何問題...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
