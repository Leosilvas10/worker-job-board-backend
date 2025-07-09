
import React, { useState, useEffect } from 'react'

const LeadModal = ({ isOpen, onClose, jobData }) => {
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    ultimaEmpresa: '',
    tipoCarteira: '',
    recebeuTudoCertinho: '',
    situacoesDuranteTrabalho: [],
    aceitaConsultoria: '',
    consentimento: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome: '',
        whatsapp: '',
        ultimaEmpresa: '',
        tipoCarteira: '',
        recebeuTudoCertinho: '',
        situacoesDuranteTrabalho: [],
        aceitaConsultoria: '',
        consentimento: false
      })
      setError('')
      setSuccess(false)
    }
  }, [isOpen])

  // Função para formatar WhatsApp
  const formatWhatsApp = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      if (name === 'consentimento') {
        setFormData(prev => ({ ...prev, [name]: checked }))
      } else {
        // Para checkboxes de múltipla escolha
        setFormData(prev => ({
          ...prev,
          situacoesDuranteTrabalho: checked
            ? [...prev.situacoesDuranteTrabalho, value]
            : prev.situacoesDuranteTrabalho.filter(item => item !== value)
        }))
      }
    } else if (name === 'whatsapp') {
      setFormData(prev => ({ ...prev, [name]: formatWhatsApp(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    // Validação rigorosa
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return false
    }

    if (!formData.whatsapp.trim()) {
      setError('WhatsApp é obrigatório')
      return false
    }

    // Validar formato do WhatsApp
    const whatsappNumbers = formData.whatsapp.replace(/\D/g, '')
    if (whatsappNumbers.length < 10 || whatsappNumbers.length > 11) {
      setError('WhatsApp deve ter formato válido')
      return false
    }

    if (!formData.ultimaEmpresa.trim()) {
      setError('Última empresa é obrigatória')
      return false
    }

    if (!formData.tipoCarteira) {
      setError('Selecione se possui carteira assinada')
      return false
    }

    if (!formData.recebeuTudoCertinho) {
      setError('Informe se recebeu tudo certinho')
      return false
    }

    if (!formData.aceitaConsultoria) {
      setError('Selecione se aceita consultoria')
      return false
    }

    if (!formData.consentimento) {
      setError('Você deve aceitar os termos')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Preparar dados no formato exato que o backend espera
      const payload = {
        nomeCompleto: formData.nome.trim(),
        whatsapp: formData.whatsapp.trim(),
        ultimaEmpresa: formData.ultimaEmpresa.trim(),
        tipoCarteira: formData.tipoCarteira,
        recebeuTudoCertinho: formData.recebeuTudoCertinho,
        situacoesDuranteTrabalho: formData.situacoesDuranteTrabalho,
        aceitaConsultoria: formData.aceitaConsultoria,
        vagaId: jobData?.id || 'sem-vaga',
        vagaTitulo: jobData?.title || 'Vaga não especificada',
        vagaEmpresa: jobData?.company || 'Empresa não especificada',
        timestamp: new Date().toISOString()
      }

      console.log('📤 Enviando dados para o backend:', payload)

      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      console.log('📨 Resposta do backend:', response.status, result)

      if (response.ok && result.success) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.message || 'Erro ao enviar candidatura')
      }

    } catch (error) {
      console.error('❌ Erro no envio:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Candidatar-se para: {jobData?.title || 'Vaga'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                Candidatura enviada com sucesso!
              </h3>
              <p className="text-gray-600">
                Entraremos em contato em breve via WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Nome Completo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* WhatsApp */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp * (com DDD)
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              {/* Última Empresa */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Última empresa onde trabalhou *
                </label>
                <input
                  type="text"
                  name="ultimaEmpresa"
                  value={formData.ultimaEmpresa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa"
                  required
                />
              </div>

              {/* Tipo de Carteira */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possui carteira assinada? *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoCarteira"
                      value="sim"
                      checked={formData.tipoCarteira === 'sim'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Sim
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipoCarteira"
                      value="nao"
                      checked={formData.tipoCarteira === 'nao'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Não
                  </label>
                </div>
              </div>

              {/* Recebeu Tudo Certinho */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recebeu tudo certinho na última empresa? *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recebeuTudoCertinho"
                      value="sim"
                      checked={formData.recebeuTudoCertinho === 'sim'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Sim, recebi tudo certinho
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recebeuTudoCertinho"
                      value="nao"
                      checked={formData.recebeuTudoCertinho === 'nao'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Não, tive problemas
                  </label>
                </div>
              </div>

              {/* Situações Durante o Trabalho */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Situações que passou no trabalho (opcional):
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'horas_extras', label: 'Fazia hora extra sem receber' },
                    { value: 'domingos_feriados', label: 'Trabalhei domingos/feriados sem adicional ou folga' },
                    { value: 'assedio_moral', label: 'Sofri assédio ou humilhações' },
                    { value: 'acumulo_funcoes', label: 'Acúmulo de funções sem aumento salarial' },
                    { value: 'nenhuma', label: 'Nenhuma dessas' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        name="situacoesDuranteTrabalho"
                        value={option.value}
                        checked={formData.situacoesDuranteTrabalho.includes(option.value)}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Aceita Consultoria */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gostaria de uma consultoria trabalhista gratuita? *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aceitaConsultoria"
                      value="sim"
                      checked={formData.aceitaConsultoria === 'sim'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Sim, quero saber meus direitos
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aceitaConsultoria"
                      value="nao"
                      checked={formData.aceitaConsultoria === 'nao'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Não, só a vaga mesmo
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="aceitaConsultoria"
                      value="talvez"
                      checked={formData.aceitaConsultoria === 'talvez'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Talvez no futuro
                  </label>
                </div>
              </div>

              {/* Consentimento */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="consentimento"
                    checked={formData.consentimento}
                    onChange={handleInputChange}
                    className="mr-2 mt-1"
                    required
                  />
                  <span className="text-sm text-gray-600">
                    Aceito o tratamento dos meus dados conforme a{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Política de Privacidade
                    </a>{' '}
                    e autorizo o contato para oportunidades de trabalho e consultoria jurídica trabalhista gratuita.
                  </span>
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Enviando...' : 'Enviar Candidatura'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadModal
