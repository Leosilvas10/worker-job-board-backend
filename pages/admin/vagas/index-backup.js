import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../../src/components/Admin/AdminLayout'

export default function AdminVagas() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [vagas, setVagas] = useState([])
  const [vagasBackend, setVagasBackend] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('frontend') // 'frontend', 'backend', 'sync'
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    // Verificar se está autenticado
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      carregarVagasReais()
      carregarVagasBackend()
    }
    setLoading(false)
  }, [])

  const carregarVagasReais = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Carregando TODAS as vagas (simples + externas) no painel admin...')

      // Usar a mesma API que a homepage e página de vagas
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/all-jobs-combined?t=${timestamp}&admin=true`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Dados recebidos no admin:', data)

      if (data.success && data.jobs && Array.isArray(data.jobs)) {
        setVagas(data.jobs)
        setLastUpdate(new Date().toLocaleString('pt-BR'))
        console.log(`✅ ${data.jobs.length} vagas carregadas no admin`)
        console.log(`📈 Fontes: ${data.meta?.sources?.join(', ') || 'N/A'}`)
        console.log(`🎯 Simples: ${data.jobs.filter(j => j.category?.includes('Doméstica') || j.category?.includes('Portaria') || j.category?.includes('Vendas')).length}`)
      } else {
        console.error('❌ Formato de dados inválido:', data)
        setError('Formato de dados inválido recebido da API')
        setVagas([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar vagas:', error)
      setError(error.message)
      setVagas([])
    } finally {
      setLoading(false)
    }
  }

  const carregarVagasBackend = async () => {
    try {
      console.log('🔄 Carregando vagas do BACKEND...')
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await fetch(`${backendUrl}/api/vagas`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Vagas do backend recebidas:', data)

      if (data.success && data.vagas && Array.isArray(data.vagas)) {
        setVagasBackend(data.vagas)
        console.log(`✅ ${data.vagas.length} vagas carregadas do backend`)
      } else {
        console.log('⚠️ Nenhuma vaga encontrada no backend')
        setVagasBackend([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar vagas do backend:', error)
      setVagasBackend([])
    }
  }

  const importarVagasParaBackend = async () => {
    try {
      setImporting(true)
      console.log('📥 Importando vagas do frontend para o backend...')
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await fetch(`${backendUrl}/api/vagas/import-from-frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Resultado da importação:', data)

      if (data.success) {
        alert(`✅ Importação concluída!\n\n` +
              `• ${data.stats.vagasImportadas} vagas novas\n` +
              `• ${data.stats.vagasAtualizadas} vagas atualizadas\n` +
              `• ${data.stats.erros} erros\n` +
              `• Total processado: ${data.stats.total}`)
        
        // Recarregar vagas do backend
        await carregarVagasBackend()
      } else {
        throw new Error(data.message || 'Erro na importação')
      }
    } catch (error) {
      console.error('❌ Erro na importação:', error)
      alert(`❌ Erro na importação: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <AdminLayout>
      <Head>
        <title>Administração de Vagas - Site do Trabalhador</title>
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administração de Vagas</h1>
              <p className="mt-2 text-gray-600">
                Gerenciamento de todas as vagas do sistema (Frontend + Backend)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={carregarVagasReais}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? '🔄 Carregando...' : '🔄 Atualizar Frontend'}
              </button>
              <button
                onClick={carregarVagasBackend}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                📊 Atualizar Backend
              </button>
              <button
                onClick={importarVagasParaBackend}
                disabled={importing || loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {importing ? '📥 Importando...' : '📥 Importar para Backend'}
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('frontend')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'frontend'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🌐 Vagas Frontend ({vagas.length})
              </button>
              <button
                onClick={() => setActiveTab('backend')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'backend'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🗄️ Vagas Backend ({vagasBackend.length})
              </button>
              <button
                onClick={() => setActiveTab('sync')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sync'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔄 Sincronização
              </button>
            </nav>
          </div>
          
          {lastUpdate && (
            <div className="mt-4 text-sm text-gray-500">
              Última atualização: {lastUpdate}
            </div>
          )}
        </div>

        {/* Estatísticas */}
        {(vagas.length > 0 || vagasBackend.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Frontend</p>
                  <p className="text-2xl font-bold text-gray-900">{vagas.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Backend</p>
                  <p className="text-2xl font-bold text-gray-900">{vagasBackend.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{vagas.length + vagasBackend.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cidades</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set([
                      ...vagas.map(v => v.location?.split(',')[0]),
                      ...vagasBackend.map(v => v.localizacao?.split(',')[0])
                    ]).size}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categorias</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set([
                      ...vagas.map(v => v.category),
                      ...vagasBackend.map(v => v.categoria)
                    ]).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
                <option value="">Todas as categorias</option>
                {Array.from(new Set(vagas.map(v => v.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
                <option value="">Todas as cidades</option>
                {Array.from(new Set(vagas.map(v => v.location?.split(',')[0]))).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white">
                <option value="">Todos os tipos</option>
                <option value="CLT">CLT</option>
                <option value="Autônomo">Autônomo</option>
                <option value="Diarista">Diarista</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro ao carregar vagas</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg text-gray-600">Carregando vagas...</span>
            </div>
          </div>
        )}

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === 'frontend' && (
          <>
            {/* Lista de Vagas Frontend */}
            {!loading && vagas.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    📱 Vagas do Frontend ({vagas.length})
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Vagas obtidas das APIs do frontend (simple-jobs, public-jobs, etc.)
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vaga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Empresa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Localização
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fonte
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vagas.slice(0, 50).map((vaga, index) => (
                        <tr key={vaga.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vaga.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {vaga.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {vaga.company?.name || vaga.company || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vaga.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vaga.salary}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {vaga.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {vaga.source || 'Frontend'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {vagas.length > 50 && (
                  <div className="px-6 py-4 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                      Mostrando primeiras 50 vagas de {vagas.length} total
                    </p>
                  </div>
                )}
              </div>
            )}

            {!loading && vagas.length === 0 && !error && (
              <div className="text-center py-12">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Nenhuma vaga do frontend encontrada</h3>
                <p className="mt-2 text-gray-500">Clique em "Atualizar Frontend" para carregar as vagas disponíveis.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'backend' && (
          <>
            {/* Lista de Vagas Backend */}
            {vagasBackend.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    🗄️ Vagas do Backend ({vagasBackend.length})
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Vagas armazenadas no banco de dados do backend
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vaga
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Empresa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Localização
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vagasBackend.slice(0, 50).map((vaga, index) => (
                        <tr key={vaga.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {vaga.titulo}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {vaga.id} | Criada: {new Date(vaga.data_criacao).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {vaga.empresa || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vaga.localizacao}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vaga.salario || 'A combinar'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {vaga.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              vaga.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {vaga.ativa ? 'Ativa' : 'Inativa'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                            <button className="text-red-600 hover:text-red-900">Excluir</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {vagasBackend.length > 50 && (
                  <div className="px-6 py-4 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">
                      Mostrando primeiras 50 vagas de {vagasBackend.length} total
                    </p>
                  </div>
                )}
              </div>
            )}

            {vagasBackend.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Nenhuma vaga no backend</h3>
                <p className="mt-2 text-gray-500">Use a função "Importar para Backend" para transferir vagas do frontend para o banco de dados.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'sync' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔄 Sincronização de Vagas</h3>
            <p className="text-gray-600 mb-6">
              Gerencie a sincronização entre as vagas do frontend e backend. As vagas do frontend são obtidas dinamicamente 
              de várias fontes, enquanto as do backend são armazenadas permanentemente no banco de dados.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-900">Importar vagas do frontend para o backend</h4>
                  <p className="text-sm text-blue-700">
                    Transfere todas as vagas do frontend para o banco de dados do backend
                  </p>
                </div>
                <button
                  onClick={importarVagasParaBackend}
                  disabled={importing || loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {importing ? '📥 Importando...' : '📥 Importar Agora'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">📱 Vagas Frontend</h5>
                  <p className="text-2xl font-bold text-blue-600">{vagas.length}</p>
                  <p className="text-sm text-gray-600">Disponíveis para importação</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">🗄️ Vagas Backend</h5>
                  <p className="text-2xl font-bold text-green-600">{vagasBackend.length}</p>
                  <p className="text-sm text-gray-600">Armazenadas no banco</p>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h5 className="font-medium text-yellow-900 mb-2">⚠️ Importante</h5>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• As vagas serão sincronizadas baseadas no ID único</li>
                  <li>• Vagas existentes serão atualizadas com novos dados</li>
                  <li>• Novas vagas serão inseridas no banco de dados</li>
                  <li>• O processo pode levar alguns minutos dependendo da quantidade</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
