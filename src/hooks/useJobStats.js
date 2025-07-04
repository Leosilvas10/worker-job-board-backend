import { useState, useEffect } from 'react'

// Hook para buscar estatísticas reais das vagas
export const useJobStats = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    recentJobs: 0,
    categories: {
      'Serviços Domésticos': 0,
      'Segurança e Portaria': 0,
      'Cuidados e Saúde': 0,
      'Limpeza e Conservação': 0,
      'Transporte e Logística': 0,
      'Vendas e Atendimento': 0,
    },
    topCities: [],
    salaryRanges: {},
    contractTypes: {},
    formatted: {
      totalJobsFormatted: '0',
      recentJobsFormatted: '0',
      topCategory: ['', 0],
      avgJobsPerCategory: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/jobs-stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.message || 'Erro ao buscar estatísticas')
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Atualizar estatísticas a cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  }
}

// Hook para formatação de números específico para vagas
export const useJobFormatting = () => {
  const formatJobCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`
    }
    return count.toLocaleString('pt-BR')
  }

  const getCategoryDisplayName = (category) => {
    const displayNames = {
      'domestica': 'Serviços Domésticos',
      'porteiro': 'Segurança e Portaria',
      'cuidador': 'Cuidados e Saúde',
      'limpeza': 'Limpeza e Conservação',
      'motorista': 'Transporte e Logística',
      'vendedor': 'Vendas e Atendimento',
    }
    return displayNames[category] || category
  }

  const getJobText = (count) => {
    if (count === 1) return 'vaga'
    return 'vagas'
  }

  const formatCategoryCount = (category, count) => {
    return `${formatJobCount(count)} ${getJobText(count)}`
  }

  return {
    formatJobCount,
    getCategoryDisplayName,
    getJobText,
    formatCategoryCount
  }
}
