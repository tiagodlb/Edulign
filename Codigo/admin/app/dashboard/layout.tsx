import { AuthProvider } from '@/components/AuthProvider'
import { MainNav } from '@/components/layout/main-nav'
import { AdminProvider } from '@/lib/contexts/AdminContext'
import type React from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AdminProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4">
              <MainNav />
            </div>
          </header>
          <main className="flex-1">
            <div className="container py-6 px-4">
              {children}
            </div>
          </main>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
          >
            Pular para o conteúdo principal
          </a>
        </div>
      </AuthProvider>

    </AdminProvider>
  )
}