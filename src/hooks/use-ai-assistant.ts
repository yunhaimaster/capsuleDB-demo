'use client'

import { useState, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface InitialAssistantMessage {
  content: string
  suggestions?: string[]
}

interface UseAIAssistantProps {
  orders?: any[]
  currentOrder?: any
  context?: any
  initialAssistantMessage?: InitialAssistantMessage | null
  enableReasoning?: boolean
}

const DEFAULT_INITIAL_ASSISTANT: InitialAssistantMessage = {
  content: '您好！我是 Easy Health AI 助手，專門協助您分析膠囊配方和生產工藝。請選擇以下問題開始，或直接輸入您的問題：',
  suggestions: [
    '分析配方成分堆積密度，計算粉劑容積，對比膠囊殼容積，評估填充可行性並提供建議。',
    '分析原料流動性、黏性、結塊風險，評估製粒必要性（0-100分），推薦流動性改善輔料及用量。',
    '分析成分顏色混合效果，預測粉劑顏色，評估膠囊染色風險（0-100分）及預防措施。',
    '分析配方在港陸歐美的法規合規性，提供申報要求、標籤規範、成分限量清單。'
  ]
}

const buildAssistantMessage = (config?: InitialAssistantMessage | null): Message | null => {
  if (config === null) return null

  const resolvedConfig = config ?? DEFAULT_INITIAL_ASSISTANT

  return {
    id: 'welcome',
    role: 'assistant',
    content: resolvedConfig.content,
    suggestions: resolvedConfig.suggestions ?? [],
    timestamp: new Date()
  }
}

export function useAIAssistant({ orders = [], currentOrder, context, initialAssistantMessage, enableReasoning = false }: UseAIAssistantProps) {
  const initialMessage = buildAssistantMessage(initialAssistantMessage)
  const [messages, setMessages] = useState<Message[]>(() => (initialMessage ? [initialMessage] : []))
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[][]>([])
  const [currentChatIndex, setCurrentChatIndex] = useState(-1)
  const [lastUserMessage, setLastUserMessage] = useState<string>('') // 儲存最後一個用戶消息
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async (retryMessage?: string) => {
    const messageToSend = retryMessage || input.trim()
    if (!messageToSend || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    // 儲存最後一個用戶消息（用於重試）
    if (!retryMessage) {
      setLastUserMessage(messageToSend)
    }

    const assistantMessageId = `assistant-${Date.now() + 1}`
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      suggestions: []
    }

    setMessages(prev => [...prev, userMessage, assistantPlaceholder])
    if (!retryMessage) {
      setInput('')
    }
    setIsLoading(true)

    const appendAssistantContent = (chunk: string) => {
      if (!chunk) return
      setMessages(prev => prev.map(message => {
        if (message.id === assistantMessageId) {
          return {
            ...message,
            content: (message.content || '') + chunk
          }
        }
        return message
      }))
    }

    const setAssistantSuggestions = (suggestions: string[]) => {
      if (!Array.isArray(suggestions)) return
      setMessages(prev => prev.map(message => {
        if (message.id === assistantMessageId) {
          return {
            ...message,
            suggestions
          }
        }
        return message
      }))
    }

    const handleErrorState = (errorMessage?: string) => {
      const fallback = errorMessage || '抱歉，AI 助手暫時無法回應。這可能是網路連線問題或服務暫時不可用。\n\n您可以點擊下方「重試」按鈕再次嘗試。'
      setMessages(prev => prev.map(message => {
        if (message.id === assistantMessageId) {
          return {
            ...message,
            content: fallback,
            suggestions: ['重試'] // 只提供重試選項
          }
        }
        return message
      }))
    }

    const scrollToBottom = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }

    const parseSSEEvent = (rawEvent: string): { event?: string; data?: string } => {
      const lines = rawEvent.split('\n')
      let eventName: string | undefined
      const dataLines: string[] = []

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (trimmed.startsWith('event:')) {
          eventName = trimmed.slice(6).trim()
        } else if (trimmed.startsWith('data:')) {
          dataLines.push(trimmed.slice(5).trim())
        }
      }

      return {
        event: eventName,
        data: dataLines.length > 0 ? dataLines.join('\n') : undefined
      }
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          orders: orders,
          context: context,
          enableReasoning: enableReasoning
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('AI 助手暫時無法回應')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let streamCompleted = false

      while (!streamCompleted) {
        const { value, done } = await reader.read()
        if (done) {
          buffer += decoder.decode()
        } else if (value) {
          buffer += decoder.decode(value, { stream: true })
        }

        let eventBoundary = buffer.indexOf('\n\n')
        while (eventBoundary !== -1) {
          const rawEvent = buffer.slice(0, eventBoundary)
          buffer = buffer.slice(eventBoundary + 2)
          const { event, data } = parseSSEEvent(rawEvent)

          if (event === 'delta' && data) {
            try {
              const textChunk = JSON.parse(data)
              if (typeof textChunk === 'string') {
                appendAssistantContent(textChunk)
                scrollToBottom()
              }
            } catch (err) {
              console.error('解析 delta 事件失敗:', err)
            }
          } else if (event === 'suggestions' && data) {
            try {
              const suggestions = JSON.parse(data)
              setAssistantSuggestions(suggestions)
              scrollToBottom()
            } catch (err) {
              console.error('解析 suggestions 事件失敗:', err)
            }
          } else if (event === 'error' && data) {
            streamCompleted = true
            try {
              const errorPayload = JSON.parse(data)
              handleErrorState(errorPayload?.error)
            } catch (err) {
              handleErrorState()
            }
          } else if (event === 'done') {
            streamCompleted = true
          }

          eventBoundary = buffer.indexOf('\n\n')
        }

        if (done) {
          streamCompleted = true
        }
      }

      if (buffer.trim().length > 0) {
        const { event, data } = parseSSEEvent(buffer)
        if (event === 'delta' && data) {
          try {
            const textChunk = JSON.parse(data)
            if (typeof textChunk === 'string') {
              appendAssistantContent(textChunk)
            }
          } catch (err) {
            console.error('解析最終 delta 事件失敗:', err)
          }
        } else if (event === 'suggestions' && data) {
          try {
            const suggestions = JSON.parse(data)
            setAssistantSuggestions(suggestions)
          } catch (err) {
            console.error('解析最終 suggestions 事件失敗:', err)
          }
        } else if (event === 'error' && data) {
          try {
            const errorPayload = JSON.parse(data)
            handleErrorState(errorPayload?.error)
          } catch (err) {
            handleErrorState()
          }
        }
      }
    } catch (error) {
      console.error('AI 助手錯誤:', error)
      handleErrorState()
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    const currentWelcome = buildAssistantMessage(initialAssistantMessage)
    setMessages(currentWelcome ? [currentWelcome] : [])
    setShowSettings(false)
  }

  const startNewChat = () => {
    if (messages.length > 0) {
      const newHistory = [...chatHistory, messages]
      setChatHistory(newHistory)
      setCurrentChatIndex(newHistory.length - 1)
    }
    const currentWelcome = buildAssistantMessage(initialAssistantMessage)
    setMessages(currentWelcome ? [currentWelcome] : [])
    setShowSettings(false)
  }

  const loadChatHistory = (index: number) => {
    if (index >= 0 && index < chatHistory.length) {
      setMessages(chatHistory[index])
      setCurrentChatIndex(index)
    }
  }

  const deleteChatHistory = (index: number) => {
    const newHistory = chatHistory.filter((_, i) => i !== index)
    setChatHistory(newHistory)
    if (currentChatIndex === index) {
      setMessages([])
      setCurrentChatIndex(-1)
    } else if (currentChatIndex > index) {
      setCurrentChatIndex(currentChatIndex - 1)
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const exportConversation = () => {
    const conversation = messages.map(msg => {
      const role = msg.role === 'user' ? '用戶' : 'AI 助手'
      return `${role}: ${msg.content}`
    }).join('\n\n')
    
    const blob = new Blob([conversation], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI對話記錄_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const retryLastMessage = () => {
    if (lastUserMessage) {
      // Remove the last assistant message (error message)
      setMessages(prev => prev.filter(msg => !msg.content.includes('抱歉，AI 助手暫時無法回應')))
      handleSendMessage(lastUserMessage)
    }
  }

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    isMinimized,
    showSettings,
    setShowSettings,
    chatHistory,
    currentChatIndex,
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
  }
}
