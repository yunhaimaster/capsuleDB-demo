import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface UnifiedCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'feature' | 'info' | 'warning'
}

export function UnifiedCard({ children, className, variant = 'default' }: UnifiedCardProps) {
  const variants = {
    default: 'border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900',
    feature: 'border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
    info: 'border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
    warning: 'border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20'
  }

  return (
    <Card className={cn(variants[variant], className)}>
      {children}
    </Card>
  )
}

export { CardContent, CardDescription, CardHeader, CardTitle }
