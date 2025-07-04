import { useState, useEffect } from 'react'

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalVagas: 0,
    vagasAtivas: 0,
    totalLeads: 0,
    leadsHoje: 0,
    acessosHoje: 0,
    empresas: 0,
    usuariosAtivos: 0,
    taxaConversao: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📊 Carregando dados do dashboard...')

      // Buscar estatísticas das vagas
      const vagasResponse = await fetch('/api/all-jobs-combined')
      const vagasData = await vagasResponse.json()

      // Buscar estatísticas dos leads do backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      let leadsData = { success: false, leads: [] }
      
      try {
        const leadsResponse = await fetch(`${backendUrl}/api/leads`)
        if (leadsResponse.ok) {
          leadsData = await leadsResponse.json()
        }
      } catch (leadsError) {
        console.log('⚠️ Backend não disponível, usando dados mock para leads')
      }

      // Processar dados das vagas
      if (vagasData.success && vagasData.jobs) {
        const jobs = vagasData.jobs
        const today = new Date().toDateString()
        
        // Estatísticas das vagas
        const totalVagas = jobs.length
        const vagasAtivas = jobs.filter(job => !job.expired && !job.inactive).length
        const empresas = new Set(jobs.map(job => job.company?.name || job.company)).size

        // Processar dados dos leads
        const leads = leadsData.success ? leadsData.leads : []
        const totalLeads = leads.length
        const leadsHoje = leads.filter(lead => {
          const leadDate = new Date(lead.data_criacao || lead.created_at)
          return leadDate.toDateString() === today
        }).length

        // Dados simulados para dashboard completo
        const acessosHoje = Math.floor(Math.random() * 500) + 100
        const usuariosAtivos = Math.floor(Math.random() * 25) + 5
        const taxaConversao = totalVagas > 0 ? ((totalLeads / (totalVagas * 10)) * 100).toFixed(0) : 0

        setStats({
          totalVagas,
          vagasAtivas,
          totalLeads,
          leadsHoje,
          acessosHoje,
          empresas,
          usuariosAtivos,
          taxaConversao: parseFloat(taxaConversao)
        })

        console.log('✅ Dados do dashboard carregados:', {
          totalVagas,
          vagasAtivas,
          totalLeads,
          leadsHoje,
          empresas
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do dashboard:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erro ao carregar estatísticas</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Vagas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 bg-brown-100 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Vagas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalVagas}</p>
            </div>
          </div>
        </div>

        {/* Vagas Ativas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.vagasAtivas}</p>
            </div>
          </div>
        </div>

        {/* Total de Leads */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        {/* Leads Hoje */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Leads Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{stats.leadsHoje}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Acessos Hoje */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Acessos Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{stats.acessosHoje}</p>
            </div>
          </div>
        </div>

        {/* Empresas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.empresas}</p>
            </div>
          </div>
        </div>

        {/* Usuários Ativos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.usuariosAtivos}</p>
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <img 
                src="/site do trabalhador.png" 
                alt="Site do Trabalhador" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-3xl font-bold text-gray-900">{stats.taxaConversao}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
