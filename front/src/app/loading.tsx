'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function Loading() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Reset loading state when route changes
  useEffect(() => {
    setIsLoading(true)
    const startProgress = () => {
      setProgress(0)
      setIsLoading(true)

      // Simular progresso inicial rápido
      setTimeout(() => setProgress(30), 100)
      setTimeout(() => setProgress(60), 300)
      setTimeout(() => setProgress(80), 600)

      // Finalizar após um curto delay
      setTimeout(() => {
        setProgress(100)
        setTimeout(() => setIsLoading(false), 200)
      }, 800)
    }

    startProgress()

    // Cleanup timeouts on route change
    return () => {
      setIsLoading(false)
      setProgress(0)
    }
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-card p-6 shadow-lg">
          <div className="relative">
            <div className="flex items-center justify-center">
              <Loader2
                className={cn(
                  'h-10 w-10 animate-spin text-primary',
                  progress === 100 && 'text-green-500'
                )}
              />
            </div>

            <div className="mt-4 space-y-3">
              <Progress value={progress} className="h-2 w-full transition-all duration-300" />

              <p className="text-center text-sm text-muted-foreground">
                {progress < 30 && 'Iniciando...'}
                {progress >= 30 && progress < 60 && 'Carregando...'}
                {progress >= 60 && progress < 90 && 'Quase lá...'}
                {progress >= 90 && 'Concluindo...'}
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-1.5">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full bg-primary/30',
                  'animate-pulse',
                  `delay-${i * 150}`
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
