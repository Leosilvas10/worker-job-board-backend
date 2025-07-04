import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useSiteContext } from '../src/contexts/SiteContext'
import HeroSection from '../src/components/HeroSection/HeroSection'
import LeadModal from '../src/components/LeadModal/index'

export default function Home() {
  const { siteConfig } = useSiteContext()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  // Buscar vagas em destaque
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/all-jobs-combined')
        const data = await response.json()
        
        if (data.success && data.jobs) {
          // Pegar apenas as 6 primeiras vagas para exibir em destaque
          setJobs(data.jobs.slice(0, 6))
        }
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [])

  const handleApplyClick = (job) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedJob(null)
  }

  return (
    <>
      <Head>
        <title>Encontre a Sua Vaga Ideal e Conheça Seus Direitos! | Site do Trabalhador</title>
        <meta name="description" content="Milhares de vagas de empregos simples te esperam! Doméstica, Cuidador(a), Porteiro, Limpeza e muito mais. Aprenda seus direitos trabalhistas de forma fácil e gratuita." />
        <meta name="keywords" content="vagas de emprego, direitos trabalhistas, calculadora trabalhista, trabalho doméstico, cuidador, porteiro, limpeza" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://sitedotrabalhador.com.br" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sitedotrabalhador.com.br/" />
        <meta property="og:title" content="Site do Trabalhador - Vagas e Direitos Trabalhistas" />
        <meta property="og:description" content="Encontre vagas de emprego e conheça seus direitos trabalhistas. Calculadora trabalhista gratuita!" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://sitedotrabalhador.com.br/" />
        <meta property="twitter:title" content="Site do Trabalhador - Vagas e Direitos Trabalhistas" />
        <meta property="twitter:description" content="Encontre vagas de emprego e conheça seus direitos trabalhistas. Calculadora trabalhista gratuita!" />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Seção de Vagas em Destaque */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                🔥 Vagas em Destaque
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Confira as oportunidades mais procuradas e cadastre-se agora mesmo!
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-3"></div>
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {jobs.map((job, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 text-xs font-semibold bg-govblue-100 text-govblue-800 rounded-full">
                        {job.categoria || 'Geral'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {job.dataPublicacao || 'Recente'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {job.titulo || job.cargo || 'Cargo não informado'}
                    </h3>
                    
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span className="line-clamp-1">{job.empresa || 'Empresa Confidencial'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="line-clamp-1">{job.local || job.cidade || 'Local a definir'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span className="line-clamp-1">{job.salario || 'A combinar'}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="w-full bg-govgreen-600 hover:bg-govgreen-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                    >
                      📄 Candidatar-se
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <Link href="/vagas">
                <button className="bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                  Ver Todas as Vagas →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Seção da Calculadora Trabalhista */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                  🧮 Calculadora Trabalhista
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Calcule seus direitos trabalhistas de forma rápida e gratuita. Saiba quanto você deve receber!
                </p>
              </div>

              <div className="bg-gradient-to-br from-govblue-50 to-govgreen-50 rounded-2xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Conheça Seus Direitos
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-govgreen-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                        <span className="text-gray-700">Férias e 1/3 constitucional</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-govgreen-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                        <span className="text-gray-700">13º salário proporcional</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-govgreen-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                        <span className="text-gray-700">FGTS e multa rescisória</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-govgreen-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                        <span className="text-gray-700">Aviso prévio e horas extras</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <Link href="/calculadora">
                      <button className="bg-govblue-600 hover:bg-govblue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-lg">
                        🧮 Calcular Agora
                      </button>
                    </Link>
                    <p className="text-sm text-gray-500 mt-3">
                      Cálculo gratuito e instantâneo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card de Contato */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">📞</span>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                    Entre em Contato
                  </h2>
                </div>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Tem dúvidas sobre direitos trabalhistas, problemas com vagas ou sugestões? Nossa 
                  equipe está pronta para ajudar você.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Lado Esquerdo - Informações de Contato */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Fale Conosco</h3>
                  
                  {/* Email */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-govblue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">📧</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Email</h4>
                        <p className="text-gray-600">contato@sitedotrabalhador.com.br</p>
                        <p className="text-gray-500 text-sm">suporte@sitedotrabalhador.com.br</p>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">📱</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">WhatsApp</h4>
                        <p className="text-gray-600">(11) 99999-9999</p>
                        <p className="text-gray-500 text-sm">Seg. a Sex. 9h às 18h</p>
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-govgreen-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">📍</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Endereço</h4>
                        <p className="text-gray-600">São Paulo - SP, Brasil</p>
                        <p className="text-gray-500 text-sm">Atendimento 100% digital</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lado Direito - Formulário de Contato */}
                <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Envie sua Mensagem</h3>
                  
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Nome *</label>
                        <input
                          type="text"
                          placeholder="Seu nome completo"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          placeholder="seu@email.com"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Assunto *</label>
                      <select className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent">
                        <option value="">Selecione o assunto</option>
                        <option value="duvida">Dúvida geral</option>
                        <option value="direitos">Direitos trabalhistas</option>
                        <option value="empresa">Sou empresa</option>
                        <option value="candidato">Sou candidato</option>
                        <option value="suporte">Suporte técnico</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Mensagem *</label>
                      <textarea
                        rows={4}
                        placeholder="Descreva sua mensagem detalhadamente..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent resize-vertical"
                      />
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1" />
                      <label className="text-sm text-gray-600">
                        Aceito o tratamento dos meus dados conforme a{' '}
                        <a href="#" className="text-govgreen-600 hover:underline">Política de Privacidade</a>{' '}
                        e <a href="#" className="text-govgreen-600 hover:underline">LGPD</a>.
                      </label>
                    </div>
                    
                    <Link href="/contato">
                      <button
                        type="button"
                        className="w-full bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <span>📤</span>
                        <span>Enviar Mensagem</span>
                      </button>
                    </Link>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modal de Candidatura */}
        {showModal && selectedJob && (
          <LeadModal
            isOpen={showModal}
            onClose={handleModalClose}
            job={selectedJob}
          />
        )}
      </main>
    </>
  )
}
