import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ProtectedLayout } from '@/components/auth/protected-layout'
import { Analytics } from '@vercel/analytics/next'
import ErrorBoundary from '@/components/ui/error-boundary'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'
import { OfflineIndicator } from '@/hooks/use-offline'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Easy Health 膠囊配方管理系統',
  description: 'Easy Health 內部生產管理系統',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} antialiased`} style={{ WebkitTextSizeAdjust: '100%', textSizeAdjust: '100%', MozTextSizeAdjust: '100%' }}>
        <ErrorBoundary>
          <AuthProvider>
            <ProtectedLayout>
              <div className="min-h-screen">
                {children}
              </div>
              <OfflineIndicator />
            </ProtectedLayout>
          </AuthProvider>
        </ErrorBoundary>
        <PerformanceMonitor />
        <Analytics />
      </body>
    </html>
  )
}
