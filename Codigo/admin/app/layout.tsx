import { AuthProvider } from '@/components/AuthProvider'
import './globals.css'
import { Inter } from 'next/font/google'
import type React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Metadata, Viewport } from 'next'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: 'Painel do Administrador',
    template: '%s | Painel do Administrador'
  },
  description: 'Sistema completo para gerenciamento de questões, turmas e simulados educacionais',
  keywords: ['educação', 'simulados', 'questões', 'ensino', 'administração'],
  authors: [{ name: 'Sua Empresa' }],
  creator: 'Sua Empresa',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://seudominio.com.br',
    title: 'Painel do Administrador',
    description: 'Sistema completo para gerenciamento educacional',
    siteName: 'Painel Educacional'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Painel do Administrador',
    description: 'Sistema completo para gerenciamento educacional'
  },
  robots: {
    index: false,
    follow: false
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body 
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}