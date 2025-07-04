import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

const AdminLayout = ({ children, title = 'Painel Administrativo' }) => {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('admin_token')
      const adminUser = localStorage.getItem('admin_user')

      if (!adminToken || adminToken !== 'admin_authenticated') {
        router.push('/admin/login')
        return
      }

      if (adminUser) {
        try {
          const userData = JSON.parse(adminUser)
          if (userData.authenticated) {
            setUser(userData)
            setLoading(false)
          } else {
            router.push('/admin/login')
          }
        } catch (e) {
          router.push('/admin/login')
        }
      } else {
        router.push('/admin/login')
      }
    }

    setTimeout(checkAuth, 100)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      href: '/admin',
      active: router.pathname === '/admin'
    },
    {
      icon: '💼',
      label: 'Vagas',
      href: '/admin/vagas',
      active: router.pathname.startsWith('/admin/vagas')
    },
    {
      icon: '📋',
      label: 'Analytics Vagas',
      href: '/admin/vagas/analytics',
      active: router.pathname === '/admin/vagas/analytics'
    },
    {
      icon: '👥',
      label: 'Leads',
      href: '/admin/leads',
      active: router.pathname === '/admin/leads'
    },
    {
      icon: '🏢',
      label: 'Empresas',
      href: '/admin/empresas',
      active: router.pathname === '/admin/empresas'
    },
    {
      icon: '👤',
      label: 'Usuários',
      href: '/admin/usuarios',
      active: router.pathname === '/admin/usuarios'
    },
    {
      icon: '✏️',
      label: 'Editor de Conteúdo',
      href: '/admin/conteudo',
      active: router.pathname.startsWith('/admin/conteudo')
    },
    {
      icon: '⚙️',
      label: 'Configurações',
      href: '/admin/configuracoes',
      active: router.pathname === '/admin/configuracoes'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>{title} - Site do Trabalhador</title>
      </Head>
      
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center p-1">
              <img 
                src="/site do trabalhador.png" 
                alt="Site do Trabalhador" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-500">Painel Administrativo</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <Link 
              key={index}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.active && <span className="ml-auto text-blue-600">→</span>}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@admin.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            🚪 Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bem-vindo ao painel de controle do Site do Trabalhador
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                🔔
              </button>
              <Link 
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ver Site →
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
