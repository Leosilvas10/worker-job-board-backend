import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../../src/components/Admin/AdminLayout'
import { useJobStats, useJobFormatting } from '../../../src/hooks/useJobStats'

const AdminContentEditor = () => {
  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showRealStats, setShowRealStats] = useState(false)
  
  // Hook para estatísticas reais das vagas
  const { stats: jobStats, loading: statsLoading, error: statsError, refresh: refreshStats } = useJobStats()
  const { formatJobCount, formatCategoryCount } = useJobFormatting()
  
  const [contents, setContents] = useState({
    home: {
      title: 'Site do Trabalhador',
      subtitle: 'Encontre sua próxima oportunidade de trabalho',
      description: 'A maior plataforma de empregos do Brasil. Conectamos talentos com as melhores oportunidades do mercado.',
      heroText: 'Mais de 50.000 vagas disponíveis',
      ctaText: 'Buscar Vagas'
    },
    about: {
      title: 'Sobre Nós',
      mission: 'Nossa missão é conectar pessoas talentosas com empresas que valorizam seus potenciais.',
      vision: 'Ser a principal plataforma de empregos do Brasil.',
      values: 'Transparência, Inovação, Excelência'
    },
    contact: {
      title: 'Fale Conosco',
      email: 'contato@sitedotrabalhador.com.br',
      phone: '(11) 99999-9999',
      address: 'São Paulo, SP'
    },
    footer: {
      copyright: '© 2024 Site do Trabalhador. Todos os direitos reservados.',
      links: [
        { title: 'Política de Privacidade', url: '/privacidade' },
        { title: 'Termos de Uso', url: '/termos' },
        { title: 'Suporte', url: '/suporte' }
      ]
    }
  })

  useEffect(() => {
    // Carregar conteúdo salvo do localStorage
    const savedContent = localStorage.getItem('site_content')
    if (savedContent) {
      setContents(JSON.parse(savedContent))
    }
  }, [])

  const handleContentChange = (section, field, value) => {
    setContents(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    setLoading(true)
    localStorage.setItem('site_content', JSON.stringify(contents))
    
    setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1000)
  }

  const handlePreview = () => {
    window.open('/', '_blank')
  }

  const tabs = [
    { id: 'home', label: 'Página Inicial', icon: '🏠' },
    { id: 'about', label: 'Sobre', icon: '📋' },
    { id: 'contact', label: 'Contato', icon: '📞' },
    { id: 'footer', label: 'Rodapé', icon: '📄' }
  ]

  return (
    <AdminLayout>
      <Head>
        <title>Editor de Conteúdo - Admin</title>
      </Head>

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Editor de Conteúdo</h1>
          <p className="text-gray-600">Gerencie o conteúdo do site</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Páginas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Edição</p>
                <p className="text-2xl font-bold text-green-600">Hoje</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold text-purple-600">Online</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Backup</p>
                <p className="text-2xl font-bold text-orange-600">Auto</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            
            <button
              onClick={handlePreview}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Visualizar Site
            </button>

            {saved && (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Conteúdo salvo com sucesso!
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'home' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Página Inicial</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Principal
                  </label>
                  <input
                    type="text"
                    value={contents.home.title}
                    onChange={(e) => handleContentChange('home', 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={contents.home.subtitle}
                    onChange={(e) => handleContentChange('home', 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={contents.home.description}
                    onChange={(e) => handleContentChange('home', 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Hero
                  </label>
                  <input
                    type="text"
                    value={contents.home.heroText}
                    onChange={(e) => handleContentChange('home', 'heroText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={contents.home.ctaText}
                    onChange={(e) => handleContentChange('home', 'ctaText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Página Sobre</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={contents.about.title}
                    onChange={(e) => handleContentChange('about', 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Missão
                  </label>
                  <textarea
                    value={contents.about.mission}
                    onChange={(e) => handleContentChange('about', 'mission', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visão
                  </label>
                  <textarea
                    value={contents.about.vision}
                    onChange={(e) => handleContentChange('about', 'vision', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valores
                  </label>
                  <input
                    type="text"
                    value={contents.about.values}
                    onChange={(e) => handleContentChange('about', 'values', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Página de Contato</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={contents.contact.title}
                    onChange={(e) => handleContentChange('contact', 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contents.contact.email}
                    onChange={(e) => handleContentChange('contact', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={contents.contact.phone}
                    onChange={(e) => handleContentChange('contact', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={contents.contact.address}
                    onChange={(e) => handleContentChange('contact', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {activeTab === 'footer' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Rodapé</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Copyright
                  </label>
                  <input
                    type="text"
                    value={contents.footer.copyright}
                    onChange={(e) => handleContentChange('footer', 'copyright', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Links do Rodapé
                  </label>
                  <div className="space-y-3">
                    {contents.footer.links.map((link, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Título do link"
                          value={link.title}
                          onChange={(e) => {
                            const newLinks = [...contents.footer.links]
                            newLinks[index].title = e.target.value
                            handleContentChange('footer', 'links', newLinks)
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...contents.footer.links]
                            newLinks[index].url = e.target.value
                            handleContentChange('footer', 'links', newLinks)
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Dicas para Edição de Conteúdo
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Sempre salve suas alterações antes de sair</li>
                  <li>Use o botão "Visualizar Site" para ver as mudanças</li>
                  <li>Mantenha os textos claros e objetivos</li>
                  <li>O backup automático salva as alterações a cada 5 minutos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminContentEditor
