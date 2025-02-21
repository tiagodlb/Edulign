import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { Toaster } from '../components/ui/toaster'
import { customFont } from '../config/fonts'
import { ThemeProvider } from '../components/theme-provider'
import Loading from '../components/loading'

export const metadata: Metadata = {
  title: 'Edulign',
  description: 'Plataforma de preparação para o ENADE'
}

export default function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: { lang: string }
}>) {
  return (
    <html lang={params.lang} className={customFont.variable} suppressHydrationWarning>
      <body className={`font-sans antialiased ${customFont.className} tracking-tighter`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<Loading />}>{children}</Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
