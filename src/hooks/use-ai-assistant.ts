'use client'

import { useState, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
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
  const [isThinking, setIsThinking] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[][]>([])
  const [currentChatIndex, setCurrentChatIndex] = useState(-1)
  const [lastUserMessage, setLastUserMessage] = useState<string>('') // 儲存最後一個用戶消息
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async (retryMessage?: string) => {
    let messageToSend = retryMessage || input.trim()
    if (!messageToSend || isLoading) return

    // 處理特殊建議的展開
    if (messageToSend === '分析填充可行性') {
      messageToSend = `請依下列步驟，評估配方是否能裝入指定的膠囊（僅限 00 號、0 號或 1 號，使用者會指定其中一種）：

**原料分析**
對配方中每個原料，請主動查找並提供具體的堆積密度數值（g/cm³）。如果原料名稱明確，請根據原料特性提供合理的堆積密度估算值，不要只寫「假設值/參考值」，而要給出實際的數值範圍。

**單一原料體積計算**
使用公式 體積 = 重量 ÷ 堆積密度 計算每個原料的體積。

**混合總體積**
將所有原料體積加總，得到混合物的理論體積。請註明這是假設直接相加，不考慮壓縮效果或顆粒嵌合。

**膠囊容積對照**
列出指定規格膠囊（00 或 0 或 1）的典型最大填充容積。

**比較與評估**
將混合總體積與膠囊容積比較。判斷該膠囊是否能完全裝下此劑量。

**結論與建議**
若能裝入：指出理論上可行（提醒為估算值，需實驗確認）。
若超過：說明超出多少，並提供建議（如採用更大膠囊、改變配方比例、或考慮製粒/壓縮以增加密度）。`
    } else if (messageToSend === '分析製粒必要性') {
      messageToSend = `請分析原料的流動性、黏性及結塊風險，並給出【製粒必要性評分】，範圍 0–100 分（0 = 完全不需要製粒，100 = 極度需要製粒），同時簡要說明評分理由。

在建議改善流動性的方法時，只能從以下四種輔料中選擇：麥芽糊精、硬脂酸鎂、二氧化硅、微晶纖維素。請根據實際分析決定是否需要推薦輔料，以及推薦哪些輔料，並說明每一種的建議添加比例（佔總配方百分比）及其作用機制。

最後，假設依照上述輔料建議進行配方改善，請重新評估【改善後的製粒必要性評分】，同樣以 0–100 分表示，並解釋與改善前的差異。`
    }

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
      reasoning: '',
      timestamp: new Date(),
      suggestions: []
    }

    setMessages(prev => [...prev, userMessage, assistantPlaceholder])
    if (!retryMessage) {
      setInput('')
    }
    setIsLoading(true)
    setIsThinking(true)

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

    const appendAssistantReasoning = (chunk: string) => {
      if (!chunk) return
      setMessages(prev => prev.map(message => {
        if (message.id === assistantMessageId) {
          return {
            ...message,
            reasoning: (message.reasoning || '') + chunk
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

          if (event === 'reasoning' && data) {
            try {
              const reasoningChunk = JSON.parse(data)
              if (typeof reasoningChunk === 'string') {
                appendAssistantReasoning(reasoningChunk)
                scrollToBottom()
              }
            } catch (err) {
              console.error('解析 reasoning 事件失敗:', err)
            }
          } else if (event === 'delta' && data) {
            try {
              const textChunk = JSON.parse(data)
              if (typeof textChunk === 'string') {
                appendAssistantContent(textChunk)
                setIsThinking(false) // 開始接收內容時停止思考狀態
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
        if (event === 'reasoning' && data) {
          try {
            const reasoningChunk = JSON.parse(data)
            if (typeof reasoningChunk === 'string') {
              appendAssistantReasoning(reasoningChunk)
            }
          } catch (err) {
            console.error('解析最終 reasoning 事件失敗:', err)
          }
        } else if (event === 'delta' && data) {
          try {
            const textChunk = JSON.parse(data)
            if (typeof textChunk === 'string') {
              appendAssistantContent(textChunk)
              setIsThinking(false) // 開始接收內容時停止思考狀態
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
      setIsThinking(false)
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
    isThinking,
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
