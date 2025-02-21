import Link from 'next/link'
import { Button } from '../ui/button'

interface AuthLinksProps {
  isRegisterPage?: boolean
}

export function AuthLinks({ isRegisterPage = false }: Readonly<AuthLinksProps>) {
  return (
    <>
      <div className="mt-6 flex w-full max-w-md items-center justify-center" role="separator">
        <div className="h-px w-full bg-gray-300"></div>
        <span className="mx-4 text-sm text-gray-500">OU</span>
        <div className="h-px w-full bg-gray-300"></div>
      </div>
      <div className="mt-6 w-full max-w-md space-y-4">
        {isRegisterPage ? (
          <Link href="/" className="block w-full">
            <Button
              variant="outline"
              className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Já tem uma conta? Entre
            </Button>
          </Link>
        ) : (
          <Link href="/registrar" className="block w-full">
            <Button
              variant="outline"
              className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Cadastre-se
            </Button>
          </Link>
        )}
        <Link href="/esqueci-senha" className="block w-full">
          <Button
            variant="outline"
            className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Esqueci a senha
          </Button>
        </Link>
      </div>
    </>
  )
}
