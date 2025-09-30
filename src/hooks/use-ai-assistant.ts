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
      messageToSend = `請依下列步驟，評估配方是否需要製粒：

**原料性質分析**
分析配方中每個原料的粉體性質，包括流動性、黏性、結塊風險。
若為假設或典型值，請清楚標註。

**製粒必要性評分**
綜合上述結果後，給出【製粒必要性評分】，範圍 0–100 分。
分數含義：
0 = 完全不需要
100 = 極度需要
請解釋給分理由。

**流動性改善方案**
只能從以下可用的輔料中選擇：麥芽糊精、硬脂酸鎂、二氧化硅、微晶纖維素。
推薦是否需要添加輔料，若需要，請提出具體建議（哪些品項、建議添加比例佔配方百分比、改善機制）。

**改善後再評估**
假設已添加建議輔料後，重新給出【製粒必要性評分】（0–100 分）。
比較改善前後的差異，並解釋原因。

**注意事項：**
請以結構化回覆。
建議使用表格或分點敘述，突出「分析 → 分數 → 建議 → 改善後評分」。
此分析僅作配方前期理論參考，最終仍需實驗驗證。`
    } else if (messageToSend === '分析成分顏色與膠囊染色風險') {
      messageToSend = `請依下列步驟，評估配方粉末顏色及對指定膠囊的染色風險：

**原料顏色分析**
對每個原料描述其典型顏色或外觀特徵。
若無確切顏色資料，請提供常見或假設的顏色，並清楚標註「假設值／參考值」。

**混合顏色預測**
根據比例及顏色特徵，推估混合後粉劑的整體顏色（例如傾向淺黃、淡灰、褐色等）。

**膠囊染色風險評估**
依據原料顏色深淺、是否含色素、油性成分或吸附性，給出【膠囊染色風險評分】，範圍 0–100 分。
分數含義：
0 = 無染色風險
100 = 極高染色風險
請解釋評分理由。

**預防措施**
提出減低膠囊染色風險的策略，例如選擇合適的內外包材、使用包衣、增加乾燥控制或避免高濕環境。

**結論**
總結粉劑預期外觀與膠囊匹配度，並說明是否需特別製程措施保障外觀一致性。

**注意事項：**
本分析僅為理論預測，實際粉體顏色可能因粒徑、濕度、光照等條件而有所差異，需以實驗驗證。
請使用結構化回覆，建議分段或表格列出：原料顏色 → 混合顏色 → 染色風險評分 → 預防措施。`
    } else if (messageToSend === '分析文件與標籤合規性') {
      messageToSend = `請依下列步驟，檢視產品在指定市場（香港、中國內地、歐美）的文件與標籤要求：

**必要文件清單**
列出客戶需要準備或代工廠需提供的文件，例如：COA、配方表、產地證明、穩定性報告。

**標籤規範**
說明該市場對標籤的基本要求：
必須標註：產品名稱、成分表、含量、食用方法、保存條件、生產批號、有效期、代工廠資訊。
禁止或限制標註：藥效宣傳、誇大療效字眼。

**成分合規性檢查**
比對配方成分與該市場的允許清單、限量要求、禁限用成分。
標註出可能需要調整或替代的成分（若有）。

**文件與標籤風險評估**
給出【合規風險評分】（0–100 分，其中 0 = 完全合規，100 = 風險極高）。
說明評分依據。

**改善建議**
提供修改標籤或補充文件的具體建議，以符合目標市場要求。

**注意：**
此分析僅為初步文件合規建議，最終仍需由法規與法務部門確認。`
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
