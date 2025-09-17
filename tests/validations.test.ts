import { productionOrderSchema, ingredientSchema } from '../src/lib/validations'

describe('Validations', () => {
  describe('ingredientSchema', () => {
    it('should validate correct ingredient data', () => {
      const validIngredient = {
        materialName: '維生素C',
        unitContentMg: 500.0
      }
      expect(() => ingredientSchema.parse(validIngredient)).not.toThrow()
    })

    it('should reject invalid ingredient data', () => {
      const invalidIngredient = {
        materialName: '',
        unitContentMg: -1
      }
      expect(() => ingredientSchema.parse(invalidIngredient)).toThrow()
    })
  })

  describe('productionOrderSchema', () => {
    it('should validate correct production order data', () => {
      const validOrder = {
        customerName: '測試客戶',
        productCode: 'TEST-001',
        productionQuantity: 1000,
        ingredients: [
          { materialName: '維生素C', unitContentMg: 500.0 }
        ]
      }
      expect(() => productionOrderSchema.parse(validOrder)).not.toThrow()
    })

    it('should reject production order without ingredients', () => {
      const invalidOrder = {
        customerName: '測試客戶',
        productCode: 'TEST-001',
        productionQuantity: 1000,
        ingredients: []
      }
      expect(() => productionOrderSchema.parse(invalidOrder)).toThrow()
    })
  })
})
