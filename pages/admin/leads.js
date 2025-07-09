import { useState, useEffect } from 'react'
import AdminLayout from '../../src/components/Admin/AdminLayout'

export default function AdminLeads() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({
    totalLeads: 152,
    leadsHoje: 8,
    conversion: '12%',
    pendentes: 34
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Carregando leads do painel admin...')
        const response = await fetch('/api/get-leads')
        const data = await response.json()

        console.log('📊 Resposta da API:', data)

        // SEMPRE usar os dados retornados pela API (que agora sempre funciona)
        if (data && data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads)
          setStats({
            totalLeads: data.leads.length,
            leadsHoje: data.leads.filter(lead => {
              const today = new Date().toDateString()
              const leadDate = new Date(lead.criadoEm || lead.createdAt || lead.timestamp).toDateString()
              return leadDate === today
            }).length,
            conversion: '12%',
            pendentes: data.leads.filter(lead => 
              lead.status === 'novo' || 
              lead.status === 'pending' || 
              !lead.contatado
            ).length
          })
          console.log('✅ Leads carregados com sucesso:', data.leads.length)
        } else {
          console.log('⚠️ Dados inválidos, usando fallback')
          setLeads([])
          setStats({
            totalLeads: 0,
            leadsHoje: 0,
            conversion: '0%',
            pendentes: 0
          })
        }
      } catch (error) {
        console.error('❌ Erro ao carregar leads:', error)
        setLeads([])
        setStats({
          totalLeads: 0,
          leadsHoje: 0,
          conversion: '0%',
          pendentes: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = (lead.nome || lead.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.email)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.telefone || lead.phone)?.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    alert('Exportar leads para CSV')
  }

  const handleUpdateStatus = (leadId, newStatus) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ))
  }

  const handleViewLead = (lead) => {
    setSelectedLead(lead)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedLead(null)
  }

  const handleDeleteLead = async (leadId) => {
    if (confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      try {
        // Em produção, fazer DELETE para o backend
        setLeads(leads.filter(lead => lead.id !== leadId))
        alert('Lead excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir lead:', error)
        alert('Erro ao excluir lead. Tente novamente.')
      }
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Leads">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Leads">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total de Leads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Leads Hoje</p>
                <p className="text-3xl font-bold text-gray-900">{stats.leadsHoje}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversion}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center p-2">
                <img 
                  src="/site do trabalhador.png" 
                  alt="Site do Trabalhador" 
                  className="w-full h-full object-contain"
                />
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
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="contacted">Contatado</option>
                <option value="converted">Convertido</option>
                <option value="closed">Fechado</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Tabela de Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Leads ({filteredLeads.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interesse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.nome || lead.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.telefone || lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.vaga?.titulo || lead.vaga_titulo || lead.interesse || 'Pesquisa Trabalhista'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.fonte || lead.source || 'Formulário Site'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                          lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="contacted">Contatado</option>
                        <option value="converted">Convertido</option>
                        <option value="closed">Fechado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.criadoEm || lead.data_criacao || lead.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleViewLead(lead)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        👁️ Ver
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informações sobre Leads */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-600 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Sobre os Leads</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Os leads são potenciais clientes que demonstraram interesse no site:</p>
                <ul className="mt-2 ml-4 list-disc">
                  <li><strong>Pendente:</strong> Lead recém-chegado, precisa ser contatado</li>
                  <li><strong>Contatado:</strong> Primeiro contato realizado</li>
                  <li><strong>Convertido:</strong> Lead se tornou cliente/candidato</li>
                  <li><strong>Fechado:</strong> Lead finalizado (convertido ou descartado)</li>
                </ul>
                <p className="mt-2">Use os filtros para encontrar leads específicos e atualize o status conforme o andamento.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Detalhes do Lead */}
        {showModal && selectedLead && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              {/* Header do Modal */}
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  📋 Detalhes do Lead - {selectedLead.nome}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="mt-6 space-y-6">
                {/* Informações Pessoais */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    👤 Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">{selectedLead.nome || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">{selectedLead.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefone</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">{selectedLead.telefone || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Idade</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">{selectedLead.idade || 'Não informada'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cidade</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">{selectedLead.cidade || 'Não informada'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">{selectedLead.estado || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Pesquisa Trabalhista - Último Emprego */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    🏢 Pesquisa Trabalhista - Último Emprego
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Empresa</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.nome_ultima_empresa || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Carteira</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.tipo_carteira === 'com_carteira' ? 'Com carteira assinada' :
                         selectedLead.tipo_carteira === 'sem_carteira' ? 'Sem carteira assinada' :
                         selectedLead.tipo_carteira === 'comecou_sem_depois_registrou' ? 'Comecei sem, depois registraram' :
                         selectedLead.tipo_carteira === 'nao_tenho_certeza' ? 'Não tenho certeza' :
                         'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recebeu Direitos Trabalhistas</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.recebeu_tudo_certinho === 'sim' ? 'Sim' :
                         selectedLead.recebeu_tudo_certinho === 'nao_recebi_nada' ? 'Não recebi nada' :
                         selectedLead.recebeu_tudo_certinho === 'recebi_so_uma_parte' ? 'Recebi só uma parte' :
                         selectedLead.recebeu_tudo_certinho === 'nao_sei_dizer' ? 'Não sei dizer' :
                         'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aceita Consultoria</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.aceita_consultoria === 'sim' ? 'Sim, quero saber se tenho algo a receber' :
                         selectedLead.aceita_consultoria === 'nao' ? 'Não, obrigado(a)' :
                         'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Situações Enfrentadas</label>
                    <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                      {selectedLead.situacoes_enfrentadas || 'Não informado'}
                    </p>
                  </div>
                </div>

                {/* Observações */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    📝 Observações e Mensagem
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações do Candidato</label>
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedLead.mensagem || 'Nenhuma observação fornecida'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informações de Rastreamento */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    📊 Informações de Rastreamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fonte</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.fonte || 'Pesquisa Trabalhista'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UTM Source</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.utm_source || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UTM Medium</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.utm_medium || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UTM Campaign</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.utm_campaign || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.data_criacao ? 
                          new Date(selectedLead.data_criacao).toLocaleString('pt-BR') : 
                          'Não informada'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Atual</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedLead.status === 'novo' ? 'bg-blue-100 text-blue-800' :
                          selectedLead.status === 'contatado' ? 'bg-yellow-100 text-yellow-800' :
                          selectedLead.status === 'convertido' ? 'bg-green-100 text-green-800' :
                          selectedLead.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedLead.status === 'novo' ? 'Novo' :
                           selectedLead.status === 'contatado' ? 'Contatado' :
                           selectedLead.status === 'convertido' ? 'Convertido' :
                           selectedLead.status === 'cancelado' ? 'Cancelado' :
                           'Não informado'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contatado</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedLead.contatado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedLead.contatado ? '✓ Sim' : '✗ Não'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Convertido</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedLead.convertido ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedLead.convertido ? '✓ Sim' : '✗ Não'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ações do Modal */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => window.open(`mailto:${selectedLead.email}`, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📧 Enviar Email
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/${selectedLead.telefone?.replace(/\D/g, '')}`, '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📱 WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        const text = `Nome: ${selectedLead.nome}\nEmail: ${selectedLead.email}\nTelefone: ${selectedLead.telefone}\nVaga: ${selectedLead.vaga?.titulo || selectedLead.vaga_titulo}\nExperiência: ${selectedLead.profissional?.experienciaAnos || selectedLead.experiencia_anos} anos\nPretensão: ${selectedLead.profissional?.pretensaoSalarial || selectedLead.pretensao_salarial}`
                        navigator.clipboard.writeText(text)
                        alert('Dados copiados para a área de transferência!')
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📋 Copiar Dados
                    </button>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    ✕ Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}