import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        <h2 className="mt-4 text-xl font-semibold">Carregando...</h2>
        <p className="mt-2 text-muted-foreground">
          Por favor, aguarde enquanto preparamos tudo para você.
        </p>
      </div>
    </div>
  )
}
