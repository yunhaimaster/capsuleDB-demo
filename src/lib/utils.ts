import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { WeightUnit } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-TW').format(num)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return '-'
  
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

export function formatDateOnly(date: Date | string | null | undefined): string {
  if (!date) return '-'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return '-'
  
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj)
}

export function convertWeight(mg: number): WeightUnit {
  if (mg >= 1000000) {
    return {
      value: mg / 1000000,
      unit: 'kg',
      display: `${(mg / 1000000).toFixed(3)} kg`
    }
  } else if (mg >= 1000) {
    return {
      value: mg / 1000,
      unit: 'g',
      display: `${(mg / 1000).toFixed(3)} g`
    }
  } else {
    return {
      value: mg,
      unit: 'mg',
      display: `${mg.toFixed(3)} mg`
    }
  }
}

export function calculateBatchWeight(unitContentMg: number, quantity: number): WeightUnit {
  const totalMg = unitContentMg * quantity
  return convertWeight(totalMg)
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}

export function generateCSV(data: any[], headers: string[]): string {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map((_, index) => {
        const value = row[index] || ''
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
