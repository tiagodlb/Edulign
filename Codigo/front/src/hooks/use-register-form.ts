/* eslint-disable @typescript-eslint/no-explicit-any */
import { useToast } from './use-toast'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerFormSchema, type RegisterFormData } from '../lib/validations/auth'
import { AUTH_MESSAGES } from '../lib/constants/auth'
import { useAuth } from './use-auth'

export function useRegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { setAuth } = useAuth()

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      area: ''
    }
  })

  async function onSubmit(values: RegisterFormData) {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAuth(data.user)

      toast({
        title: 'Sucesso',
        description: AUTH_MESSAGES.REGISTER_SUCCESS
      })

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || AUTH_MESSAGES.REGISTER_ERROR
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit)
  }
}
