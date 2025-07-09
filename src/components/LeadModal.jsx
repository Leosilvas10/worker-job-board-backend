
import { useState } from 'react'

export default function LeadModal({ isOpen, onClose, vaga = null }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    ultimaEmpresa: '',
    tipoCarteira: '',
    recebeuTudoCertinho: '',
    situacoesDuranteTrabalho: [],
    aceitaConsultoria: ''
  })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'situacoesDuranteTrabalho') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          situacoesDuranteTrabalho: [...prev.situacoesDuranteTrabalho, value]
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          situacoesDuranteTrabalho: prev.situacoesDuranteTrabalho.filter(item => item !== value)
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('🚀 Enviando dados do modal único:', formData)
      
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          vaga: vaga ? {
            id: vaga.id,
            titulo: vaga.title || vaga.titulo,
            empresa: vaga.company || vaga.empresa
          } : null,
          fonte: 'modal_unico',
          timestamp: new Date().toISOString()
        })
      })

      const result = await response.json()
      console.log('✅ Resposta do servidor:', result)

      if (result.success) {
        alert('✅ Pesquisa trabalhista enviada com sucesso!')
        onClose()
        // Reset form
        setFormData({
          nome: '',
          telefone: '',
          email: '',
          ultimaEmpresa: '',
          tipoCarteira: '',
          recebeuTudoCertinho: '',
          situacoesDuranteTrabalho: [],
          aceitaConsultoria: ''
        })
        setStep(1)
      } else {
        throw new Error(result.message || 'Erro no envio')
      }
    } catch (error) {
      console.error('❌ Erro no envio:', error)
      alert('❌ Erro ao enviar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">⚖️ Pesquisa Trabalhista Rápida</h2>
              <p className="text-blue-100 mt-1">Descubra se você tem direitos a receber</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pergunta 1 */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-900">
              1. Qual foi sua última empresa onde trabalhou?
            </label>
            <input
              type="text"
              name="ultimaEmpresa"
              value={formData.ultimaEmpresa}
              onChange={handleInputChange}
              placeholder="Ex: Loja ABC, Restaurante XYZ, Empresa de Limpeza..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Pergunta 2 */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-900">
              2. Você teve carteira de trabalho assinada nessa empresa?
            </label>
            <div className="space-y-2">
              {[
                { value: 'sim', label: 'Sim, com carteira assinada desde o início' },
                { value: 'nao', label: 'Não, trabalhei sem carteira assinada' },
                { value: 'parcial', label: 'Comecei sem carteira, depois assinaram' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="tipoCarteira"
                    value={option.value}
                    checked={formData.tipoCarteira === option.value}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 3 */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-900">
              3. Quando saiu da empresa, recebeu tudo certinho?
            </label>
            <div className="space-y-2">
              {[
                { value: 'sim', label: 'Sim, recebi todos os meus direitos' },
                { value: 'nao', label: 'Não recebi nada ou quase nada' },
                { value: 'parcial', label: 'Recebi só uma parte dos meus direitos' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="recebeuTudoCertinho"
                    value={option.value}
                    checked={formData.recebeuTudoCertinho === option.value}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 4 */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-900">
              4. Durante o trabalho, você passou por alguma dessas situações?
            </label>
            <div className="space-y-2">
              {[
                { value: 'horas_extras_nao_pagas', label: 'Fiz horas extras mas não recebi por elas' },
                { value: 'fgts_nao_depositado', label: 'FGTS não foi depositado corretamente' },
                { value: 'trabalho_domingos_feriados', label: 'Trabalhei em domingos e feriados sem receber a mais' },
                { value: 'assedio_moral', label: 'Sofri assédio moral ou humilhações' },
                { value: 'acumulo_funcoes', label: 'Fazia trabalho de várias pessoas (acúmulo de funções)' },
                { value: 'nenhuma', label: 'Nenhuma dessas situações' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name="situacoesDuranteTrabalho"
                    value={option.value}
                    checked={formData.situacoesDuranteTrabalho.includes(option.value)}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 5 */}
          <div className="space-y-3">
            <label className="block text-lg font-semibold text-gray-900">
              5. Gostaria de uma consultoria trabalhista gratuita?
            </label>
            <div className="space-y-2">
              {[
                { value: 'sim', label: 'Sim, quero saber meus direitos' },
                { value: 'nao', label: 'Não, só é vaga mesmo' },
                { value: 'talvez', label: 'Talvez no futuro' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="aceitaConsultoria"
                    value={option.value}
                    checked={formData.aceitaConsultoria === option.value}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600"
                    required
                  />
                  <span className="text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Seção de Contato */}
          <div className="bg-blue-50 p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-bold text-blue-900">Seus dados para contato:</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp * <span className="text-gray-500">(com DDD)</span>
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(11) 99999-8938"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-600 mt-1">
                Seus dados são seguros e serão usados apenas para esta oportunidade
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Checkbox de aceite */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              required
              className="w-4 h-4 text-blue-600 mt-1"
            />
            <p className="text-sm text-gray-600">
              Aceito o tratamento dos meus dados conforme a{' '}
              <span className="text-blue-600 underline cursor-pointer">Política de Privacidade</span>{' '}
              e autorizo o contato para oportunidades de trabalho e consultoria jurídica trabalhista gratuita. *
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '⏳ Enviando...' : '✅ Enviar Pesquisa'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            🔒 Seus dados estão seguros e serão usados apenas para esta oportunidade
          </div>
        </form>
      </div>
    </div>
  )
}
