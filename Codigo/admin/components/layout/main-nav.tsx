'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserNav } from './user-nav'
import { useAuth } from '@/components/AuthProvider'
import { cn } from '@/lib/utils'

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [userRole, setUserRole] = React.useState<'admin' | 'professor'>('professor') // Simular role

  // Definir itens de navegação baseado no papel do usuário
  const navItems = React.useMemo(() => {
    if (userRole === 'professor') {
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/turmas', label: 'Turmas' },
        { href: '/simulados', label: 'Simulados' },
        { href: '/materiais', label: 'Materiais' },
        { href: '/relatorios', label: 'Relatórios' }
      ]
    } else {
      return [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/manage-admins', label: 'Usuários' },
        { href: '/questoes', label: 'Questões' },
        { href: '/configuracoes', label: 'Configurações' }
      ]
    }
  }, [userRole])

  const appTitle = userRole === 'professor' ? 'Edulign - Professor' : 'Edulign - Admin'

  return (
    <div className="flex items-center justify-between w-full">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <GraduationCap className="h-6 w-6" />
        <span className="scroll-m-20 text-xl font-semibold tracking-tight inline-block">
          {appTitle}
        </span>
      </Link>
      <div className="flex items-center space-x-6">
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-primary leading-7 text-base',
                pathname?.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ModeToggle />
        <UserNav />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-4">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-primary leading-7 text-base',
                    pathname?.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}