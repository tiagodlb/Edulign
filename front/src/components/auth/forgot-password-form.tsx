'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/auth/password-input'
import { RegisterFormHeader } from '@/components/auth/register-form-header'
import { AuthLinks } from '@/components/auth/auth-links'
import { AUTH_MESSAGES } from '@/lib/constants/auth'
import { Loader2 } from 'lucide-react'
import { AreaSelect } from '@/components/auth/area-select'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { registerFormSchema, type RegisterFormData } from '@/lib/validations/auth'
import { AuthService } from '@/lib/api/auth'
import { useToast } from '@/hooks/use-toast'
import { ForgotPasswordFormHeader } from './forgot-password-header'

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      area: ''
    }
  })

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true)
    try {
      await AuthService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        area: values.area
      })

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo(a) ao Eduling!'
      })

      router.push('/dashboard')
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar conta',
          description: error.message
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar conta',
          description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
        })
      }
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0">
      <CardHeader>
        <ForgotPasswordFormHeader />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Endereço de Email para Recuperação de senha</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      id="email"
                      placeholder="exemplo@gmail.com"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {AUTH_MESSAGES.LOADING}
                </>
              ) : (
                AUTH_MESSAGES.FORGOT_PASSWORD_BUTTON
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <AuthLinks isRegisterPage />
      </CardFooter>
    </Card>
  )
}
