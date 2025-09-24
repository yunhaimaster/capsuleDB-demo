'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ParsedIngredient {
  materialName: string
  unitContentMg: number
}

interface BulkIngredientsImportProps {
  onImport: (ingredients: ParsedIngredient[]) => void
}

export function BulkIngredientsImport({ onImport }: BulkIngredientsImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])

  const parseIngredients = (text: string): ParsedIngredient[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const ingredients: ParsedIngredient[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // 支援多種格式的正則表達式
      const patterns = [
        // 格式1: "原料名稱 數量mg" 或 "原料名稱 數量 mg"
        /^(.+?)\s+(\d+(?:\.\d+)?)\s*mg?\s*$/i,
        // 格式2: "原料名稱: 數量mg" 或 "原料名稱：數量mg"
        /^(.+?)[：:]\s*(\d+(?:\.\d+)?)\s*mg?\s*$/i,
        // 格式3: "原料名稱 - 數量mg"
        /^(.+?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*mg?\s*$/i,
        // 格式4: "數量mg 原料名稱"
        /^(\d+(?:\.\d+)?)\s*mg?\s+(.+)$/i,
        // 格式5: "原料名稱 (數量mg)"
        /^(.+?)\s*\((\d+(?:\.\d+)?)\s*mg?\s*\)$/i,
        // 格式6: 用逗號分隔 "原料名稱, 數量mg"
        /^(.+?),\s*(\d+(?:\.\d+)?)\s*mg?\s*$/i,
        // 格式7: 用制表符分隔
        /^(.+?)\t+(\d+(?:\.\d+)?)\s*mg?\s*$/i,
        // 格式8: "原料名稱 數量" (沒有mg單位)
        /^(.+?)\s+(\d+(?:\.\d+)?)$/ 
      ]

      let matched = false
      for (const pattern of patterns) {
        const match = trimmedLine.match(pattern)
        if (match) {
          let materialName: string
          let amount: number

          // 對於格式4 (數量在前)，需要調換順序
          if (pattern === patterns[3]) {
            materialName = match[2].trim()
            amount = parseFloat(match[1])
          } else {
            materialName = match[1].trim()
            amount = parseFloat(match[2])
          }

          if (materialName && !isNaN(amount) && amount > 0) {
            ingredients.push({
              materialName,
              unitContentMg: amount
            })
            matched = true
            break
          }
        }
      }

      if (!matched) {
        errors.push(`第 ${index + 1} 行無法解析: "${trimmedLine}"`)
      }
    })

    setParseErrors(errors)
    return ingredients
  }

  const handleTextChange = (text: string) => {
    setInputText(text)
    if (text.trim()) {
      const parsed = parseIngredients(text)
      setParsedIngredients(parsed)
    } else {
      setParsedIngredients([])
      setParseErrors([])
    }
  }

  const handleImport = () => {
    if (parsedIngredients.length > 0) {
      onImport(parsedIngredients)
      setIsOpen(false)
      setInputText('')
      setParsedIngredients([])
      setParseErrors([])
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setInputText('')
    setParsedIngredients([])
    setParseErrors([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          批量導入
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            批量導入原料配方
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 說明 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">支援的格式：</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• 維生素C 500mg</li>
                  <li>• 維生素E: 200mg</li>
                  <li>• 鈣質 - 300mg</li>
                  <li>• 100mg 維生素D</li>
                  <li>• 鎂 (250mg)</li>
                  <li>• 鐵質, 18mg</li>
                  <li>• 鋅	15mg (制表符分隔)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  每行一個原料，系統會自動識別原料名稱和含量
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* 輸入區域 */}
          <div className="space-y-2">
            <Label htmlFor="bulk-input">貼上原料列表</Label>
            <Textarea
              id="bulk-input"
              placeholder="請貼上原料列表，每行一個原料&#10;例如：&#10;維生素C 500mg&#10;維生素E: 200mg&#10;鈣質 - 300mg"
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          {/* 解析結果 */}
          {(parsedIngredients.length > 0 || parseErrors.length > 0) && (
            <div className="space-y-4">
              {/* 成功解析的原料 */}
              {parsedIngredients.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        成功解析 {parsedIngredients.length} 個原料
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {parsedIngredients.map((ingredient, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <span className="font-medium">{ingredient.materialName}</span>
                          <span className="text-sm text-muted-foreground">
                            {ingredient.unitContentMg} mg
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 解析錯誤 */}
              {parseErrors.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-600">
                        解析失敗 {parseErrors.length} 行
                      </span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {parseErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button 
              type="button" 
              onClick={handleImport}
              disabled={parsedIngredients.length === 0}
            >
              導入 {parsedIngredients.length} 個原料
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
