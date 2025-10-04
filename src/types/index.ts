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
  actualProductionQuantity?: number | null
  materialYieldQuantity?: number | null
  ingredients: Ingredient[]
  worklogs?: OrderWorklog[]
  totalWorkUnits?: number
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
  actualProductionQuantity?: number | null
  materialYieldQuantity?: number | null
  ingredients: CreateIngredientData[]
  worklogs?: CreateOrderWorklogData[]
}

export interface CreateIngredientData {
  materialName: string
  unitContentMg: number
  isCustomerProvided?: boolean
  isCustomerSupplied?: boolean
}

export interface OrderWorklog {
  id: string
  orderId: string
  workDate: string
  headcount: number
  startTime: string
  endTime: string
  notes?: string | null
  effectiveMinutes: number
  calculatedWorkUnits: number
  createdAt: string
  updatedAt: string
}

export interface WorklogWithOrder extends OrderWorklog {
  order?: {
    id: string
    customerName: string
    productName: string
    createdAt: string
  } | null
}

export interface CreateOrderWorklogData {
  workDate: string
  headcount: number
  startTime: string
  endTime: string
  notes?: string
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

export interface WorklogFilters {
  orderKeyword?: string
  notesKeyword?: string
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
  sortOrder?: 'asc' | 'desc'
}
