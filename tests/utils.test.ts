import { formatNumber, convertWeight, calculateBatchWeight } from '../src/lib/utils'

describe('Utils', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(123)).toBe('123')
    })
  })

  describe('convertWeight', () => {
    it('should convert mg to appropriate units', () => {
      const result1 = convertWeight(500)
      expect(result1.unit).toBe('mg')
      expect(result1.value).toBe(500)

      const result2 = convertWeight(1500)
      expect(result2.unit).toBe('g')
      expect(result2.value).toBe(1.5)

      const result3 = convertWeight(1500000)
      expect(result3.unit).toBe('kg')
      expect(result3.value).toBe(1.5)
    })
  })

  describe('calculateBatchWeight', () => {
    it('should calculate batch weight correctly', () => {
      const result = calculateBatchWeight(500, 1000)
      expect(result.value).toBe(500)
      expect(result.unit).toBe('g')
      expect(result.display).toBe('500.000 g')
    })
  })
})
