import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AdminLayout from '../../../src/components/Admin/AdminLayout'

export default function AdminVagas() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [vagas, setVagas] = useState([])
  const [filteredVagas, setFilteredVagas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Verificar se está autenticado
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      carregarVagas()
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Filtrar vagas quando search term ou categoria mudar
    let filtered = vagas
    
    if (searchTerm) {
      filtered = filtered.filter(vaga => 
        vaga.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vaga.company?.name || vaga.company)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaga.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (categoryFilter) {
      filtered = filtered.filter(vaga => vaga.category === categoryFilter)
    }
    
    setFilteredVagas(filtered)
  }, [vagas, searchTerm, categoryFilter])

  const carregarVagas = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Carregando vagas...')

      const response = await fetch('/api/all-jobs-combined', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Dados recebidos:', data)

      if (data.success && data.jobs && Array.isArray(data.jobs)) {
        setVagas(data.jobs)
        setFilteredVagas(data.jobs)
        setLastUpdate(new Date().toLocaleString('pt-BR'))
        console.log(`✅ ${data.jobs.length} vagas carregadas`)
      } else {
        console.error('❌ Formato de dados inválido:', data)
        setError('Formato de dados inválido recebido da API')
        setVagas([])
        setFilteredVagas([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar vagas:', error)
      setError(error.message)
      setVagas([])
      setFilteredVagas([])
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(vagas.map(v => v.category))).filter(Boolean)

  return (
    <AdminLayout title="Administração de Vagas">
      <Head>
        <title>Administração de Vagas - Site do Trabalhador</title>
      </Head>
      
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Vagas</h1>
              <p className="text-gray-600 mt-1">
                {filteredVagas.length} de {vagas.length} vagas encontradas
              </p>
            </div>
            <button
              onClick={carregarVagas}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
            </button>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{vagas.length}</div>
              <div className="text-sm text-gray-600">Total de Vagas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {vagas.filter(v => !v.expired).length}
              </div>
              <div className="text-sm text-gray-600">Vagas Ativas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categorias</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(vagas.map(v => v.location?.split(',')[0])).size}
              </div>
              <div className="text-sm text-gray-600">Cidades</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar vagas
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o título, empresa ou cidade..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por categoria
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-400 mr-3">❌</div>
              <div>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-lg text-gray-600">Carregando vagas...</span>
            </div>
          </div>
        )}

        {/* Lista de Vagas */}
        {!loading && filteredVagas.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">
                Lista de Vagas ({filteredVagas.length})
              </h3>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Última atualização: {lastUpdate}
                </p>
              )}
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
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVagas.slice(0, 50).map((vaga, index) => (
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
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {vaga.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vaga.salary || 'A combinar'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          vaga.isExternal 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {vaga.isExternal ? 'Externa' : 'Interna'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredVagas.length > 50 && (
              <div className="px-6 py-4 border-t border-gray-200 text-center bg-gray-50">
                <p className="text-sm text-gray-500">
                  Mostrando primeiras 50 vagas de {filteredVagas.length} total
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sem vagas */}
        {!loading && filteredVagas.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || categoryFilter ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga disponível'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter 
                ? 'Tente ajustar os filtros de busca' 
                : 'Clique em "Atualizar" para carregar as vagas disponíveis'
              }
            </p>
            {(searchTerm || categoryFilter) && (
              <button
                onClick={() => { setSearchTerm(''); setCategoryFilter('') }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
