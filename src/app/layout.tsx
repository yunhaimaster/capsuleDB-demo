import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ProtectedLayout } from '@/components/auth/protected-layout'
import { LogoutButton } from '@/components/auth/logout-button'
import { Analytics } from '@vercel/analytics/next'
import { Logo } from '@/components/ui/logo'

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
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ProtectedLayout>
              <div className="min-h-screen">
                <header className="border-b">
                  <div className="container mx-auto px-4 py-3 md:py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Logo size="lg" variant="icon" />
                        <div>
                          <h1 className="text-lg md:text-2xl font-bold text-brand-primary">
                            Easy Health 膠囊配方管理系統
                          </h1>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            Easy Health 內部生產管理
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <LogoutButton />
                      </div>
                    </div>
                  </div>
                </header>
                <main className="container mx-auto px-4 py-4 md:py-6">
                  {children}
                </main>
              </div>
            </ProtectedLayout>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
