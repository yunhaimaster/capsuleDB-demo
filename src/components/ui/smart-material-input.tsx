'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FieldTranslator } from '@/components/ui/field-translator'
import { ChevronDown, X } from 'lucide-react'

interface SmartMaterialInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onTranslate?: (translatedText: string) => void
}

export function SmartMaterialInput({ 
  value, 
  onChange, 
  placeholder = "原料品名", 
  className,
  onTranslate 
}: SmartMaterialInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 獲取歷史原料選項
  const fetchMaterialSuggestions = async (query: string = '') => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders/options?ingredientName=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.ingredientOptions || [])
      }
    } catch (error) {
      console.error('Error fetching material suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    
    if (newValue.trim()) {
      fetchMaterialSuggestions(newValue)
      setIsOpen(true)
    } else {
      setIsOpen(false)
      setSuggestions([])
    }
  }

  // 處理建議選擇
  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion)
    onChange(suggestion)
    setIsOpen(false)
    setSuggestions([])
  }

  // 處理輸入框點擊
  const handleInputClick = () => {
    if (inputValue.trim()) {
      fetchMaterialSuggestions(inputValue)
      setIsOpen(true)
    }
  }

  // 處理輸入框焦點
  const handleInputFocus = () => {
    if (inputValue.trim()) {
      fetchMaterialSuggestions(inputValue)
      setIsOpen(true)
    }
  }

  // 處理輸入框失焦
  const handleInputBlur = (e: React.FocusEvent) => {
    // 延遲關閉，讓用戶可以點擊建議
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 150)
  }

  // 處理鍵盤導航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // 清除輸入
  const handleClear = () => {
    setInputValue('')
    onChange('')
    setIsOpen(false)
    setSuggestions([])
  }

  // 同步外部值變化
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pr-8"
          />
          
          {/* 清除按鈕 */}
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          
          {/* 下拉箭頭 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        {/* 翻譯按鈕 */}
        {onTranslate && (
          <FieldTranslator
            value={inputValue}
            onTranslate={onTranslate}
            className="shrink-0"
          />
        )}
      </div>

      {/* 下拉建議列表 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-center text-sm text-gray-500">
              載入中...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion}
              </button>
            ))
          ) : inputValue.trim() ? (
            <div className="p-3 text-center text-sm text-gray-500">
              沒有找到相關原料
            </div>
          ) : (
            <div className="p-3 text-center text-sm text-gray-500">
              輸入原料名稱開始搜尋
            </div>
          )}
        </div>
      )}
    </div>
  )
}
