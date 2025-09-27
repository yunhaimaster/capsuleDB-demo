'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

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
  loading?: boolean
}

export function LinkedFilter({
  customerOptions,
  productOptions,
  ingredientOptions,
  capsuleOptions,
  onSearch,
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

  // 根據客戶篩選產品選項
  const filteredProductOptions = useMemo(() => {
    if (!filters.customerName) return productOptions
    // 這裡可以根據實際數據關係進行篩選
    // 暫時返回所有產品選項
    return productOptions
  }, [filters.customerName, productOptions])

  // 根據客戶和產品篩選原料選項
  const filteredIngredientOptions = useMemo(() => {
    if (!filters.customerName && !filters.productName) return ingredientOptions
    // 這裡可以根據實際數據關係進行篩選
    return ingredientOptions
  }, [filters.customerName, filters.productName, ingredientOptions])

  // 根據客戶、產品和原料篩選膠囊選項
  const filteredCapsuleOptions = useMemo(() => {
    if (!filters.customerName && !filters.productName && !filters.ingredientName) return capsuleOptions
    // 這裡可以根據實際數據關係進行篩選
    return capsuleOptions
  }, [filters.customerName, filters.productName, filters.ingredientName, capsuleOptions])

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
  }

  const handleOptionSelect = (field: keyof typeof filters, value: string, label: string) => {
    handleInputChange(field, value)
    setShowDropdowns(prev => ({ ...prev, [field]: false }))
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

  return (
    <div className="liquid-glass-card liquid-glass-card-subtle p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 客戶名稱篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            客戶名稱
          </label>
          <div className="relative">
            <Input
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
            {showDropdowns.customer && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {customerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('customerName', option.value, option.label)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 產品名稱篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            產品名稱
          </label>
          <div className="relative">
            <Input
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
            {showDropdowns.product && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredProductOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('productName', option.value, option.label)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 原料名稱篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            原料名稱
          </label>
          <div className="relative">
            <Input
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
            {showDropdowns.ingredient && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredIngredientOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('ingredientName', option.value, option.label)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 膠囊類型篩選 */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            膠囊類型
          </label>
          <div className="relative">
            <Input
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
            {showDropdowns.capsule && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredCapsuleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect('capsuleType', option.value, option.label)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          清除篩選
        </Button>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          {loading ? '搜尋中...' : '搜尋'}
        </Button>
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
