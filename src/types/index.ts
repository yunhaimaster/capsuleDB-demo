export interface ProductionOrder {
  id: string
  customerName: string
  productCode: string
  productionQuantity: number
  unitWeightMg: number
  batchTotalWeightMg: number
  completionDate?: Date | null
  processIssues?: string | null
  qualityNotes?: string | null
  createdAt: Date
  updatedAt: Date
  createdBy?: string | null
  ingredients: Ingredient[]
}

export interface Ingredient {
  id: string
  orderId: string
  materialName: string
  unitContentMg: number
}

export interface CreateProductionOrderData {
  customerName: string
  productCode: string
  productionQuantity: number
  completionDate?: Date | null
  processIssues?: string | null
  qualityNotes?: string | null
  createdBy?: string | null
  ingredients: CreateIngredientData[]
}

export interface CreateIngredientData {
  materialName: string
  unitContentMg: number
}

export interface UpdateProductionOrderData extends Partial<CreateProductionOrderData> {
  id: string
}

export interface SearchFilters {
  customerName?: string
  productCode?: string
  dateFrom?: Date
  dateTo?: Date
  isCompleted?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'productionQuantity' | 'customerName' | 'completionDate'
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
