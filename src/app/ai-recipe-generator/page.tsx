'use client'

import { useState } from 'react'
import { LiquidGlassNav } from '@/components/ui/liquid-glass-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { AIRecipeRequest, AIRecipeResponse } from '@/types/v2-types'
import { Sparkles, Loader2, Copy, RefreshCw, MessageCircle, Send } from 'lucide-react'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { AIDisclaimer } from '@/components/ui/ai-disclaimer'
import Link from 'next/link'

export default function AIRecipeGeneratorPage() {
  const [formData, setFormData] = useState<AIRecipeRequest>({
    targetEffect: '',
    targetAudience: '一般成人',
    dosageForm: 'capsule',
    budget: '',
    enableReasoning: false
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<AIRecipeResponse['recipe'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isChatMode, setIsChatMode] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/recipe-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedRecipe(result.recipe)
      } else {
        setError(result.error || '配方生成失敗')
      }
    } catch (err) {
      setError('網絡錯誤，請稍後再試')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (generatedRecipe?.content) {
      try {
        await navigator.clipboard.writeText(generatedRecipe.content)
        // 可以在這裡添加複製成功的提示
      } catch (err) {
        console.error('複製失敗:', err)
      }
    }
  }

  const handleRegenerate = () => {
    setGeneratedRecipe(null)
    handleSubmit(new Event('submit') as any)
  }

  const handleStartChat = () => {
    setIsChatMode(true)
    setChatMessages([
      {
        role: 'assistant',
        content: `您好！我是您的 AI 膠囊配方助手。我已經為您生成了「${formData.targetEffect}」的膠囊配方。\n\n作為膠囊灌裝工廠，您可以告訴我如何優化這個配方，例如：\n- 調整膠囊規格（顏色、大小、材料）\n- 優化原料配比和劑量\n- 降低每粒成本\n- 提高生產效率\n- 改善產品穩定性\n- 調整建議售價\n- 優化包裝方案\n\n請描述您的具體需求，我會為您提供專業的膠囊工廠優化建議！`
      }
    ])
    
    // 滾動到聊天框
    setTimeout(() => {
      const chatElement = document.getElementById('ai-chat-container')
      if (chatElement) {
        chatElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }
    }, 100)
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setIsChatLoading(true)

    // 添加用戶消息
    const newMessages = [...chatMessages, { role: 'user' as const, content: userMessage }]
    setChatMessages(newMessages)

    try {
      const response = await fetch('/api/ai/recipe-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            currentRecipe: generatedRecipe,
            originalRequest: formData
          }
        }),
      })

      const result = await response.json()

      if (result.success) {
        setChatMessages([...newMessages, { role: 'assistant', content: result.message }])
      } else {
        setChatMessages([...newMessages, { role: 'assistant', content: '抱歉，我暫時無法回應。請稍後再試。' }])
      }
    } catch (err) {
      setChatMessages([...newMessages, { role: 'assistant', content: '抱歉，發生了網絡錯誤。請稍後再試。' }])
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen brand-logo-pattern-bg">
      <LiquidGlassNav />
      
      <div className="container mx-auto px-4 pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* 頁面標題 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              💊 AI 膠囊配方生成器
            </h1>
            <p className="text-lg text-gray-600">
              專為膠囊灌裝工廠設計，智能生成專業配方並提供成本分析
            </p>
          </div>

          {/* 表單區域 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated mb-8">
            <div className="liquid-glass-content">
              <div className="flex items-center space-x-3 mb-6">
                <div className="icon-container icon-container-blue">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">膠囊配方需求</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目標功效 *
                  </label>
                  <Input
                    value={formData.targetEffect}
                    onChange={(e) => setFormData({ ...formData, targetEffect: e.target.value })}
                    placeholder="例如：提升免疫力、改善睡眠、增強記憶力"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      目標受眾
                    </label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="一般成人">一般成人</SelectItem>
                        <SelectItem value="中老年人">中老年人</SelectItem>
                        <SelectItem value="上班族">上班族</SelectItem>
                        <SelectItem value="學生">學生</SelectItem>
                        <SelectItem value="運動員">運動員</SelectItem>
                        <SelectItem value="孕婦">孕婦</SelectItem>
                        <SelectItem value="兒童">兒童</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      劑型
                    </label>
                    <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                      <span className="flex items-center">
                        <span className="mr-2">💊</span>
                        膠囊（固定）
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    每粒成本限制（可選）
                  </label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="例如：每粒成本不超過 HK$2.00，建議售價 HK$8.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    請輸入每粒成本限制，系統會據此優化配方並建議售價
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableReasoning"
                    checked={formData.enableReasoning}
                    onChange={(e) => setFormData({ ...formData, enableReasoning: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="enableReasoning" className="text-sm text-gray-700">
                    啟用深度思考模式（回應時間較長但質量更高）
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating || !formData.targetEffect}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      生成配方
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>

          {/* 錯誤提示 */}
          {error && (
            <Card className="liquid-glass-card liquid-glass-card-warning mb-8">
              <div className="liquid-glass-content">
                <div className="flex items-center space-x-3">
                  <div className="icon-container icon-container-red">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* 生成中狀態 */}
          {isGenerating && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <div className="liquid-glass-content">
                <div className="text-center py-12">
                  <div className="icon-container icon-container-blue mx-auto mb-6">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    🤖 AI 正在生成配方...
                  </h3>
                  <div className="space-y-3 text-gray-600">
                    <p>正在分析您的需求...</p>
                    <div className="flex justify-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm">這可能需要 10-30 秒，請耐心等待...</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 生成結果 */}
          {generatedRecipe && !isGenerating && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <div className="liquid-glass-content">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="icon-container icon-container-green">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">生成的配方</h2>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-4 w-4" />
                      <span>複製</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={isGenerating}
                      className="flex items-center space-x-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>重新生成</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartChat}
                      className="flex items-center space-x-1"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>繼續對話</span>
                    </Button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <MarkdownRenderer content={generatedRecipe.content} />
                </div>

                {/* 免責條款 */}
                <div className="mt-6">
                  <AIDisclaimer type="recipe" />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">配方 ID:</span>
                      <span className="ml-2 text-gray-800">{generatedRecipe.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">生成時間:</span>
                      <span className="ml-2 text-gray-800">
                        {new Date(generatedRecipe.createdAt).toLocaleString('zh-TW')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">狀態:</span>
                      <span className="ml-2 text-green-600">已保存</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 聊天界面 */}
          {isChatMode && (
            <Card id="ai-chat-container" className="liquid-glass-card liquid-glass-card-elevated mt-6">
              <div className="liquid-glass-content">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="icon-container icon-container-blue">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">AI 配方助手</h2>
                </div>

                {/* 聊天消息 */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3xl p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="prose prose-sm max-w-none">
                          <MarkdownRenderer content={message.content} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>AI 正在思考...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 聊天輸入 */}
                <form onSubmit={handleChatSubmit} className="flex space-x-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="請描述您希望如何修改配方..."
                    className="flex-1"
                    disabled={isChatLoading}
                  />
                  <Button type="submit" disabled={isChatLoading || !chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChatMode(false)}
                    className="text-gray-600"
                  >
                    關閉對話
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 公司信息 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Easy Health</h3>
              <p className="text-gray-400 text-sm mb-4">
                專業的保健品膠囊生產管理解決方案
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💊</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🏭</span>
                </div>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
            </div>

            {/* 主要功能 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">主要功能</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/orders" className="hover:text-white transition-colors">訂單管理</Link></li>
                <li><Link href="/ai-recipe-generator" className="hover:text-white transition-colors">AI 配方生成</Link></li>
                <li><Link href="/work-orders" className="hover:text-white transition-colors">工作單生成</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">返回首頁</Link></li>
              </ul>
            </div>

            {/* 系統功能 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">系統功能</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/orders/new" className="hover:text-white transition-colors">新建訂單</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">登入系統</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">系統首頁</Link></li>
                <li><Link href="/login?logout=true" className="hover:text-white transition-colors">安全登出</Link></li>
              </ul>
            </div>

            {/* 技術支援 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">技術支援</h3>
              <div className="text-sm text-gray-400">
                <p className="mb-2">系統管理員：Victor</p>
                <p className="mb-2">版本：v2.0</p>
                <p className="mb-4">最後更新：2025年9月29日</p>
                <div className="flex space-x-2">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">在線</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">AI 驅動</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Easy Health 膠囊管理系統. 保留所有權利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
