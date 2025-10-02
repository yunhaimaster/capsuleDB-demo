export interface ProductionOrder {
  id: string
  customerName: string
  productName: string
  productionQuantity: number
  unitWeightMg: number
  batchTotalWeightMg: number
  completionDate?: Date | null
  processIssues?: string | null
  qualityNotes?: string | null
  capsuleColor?: string | null
  capsuleSize?: string | null
  capsuleType?: string | null
  createdAt: Date
  updatedAt: Date
  customerService?: string | null
  ingredients: Ingredient[]
}

export interface Ingredient {
  id: string
  orderId: string
  materialName: string
  unitContentMg: number
  isCustomerProvided: boolean
  isCustomerSupplied: boolean
}

export interface CreateProductionOrderData {
  customerName: string
  productName: string
  productionQuantity: number
  completionDate?: Date | null
  processIssues?: string | null
  qualityNotes?: string | null
  capsuleColor?: string | null
  capsuleSize?: string | null
  capsuleType?: string | null
  customerService?: string | null
  ingredients: CreateIngredientData[]
}

export interface CreateIngredientData {
  materialName: string
  unitContentMg: number
  isCustomerProvided?: boolean
  isCustomerSupplied?: boolean
}

export interface UpdateProductionOrderData extends Partial<CreateProductionOrderData> {
  id: string
}

export interface SearchFilters {
  customerName?: string
  productName?: string
  ingredientName?: string
  capsuleType?: string
  dateTo?: Date
  minQuantity?: number
  maxQuantity?: number
  isCompleted?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'productionQuantity' | 'customerName' | 'productName' | 'completionDate'
  sortOrder?: 'asc' | 'desc'
}

export interface WeightUnit {
  value: number
  unit: 'mg' | 'g' | 'kg'
  display: string
}

export interface ExportOptions {
  format: 'csv' | 'pdf'
  includeIngredients?: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}
