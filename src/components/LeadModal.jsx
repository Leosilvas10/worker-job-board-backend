
import React, { useState } from 'react'

export default function LeadModal({ isOpen, onClose, vaga = null }) {
  const [step, setStep] = useState(1)
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
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
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {vaga ? `Candidatar-se: ${vaga.title}` : 'Pesquisa Trabalhista'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Última Empresa que Trabalhou
                  </label>
                  <input
                    type="text"
                    value={formData.ultimaEmpresa}
                    onChange={(e) => handleInputChange('ultimaEmpresa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continuar
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Você tinha carteira assinada?
                  </label>
                  <div className="space-y-2">
                    {['sim', 'não', 'algumas_vezes'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="tipoCarteira"
                          value={option}
                          checked={formData.tipoCarteira === option}
                          onChange={(e) => handleInputChange('tipoCarteira', e.target.value)}
                          className="mr-2"
                        />
                        {option === 'sim' && 'Sim'}
                        {option === 'não' && 'Não'}
                        {option === 'algumas_vezes' && 'Algumas vezes'}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recebeu tudo certinho quando saiu?
                  </label>
                  <div className="space-y-2">
                    {['sim', 'não', 'nao_sei'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="recebeuTudoCertinho"
                          value={option}
                          checked={formData.recebeuTudoCertinho === option}
                          onChange={(e) => handleInputChange('recebeuTudoCertinho', e.target.value)}
                          className="mr-2"
                        />
                        {option === 'sim' && 'Sim'}
                        {option === 'não' && 'Não'}
                        {option === 'nao_sei' && 'Não sei'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Que situações passou durante o trabalho?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'horas_extras_nao_pagas', label: 'Horas extras não pagas' },
                      { value: 'fgts_nao_depositado', label: 'FGTS não depositado' },
                      { value: 'ferias_nao_pagas', label: 'Férias não pagas' },
                      { value: 'decimo_terceiro_nao_pago', label: '13º salário não pago' },
                      { value: 'assedio_moral', label: 'Assédio moral' },
                      { value: 'acidente_trabalho', label: 'Acidente de trabalho' },
                      { value: 'demissao_sem_justa_causa', label: 'Demissão sem justa causa' },
                      { value: 'nenhuma', label: 'Nenhuma dessas situações' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.situacoesDuranteTrabalho.includes(option.value)}
                          onChange={() => handleCheckboxChange('situacoesDuranteTrabalho', option.value)}
                          className="mr-2"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aceita consultoria para analisar seus direitos?
                  </label>
                  <div className="space-y-2">
                    {['sim', 'não', 'talvez'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="aceitaConsultoria"
                          value={option}
                          checked={formData.aceitaConsultoria === option}
                          onChange={(e) => handleInputChange('aceitaConsultoria', e.target.value)}
                          className="mr-2"
                        />
                        {option === 'sim' && 'Sim'}
                        {option === 'não' && 'Não'}
                        {option === 'talvez' && 'Talvez'}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
