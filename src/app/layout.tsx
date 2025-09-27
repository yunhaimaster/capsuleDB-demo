import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ProtectedLayout } from '@/components/auth/protected-layout'
import { Analytics } from '@vercel/analytics/next'

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
      <body className={inter.className}>
        <AuthProvider>
          <ProtectedLayout>
            <div className="min-h-screen">
              {children}
            </div>
          </ProtectedLayout>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
