'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { PasswordInput } from './password-input'
import { LoginFormHeader } from './login-form-header'
import { AuthLinks } from './auth-links'
import { AUTH_MESSAGES } from '../../lib/constants/auth'
import { Loader2 } from 'lucide-react'
import { AuthService } from '../../lib/api/auth'
import { useToast } from '../../hooks/use-toast'

const loginFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional()
})

type LoginFormData = z.infer<typeof loginFormSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const onSubmit = async (values: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await AuthService.login({
        email: values.email,
        password: values.password
      })

      if (values.rememberMe) {
        // Store rememberMe preference
        localStorage.setItem('rememberMe', 'true')
      }

      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo(a), ${response.data.user.name}!`
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-4"
          aria-labelledby="login-heading"
        >
          <LoginFormHeader />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Endereço de email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    id="email"
                    placeholder="exemplo@gmail.com"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    aria-describedby="email-error"
                  />
                </FormControl>
                <FormMessage id="email-error" aria-live="polite" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Senha</FormLabel>
                <FormControl>
                  <PasswordInput field={field} disabled={isLoading} />
                </FormControl>
                <FormMessage id="password-error" aria-live="polite" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 justify-end">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="rememberMe"
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="rememberMe">Lembrar de mim por 30 dias</FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading} aria-live="polite">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {AUTH_MESSAGES.LOADING}
              </>
            ) : (
              AUTH_MESSAGES.LOGIN_BUTTON
            )}
          </Button>
        </form>
      </Form>
      <AuthLinks />
    </>
  )
}
