'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  GraduationCap, 
  Menu, 
  LayoutDashboard,
  Users,
  FileQuestion,
  Brain,
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModeToggle } from '@/components/mode-toggle'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { UserNav } from './user-nav'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useAdmin } from '@/lib/contexts/AdminContext'
import { cn } from '@/lib/utils'

// ==================== NAVIGATION ITEMS ====================

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  requiresRole?: 'student' | 'professor' | 'admin'
  requiresPermission?: string
}

const getNavItems = (role: 'student' | 'professor' | 'admin' | null): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral do sistema'
    }
  ]

  if (role === 'admin') {
    return [
      ...baseItems,
      {
        href: '/usuarios',
        label: 'Usuários',
        icon: Users,
        description: 'Gerenciar usuários do sistema'
      },
      {
        href: '/questoes',
        label: 'Questões',
        icon: FileQuestion,
        description: 'Banco de questões'
      },
      {
        href: '/revisao-ia',
        label: 'Revisão IA',
        icon: Brain,
        description: 'Revisar respostas da IA'
      },
      {
        href: '/estatisticas',
        label: 'Estatísticas',
        icon: BarChart3,
        description: 'Analytics e relatórios'
      },
      {
        href: '/configuracoes',
        label: 'Configurações',
        icon: Settings,
        description: 'Configurações do sistema'
      }
    ]
  } else if (role === 'professor') {
    return [
      ...baseItems,
      {
        href: '/turmas',
        label: 'Turmas',
        icon: Users,
        description: 'Gerenciar turmas'
      },
      {
        href: '/simulados',
        label: 'Simulados',
        icon: FileText,
        description: 'Criar e gerenciar simulados'
      },
      {
        href: '/materiais',
        label: 'Materiais',
        icon: BookOpen,
        description: 'Materiais de estudo'
      },
      {
        href: '/relatorios',
        label: 'Relatórios',
        icon: BarChart3,
        description: 'Desempenho dos alunos'
      }
    ]
  } else {
    // Student items
    return [
      ...baseItems,
      {
        href: '/simulados',
        label: 'Simulados',
        icon: FileText,
        description: 'Realizar simulados'
      },
      {
        href: '/materiais',
        label: 'Materiais',
        icon: BookOpen,
        description: 'Materiais de estudo'
      },
      {
        href: '/progresso',
        label: 'Progresso',
        icon: BarChart3,
        description: 'Acompanhar desempenho'
      }
    ]
  }
}

// ==================== NOTIFICATION BADGE ====================

interface NotificationBadgeProps {
  count: number
  max?: number
}

function NotificationBadge({ count, max = 99 }: NotificationBadgeProps) {
  if (count === 0) return null
  
  const displayCount = count > max ? `${max}+` : count.toString()
  
  return (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
    >
      {displayCount}
    </Badge>
  )
}

// ==================== MOBILE NAVIGATION ====================

interface MobileNavProps {
  navItems: NavItem[]
  pathname: string | null
  pendingCount?: number
}

function MobileNav({ navItems, pathname, pendingCount }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <SheetTitle>
            <Link
              href="/dashboard"
              className="flex items-center"
              onClick={() => setOpen(false)}
            >
              <GraduationCap className="mr-2 h-6 w-6" />
              <span className="font-bold">Edulign</span>
            </Link>
          </SheetTitle>
        </SheetHeader>
        
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                    isActive 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground'
                  )}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {item.label === 'Revisão IA' && pendingCount && pendingCount > 0 && (
                      <NotificationBadge count={pendingCount} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div>{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ==================== DESKTOP NAVIGATION ====================

interface DesktopNavProps {
  navItems: NavItem[]
  pathname: string | null
  pendingCount?: number
}

function DesktopNav({ navItems, pathname, pendingCount }: DesktopNavProps) {
  return (
    <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="relative">
              <Icon className="h-4 w-4" />
              {item.label === 'Revisão IA' && pendingCount && pendingCount > 0 && (
                <NotificationBadge count={pendingCount} />
              )}
            </div>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

// ==================== MAIN NAVIGATION ====================

export function MainNav() {
  const pathname = usePathname()
  const { state: authState, isAdmin, isProfessor } = useAuth()
  const { state: adminState } = useAdmin()

  // Get navigation items based on user role
  const navItems = React.useMemo(() => {
    return getNavItems(authState.user?.role || null)
  }, [authState.user?.role])

  // Get app title based on role
  const appTitle = React.useMemo(() => {
    if (isAdmin) return 'Edulign - Admin'
    if (isProfessor) return 'Edulign - Professor'
    return 'Edulign'
  }, [isAdmin, isProfessor])

  // Get pending AI responses count for admin
  const pendingCount = React.useMemo(() => {
    if (isAdmin) {
      return adminState.aiResponses.pagination.total || 0
    }
    return 0
  }, [isAdmin, adminState.aiResponses.pagination.total])

  // System status indicator
  const systemStatus = React.useMemo(() => {
    if (!isAdmin) return null
    
    // You can add more sophisticated status logic here
    const hasIssues = pendingCount > 10
    
    return {
      status: hasIssues ? 'warning' : 'healthy',
      message: hasIssues ? `${pendingCount} respostas pendentes` : 'Sistema funcionando normalmente'
    }
  }, [isAdmin, pendingCount])

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* Mobile menu */}
        <MobileNav 
          navItems={navItems} 
          pathname={pathname}
          pendingCount={pendingCount}
        />

        {/* Logo */}
        <div className="mr-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
              {appTitle}
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="flex-1">
          <DesktopNav 
            navItems={navItems} 
            pathname={pathname}
            pendingCount={pendingCount}
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* System status for admin */}
          {systemStatus && (
            <div className="hidden lg:flex items-center space-x-2">
              <div 
                className={cn(
                  'h-2 w-2 rounded-full',
                  systemStatus.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                )}
              />
              <span className="text-xs text-muted-foreground">
                {systemStatus.message}
              </span>
            </div>
          )}

          {/* Notifications */}
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => {
                // Navigate to notifications or show dropdown
              }}
            >
              <Bell className="h-4 w-4" />
              {adminState.ui.notifications.length > 0 && (
                <NotificationBadge count={adminState.ui.notifications.length} />
              )}
            </Button>
          )}

          {/* Theme toggle */}
          <ModeToggle />

          {/* User menu */}
          <UserNav />
        </div>
      </div>
    </div>
  )
}

// ==================== BREADCRUMB NAVIGATION ====================

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  if (items.length === 0) return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// ==================== PAGE HEADER ====================

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  breadcrumb?: BreadcrumbItem[]
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {breadcrumb && breadcrumb.length > 0 && (
        <BreadcrumbNav items={breadcrumb} />
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {action && (
          <div className="flex items-center space-x-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}