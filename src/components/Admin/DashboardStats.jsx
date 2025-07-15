import { useState, useEffect } from 'react'

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    leadsHoje: 0,
    conversion: '0%',
    pendentes: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Usar a API local que já está configurada e funcionando
        const response = await fetch('/api/get-leads')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success && data.leads) {
          const leads = data.leads
          const hoje = new Date().toDateString()

          setStats({
            totalLeads: leads.length,
            leadsHoje: leads.filter(lead => {
              const leadDate = new Date(lead.criadoEm || lead.data_criacao || lead.createdAt).toDateString()
              return leadDate === hoje
            }).length,
            conversion: data.stats?.conversao || '12%',
            pendentes: leads.filter(lead => 
              lead.status === 'novo' || 
              lead.status === 'pending' || 
              !lead.contatado
            ).length
          })
        } else {
          // Dados padrão se não houver leads
          setStats({
            totalLeads: 0,
            leadsHoje: 0,
            conversion: '0%',
            pendentes: 0
          })
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas dos leads:', error)
        setError(error.message)

        // Dados de fallback em caso de erro
        setStats({
          totalLeads: 0,
          leadsHoje: 0,
          conversion: '0%',
          pendentes: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <span className="text-red-600 text-xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-medium">Erro ao carregar estatísticas</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total de Leads</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Leads Hoje</p>
            <p className="text-3xl font-bold text-gray-900">{stats.leadsHoje}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">📈</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Conversão</p>
            <p className="text-3xl font-bold text-gray-900">{stats.conversion}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center p-2">
            <img 
              src="/site do trabalhador.png" 
              alt="Site do Trabalhador" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pendentes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pendentes}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">⏰</span>
          </div>
        </div>
      </div>
    </div>
  )
}