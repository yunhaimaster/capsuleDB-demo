import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ProtectedLayout } from '@/components/auth/protected-layout'
import { Analytics } from '@vercel/analytics/next'
import ErrorBoundary from '@/components/ui/error-boundary'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'
import { OfflineIndicator } from '@/hooks/use-offline'
import { ToastProvider } from '@/components/ui/toast-provider'

const inter = Inter({ subsets: ['latin'] })

const appTitle = 'Easy Health 膠囊配方管理系統'
const appDescription = 'Easy Health 內部生產管理系統'
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://capsuledb.easyhealth.internal'

export const metadata: Metadata = {
  title: appTitle,
  description: appDescription,
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: appTitle,
    description: appDescription,
    url: baseUrl,
    siteName: appTitle,
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: appTitle,
    description: appDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} antialiased`} style={{ WebkitTextSizeAdjust: '100%', textSizeAdjust: '100%', MozTextSizeAdjust: '100%', fontSize: '16px' }}>
        <ToastProvider>
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
        </ToastProvider>
      </body>
    </html>
  )
}
