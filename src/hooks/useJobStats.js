import { useState, useEffect, useRef } from 'react'

export const useJobStats = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    newJobsToday: 0,
    companies: 0,
    applicants: 0
  })
  const [loading, setLoading] = useState(true)
  const hasLoaded = useRef(false)

  useEffect(() => {
    // Evitar múltiplas chamadas
    if (hasLoaded.current) return

    const fetchStats = async () => {
      try {
        console.log('📊 Buscando estatísticas reais das vagas...')

        const response = await fetch('/api/jobs-stats/')
        if (response.ok) {
          const data = await response.json()
          setStats({
            totalJobs: data.total || 0,
            newJobsToday: data.newToday || 0,
            companies: data.companies || 0,
            applicants: data.applicants || 0
          })
          console.log('✅ Estatísticas calculadas:', data.total, 'vagas totais')
          hasLoaded.current = true
        }
      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
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