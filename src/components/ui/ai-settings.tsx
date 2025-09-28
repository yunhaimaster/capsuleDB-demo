'use client'

import { useState } from 'react'
import { Settings, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AISettingsProps {
  enableReasoning: boolean
  onToggleReasoning: (enabled: boolean) => void
}

export function AISettings({ enableReasoning, onToggleReasoning }: AISettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
        title="AI 設置"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Settings Panel */}
          <div className="absolute right-0 top-8 z-50 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-xl min-w-[280px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-800">AI 設置</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>

              {/* Reasoning Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">深度推理模式</span>
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableReasoning}
                      onChange={(e) => onToggleReasoning(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Warning Message */}
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-800">
                      <p className="font-medium mb-1">⚠️ 性能影響</p>
                      <p className="leading-relaxed">
                        啟用深度推理模式會：
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>顯著增加回應時間（2-5倍）</li>
                        <li>提供更詳細的分析和推理過程</li>
                        <li>消耗更多 API 配額</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quality Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">💡 質量說明</p>
                    <p className="leading-relaxed">
                      當前設置已針對最高質量優化：
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>32K tokens 極限長度</li>
                      <li>低溫度確保一致性</li>
                      <li>優化的參數配置</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
