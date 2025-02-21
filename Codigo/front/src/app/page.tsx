import dynamic from 'next/dynamic'
import { LoginHero } from '../components/auth/login-hero'

// Lazy Loading
const LoginForm = dynamic(
  () => import('../components/auth/login-form').then(mod => mod.LoginForm),
  {
    loading: () => <div className="animate-pulse">Carregando formulário de login...</div>
  }
)

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 md:px-12">
        <LoginForm />
      </div>
      <LoginHero />
    </main>
  )
}
