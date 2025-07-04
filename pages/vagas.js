import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import LeadModal from '../src/components/LeadModal/index'
import JobCard from '../src/components/JobCard/JobCard'
import { useJobStats, useJobFormatting } from '../src/hooks/useJobStats'

const Vagas = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    salary: '',
    type: ''
  })
  const [filteredJobs, setFilteredJobs] = useState([])
  const jobsPerPage = 9

  // Hook para estatísticas reais
  const { stats: jobStats } = useJobStats()
  const { formatJobCount } = useJobFormatting()

  useEffect(() => {
    // Buscar TODAS as vagas (internas + públicas externas)
    console.log('🔍 Buscando TODAS as vagas (internas + públicas)...')
    
    fetch(`/api/all-jobs-combined?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log('📋 Dados recebidos na página de vagas:', data)
        
        if (data.success) {
          const vagasData = data.jobs || data.data || []
          console.log(`✅ Total de ${vagasData.length} vagas carregadas`)
          console.log(`📊 Internas: ${data.meta?.internalJobs || 0}, Externas: ${data.meta?.externalJobs || 0}`)
          console.log(`🌐 Fontes: ${data.meta?.sources?.join(', ') || 'N/A'}`)
          
          setJobs(vagasData)
          setFilteredJobs(vagasData)
        } else {
          console.error('❌ Erro na resposta da API:', data.message)
          setError(data.message || 'Erro ao carregar vagas')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('❌ Erro ao buscar vagas:', err)
        setError('Erro ao carregar vagas. Tente novamente.')
        setLoading(false)
      })
  }, [])

  // Effect para aplicar filtros
  useEffect(() => {
    let filtered = [...jobs]

    // Filtro de busca (título ou empresa)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm) ||
        job.company?.name?.toLowerCase().includes(searchTerm) ||
        job.company?.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por categoria (baseado no título da vaga - focado em trabalhos simples)
    if (filters.category) {
      filtered = filtered.filter(job => {
        const title = job.title?.toLowerCase() || ''
        const description = job.description?.toLowerCase() || ''
        switch (filters.category) {
          case 'domestica':
            return title.includes('domést') || title.includes('diarista') || title.includes('faxineira') || description.includes('domést')
          case 'limpeza':
            return title.includes('limpeza') || title.includes('faxina') || title.includes('zelador') || title.includes('servente')
          case 'seguranca':
            return title.includes('porteiro') || title.includes('vigilante') || title.includes('seguran') || title.includes('guarita')
          case 'alimentacao':
            return title.includes('cozinheir') || title.includes('ajudante de cozinha') || title.includes('copeira') || title.includes('garç')
          case 'cuidados':
            return title.includes('cuidador') || title.includes('babá') || title.includes('acompanhante') || title.includes('idoso')
          case 'construcao':
            return title.includes('pedreiro') || title.includes('servente') || title.includes('ajudante') || title.includes('construção')
          case 'motorista':
            return title.includes('motorista') || title.includes('entregador') || title.includes('driver')
          case 'servicos':
            return title.includes('jardineiro') || title.includes('manutenção') || title.includes('serviços gerais') || title.includes('auxiliar')
          case 'vendas':
            return title.includes('vend') || title.includes('comercial') || title.includes('promot')
          case 'administrativo':
            return title.includes('admin') || title.includes('assist') || title.includes('auxiliar') || title.includes('recep')
          default:
            return true
        }
      })
    }

    // Filtro por faixa salarial
    if (filters.salary) {
      filtered = filtered.filter(job => {
        const salary = job.salary?.toLowerCase() || ''
        switch (filters.salary) {
          case 'ate-2k':
            return salary.includes('1.') || salary.includes('salário') || salary.includes('combinar')
          case '2k-5k':
            return salary.includes('2.') || salary.includes('3.') || salary.includes('4.')
          case 'acima-5k':
            return salary.includes('5.') || salary.includes('6.') || salary.includes('7.') || salary.includes('8.')
          default:
            return true
        }
      })
    }

    // Filtro por tipo de contrato
    if (filters.type) {
      filtered = filtered.filter(job => {
        const description = (job.description || '').toLowerCase()
        const title = (job.title || '').toLowerCase()
        switch (filters.type) {
          case 'clt':
            return description.includes('clt') || title.includes('efetiv')
          case 'pj':
            return description.includes('pj') || description.includes('pessoa jurídica')
          case 'temporario':
            return description.includes('temp') || description.includes('contrato')
          case 'estagio':
            return title.includes('estag') || title.includes('jovem aprendiz')
          default:
            return true
        }
      })
    }

    setFilteredJobs(filtered)
    setCurrentPage(1) // Reset para primeira página quando filtrar
  }, [jobs, filters])

  // Cálculos de paginação usando jobs filtrados
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)
  const startIndex = (currentPage - 1) * jobsPerPage
  const endIndex = startIndex + jobsPerPage
  const currentJobs = filteredJobs.slice(startIndex, endIndex)

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      salary: '',
      type: ''
    })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApply = (job) => {
    // Registrar aplicação para analytics
    if (job.id || job.title) {
      fetch('/api/jobs-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobId: job.id || `${job.title}_${job.company}`.replace(/\s+/g, '_'),
          action: 'apply',
          jobData: {
            title: job.title,
            company: job.company?.name || job.company
          }
        })
      }).catch(err => console.log('Analytics error:', err))
    }

    // Usar sempre o LeadModal unificado para todas as vagas
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  // Effect para registrar visualizações das vagas
  useEffect(() => {
    if (!loading && !error && currentJobs.length > 0) {
      // Registrar view para as vagas visíveis na página atual
      currentJobs.forEach(job => {
        if (job.id || job.title) {
          fetch('/api/jobs-analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              jobId: job.id || `${job.title}_${job.company}`.replace(/\s+/g, '_'),
              action: 'view',
              jobData: {
                title: job.title,
                company: job.company?.name || job.company
              }
            })
          }).catch(err => console.log('Analytics error:', err))
        }
      })
    }
  }, [currentJobs, loading, error])

  // Função para gerar conteúdo específico por categoria (focado em trabalhos simples)
  const getCategoryContent = (category) => {
    const contents = {
      domestica: "🏠 Encontre as melhores **vagas para Doméstica e Diarista** em todo o Brasil! Oportunidades com carteira assinada, meio período ou diárias. Trabalhe em residências que valorizam seu serviço e oferecem boas condições. Sua nova oportunidade como doméstica está aqui!",
      limpeza: "🧹 Descubra **vagas em Limpeza e Conservação** em todo o Brasil! Oportunidades para faxineira, zelador, servente e auxiliar de limpeza em empresas, condomínios e estabelecimentos comerciais. Trabalhe com dignidade e reconhecimento!",
      seguranca: "🔒 Explore vagas em **Segurança, Portaria e Vigilância** em todo o Brasil! Oportunidades para porteiro, vigilante, controlador de acesso em condomínios, empresas e estabelecimentos comerciais. Proteja e seja valorizado!",
      alimentacao: "🍽️ Encontre vagas na área de **Alimentação e Cozinha** em todo o Brasil! Oportunidades para cozinheiro, ajudante de cozinha, copeira e garçom em restaurantes, lanchonetes e empresas. Sua paixão pela culinária pode ser sua profissão!",
      cuidados: "👥 Descubra vagas em **Cuidados Pessoais** em todo o Brasil! Oportunidades para cuidador de idosos, babá, acompanhante e auxiliar de cuidados especiais. Trabalhe cuidando de pessoas com carinho e dedicação!",
      construcao: "🔨 Explore vagas na **Construção Civil** em todo o Brasil! Oportunidades para pedreiro, servente, ajudante geral e auxiliar de obras. Construa sua carreira no setor que mais cresce no país!",
      motorista: "🚗 Encontre vagas para **Motorista e Entregador** em todo o Brasil! Oportunidades para motorista particular, entregador, driver de aplicativo e transporte de cargas. Sua carteira de motorista pode ser sua fonte de renda!",
      servicos: "⚙️ Descubra vagas em **Serviços Gerais** em todo o Brasil! Oportunidades para jardineiro, auxiliar de manutenção, handyman e prestador de serviços diversos. Suas habilidades práticas são valorizadas aqui!",
      vendas: "💼 Explore as melhores vagas em **Vendas e Comercial** em todo o Brasil! Encontre oportunidades para vendedor, promotor de vendas, consultor e mais, em diversas cidades. Sua carreira de sucesso em vendas espera por você!",
      administrativo: "📋 Encontre sua vaga em **Administrativo** em todo o Brasil! Oportunidades para assistente administrativo, recepcionista, secretária e cargos de apoio em todo o país. Comece a organizar sua carreira com as melhores vagas!"
    }
    return contents[category] || null  
  }

  return (
    <div className="page-white-bg min-h-screen">
      <Head>
        <title>Encontre Sua Vaga de Emprego Ideal: Milhares de Oportunidades Esperam por Você! | Site do Trabalhador</title>
        <meta name="description" content="Doméstica, Porteiro, Cuidador, Limpeza, Motorista e Mais! Milhares de vagas simples em todo o Brasil. Filtre por categoria, cidade ou salário. Vagas atualizadas diariamente!" />
        <meta name="keywords" content="vaga emprego, doméstica, porteiro, cuidador, limpeza, motorista, trabalho simples, Brasil, vagas CLT, carteira assinada" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/site-do-trabalhador.ico" />
      </Head>

      {/* Hero Section */}
        <section className="bg-govblue-600 relative overflow-hidden border-b-4 border-govyellow-400">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Encontre Sua Vaga de Emprego Ideal: Milhares de Oportunidades Esperam por Você!
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-100 mb-4">
                Doméstica, Porteiro, Cuidador, Limpeza, Motorista e Mais! Filtre por Categoria, Cidade ou Salário.
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-4xl mx-auto">
                Seu próximo emprego está a um clique! Aqui, você encontra as melhores <strong>vagas para trabalhos simples</strong> em todo o <strong>Brasil</strong>, atualizadas diariamente. Use nossos filtros inteligentes para achar a oportunidade que realmente combina com você e seu perfil e dê o próximo passo em sua carreira!
              </p>
              
              {/* Bloco de Contagem de Vagas e Última Atualização */}
              <div className="bg-blue-800 bg-opacity-40 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                <p className="text-xl text-blue-100 mb-2">
                  ✅ {loading ? "Carregando vagas..." : `${filteredJobs.length} vagas disponíveis | Mostrando as mais recentes`}
                </p>
                {jobStats.totalJobs > 0 && (
                  <p className="text-blue-200 text-sm mb-1">
                    📊 Total na plataforma: <strong>{jobStats.formatted.totalJobsFormatted} vagas</strong> | 
                    Recentes: <strong>{jobStats.formatted.recentJobsFormatted}</strong>
                  </p>
                )}
                <p className="text-blue-200 text-sm">
                  Última atualização: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  🔄 As vagas são atualizadas automaticamente a cada 1 hora!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de Filtros */}
        {!loading && !error && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 mb-8">
              <h2 className="text-xl font-semibold text-govgray-800 mb-4">🔍 Filtre suas vagas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Busca por palavra-chave */}
                <div>
                  <label className="block text-sm font-medium text-govgray-700 mb-2">
                    Buscar por palavra-chave
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: porteiro, limpeza..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-govgray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                  >
                    <option value="">Todas as categorias</option>
                    <option value="domestica">Serviços Domésticos</option>
                    <option value="limpeza">Limpeza e Conservação</option>
                    <option value="seguranca">Segurança e Portaria</option>
                    <option value="alimentacao">Alimentação e Cozinha</option>
                    <option value="cuidados">Cuidados Pessoais</option>
                    <option value="construcao">Construção Civil</option>
                    <option value="motorista">Motorista e Entregador</option>
                    <option value="servicos">Serviços Gerais</option>
                    <option value="vendas">Vendas e Comercial</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>

                {/* Faixa Salarial */}
                <div>
                  <label className="block text-sm font-medium text-govgray-700 mb-2">
                    Faixa Salarial
                  </label>
                  <select
                    value={filters.salary}
                    onChange={(e) => handleFilterChange('salary', e.target.value)}
                    className="w-full px-3 py-2 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                  >
                    <option value="">Todas as faixas</option>
                    <option value="ate-2k">Até R$ 2.000</option>
                    <option value="2k-5k">R$ 2.000 - R$ 5.000</option>
                    <option value="acima-5k">Acima de R$ 5.000</option>
                  </select>
                </div>

                {/* Tipo de Contrato */}
                <div>
                  <label className="block text-sm font-medium text-govgray-700 mb-2">
                    Tipo de Contrato
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="clt">CLT</option>
                    <option value="pj">PJ</option>
                    <option value="temporario">Temporário</option>
                    <option value="estagio">Estágio</option>
                  </select>
                </div>
              </div>

              {/* Botão para limpar filtros */}
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-govgray-600 hover:text-govgray-800 hover:bg-govgray-100 rounded-lg transition-colors"
                >
                  🗑️ Limpar filtros
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Divisor Moderno */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-center py-8">
            <div className="flex-grow border-t border-govgray-200"></div>
            <div className="flex-shrink-0 px-4">
              <div className="w-12 h-12 bg-gradient-to-r from-govblue-500 to-govgreen-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">💼</span>
              </div>
            </div>
            <div className="flex-grow border-t border-govgray-200"></div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center bg-white rounded-xl p-12 shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-govblue-600 mx-auto mb-4"></div>
              <p className="text-govgray-600 font-medium">Carregando vagas reais...</p>
            </div>  
          </section>
        )}

        {/* Error State */}
        {error && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center bg-white rounded-xl p-12 shadow-lg">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-govgray-800 mb-2">Erro ao carregar vagas</h3>
              <p className="text-govgray-600 mb-6">{error}</p>
            </div>
          </section>
        )}

        {/* Lista de Vagas com Paginação */}
        {!loading && !error && filteredJobs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            
            {/* Conteúdo específico por categoria */}
            {filters.category && getCategoryContent(filters.category) && (
              <div className="bg-govblue-50 border-l-4 border-govblue-600 p-6 mb-8 rounded-r-lg">
                <p className="text-govgray-700 text-lg leading-relaxed">
                  {getCategoryContent(filters.category).split('**').map((part, index) => 
                    index % 2 === 1 ? <strong key={index} className="text-govblue-700">{part}</strong> : part
                  )}
                </p>
              </div>
            )}

            {/* Parágrafo introdutório */}
            <div className="text-center mb-8">
              <p className="text-lg text-govgray-700 max-w-3xl mx-auto">
                Confira abaixo as <strong>vagas de emprego atualizadas</strong> que correspondem à sua busca. 
                Para saber mais detalhes e enviar sua candidatura, clique em <strong>"Quero me Candidatar"</strong> em cada vaga.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentJobs.map((job, index) => (
                <JobCard 
                  key={index}
                  job={job}
                  onApplyClick={() => handleApply(job)}
                />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-govgray-100 text-govgray-700 rounded-lg hover:bg-govgray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? 'bg-govblue-600 text-white'
                        : 'bg-govgray-100 text-govgray-700 hover:bg-govgray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-govgray-100 text-govgray-700 rounded-lg hover:bg-govgray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Empty State */}
        {!loading && !error && filteredJobs.length === 0 && jobs.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center bg-white rounded-xl p-12 shadow-lg">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-govgray-800 mb-4">Nenhuma vaga encontrada</h3>
              <p className="text-govgray-600 mb-8 max-w-md mx-auto">
                Não encontramos vagas com os filtros aplicados. Tente ajustar os critérios de busca.
              </p>
              <button
                onClick={clearFilters}
                className="bg-govblue-600 text-white px-6 py-3 rounded-lg hover:bg-govblue-700 transition-colors font-medium"
              >
                🗑️ Limpar Filtros
              </button>
            </div>
          </section>
        )}

        {/* Empty State - Nenhuma vaga disponível */}
        {!loading && !error && jobs.length === 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center bg-white rounded-xl p-12 shadow-lg">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-govgray-800 mb-4">Nenhuma vaga encontrada</h3>
              <p className="text-govgray-600 mb-8 max-w-md mx-auto">
                Não há vagas disponíveis no momento. Nossas fontes estão sendo atualizadas constantemente.
              </p>
            </div>
          </section>
        )}

        {/* Seção Dicas para o Candidato */}
        {!loading && !error && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-govgray-50">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-govgray-800 mb-4">
                💡 Dicas Essenciais para o Candidato: Conquiste Sua Próxima Vaga!
              </h2>
              <p className="text-lg text-govgray-600 max-w-3xl mx-auto">
                Maximize suas chances de sucesso com nossas dicas especializadas para candidatos a emprego
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Dica 1: Currículo */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-govblue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">📄</span>
                  </div>
                  <h3 className="text-xl font-bold text-govgray-800 mb-3">Currículo que Impressiona</h3>
                  <p className="text-govgray-600 mb-6">
                    Saiba como montar um <strong>currículo simples e eficaz</strong>, destacando suas qualidades e experiências para as vagas de emprego.
                  </p>
                  <a 
                    href="https://www.vagas.com.br/dicas-de-carreira/curriculo/como-fazer-um-curriculo" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-govblue-600 hover:bg-govblue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    VEJA COMO MONTAR SEU CURRÍCULO
                  </a>
                </div>
              </div>

              {/* Dica 2: Entrevista */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-govgreen-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">💼</span>
                  </div>
                  <h3 className="text-xl font-bold text-govgray-800 mb-3">Entrevista de Sucesso</h3>
                  <p className="text-govgray-600 mb-6">
                    Prepare-se para sua <strong>entrevista de emprego</strong> com nossas dicas valiosas. Descubra como responder às perguntas mais comuns e deixar uma ótima impressão nos recrutadores.
                  </p>
                  <a 
                    href="https://www.catho.com.br/carreira-sucesso/dicas-emprego/como-se-preparar-para-uma-entrevista-de-emprego/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    PREPARE-SE PARA A ENTREVISTA
                  </a>
                </div>
              </div>

              {/* Dica 3: Direitos Trabalhistas */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-govyellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">⚖️</span>
                  </div>
                  <h3 className="text-xl font-bold text-govgray-800 mb-3">Seus Direitos Trabalhistas</h3>
                  <p className="text-govgray-600 mb-6">
                    Antes de aceitar qualquer vaga de trabalho, é fundamental conhecer e entender seus <strong>direitos trabalhistas</strong>. Use nossa Calculadora Trabalhista Gratuita para se informar e garantir um futuro seguro!
                  </p>
                  <a 
                    href="/calculadora" 
                    className="inline-block bg-govyellow-500 hover:bg-govyellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    ACESSAR CALCULADORA DE DIREITOS
                  </a>
                </div>
              </div>
            </div>

            {/* Texto adicional para SEO */}
            <div className="text-center mt-12 bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-govgray-800 mb-4">
                Por que escolher o Site do Trabalhador?
              </h3>
              <p className="text-lg text-govgray-700 max-w-4xl mx-auto leading-relaxed">
                Somos a plataforma completa que conecta <strong>trabalhadores brasileiros</strong> às melhores <strong>oportunidades de emprego</strong> 
                em todo o país. Além de vagas atualizadas diariamente, oferecemos ferramentas gratuitas como a 
                <strong> Calculadora Trabalhista</strong>, dicas de carreira e orientações sobre direitos trabalhistas. 
                Seu sucesso profissional é nossa missão!
              </p>
            </div>
          </section>
        )}

        {/* Espaço branco antes do footer */}
        <div className="bg-white py-12">
          {/* Espaço em branco intencional */}
        </div>

        {/* Modal de Lead Unificado */}
        <LeadModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          jobData={selectedJob}
        />
      </div>
    )
}

export default Vagas
