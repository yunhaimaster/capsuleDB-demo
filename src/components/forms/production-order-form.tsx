'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productionOrderSchema, type ProductionOrderFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { FieldTranslator } from '@/components/ui/field-translator'
import { SmartRecipeImport } from '@/components/forms/smart-recipe-import'
import { formatNumber, convertWeight, calculateBatchWeight, copyToClipboard } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'

interface ProductionOrderFormProps {
  initialData?: Partial<ProductionOrderFormData>
  orderId?: string
}

export function ProductionOrderForm({ initialData, orderId }: ProductionOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasStartedTyping, setHasStartedTyping] = useState(false)

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
      completionDate: initialData?.completionDate || '',
      processIssues: initialData?.processIssues || '',
      qualityNotes: initialData?.qualityNotes || '',
      capsuleColor: initialData?.capsuleColor || '',
      capsuleSize: initialData?.capsuleSize || null,
      capsuleType: initialData?.capsuleType || null,
      customerService: initialData?.customerService || '',
      ingredients: initialData?.ingredients?.map(ingredient => ({
        ...ingredient,
        isCustomerProvided: ingredient.isCustomerProvided ?? true,
        isCustomerSupplied: ingredient.isCustomerSupplied ?? true
      })) || [
        { materialName: '', unitContentMg: 0, isCustomerProvided: true, isCustomerSupplied: true }
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


  const handleSmartImport = (importedIngredients: any[]) => {
    try {
      console.log('開始導入原料:', importedIngredients)
      
      // 驗證導入的原料數據
      if (!Array.isArray(importedIngredients)) {
        throw new Error('導入數據格式不正確')
      }
      
      // 初始原料：預設為客戶提供
      const newIngredients = importedIngredients.length > 0 
        ? importedIngredients
            .map((ing, index) => {
              const materialName = String(ing.materialName || '').trim()
              const unitContentMg = Number(ing.unitContentMg) || 0
              
              if (!materialName) {
                console.warn(`第 ${index + 1} 個原料名稱為空，跳過`)
                return null
              }
              
              return {
                materialName,
                unitContentMg: Math.max(0, unitContentMg),
                // 導入的配方原料預設視為客戶提供
                isCustomerProvided: true,
                isCustomerSupplied: true
              }
            })
            .filter((item): item is { materialName: string; unitContentMg: number; isCustomerProvided: boolean; isCustomerSupplied: boolean } => item !== null)
        : [{ materialName: '', unitContentMg: 0, isCustomerProvided: true, isCustomerSupplied: true }]
      
      console.log('處理後的原料:', newIngredients)
      
      // 使用 setValue 設置表單值，觸發重新渲染
      setValue('ingredients', newIngredients, { 
        shouldValidate: true,
        shouldDirty: true 
      })
      
      console.log('導入完成，表單已更新')
      
    } catch (error) {
      console.error('導入原料時發生錯誤:', error)
      alert(`導入失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  if (isSubmitting) {
    return (
      <div className="space-y-6 skeleton-stagger">
          {/* Basic Info Skeleton */}
          <Card className="liquid-glass-card liquid-glass-card-subtle">
            <CardHeader>
              <div className="skeleton skeleton-title"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="skeleton skeleton-text-sm"></div>
                  <div className="skeleton skeleton-form-field"></div>
                </div>
                <div className="space-y-2">
                  <div className="skeleton skeleton-text-sm"></div>
                  <div className="skeleton skeleton-form-field"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Capsule Specs Skeleton */}
          <Card className="liquid-glass-card liquid-glass-card-subtle">
            <CardHeader>
              <div className="skeleton skeleton-title"></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="skeleton skeleton-form-field"></div>
                <div className="skeleton skeleton-form-field"></div>
                <div className="skeleton skeleton-form-field"></div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ingredients Skeleton */}
          <Card className="liquid-glass-card liquid-glass-card-subtle">
            <CardHeader>
              <div className="skeleton skeleton-title"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="skeleton skeleton-form-field"></div>
                <div className="skeleton skeleton-form-field"></div>
                <div className="skeleton skeleton-form-field"></div>
              </div>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 基本資訊 */}
        <div className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
          <div className="liquid-glass-content">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <span style={{ color: '#2a588c' }}>基本資訊</span>
              </h2>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">客戶名稱 *</Label>
              <div className="flex gap-2">
                <Input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="請輸入客戶名稱"
                  className="flex-1 form-focus-effect input-micro-focus"
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
              <Label htmlFor="customerService">客服 *</Label>
              <Input
                id="customerService"
                {...register('customerService')}
                placeholder="請輸入客服姓名"
                className="flex-1 form-focus-effect input-micro-focus"
              />
              {errors.customerService && (
                <p className="text-sm text-destructive">{errors.customerService.message}</p>
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
          </div>
        </div>

      {/* 膠囊規格 */}
        <div className="liquid-glass-card liquid-glass-card-elevated liquid-glass-card-refraction">
          <div className="liquid-glass-content">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <span style={{ color: '#2a588c' }}>膠囊規格</span>
              </h2>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-6">
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
          </div>
        </div>

      {/* 其他信息 */}
        <Card className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <span className="text-green-600">📋</span>
              其他信息
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="completionDate">完工日期</Label>
            <Controller
              name="completionDate"
              control={control}
              render={({ field }) => (
                <Input
                  id="completionDate"
                  type="date"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || '')}
                />
              )}
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
      <div className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
        <div className="liquid-glass-content">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                  </svg>
                </div>
                <span style={{ color: '#2a588c' }}>原料配方（每粒規格）</span>
              </h2>
              <div className="flex gap-2 flex-wrap">
                <SmartRecipeImport 
                  onImport={handleSmartImport}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          {/* 桌面版表格 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>原料品名 *</TableHead>
                  <TableHead>單粒含量 (mg) *</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="flex gap-2">
                        <Controller
                          name={`ingredients.${index}.materialName`}
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="原料品名"
                              className="flex-1"
                              autoComplete="off"
                            />
                          )}
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
                      <div className="space-y-2">
                        <Input
                          type="number"
                          step="0.00001"
                          {...register(`ingredients.${index}.unitContentMg`, { valueAsNumber: true })}
                          placeholder="0.00000"
                        />
                        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                          <Controller
                            name={`ingredients.${index}.isCustomerProvided`}
                            control={control}
                            defaultValue={true}
                            render={({ field }) => (
                              <label className="flex items-center gap-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                  className="h-4 w-4"
                                />
                                <span>客戶指定配方</span>
                              </label>
                            )}
                          />
                          <Controller
                            name={`ingredients.${index}.isCustomerSupplied`}
                            control={control}
                            defaultValue={true}
                            render={({ field }) => (
                              <label className="flex items-center gap-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                  className="h-4 w-4"
                                />
                                <span>客戶提供原料</span>
                              </label>
                            )}
                          />
                        </div>
                      </div>
                      {errors.ingredients?.[index]?.unitContentMg && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.ingredients[index]?.unitContentMg?.message}
                        </p>
                      )}
                    </TableCell>
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
              <Card key={field.id} className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction border border-gray-200">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-700">
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
                        <Controller
                          name={`ingredients.${index}.materialName`}
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="請輸入原料品名"
                              className="flex-1"
                              autoComplete="off"
                            />
                          )}
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

                    {/* 單粒含量、原料來源 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">單粒含量 (mg) *</Label>
                      <Controller
                        name={`ingredients.${index}.unitContentMg`}
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.00001"
                            placeholder="0.00000"
                            className="w-full"
                            autoComplete="off"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        )}
                      />
                      {errors.ingredients?.[index]?.unitContentMg && (
                        <p className="text-sm text-destructive">
                          {errors.ingredients[index]?.unitContentMg?.message}
                        </p>
                      )}

                      <Controller
                        name={`ingredients.${index}.isCustomerProvided`}
                        control={control}
                        defaultValue={true}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                              className="h-4 w-4"
                            />
                            <span>客戶指定配方</span>
                          </label>
                        )}
                      />
                      <Controller
                        name={`ingredients.${index}.isCustomerSupplied`}
                        control={control}
                        defaultValue={true}
                        render={({ field }) => (
                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                              className="h-4 w-4"
                            />
                            <span>客戶提供原料</span>
                          </label>
                        )}
                      />
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
            onClick={() => append({ materialName: '', unitContentMg: 0, isCustomerProvided: true, isCustomerSupplied: true })}
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
        </div>
      </div>

      {/* 計算結果 */}
        <Card className="liquid-glass-card liquid-glass-card-brand liquid-glass-card-refraction">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <span className="text-emerald-600">📊</span>
              計算結果
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">單粒總重量</p>
              <p className="text-lg sm:text-xl font-semibold text-blue-800">
                {unitTotalWeight.toFixed(3)} mg
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-600 font-medium">批次總重量</p>
              <p className="text-lg sm:text-xl font-semibold text-emerald-800">
                {convertWeight(batchTotalWeight).display}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">生產數量</p>
              <p className="text-lg sm:text-xl font-semibold text-purple-800">
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
          className="ripple-effect btn-micro-hover micro-brand-glow w-full sm:w-auto order-1 sm:order-2"
        >
          {isSubmitting ? '儲存中...' : '儲存配方'}
        </Button>
      </div>
    </form>
  )
}