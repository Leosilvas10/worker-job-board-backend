import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useSiteContext } from '../src/contexts/SiteContext'
import HeroSection from '../src/components/HeroSection/HeroSection'
import LeadModal from '../src/components/LeadModal/LeadModal'
import JobCard from '../src/components/JobCard/JobCard'

export default function Home() {
  const { siteConfig } = useSiteContext()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

  // Buscar vagas em destaque - mesma estrutura da página de vagas
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('🔍 Buscando vagas para destaque na homepage...')
        
        const response = await fetch(`/api/all-jobs-combined?t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const data = await response.json()
        
        if (data.success && data.jobs) {
          console.log(`✅ Total de ${data.jobs.length} vagas disponíveis`)
          console.log(`📊 Internas: ${data.meta?.internalJobs || 0}, Externas: ${data.meta?.externalJobs || 0}`)
          
          // Pegar apenas as 6 primeiras vagas para exibir em destaque
          const featuredJobs = data.jobs.slice(0, 6)
          console.log(`🔥 ${featuredJobs.length} vagas selecionadas para destaque`)
          
          setJobs(featuredJobs)
        } else {
          console.error('❌ Erro na resposta da API:', data.message)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar vagas:', error)
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
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="h-3 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {jobs.map((job, index) => (
                  <JobCard
                    key={index}
                    job={job}
                    onApplyClick={() => handleApplyClick(job)}
                  />
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



        {/* Seção com Estatísticas da Calculadora */}
        <section className="py-16 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">🚨</span>
                  <h2 className="text-3xl lg:text-4xl font-bold">
                    Será que Seus Direitos Estão Sendo Respeitados? Descubra Agora!
                  </h2>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
                <p className="text-xl mb-6">
                  Você trabalhou duro, mas tem dúvidas se recebeu <strong>tudo que era seu por direito</strong>? FGTS, 
                  seguro-desemprego, horas extras, rescisão... Infelizmente, <span className="text-yellow-300 font-bold">muitos trabalhadores perdem 
                  dinheiro</span> simplesmente por falta de informação. <span className="text-yellow-300 font-bold">Não deixe isso acontecer com você!</span>
                </p>
                <p className="text-lg mb-6">
                  Use nossa <strong>Calculadora de Direitos Trabalhistas GRATUITA</strong> e tenha uma estimativa clara do que te 
                  pertence. É uma ferramenta rápida, fácil de usar e totalmente segura. <span className="text-yellow-300 font-bold">Proteja seu futuro financeiro e 
                  garante o que é justo!</span>
                </p>
                
                <div className="mb-8">
                  <Link href="/calculadora">
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-lg inline-flex items-center gap-2">
                      <span>🧮</span>
                      <span>Calcular Meus Direitos →</span>
                    </button>
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-8 text-sm">
                  <span>✅ <strong>100% Gratuito</strong></span>
                  <span>✅ <strong>Resultados Imediatos</strong></span>
                  <span>✅ <strong>Dados Protegidos</strong></span>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold text-yellow-300 mb-2">25K+</div>
                  <div className="text-sm">Cálculos Realizados</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold text-yellow-300 mb-2">R$ 2.8M</div>
                  <div className="text-sm">Recuperados pelos Usuários*</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="text-4xl font-bold text-yellow-300 mb-2">4.9 ⭐</div>
                  <div className="text-sm">Avaliação dos Usuários</div>
                </div>
              </div>
              
              <p className="text-xs mt-4 opacity-70">
                *Estimativa baseada em relatos de usuários que utilizaram nossa calculadora
              </p>
            </div>
          </div>
        </section>

        {/* Seção das Empresas */}
        <section className="py-16 bg-gradient-to-br from-green-600 via-green-500 to-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">🏢</span>
                  <h2 className="text-3xl lg:text-4xl font-bold">
                    Sua Empresa Precisa de Talentos?
                  </h2>
                </div>
                <p className="text-xl max-w-3xl mx-auto">
                  Conecte-se diretamente com milhares de profissionais qualificados que estão 
                  procurando uma oportunidade! Domésticas, porteiros, cuidadores, auxiliares de 
                  limpeza, motoristas e muito mais.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-bold mb-6">
                  Por que escolher o Site do Trabalhador para encontrar seus funcionários?
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                    <span className="text-left"><strong>Candidatos Verificados:</strong> Profissionais com experiência real</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                    <span className="text-left"><strong>Resultados Rápidos:</strong> Receba candidatos em 24h</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                    <span className="text-left"><strong>Publicação Gratuita:</strong> Anuncie sua vaga sem custos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                    <span className="text-left"><strong>Suporte Dedicado:</strong> Nossa equipe te ajuda a encontrar o profissional ideal</span>
                  </div>
                </div>

                <div className="mb-6">
                  <Link href="/empresas">
                    <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-lg inline-flex items-center gap-2">
                      <span>🚀</span>
                      <span>PUBLIQUE SUA VAGA GRATUITAMENTE →</span>
                    </button>
                  </Link>
                </div>

                <p className="text-sm">
                  <span className="font-semibold">Junte-se a centenas de empresas que já encontraram seus funcionários conosco!</span>
                </p>
                <div className="flex items-center justify-center gap-8 mt-4 text-sm">
                  <span>✅ <strong>Cadastro Rápido</strong></span>
                  <span>✅ <strong>Sem Taxas Ocultas</strong></span>
                  <span>✅ <strong>Candidatos Qualificados</strong></span>
                  <span>✅ <strong>Atendimento Personalizado</strong></span>
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
                  
                  <form className="space-y-4 bg-white">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Nome *</label>
                        <input
                          type="text"
                          placeholder="Seu nome completo"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 !bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          placeholder="seu@email.com"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 !bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Assunto *</label>
                      <select className="w-full px-4 py-3 rounded-lg border border-gray-300 !bg-white text-gray-800 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent">
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
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 !bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-govgreen-500 focus:border-transparent resize-vertical"
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
            jobData={selectedJob}
          />
        )}
      </main>
    </>
  )
}
