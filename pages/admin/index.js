import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../src/components/Admin/AdminLayout'
import DashboardStats from '../../src/components/Admin/DashboardStats'

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isClearing, setIsClearing] = useState(false)

  const handleClearAllData = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá zerar TODOS os dados do sistema (leads, estatísticas, etc.). Esta operação é IRREVERSÍVEL!\n\nTem certeza que deseja continuar?')) {
      return
    }

    if (!confirm('🚨 CONFIRMAÇÃO FINAL: Todos os leads e dados serão PERMANENTEMENTE DELETADOS. Confirma?')) {
      return
    }

    setIsClearing(true)

    try {
      // Limpar dados do backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Fazer request para endpoint de limpeza (vamos criar)
      const response = await fetch(`${backendUrl}/api/clear-all-data`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        alert('✅ Todos os dados foram zerados com sucesso!')
        // Forçar recarregamento da página para atualizar estatísticas
        window.location.reload()
      } else {
        throw new Error('Erro no servidor')
      }
    } catch (error) {
      console.error('Erro ao zerar dados:', error)
      alert('❌ Erro ao zerar dados. Verifique se o backend está funcionando.')
    }

    setIsClearing(false)
  }

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('admin_token')
      const adminUser = localStorage.getItem('admin_user')

      console.log('Verificando autenticação no dashboard...', { adminToken, adminUser })

      if (!adminToken || adminToken !== 'admin_authenticated') {
        console.log('Token inválido, redirecionando...')
        router.push('/admin/login')
        return
      }

      if (adminUser) {
        try {
          const userData = JSON.parse(adminUser)
          if (userData.authenticated) {
            setUser(userData)
            setIsAuthenticated(true)
            setLoading(false)
            console.log('Usuário autenticado com sucesso!')
          } else {
            router.push('/admin/login')
          }
        } catch (e) {
          console.error('Erro no parse dos dados:', e)
          router.push('/admin/login')
        }
      } else {
        router.push('/admin/login')
      }
    }

    // Pequeno delay para garantir que o localStorage está disponível
    setTimeout(checkAuth, 100)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-govgray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-12 shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-govblue-600 mx-auto mb-4"></div>
          <p className="text-govgray-600 font-medium">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout user={user} title="Dashboard Administrativo">
      <Head>
        <title>Dashboard Administrativo - Site do Trabalhador</title>
      </Head>
      
      <div className="space-y-6">
        {/* Estatísticas principais */}
        <DashboardStats />
        
        {/* Seções adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividade Recente */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-600">Atividade Recente</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                  🔄 Atualizar
                </button>
                <button 
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearing ? '⏳ Zerando...' : '🗑️ Zerar Tudo'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade recente</h4>
                <p className="text-gray-500">Sistema limpo e pronto para uso</p>
              </div>
            </div>
          </div>

          {/* Resumo do Sistema */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-blue-600">Resumo do Sistema</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status do Sistema</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">API das Vagas</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600 font-medium">Erro</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Último Reset</span>
                <span className="text-sm text-gray-500">Nunca</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Vagas Cadastradas</span>
                <span className="text-sm text-gray-900 font-medium">0 vagas</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Categoria Principal</span>
                <span className="text-sm text-gray-500">N/A (0)</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Estado dos Dados</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">🧹 Sistema Limpo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
