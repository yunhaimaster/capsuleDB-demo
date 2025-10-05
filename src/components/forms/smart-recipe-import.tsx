'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getGlassBadgeTone, getGlassCardTone } from '@/lib/ui/glass-tones'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
import Image from 'next/image'
import { formatNumber } from '@/lib/utils'
import { AIPoweredBadge } from '@/components/ui/ai-powered-badge'

interface ParsedIngredient {
  materialName: string
  unitContentMg: number
  originalText: string
  needsConfirmation: boolean
  isCustomerProvided?: boolean
  isCustomerSupplied?: boolean
}

interface SmartRecipeImportProps {
  onImport: (ingredients: ParsedIngredient[]) => void
  disabled?: boolean
}

export function SmartRecipeImport({ onImport, disabled }: SmartRecipeImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importImage, setImportImage] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([])
  const [parseError, setParseError] = useState('')
  const [parseSummary, setParseSummary] = useState('')
  const [confidence, setConfidence] = useState<'高' | '中' | '低'>('中')
  const [importMode, setImportMode] = useState<'text' | 'image'>('text')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const processImageFile = (file: File) => {
    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片文件')
      return
    }

    // 檢查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('圖片文件大小不能超過 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImportImage(result)
      setImportMode('image')
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      processImageFile(files[0])
    }
  }

  const handleParse = async () => {
    if (importMode === 'text' && !importText.trim()) {
      setParseError('請輸入要解析的配方文字')
      return
    }
    
    if (importMode === 'image' && !importImage) {
      setParseError('請上傳要解析的配方圖片')
      return
    }

    setIsParsing(true)
    setParseError('')
    setParsedIngredients([])

    try {
      console.log('開始解析配方:', importMode === 'text' ? importText.trim() : '圖片模式')
      
      const response = await fetch('/api/ai/parse-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: importMode === 'text' ? importText.trim() : undefined,
          image: importMode === 'image' ? importImage : undefined
        }),
      })

      console.log('API 回應狀態:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API 錯誤回應:', errorData)
        throw new Error(errorData.error || `解析失敗 (${response.status})`)
      }

      const data = await response.json()
      console.log('API 回應數據:', data)
      
      if (data.success && data.data) {
        const ingredients = (data.data.ingredients || []).map((ingredient: ParsedIngredient) => ({
          ...ingredient,
          isCustomerProvided: ingredient.isCustomerProvided ?? true,
          isCustomerSupplied: ingredient.isCustomerSupplied ?? false
        }))
        console.log('解析到的原料:', ingredients)
        
        if (ingredients.length === 0) {
          throw new Error('未能解析到任何原料，請檢查配方格式')
        }
        
        setParsedIngredients(ingredients)
        setParseSummary(data.data.summary || '')
        setConfidence(data.data.confidence || '中')
      } else {
        throw new Error(data.error || '解析失敗')
      }
    } catch (error) {
      console.error('解析錯誤:', error)
      setParseError(error instanceof Error ? error.message : '解析失敗，請稍後再試')
    } finally {
      setIsParsing(false)
    }
  }

  const handleConfirmImport = () => {
    if (parsedIngredients.length > 0) {
      try {
        console.log('確認導入原料:', parsedIngredients)
        onImport(parsedIngredients)
        
        // 延遲關閉對話框，確保導入完成
        setTimeout(() => {
          setIsOpen(false)
          setImportText('')
          setParsedIngredients([])
          setParseError('')
          setParseSummary('')
        }, 100)
      } catch (error) {
        console.error('導入確認時發生錯誤:', error)
        setParseError('導入失敗，請重試')
      }
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setImportText('')
    setImportImage(null)
    setImportMode('text')
    setParsedIngredients([])
    setParseError('')
    setParseSummary('')
  }

  const resolveConfidenceBadge = (confidence: '低' | '中' | '高' | '未知') => {
    if (confidence === '高') return getGlassBadgeTone('positive')
    if (confidence === '中') return getGlassBadgeTone('caution')
    if (confidence === '低') return getGlassBadgeTone('negative')
    return getGlassBadgeTone('neutral')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled}
          className="w-full sm:w-auto"
        >
          <Upload className="w-4 h-4 mr-2" />
          智能導入配方
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            智能配方導入
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 模式選擇 */}
          <Card className="liquid-glass-card liquid-glass-card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">選擇導入方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={importMode === 'text' ? 'default' : 'outline'}
                  onClick={() => setImportMode('text')}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  文字輸入
                </Button>
                <Button
                  variant={importMode === 'image' ? 'default' : 'outline'}
                  onClick={() => setImportMode('image')}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  圖片上傳
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 文字輸入區域 */}
          {importMode === 'text' && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">輸入配方文字</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-text">配方內容</Label>
                  <Textarea
                    id="import-text"
                    placeholder="請貼上配方文字，例如：&#10;維生素C: 500mg&#10;維生素D3: 1000IU&#10;鈣: 200mg&#10;鎂: 100mg&#10;鋅: 15mg"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="min-h-[120px]"
                    disabled={isParsing}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleParse} 
                    disabled={isParsing || !importText.trim()}
                    className="ripple-effect btn-micro-hover micro-brand-glow flex-1"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 micro-loading" />
                        解析中...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2 icon-micro-bounce" />
                        解析配方
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 圖片上傳區域 */}
          {importMode === 'image' && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">上傳配方圖片</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-image">配方圖片</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDrop={handleDrop}
                  >
                    {importImage ? (
                      <div className="space-y-4">
                        <Image
                          src={importImage}
                          alt="配方圖片預覽"
                          width={512}
                          height={512}
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm object-contain"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImportImage(null)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            重新選擇
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" aria-hidden="true" />
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            點擊選擇圖片或拖拽到此處
                          </p>
                          <p className="text-xs text-gray-500">
                            支援 JPG、PNG、GIF 格式，最大 10MB
                          </p>
                        </div>
                        <input
                          id="import-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('import-image')?.click()}
                        >
                        <ImageIcon className="w-4 h-4 mr-2" />
                          選擇圖片
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleParse} 
                    disabled={isParsing || !importImage}
                    className="ripple-effect btn-micro-hover micro-brand-glow flex-1"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 micro-loading" />
                        解析中...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2 icon-micro-bounce" />
                        解析圖片
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 錯誤提示 */}
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {/* 解析中狀態 */}
          {isParsing && (
            <Card className="liquid-glass-card liquid-glass-card-elevated">
              <CardHeader>
                <div className="skeleton skeleton-title"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 skeleton-stagger">
                  <div className="skeleton skeleton-table-row"></div>
                  <div className="skeleton skeleton-table-row"></div>
                  <div className="skeleton skeleton-table-row"></div>
                  <div className="skeleton skeleton-table-row"></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 解析結果 */}
          {parsedIngredients.length > 0 && !isParsing && (
            <Card tone="positive" className="liquid-glass-card liquid-glass-card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">導入結果</CardTitle>
                    <AIPoweredBadge variant="minimal" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={resolveConfidenceBadge(confidence)}>
                      信心度: {confidence}
                    </Badge>
                    <Badge variant="outline">
                      {parsedIngredients.length} 種原料
                    </Badge>
                  </div>
                </div>
                {parseSummary && (
                  <p className="text-sm text-muted-foreground">{parseSummary}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {parsedIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className={`rounded-xl px-4 py-3 transition-colors ${getGlassCardTone(
                        ingredient.needsConfirmation ? 'caution' : 'positive'
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ingredient.materialName}</span>
                            {ingredient.needsConfirmation && (
                              <Badge variant="outline" className="text-xs">
                                需確認
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            含量: {formatNumber(ingredient.unitContentMg)} mg
                          </div>
                          {ingredient.originalText && (
                            <div className="text-xs text-muted-foreground mt-1">
                              原始: {ingredient.originalText}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {ingredient.needsConfirmation ? (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按鈕 */}
          {parsedIngredients.length > 0 && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button onClick={handleConfirmImport}>
                確認導入
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
