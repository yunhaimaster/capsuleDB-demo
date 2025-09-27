'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Download } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface LinkedFilterProps {
  customerOptions: FilterOption[]
  productOptions: FilterOption[]
  ingredientOptions: FilterOption[]
  capsuleOptions: FilterOption[]
  onSearch: (filters: {
    customerName: string
    productName: string
    ingredientName: string
    capsuleType: string
  }) => void
  onExport?: () => void
  loading?: boolean
}

export function LinkedFilter({
  customerOptions,
  productOptions,
  ingredientOptions,
  capsuleOptions,
  onSearch,
  onExport,
  loading = false
}: LinkedFilterProps) {
  const [filters, setFilters] = useState({
    customerName: '',
    productName: '',
    ingredientName: '',
    capsuleType: ''
  })

  const [showDropdowns, setShowDropdowns] = useState({
    customer: false,
    product: false,
    ingredient: false,
    capsule: false
  })

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // 聯動篩選選項狀態
  const [linkedProductOptions, setLinkedProductOptions] = useState<FilterOption[]>([])
  const [linkedIngredientOptions, setLinkedIngredientOptions] = useState<FilterOption[]>([])
  const [linkedCapsuleOptions, setLinkedCapsuleOptions] = useState<FilterOption[]>([])

  // 獲取聯動選項
  const fetchLinkedOptions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.customerName) params.append('customerName', filters.customerName)
      if (filters.productName) params.append('productName', filters.productName)
      if (filters.ingredientName) params.append('ingredientName', filters.ingredientName)

      const response = await fetch(`/api/orders/options?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLinkedProductOptions(data.products.map((item: string) => ({ value: item, label: item })))
        setLinkedIngredientOptions(data.ingredients.map((item: string) => ({ value: item, label: item })))
        setLinkedCapsuleOptions(data.capsuleTypes.map((item: string) => ({ value: item, label: item })))
      }
    } catch (error) {
      console.error('Error fetching linked options:', error)
    }
  }, [filters.customerName, filters.productName, filters.ingredientName])

  // 當篩選條件改變時，獲取聯動選項
  useEffect(() => {
    fetchLinkedOptions()
  }, [fetchLinkedOptions])

  // 根據客戶篩選產品選項
  const filteredProductOptions = useMemo(() => {
    if (!filters.customerName) return productOptions
    return linkedProductOptions.length > 0 ? linkedProductOptions : productOptions
  }, [filters.customerName, productOptions, linkedProductOptions])

  // 根據客戶和產品篩選原料選項
  const filteredIngredientOptions = useMemo(() => {
    if (!filters.customerName && !filters.productName) return ingredientOptions
    return linkedIngredientOptions.length > 0 ? linkedIngredientOptions : ingredientOptions
  }, [filters.customerName, filters.productName, ingredientOptions, linkedIngredientOptions])

  // 根據客戶、產品和原料篩選膠囊選項
  const filteredCapsuleOptions = useMemo(() => {
    if (!filters.customerName && !filters.productName && !filters.ingredientName) return capsuleOptions
    return linkedCapsuleOptions.length > 0 ? linkedCapsuleOptions : capsuleOptions
  }, [filters.customerName, filters.productName, filters.ingredientName, capsuleOptions, linkedCapsuleOptions])

  // Debounce function for search
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }, [])

  const handleInputChange = (field: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [field]: value }
    
    // 清空後續篩選條件
    if (field === 'customerName') {
      newFilters.productName = ''
      newFilters.ingredientName = ''
      newFilters.capsuleType = ''
    } else if (field === 'productName') {
      newFilters.ingredientName = ''
      newFilters.capsuleType = ''
    } else if (field === 'ingredientName') {
      newFilters.capsuleType = ''
    }
    
    setFilters(newFilters)
    
    // 自動搜索（延遲 500ms）
    debouncedSearch(newFilters)
  }

  const debouncedSearch = useMemo(
    () => debounce((searchFilters: typeof filters) => {
      const processedFilters = {
        customerName: searchFilters.customerName === '全部客戶' ? '' : searchFilters.customerName,
        productName: searchFilters.productName === '全部產品' ? '' : searchFilters.productName,
        ingredientName: searchFilters.ingredientName === '全部原料' ? '' : searchFilters.ingredientName,
        capsuleType: searchFilters.capsuleType === '全部類型' ? '' : searchFilters.capsuleType,
      }
      onSearch(processedFilters)
    }, 500),
    [debounce, onSearch]
  )

  const handleOptionSelect = async (field: keyof typeof filters, value: string, label: string) => {
    const newFilters = { ...filters, [field]: value }
    
    // 清空後續篩選條件
    if (field === 'customerName') {
      newFilters.productName = ''
      newFilters.ingredientName = ''
      newFilters.capsuleType = ''
    } else if (field === 'productName') {
      newFilters.ingredientName = ''
      newFilters.capsuleType = ''
    } else if (field === 'ingredientName') {
      newFilters.capsuleType = ''
    }
    
    setFilters(newFilters)
    setShowDropdowns(prev => ({ ...prev, [field]: false }))
    
    // 立即觸發聯動選項更新
    try {
      const params = new URLSearchParams()
      if (newFilters.customerName) params.append('customerName', newFilters.customerName)
      if (newFilters.productName) params.append('productName', newFilters.productName)
      if (newFilters.ingredientName) params.append('ingredientName', newFilters.ingredientName)

      const response = await fetch(`/api/orders/options?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLinkedProductOptions(data.products.map((item: string) => ({ value: item, label: item })))
        setLinkedIngredientOptions(data.ingredients.map((item: string) => ({ value: item, label: item })))
        setLinkedCapsuleOptions(data.capsuleTypes.map((item: string) => ({ value: item, label: item })))
      }
    } catch (error) {
      console.error('Error fetching linked options:', error)
    }
    
    // 立即觸發搜索
    const processedFilters = {
      customerName: newFilters.customerName === '全部客戶' ? '' : newFilters.customerName,
      productName: newFilters.productName === '全部產品' ? '' : newFilters.productName,
      ingredientName: newFilters.ingredientName === '全部原料' ? '' : newFilters.ingredientName,
      capsuleType: newFilters.capsuleType === '全部類型' ? '' : newFilters.capsuleType,
    }
    onSearch(processedFilters)
  }

  const handleSearch = () => {
    const searchFilters = {
      customerName: filters.customerName === '全部客戶' ? '' : filters.customerName,
      productName: filters.productName === '全部產品' ? '' : filters.productName,
      ingredientName: filters.ingredientName === '全部原料' ? '' : filters.ingredientName,
      capsuleType: filters.capsuleType === '全部類型' ? '' : filters.capsuleType,
    }
    onSearch(searchFilters)
  }

  const clearFilters = () => {
    setFilters({
      customerName: '',
      productName: '',
      ingredientName: '',
      capsuleType: ''
    })
    onSearch({ customerName: '', productName: '', ingredientName: '', capsuleType: '' })
  }

  const toggleDropdown = (field: keyof typeof showDropdowns) => {
    setShowDropdowns(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const DropdownPortal = ({ field, options, onSelect }: { 
    field: string, 
    options: FilterOption[], 
    onSelect: (value: string, label: string) => void 
  }) => {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
    
    // 映射 field 到正確的 ref key
    const fieldToRefKey: { [key: string]: string } = {
      'customer': 'customerName',
      'product': 'productName', 
      'ingredient': 'ingredientName',
      'capsule': 'capsuleType'
    }
    
    useEffect(() => {
      const refKey = fieldToRefKey[field]
      if (showDropdowns[field as keyof typeof showDropdowns] && inputRefs.current[refKey]) {
        const input = inputRefs.current[refKey]
        const rect = input.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        })
      }
    }, [field, showDropdowns])

    if (!showDropdowns[field as keyof typeof showDropdowns]) return null

    return createPortal(
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        style={{
          top: position.top,
          left: position.left,
          width: position.width
        }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value, option.label)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          >
            {option.label}
          </button>
        ))}
      </div>,
      document.body
    )
  }

  return (
    <div className="liquid-glass-card liquid-glass-card-subtle p-6 relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 客戶名稱篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            客戶名稱
          </label>
          <div className="relative">
            <Input
              ref={(el) => { inputRefs.current['customerName'] = el }}
              value={filters.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              onFocus={() => setShowDropdowns(prev => ({ ...prev, customer: true }))}
              placeholder="輸入或選擇客戶"
              className="pr-8"
            />
            <button
              type="button"
              onClick={() => toggleDropdown('customer')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ▼
            </button>
            <DropdownPortal
              field="customer"
              options={customerOptions}
              onSelect={(value, label) => handleOptionSelect('customerName', value, label)}
            />
          </div>
        </div>

        {/* 產品名稱篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            產品名稱
          </label>
          <div className="relative">
            <Input
              ref={(el) => { inputRefs.current['productName'] = el }}
              value={filters.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              onFocus={() => setShowDropdowns(prev => ({ ...prev, product: true }))}
              placeholder="輸入或選擇產品"
              className="pr-8"
            />
            <button
              type="button"
              onClick={() => toggleDropdown('product')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ▼
            </button>
            <DropdownPortal
              field="product"
              options={filteredProductOptions}
              onSelect={(value, label) => handleOptionSelect('productName', value, label)}
            />
          </div>
        </div>

        {/* 原料名稱篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            原料名稱
          </label>
          <div className="relative">
            <Input
              ref={(el) => { inputRefs.current['ingredientName'] = el }}
              value={filters.ingredientName}
              onChange={(e) => handleInputChange('ingredientName', e.target.value)}
              onFocus={() => setShowDropdowns(prev => ({ ...prev, ingredient: true }))}
              placeholder="輸入或選擇原料"
              className="pr-8"
            />
            <button
              type="button"
              onClick={() => toggleDropdown('ingredient')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ▼
            </button>
            <DropdownPortal
              field="ingredient"
              options={filteredIngredientOptions}
              onSelect={(value, label) => handleOptionSelect('ingredientName', value, label)}
            />
          </div>
        </div>

        {/* 膠囊類型篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            膠囊類型
          </label>
          <div className="relative">
            <Input
              ref={(el) => { inputRefs.current['capsuleType'] = el }}
              value={filters.capsuleType}
              onChange={(e) => handleInputChange('capsuleType', e.target.value)}
              onFocus={() => setShowDropdowns(prev => ({ ...prev, capsule: true }))}
              placeholder="輸入或選擇類型"
              className="pr-8"
            />
            <button
              type="button"
              onClick={() => toggleDropdown('capsule')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ▼
            </button>
            <DropdownPortal
              field="capsule"
              options={filteredCapsuleOptions}
              onSelect={(value, label) => handleOptionSelect('capsuleType', value, label)}
            />
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          清除篩選
        </Button>
        {onExport && (
          <Button
            onClick={onExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4" />
            匯出 CSV
          </Button>
        )}
      </div>

      {/* 點擊外部關閉下拉菜單 */}
      <div 
        className="fixed inset-0 z-0" 
        style={{ display: Object.values(showDropdowns).some(Boolean) ? 'block' : 'none' }}
        onClick={() => setShowDropdowns({ customer: false, product: false, ingredient: false, capsule: false })}
      />
    </div>
  )
}
