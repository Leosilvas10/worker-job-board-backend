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

                {/* Informações da Vaga */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    💼 Vaga de Interesse
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Título da Vaga</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.vaga?.titulo || selectedLead.vaga_titulo || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Empresa</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.empresa || 'Não informada'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Localização</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.vaga?.localizacao || `${selectedLead.cidade}, ${selectedLead.estado}` || 'Não informada'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID da Vaga</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.vaga?.id || selectedLead.vaga_id || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO PRINCIPAL: DADOS DA PESQUISA RÁPIDA */}
                {(selectedLead.mensagem || selectedLead.observacoes) && 
                 (selectedLead.mensagem?.includes('PESQUISA RÁPIDA') || selectedLead.observacoes?.includes('PESQUISA RÁPIDA')) && (
                  <div className="bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-orange-500 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                      🎯 DADOS DA PESQUISA RÁPIDA SOBRE ÚLTIMO EMPREGO
                      <span className="ml-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                        DADOS PRINCIPAIS
                      </span>
                    </h3>

                    {(() => {
                      const message = selectedLead.mensagem || selectedLead.observacoes || ''
                      const lines = message.split('\n').filter(line => line.trim())

                      // Extrair informações específicas
                      const ultimaEmpresa = lines.find(line => line.includes('Última empresa:') || line.includes('1. Última empresa:'))?.split(':')[1]?.trim()
                      const tipoCarteira = lines.find(line => line.includes('Tipo de carteira:') || line.includes('2. Tipo de carteira:'))?.split(':')[1]?.trim()
                      const recebeuCertinho = lines.find(line => line.includes('Recebeu certinho:') || line.includes('3. Recebeu certinho:'))?.split(':')[1]?.trim()
                      const situacoes = lines.find(line => line.includes('Situações enfrentadas:') || line.includes('4. Situações enfrentadas:'))?.split(':')[1]?.trim()
                      const consultaGratuita = lines.find(line => line.includes('consulta gratuita:') || line.includes('5. Aceita consulta:'))?.split(':')[1]?.trim()

                      // Verificar se é um lead com possíveis problemas trabalhistas
                      const temProblemasTrabalhistas = message.toLowerCase().includes('não recebi') || 
                                                       message.toLowerCase().includes('hora extra') ||
                                                       message.toLowerCase().includes('assédio') ||
                                                       message.toLowerCase().includes('humilhações') ||
                                                       message.toLowerCase().includes('acúmulo de funções') ||
                                                       message.toLowerCase().includes('sem receber') ||
                                                       tipoCarteira?.toLowerCase().includes('sem carteira') ||
                                                       recebeuCertinho?.toLowerCase().includes('não') ||
                                                       recebeuCertinho?.toLowerCase().includes('parte')

                      return (
                        <div className="space-y-6">
                          {/* Alerta para leads prioritários */}
                          {temProblemasTrabalhistas && (
                            <div className="bg-red-600 text-white p-4 rounded-lg border-l-4 border-red-800">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">🚨</span>
                                <div>
                                  <h4 className="font-bold text-lg">LEAD PRIORITÁRIO - POSSÍVEL PROBLEMA TRABALHISTA</h4>
                                  <p className="text-sm mt-1">
                                    Este candidato reportou situações que podem indicar direitos trabalhistas não pagos. 
                                    <strong> CONTATO URGENTE RECOMENDADO!</strong>
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Coluna Esquerda */}
                            <div className="space-y-4">
                              <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
                                <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                                  🏢 Última Empresa onde Trabalhou
                                </h5>
                                <p className="text-xl font-semibold text-blue-700 bg-blue-50 p-3 rounded">
                                  {ultimaEmpresa || 'Não informado'}
                                </p>
                              </div>

                              <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
                                <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                                  📄 Situação da Carteira de Trabalho
                                </h5>
                                <div className={`p-3 rounded font-medium ${
                                  tipoCarteira?.toLowerCase().includes('com carteira') ? 'bg-green-100 text-green-800 border border-green-300' :
                                  tipoCarteira?.toLowerCase().includes('sem carteira') ? 'bg-red-100 text-red-800 border border-red-300' :
                                  tipoCarteira?.toLowerCase().includes('comecei sem') ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                  'bg-gray-100 text-gray-800 border border-gray-300'
                                }`}>
                                  {tipoCarteira || 'Não informado'}
                                </div>
                              </div>

                              <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
                                <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                                  💰 Recebeu os Direitos Trabalhistas?
                                </h5>
                                <div className={`p-3 rounded font-medium ${
                                  recebeuCertinho?.toLowerCase().includes('sim') ? 'bg-green-100 text-green-800 border border-green-300' :
                                  recebeuCertinho?.toLowerCase().includes('não') || recebeuCertinho?.toLowerCase().includes('parte') ? 'bg-red-100 text-red-800 border border-red-300' :
                                  'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                }`}>
                                  {recebeuCertinho || 'Não informado'}
                                </div>
                              </div>
                            </div>

                            {/* Coluna Direita */}
                            <div className="space-y-4">
                              <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
                                <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                                  ⚠️ Situações Problemáticas Enfrentadas
                                </h5>
                                <div className="space-y-2">
                                  {situacoes ? (
                                    <div className="space-y-2">
                                      {situacoes.split(',').map((situacao, index) => (
                                        <div key={index} className={`p-3 rounded border ${
                                          situacao.trim().toLowerCase() === 'nenhuma dessas' ? 
                                          'bg-green-100 text-green-800 border-green-300' :
                                          'bg-red-100 text-red-800 border-red-300'
                                        }`}>
                                          <strong>•</strong> {situacao.trim()}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 bg-gray-100 p-3 rounded">Não informado</p>
                                  )}
                                </div>
                              </div>

                              <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
                                <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                                  ⚖️ Interesse em Consulta Jurídica Gratuita
                                </h5>
                                <div className={`p-3 rounded font-medium ${
                                  consultaGratuita?.toLowerCase().includes('sim') ? 'bg-green-100 text-green-800 border border-green-300' :
                                  consultaGratuita?.toLowerCase().includes('não') ? 'bg-red-100 text-red-800 border border-red-300' :
                                  'bg-gray-100 text-gray-800 border border-gray-300'
                                }`}>
                                  {consultaGratuita || 'Não informado'}
                                </div>
                              </div>

                              {/* Contato prioritário se há problemas */}
                              {temProblemasTrabalhistas && (
                                <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg">
                                  <h6 className="font-bold text-yellow-800 mb-2 flex items-center">
                                    📞 CONTATO PRIORITÁRIO
                                  </h6>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Nome:</strong> {selectedLead.nome}</p>
                                    <p><strong>WhatsApp:</strong> {selectedLead.telefone}</p>
                                    <div className="flex gap-2 mt-3">
                                      <button
                                        onClick={() => window.open(`https://wa.me/55${selectedLead.telefone?.replace(/\D/g, '')}`, '_blank')}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700"
                                      >
                                        📱 WhatsApp URGENTE
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Pesquisa Trabalhista - Dados específicos */}
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                    ⚖️ Pesquisa Trabalhista - Último Emprego
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Empresa</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.dadosCompletos?.ultimaEmpresa || selectedLead.empresa || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Carteira</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.dadosCompletos?.tipoCarteira || selectedLead.tipo_carteira) === 'sim' ? 'bg-green-100 text-green-800' :
                        (selectedLead.dadosCompletos?.tipoCarteira || selectedLead.tipo_carteira) === 'nao' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.dadosCompletos?.tipoCarteira === 'sim' ? 'Com carteira assinada' :
                         selectedLead.dadosCompletos?.tipoCarteira === 'nao' ? 'Sem carteira assinada' :
                         selectedLead.dadosCompletos?.tipoCarteira === 'parcial' ? 'Parcialmente registrado' :
                         'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recebeu Direitos Trabalhistas</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.dadosCompletos?.recebeuTudoCertinho || selectedLead.recebeu_direitos) === 'sim' ? 'bg-green-100 text-green-800' :
                        (selectedLead.dadosCompletos?.recebeuTudoCertinho || selectedLead.recebeu_direitos) === 'nao' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.dadosCompletos?.recebeuTudoCertinho === 'sim' ? 'Sim, recebeu tudo' :
                         selectedLead.dadosCompletos?.recebeuTudoCertinho === 'nao' ? 'Não recebeu nada' :
                         selectedLead.dadosCompletos?.recebeuTudoCertinho === 'parcial' ? 'Recebeu parcialmente' :
                         'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Aceita Consultoria</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.dadosCompletos?.aceitaConsultoria || selectedLead.aceita_consultoria) === 'sim' ? 'bg-green-100 text-green-800' :
                        (selectedLead.dadosCompletos?.aceitaConsultoria || selectedLead.aceita_consultoria) === 'nao' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.dadosCompletos?.aceitaConsultoria === 'sim' ? 'Sim, quer consultoria' :
                         selectedLead.dadosCompletos?.aceitaConsultoria === 'nao' ? 'Não quer consultoria' :
                         'Não informado'}```text

                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Situações Enfrentadas</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.dadosCompletos?.situacoesDuranteTrabalho ? 
                          Array.isArray(selectedLead.dadosCompletos.situacoesDuranteTrabalho) ?
                            selectedLead.dadosCompletos.situacoesDuranteTrabalho.map(situacao => {
                              switch(situacao) {
                                case 'horas_extras_nao_pagas': return 'Horas extras não pagas';
                                case 'fgts_nao_depositado': return 'FGTS não depositado';
                                case 'trabalho_domingos_feriados': return 'Trabalho em domingos/feriados';
                                case 'assedio_moral': return 'Assédio moral';
                                case 'acumulo_funcoes': return 'Acúmulo de funções';
                                case 'nenhuma': return 'Nenhuma dessas';
                                default: return situacao;
                              }
                            }).join(', ') :
                            selectedLead.dadosCompletos.situacoesDuranteTrabalho :
                          selectedLead.situacoes_enfrentadas || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verbas Rescisórias */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    💰 Verbas Rescisórias
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">FGTS</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.verbas?.fgts || selectedLead.fgts)?.includes('sim') ? 'bg-green-100 text-green-800' :
                        (selectedLead.pesquisaTrabalhista?.verbas?.fgts || selectedLead.fgts)?.includes('não') ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.verbas?.fgts || selectedLead.fgts || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Férias</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.verbas?.ferias || selectedLead.ferias)?.includes('sim') ? 'bg-green-100 text-green-800' :
                        (selectedLead.pesquisaTrabalhista?.verbas?.ferias || selectedLead.ferias)?.includes('não') ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.verbas?.ferias || selectedLead.ferias || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">13º Salário</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.verbas?.decimoTerceiro || selectedLead.decimo_terceiro)?.includes('sim') ? 'bg-green-100 text-green-800' :
                        (selectedLead.pesquisaTrabalhista?.verbas?.decimoTerceiro || selectedLead.decimo_terceiro)?.includes('não') ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.verbas?.decimoTerceiro || selectedLead.decimo_terceiro || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Horas Extras</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.verbas?.horasExtras || selectedLead.horas_extras)?.includes('sim') ? 'bg-green-100 text-green-800' :
                        (selectedLead.pesquisaTrabalhista?.verbas?.horasExtras || selectedLead.horas_extras)?.includes('não') ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.verbas?.horasExtras || selectedLead.horas_extras || 'Não informado'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Verbas de Rescisão</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.pesquisaTrabalhista?.verbas?.verbas_rescisao || selectedLead.verbas_rescisao || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Problemas Trabalhistas */}
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                    ⚠️ Problemas Trabalhistas Identificados
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assédio</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.problemas?.assedio || selectedLead.assedio)?.includes('sim') ? 'bg-red-100 text-red-800' :
                        (selectedLead.pesquisaTrabalhista?.problemas?.assedio || selectedLead.assedio)?.includes('não') ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.problemas?.assedio || selectedLead.assedio || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Humilhações</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.problemas?.humilhacoes || selectedLead.humilhacoes)?.includes('sim') ? 'bg-red-100 text-red-800' :
                        (selectedLead.pesquisaTrabalhista?.problemas?.humilhacoes || selectedLead.humilhacoes)?.includes('não') ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.problemas?.humilhacoes || selectedLead.humilhacoes || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Acúmulo de Funções</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.problemas?.acumulo_funcoes || selectedLead.acumulo_funcoes)?.includes('sim') ? 'bg-red-100 text-red-800' :
                        (selectedLead.pesquisaTrabalhista?.problemas?.acumulo_funcoes || selectedLead.acumulo_funcoes)?.includes('não') ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.problemas?.acumulo_funcoes || selectedLead.acumulo_funcoes || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sem Registro</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.problemas?.sem_registro || selectedLead.sem_registro)?.includes('sim') ? 'bg-red-100 text-red-800' :
                        (selectedLead.pesquisaTrabalhista?.problemas?.sem_registro || selectedLead.sem_registro)?.includes('não') ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.problemas?.sem_registro || selectedLead.sem_registro || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Atraso de Salário</label>
                      <p className={`mt-1 text-sm font-medium p-2 rounded ${
                        (selectedLead.pesquisaTrabalhista?.problemas?.atraso_salario || selectedLead.atraso_salario)?.includes('sim') ? 'bg-red-100 text-red-800' :
                        (selectedLead.pesquisaTrabalhista?.problemas?.atraso_salario || selectedLead.atraso_salario)?.includes('não') ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.pesquisaTrabalhista?.problemas?.atraso_salario || selectedLead.atraso_salario || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Observações e Mensagem */}
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                    💬 Observações e Mensagem
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Observações do Candidato</label>
                    <div className="mt-1 bg-white p-4 rounded border min-h-[100px]">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedLead.observacoes || selectedLead.mensagem || 'Nenhuma observação fornecida'}
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
                        {selectedLead.fonte || 'site'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UTM Source</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.utm?.source || selectedLead.utm_source || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UTM Medium</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.utm?.medium || selectedLead.utm_medium || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UTM Campaign</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.utm?.campaign || selectedLead.utm_campaign || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.criadoEm || selectedLead.data_criacao ? 
                          new Date(selectedLead.criadoEm || selectedLead.data_criacao).toLocaleString('pt-BR') : 
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
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedLead.status === 'novo' ? 'Novo' :
                           selectedLead.status === 'contatado' ? 'Contatado' :
                           selectedLead.status === 'convertido' ? 'Convertido' :
                           selectedLead.status || 'Não definido'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contatado</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.contatado ? '✅ Sim' : '❌ Não'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Convertido</label>
                      <p className="mt-1 text-sm text-gray-900 bg-white p-2 rounded">
                        {selectedLead.convertido ? '✅ Sim' : '❌ Não'}
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