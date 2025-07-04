import { useState } from 'react'

const LeadModal = ({ isOpen, onClose, jobData }) => {
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: '',
    telefone: '',
    email: '',
    idade: '',
    cidade: '',
    estado: '',
    
    // Dados sobre trabalho anterior (para análise de demissão)
    trabalhouAntes: '',
    ultimoEmprego: '',
    tempoUltimoEmprego: '',
    motivoDemissao: '',
    salarioAnterior: '',
    experienciaAnos: '',
    
    // Dados complementares
    disponibilidade: '',
    pretensaoSalarial: '',
    observacoes: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState(1) // 1: dados pessoais, 2: dados profissionais

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNextStep = () => {
    // Validar dados básicos antes de ir para próximo step
    if (!formData.nome || !formData.telefone || !formData.email) {
      setMessage('Preencha todos os campos obrigatórios')
      return
    }
    setStep(2)
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const candidaturaData = {
        ...formData,
        // Dados da vaga
        vagaId: jobData?.id,
        vagaTitulo: jobData?.title,
        vagaEmpresa: jobData?.company?.name || jobData?.company,
        vagaLocalizacao: jobData?.location,
        // Fonte e rastreamento
        fonte: 'site',
        utm_source: window.location.search.includes('utm_source') ? 
          new URLSearchParams(window.location.search).get('utm_source') : '',
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || ''
      }

      const response = await fetch('/api/submit-candidatura-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidaturaData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Candidatura enviada com sucesso! Nossa equipe entrará em contato em breve.')
        
        // Resetar formulário após 3 segundos
        setTimeout(() => {
          setFormData({
            nome: '', telefone: '', email: '', idade: '', cidade: '', estado: '',
            trabalhouAntes: '', ultimoEmprego: '', tempoUltimoEmprego: '', 
            motivoDemissao: '', salarioAnterior: '', experienciaAnos: '',
            disponibilidade: '', pretensaoSalarial: '', observacoes: ''
          })
          setStep(1)
          setMessage('')
          onClose()
        }, 3000)
        
      } else {
        setMessage('❌ ' + (data.message || 'Erro ao enviar candidatura'))
      }
    } catch (error) {
      console.error('Erro:', error)
      setMessage('❌ Erro ao enviar candidatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-govblue-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Candidatar-se à Vaga</h2>
              <p className="text-blue-100 mt-1">{jobData?.title}</p>
              <p className="text-blue-200 text-sm">{jobData?.company?.name || jobData?.company}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-white text-govblue-600' : 'bg-blue-500 text-white'
              }`}>
                1
              </div>
              <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-white' : 'bg-blue-500'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-white text-govblue-600' : 'bg-blue-500 text-white'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between text-sm text-blue-100 mt-1">
              <span>Dados Pessoais</span>
              <span>Experiência Profissional</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seus Dados Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    name="idade"
                    value={formData.idade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                    placeholder="São Paulo"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-govblue-600 text-white px-6 py-2 rounded-lg hover:bg-govblue-700 transition-colors"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiência Profissional</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Já trabalhou antes?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trabalhouAntes"
                      value="sim"
                      checked={formData.trabalhouAntes === 'sim'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Sim
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trabalhouAntes"
                      value="nao"
                      checked={formData.trabalhouAntes === 'nao'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Não
                  </label>
                </div>
              </div>

              {formData.trabalhouAntes === 'sim' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Último emprego
                      </label>
                      <input
                        type="text"
                        name="ultimoEmprego"
                        value={formData.ultimoEmprego}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                        placeholder="Ex: Auxiliar de limpeza"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quanto tempo trabalhou lá?
                      </label>
                      <input
                        type="text"
                        name="tempoUltimoEmprego"
                        value={formData.tempoUltimoEmprego}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                        placeholder="Ex: 2 anos"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Como foi sua saída do último emprego? *
                    </label>
                    <select
                      name="motivoDemissao"
                      value={formData.motivoDemissao}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="demitido-sem-justa-causa">Fui demitido sem justa causa</option>
                      <option value="demitido-justa-causa">Fui demitido por justa causa</option>
                      <option value="pedi-demissao">Eu pedi demissão</option>
                      <option value="fim-contrato">Fim do contrato temporário</option>
                      <option value="acordo-mutuo">Acordo mútuo</option>
                      <option value="ainda-trabalho">Ainda estou trabalhando</option>
                      <option value="outros">Outros motivos</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salário anterior
                      </label>
                      <input
                        type="text"
                        name="salarioAnterior"
                        value={formData.salarioAnterior}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                        placeholder="Ex: R$ 1.400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anos de experiência
                      </label>
                      <input
                        type="number"
                        name="experienciaAnos"
                        value={formData.experienciaAnos}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disponibilidade
                  </label>
                  <select
                    name="disponibilidade"
                    value={formData.disponibilidade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="imediata">Imediata</option>
                    <option value="15-dias">Em 15 dias</option>
                    <option value="30-dias">Em 30 dias</option>
                    <option value="combinar">A combinar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pretensão salarial
                  </label>
                  <input
                    type="text"
                    name="pretensaoSalarial"
                    value={formData.pretensaoSalarial}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                    placeholder="Ex: R$ 1.600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações adicionais
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-govblue-500 focus:border-govblue-500"
                  placeholder="Conte-nos mais sobre sua experiência..."
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('✅') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-govblue-600 text-white px-6 py-2 rounded-lg hover:bg-govblue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Candidatura'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default LeadModal
