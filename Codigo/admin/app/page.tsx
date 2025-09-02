import { AuthProvider } from '@/components/AuthProvider'
import LoginForm from '../components/LoginForm'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </main>
  )
}
