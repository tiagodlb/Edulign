import dynamic from 'next/dynamic'
import { RegisterHero } from '../../components/auth/register-hero'

// Lazy Loading
const RegisterForm = dynamic(
  () => import('../../components/auth/register-form').then(mod => mod.RegisterForm),
  {
    loading: () => <div className="animate-pulse">Carregando formulário de registro...</div>
  }
)

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 md:w-1/2 md:px-12">
        <RegisterForm />
      </div>
      <RegisterHero />
    </main>
  )
}
