import { useState, useEffect } from 'react'
import AdminLayout from '../../../src/components/Admin/AdminLayout'

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([])
  const [stats, setStats] = useState({
    totalEmpresas: 45,
    ativas: 32,
    pendentes: 8,
    parceiras: 5
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company data
        const response = await fetch('/api/get-leads')
        const data = await response.json()
        
        if (data.success && data.leads) {
          // Filter only company leads
          const companyLeads = data.leads.filter(lead => 
            lead.type === 'empresa' || 
            lead.source === 'formulario_empresas' ||
            lead.nomeEmpresa
          )
          
          setEmpresas(companyLeads)
          setStats({
            totalEmpresas: companyLeads.length,
            ativas: companyLeads.filter(c => c.status === 'active').length,
            pendentes: companyLeads.filter(c => c.status === 'pending').length,
            parceiras: companyLeads.filter(c => c.status === 'partner').length
          })
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.nomeEmpresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.cnpj?.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || empresa.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    alert('Exportar empresas para CSV')
  }

  const handleUpdateStatus = (empresaId, newStatus) => {
    setEmpresas(empresas.map(empresa => 
      empresa.id === empresaId ? { ...empresa, status: newStatus } : empresa
    ))
  }

  const handleContatar = (empresa) => {
    window.open(`mailto:${empresa.email}`, '_blank')
  }

  if (loading) {
    return (
      <AdminLayout title="Empresas">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Empresas">
      <div className="space-y-6">
        {/* Stats Cards - 4 cards em linha */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total de Empresas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalEmpresas}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Empresas Ativas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.ativas}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Parceiras</p>
                <p className="text-3xl font-bold text-gray-900">{stats.parceiras}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar por nome, email ou CNPJ..."
                className="flex-1 sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativa</option>
                <option value="pending">Pendente</option>
                <option value="partner">Parceira</option>
                <option value="inactive">Inativa</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                📊 Exportar CSV
              </button>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                ➕ Nova Empresa
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Empresas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Empresas ({filteredEmpresas.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segmento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmpresas.length > 0 ? filteredEmpresas.map((empresa, index) => (
                  <tr key={empresa.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-lg">🏢</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {empresa.nomeEmpresa || 'Empresa não informada'}
                          </div>
                          <div className="text-sm text-gray-500">
                            CNPJ: {empresa.cnpj || 'Não informado'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{empresa.email || 'Email não informado'}</div>
                      <div className="text-sm text-gray-500">{empresa.telefone || 'Telefone não informado'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empresa.segmento || empresa.ramo || 'Não especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={empresa.status || 'pending'}
                        onChange={(e) => handleUpdateStatus(empresa.id || index, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                          (empresa.status || 'pending') === 'active' ? 'bg-green-100 text-green-800' :
                          (empresa.status || 'pending') === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          (empresa.status || 'pending') === 'partner' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="active">Ativa</option>
                        <option value="partner">Parceira</option>
                        <option value="inactive">Inativa</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empresa.createdAt || empresa.timestamp ? 
                        new Date(empresa.createdAt || empresa.timestamp).toLocaleDateString() : 
                        'Data não disponível'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        👁️ Ver
                      </button>
                      <button 
                        onClick={() => handleContatar(empresa)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        📧 Contatar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-center">
                        <span className="text-4xl mb-4 block">🏢</span>
                        <p className="text-lg font-medium mb-2">Nenhuma empresa encontrada</p>
                        <p className="text-sm">Tente ajustar os filtros de busca</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card de Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-600 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Gerenciamento de Empresas</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Este painel permite gerenciar todas as empresas cadastradas:</p>
                <ul className="mt-2 ml-4 list-disc">
                  <li><strong>Visualizar:</strong> Todas as empresas com informações detalhadas</li>
                  <li><strong>Status:</strong> Controlar status da empresa (Ativa, Pendente, Parceira)</li>
                  <li><strong>Contatar:</strong> Comunicação direta por email</li>
                  <li><strong>Relatórios:</strong> Exportar dados para análise</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
