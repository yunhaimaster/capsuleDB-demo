'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Languages } from 'lucide-react'

interface TranslateButtonProps {
  onTranslate: (translatedText: string) => void
  className?: string
}

export function TranslateButton({ onTranslate, className }: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    setIsTranslating(true)
    
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: '請提供要翻譯的文字'
        }),
      })

      if (!response.ok) {
        throw new Error('翻譯服務暫時無法使用')
      }

      const data = await response.json()
      
      if (data.success) {
        onTranslate(data.translatedText)
      } else {
        throw new Error(data.error || '翻譯失敗')
      }
    } catch (error) {
      console.error('Translation error:', error)
      alert('翻譯失敗，請稍後再試')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleTranslate}
      disabled={isTranslating}
      className={className}
      title="使用 AI 將簡體中文轉換為繁體中文"
    >
      {isTranslating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Languages className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isTranslating ? '翻譯中...' : '繁轉'}
      </span>
    </Button>
  )
}
