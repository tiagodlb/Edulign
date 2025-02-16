'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GraduationCap, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserNav } from './user-nav'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/manage-admins', label: 'Usuários' }
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-between w-full">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <GraduationCap className="h-6 w-6" />
        <span className="scroll-m-20 text-xl font-semibold tracking-tight inline-block">
          Edulign - Admin
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
        <UserNav /> {/* Add the UserNav component here */}
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
