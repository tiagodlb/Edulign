'use client'

import { useState } from 'react'
import { Input } from '../ui/input'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import type { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form'

interface PasswordInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>
  disabled?: boolean
}

export function PasswordInput<T extends FieldValues>({
  field,
  disabled
}: Readonly<PasswordInputProps<T>>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        {...field}
        type={showPassword ? 'text' : 'password'}
        id="password"
        placeholder="Digite sua senha"
        autoComplete="current-password"
        required
        disabled={disabled}
        aria-describedby="password-error"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOffIcon className={`h-4 w-4 ${disabled ? 'text-gray-300' : 'text-gray-500'}`} />
        ) : (
          <EyeIcon className={`h-4 w-4 ${disabled ? 'text-gray-300' : 'text-gray-500'}`} />
        )}
      </button>
    </div>
  )
}
