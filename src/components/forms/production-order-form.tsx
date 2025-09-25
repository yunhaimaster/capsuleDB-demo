'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productionOrderSchema, type ProductionOrderFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Copy, Calculator } from 'lucide-react'
import { FieldTranslator } from '@/components/ui/field-translator'
import { formatNumber, convertWeight, calculateBatchWeight, copyToClipboard } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface ProductionOrderFormProps {
  initialData?: Partial<ProductionOrderFormData>
  orderId?: string
}

export function ProductionOrderForm({ initialData, orderId }: ProductionOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalculations, setShowCalculations] = useState(false)
  const [hasStartedTyping, setHasStartedTyping] = useState(false)

  // 調試：檢查 isSubmitting 狀態
  console.log('isSubmitting state:', isSubmitting)

  // 處理產品名字的智能預填
  const handleProductNameFocus = () => {
    if (!hasStartedTyping && watch('productName') === '未命名產品') {
      setValue('productName', '')
      setHasStartedTyping(true)
    }
  }

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasStartedTyping) {
      setHasStartedTyping(true)
    }
  }

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<ProductionOrderFormData>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      customerName: initialData?.customerName || '',
      productName: initialData?.productName || '未命名產品',
      productionQuantity: initialData?.productionQuantity || 1,
      completionDate: initialData?.completionDate || null,
      processIssues: initialData?.processIssues || '',
      qualityNotes: initialData?.qualityNotes || '',
      capsuleColor: initialData?.capsuleColor || '',
      capsuleSize: initialData?.capsuleSize || null,
      capsuleType: initialData?.capsuleType || null,
      createdBy: initialData?.createdBy || '系統',
      ingredients: initialData?.ingredients || [
        { materialName: '', unitContentMg: 0 }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  })


  const watchedIngredients = watch('ingredients')
  const watchedQuantity = watch('productionQuantity')

  // 計算單粒總重量
  const unitTotalWeight = watchedIngredients.reduce(
    (sum, ingredient) => sum + (ingredient.unitContentMg || 0),
    0
  )

  // 計算批次總重量
  const batchTotalWeight = unitTotalWeight * (watchedQuantity || 1)

  // 計算值不需要設置到表單中，它們會在提交時計算

  const onSubmit = async (data: ProductionOrderFormData) => {
    setIsSubmitting(true)
    try {
      const url = orderId ? `/api/orders/${orderId}` : '/api/orders'
      const method = orderId ? 'PUT' : 'POST'

      console.log('Submitting data:', data) // 調試用

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('Response status:', response.status) // 調試用

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(`儲存失敗: ${errorData.error || '未知錯誤'}`)
      }

      const result = await response.json()
      console.log('Success:', result) // 調試用

      router.push('/orders')
      router.refresh()
    } catch (error) {
      console.error('Error saving order:', error)
      const errorMessage = error instanceof Error ? error.message : '儲存失敗，請重試'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyRecipeToClipboard = async () => {
    const recipeText = watchedIngredients
      .map((ingredient, index) => 
        `${index + 1}. ${ingredient.materialName}: ${ingredient.unitContentMg}mg`
      )
      .join('\n')
    
    const fullText = `配方清單\n${recipeText}\n\n單粒總重量: ${unitTotalWeight.toFixed(3)}mg\n批次總重量: ${convertWeight(batchTotalWeight).display}`
    
    try {
      await copyToClipboard(fullText)
      alert('配方已複製到剪貼簿')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 基本資訊 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <span className="text-blue-600">📝</span>
            基本資訊
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">客戶名稱 *</Label>
              <div className="flex gap-2">
                <Input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="請輸入客戶名稱"
                  className="flex-1"
                />
                <FieldTranslator
                  value={watch('customerName') || ''}
                  onTranslate={(translatedText) => setValue('customerName', translatedText)}
                />
              </div>
              {errors.customerName && (
                <p className="text-sm text-destructive">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">產品名字 *</Label>
              <div className="flex gap-2">
                <Input
                  id="productName"
                  {...register('productName')}
                  placeholder="請輸入產品名字"
                  onFocus={handleProductNameFocus}
                  onChange={(e) => {
                    handleProductNameChange(e)
                    register('productName').onChange(e)
                  }}
                  className="flex-1"
                />
                <FieldTranslator
                  value={watch('productName') || ''}
                  onTranslate={(translatedText) => setValue('productName', translatedText)}
                />
              </div>
              {errors.productName && (
                <p className="text-sm text-destructive">{errors.productName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionQuantity">生產數量 *</Label>
              <Input
                id="productionQuantity"
                type="number"
                {...register('productionQuantity', { valueAsNumber: true })}
                placeholder="請輸入生產數量"
                min="1"
                max="5000000"
              />
              {errors.productionQuantity && (
                <p className="text-sm text-destructive">{errors.productionQuantity.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 膠囊規格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <span className="text-purple-600">💊</span>
            膠囊規格
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capsuleColor">膠囊顏色</Label>
              <Input
                id="capsuleColor"
                {...register('capsuleColor')}
                placeholder="例如：白色、透明、藍色"
              />
              {errors.capsuleColor && (
                <p className="text-sm text-destructive">{errors.capsuleColor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capsuleSize">膠囊大小</Label>
              <Select 
                value={watch('capsuleSize') || ''} 
                onValueChange={(value) => setValue('capsuleSize', value as "#1" | "#0" | "#00")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇膠囊大小" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#1">#1</SelectItem>
                  <SelectItem value="#0">#0</SelectItem>
                  <SelectItem value="#00">#00</SelectItem>
                </SelectContent>
              </Select>
              {errors.capsuleSize && (
                <p className="text-sm text-destructive">{errors.capsuleSize.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capsuleType">膠囊成份</Label>
              <Select 
                value={watch('capsuleType') || ''} 
                onValueChange={(value) => setValue('capsuleType', value as "明膠胃溶" | "植物胃溶" | "明膠腸溶" | "植物腸溶")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇膠囊成份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="明膠胃溶">明膠胃溶</SelectItem>
                  <SelectItem value="植物胃溶">植物胃溶</SelectItem>
                  <SelectItem value="明膠腸溶">明膠腸溶</SelectItem>
                  <SelectItem value="植物腸溶">植物腸溶</SelectItem>
                </SelectContent>
              </Select>
              {errors.capsuleType && (
                <p className="text-sm text-destructive">{errors.capsuleType.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 其他信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <span className="text-green-600">📋</span>
            其他信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="completionDate">完工日期</Label>
            <Input
              id="completionDate"
              type="date"
              {...register('completionDate', { 
                setValueAs: (value) => {
                  if (!value || value === '') return null
                  const date = new Date(value)
                  return isNaN(date.getTime()) ? null : date
                }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="processIssues">製程問題記錄</Label>
            <textarea
              id="processIssues"
              {...register('processIssues')}
              placeholder="記錄生產異常與解決方案"
              className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors.processIssues && (
              <p className="text-sm text-destructive">{errors.processIssues.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualityNotes">品管備註</Label>
            <textarea
              id="qualityNotes"
              {...register('qualityNotes')}
              placeholder="品管相關備註"
              className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors.qualityNotes && (
              <p className="text-sm text-destructive">{errors.qualityNotes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 原料配方 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <span className="text-orange-600">🧪</span>
              <span className="block sm:hidden">原料配方</span>
              <span className="hidden sm:block">原料配方（每粒規格）</span>
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCalculations(!showCalculations)}
              >
                <Calculator className="mr-2 h-4 w-4" />
                {showCalculations ? '隱藏' : '顯示'}計算
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyRecipeToClipboard}
              >
                <Copy className="mr-2 h-4 w-4" />
                複製配方
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 桌面版表格 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>原料品名 *</TableHead>
                  <TableHead>單粒含量 (mg) *</TableHead>
                  {showCalculations && (
                    <>
                      <TableHead>批次用量</TableHead>
                      <TableHead>小計</TableHead>
                    </>
                  )}
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="flex gap-2">
                        <Input
                          {...register(`ingredients.${index}.materialName`)}
                          placeholder="原料品名"
                          className="flex-1"
                          autoComplete="off"
                        />
                        <FieldTranslator
                          value={watch(`ingredients.${index}.materialName`) || ''}
                          onTranslate={(translatedText) => setValue(`ingredients.${index}.materialName`, translatedText)}
                          className="shrink-0"
                        />
                      </div>
                      {errors.ingredients?.[index]?.materialName && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.ingredients[index]?.materialName?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.00001"
                        {...register(`ingredients.${index}.unitContentMg`, { valueAsNumber: true })}
                        placeholder="0.00000"
                      />
                      {errors.ingredients?.[index]?.unitContentMg && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.ingredients[index]?.unitContentMg?.message}
                        </p>
                      )}
                    </TableCell>
                    {showCalculations && (
                      <>
                        <TableCell>
                          {convertWeight(field.unitContentMg * (watchedQuantity || 1)).display}
                        </TableCell>
                        <TableCell>
                          {convertWeight(field.unitContentMg).display}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 手機版卡片佈局 */}
          <div className="block md:hidden space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      原料 #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {/* 原料品名 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">原料品名 *</Label>
                      <div className="flex gap-2">
                        <Input
                          {...register(`ingredients.${index}.materialName`)}
                          placeholder="請輸入原料品名"
                          className="flex-1"
                          autoComplete="off"
                        />
                        <FieldTranslator
                          value={watch(`ingredients.${index}.materialName`) || ''}
                          onTranslate={(translatedText) => setValue(`ingredients.${index}.materialName`, translatedText)}
                          className="shrink-0"
                        />
                      </div>
                      {errors.ingredients?.[index]?.materialName && (
                        <p className="text-sm text-destructive">
                          {errors.ingredients[index]?.materialName?.message}
                        </p>
                      )}
                    </div>

                    {/* 單粒含量 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">單粒含量 (mg) *</Label>
                      <Input
                        type="number"
                        step="0.00001"
                        {...register(`ingredients.${index}.unitContentMg`, { valueAsNumber: true })}
                        placeholder="0.00000"
                        className="w-full"
                        autoComplete="off"
                      />
                      {errors.ingredients?.[index]?.unitContentMg && (
                        <p className="text-sm text-destructive">
                          {errors.ingredients[index]?.unitContentMg?.message}
                        </p>
                      )}
                    </div>

                    {/* 計算結果（僅在顯示計算時） */}
                    {showCalculations && (
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">批次用量</Label>
                          <p className="text-sm font-medium">
                            {convertWeight(field.unitContentMg * (watchedQuantity || 1)).display}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">單位重量</Label>
                          <p className="text-sm font-medium">
                            {convertWeight(field.unitContentMg).display}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ materialName: '', unitContentMg: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              新增原料
            </Button>
          </div>

          {errors.ingredients && (
            <p className="text-sm text-destructive mt-2">
              {errors.ingredients.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 計算結果 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <span className="text-emerald-600">📊</span>
            計算結果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">單粒總重量</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200">
                {unitTotalWeight.toFixed(3)} mg
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">批次總重量</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                {convertWeight(batchTotalWeight).display}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">生產數量</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200">
                {formatNumber(watchedQuantity || 0)} 粒
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按鈕 */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          取消
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isSubmitting ? '儲存中...' : '儲存配方'}
        </Button>
      </div>
    </form>
  )
}