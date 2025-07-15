import React, { useState, useEffect } from 'react'
import { useJobStats } from '../../hooks/useJobStats'

const HeroSection = () => {
  const { stats: jobStats, loading: jobStatsLoading } = useJobStats()
  
  // Estatísticas para exibir - agora usando dados reais
  const stats = [
    { 
      label: 'Vagas Ativas', 
      value: jobStatsLoading ? '...' : `${jobStats?.formatted?.totalJobsFormatted || '0'}`, 
      icon: '💼' 
    },
    { label: 'Empresas Cadastradas', value: '5K+', icon: '🏢' },
    { label: 'Profissionais', value: '100K+', icon: '👥' },
    { 
      label: 'Vagas Preenchidas', 
      value: jobStatsLoading ? '...' : `${Math.floor((jobStats?.totalJobs || 0) * 0.3)}+`, 
      icon: '✅' 
    }
  ]

  // Categorias populares - Vagas Operacionais (usando dados reais)
  const getPopularCategories = () => {
    if (jobStatsLoading || !jobStats?.categories) {
      return [
        { name: 'Doméstica', icon: '🏠', count: '...' },
        { name: 'Limpeza', icon: '🧹', count: '...' },
        { name: 'Segurança', icon: '🛡️', count: '...' },
        { name: 'Alimentação', icon: '🍽️', count: '...' },
        { name: 'Cuidados', icon: '👨‍⚕️', count: '...' },
        { name: 'Construção', icon: '🔨', count: '...' }
      ]
    }

    const categoryMapping = {
      'Serviços Domésticos': { name: 'Doméstica', icon: '🏠' },
      'Construção e Reformas': { name: 'Construção', icon: '🔨' },
      'Alimentação e Bebidas': { name: 'Alimentação', icon: '🍽️' },
      'Limpeza e Conservação': { name: 'Limpeza', icon: '🧹' },
      'Segurança e Portaria': { name: 'Segurança', icon: '🛡️' },
      'Cuidados e Saúde': { name: 'Cuidados', icon: '👨‍⚕️' },
      'Transporte e Logística': { name: 'Transporte', icon: '🚛' },
      'Vendas e Atendimento': { name: 'Vendas', icon: '🛒' }
    }

    return Object.entries(jobStats.categories).map(([category, count]) => {
      const mapping = categoryMapping[category] || { name: category, icon: '💼' }
      return {
        ...mapping,
        count: count > 0 ? `${count}+` : '0'
      }
    }).slice(0, 6)
  }

  const popularCategories = getPopularCategories()

  return (
    <div className="relative bg-gradient-to-br from-govblue-600 via-govblue-700 to-govblue-800 overflow-hidden">
      {/* Background pattern - Inspirado no gov.br */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,205,7,0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="text-center">
          {/* Título principal - Estilo Gov.br */}
          <div className="mb-8 fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Encontre a Sua Vaga Ideal
              <span className="block text-govyellow-400">
                e Conheça Seus Direitos!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-govgray-100 max-w-4xl mx-auto leading-relaxed mb-8 font-medium">
              Milhares de vagas de empregos simples te esperam! Doméstica, Cuidador(a), Porteiro, Limpeza, Jardineiro, Cozinheiro(a) e muito mais. 
              Aqui, você não só encontra a oportunidade perfeita, mas também aprende sobre seus direitos trabalhistas de forma fácil e gratuita. 
              <span className="text-govyellow-300 font-bold">Sua próxima chance de trabalho e a segurança dos seus direitos estão a um clique!</span>
            </p>
          </div>

          <div className="space-y-12">
            {/* Botão Ver Todas as Vagas - Estilo Gov.br */}
            <div className="bounce-in" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={() => window.location.href = '/vagas'}
                className="inline-flex items-center space-x-3 bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold text-base px-10 py-4 rounded shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <span className="text-lg">👀</span>
                <span>Ver Todas as Vagas</span>
                <span className="text-base">→</span>
              </button>
              <p className="text-sm text-govgray-200 mt-3 font-medium">
                {jobStatsLoading ? 
                  'Carregando oportunidades...' : 
                  `${jobStats?.formatted?.totalJobsFormatted || '0'} oportunidades atualizadas diariamente`
                }
              </p>
            </div>
          </div>

          {/* Categorias populares - Estilo Gov.br */}
          <div className="mb-16 bounce-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-lg font-bold text-govyellow-400 mb-6">
              🔥 As Vagas Mais Buscadas por Quem Quer Crescer!
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {popularCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => window.location.href = '/vagas'}
                  className="flex items-center space-x-2 bg-white hover:bg-govgray-50 text-govblue-600 px-5 py-3 rounded font-medium transition-all duration-200 hover:scale-105 shadow-md"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-semibold">{category.name}</span>
                  <span className="text-xs bg-govgreen-600 text-white px-2 py-1 rounded">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Estatísticas - Estilo Gov.br */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 fade-in" style={{ animationDelay: '0.6s' }}>
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-govblue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-govgray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Indicador de scroll - Estilo Gov.br */}
          <div className="mt-16 fade-in" style={{ animationDelay: '1s' }}>
            <div className="flex flex-col items-center text-govgray-200">
              <span className="text-sm mb-2 font-medium">Role para explorar o portal</span>
              <div className="w-6 h-10 border-2 border-govyellow-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-govyellow-400 rounded-full mt-2 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
