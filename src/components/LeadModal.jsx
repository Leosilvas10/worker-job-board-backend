
import React, { useState } from 'react'

export default function LeadModal({ isOpen, onClose, vaga = null }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Dados pessoais
    nomeCompleto: '',
    whatsapp: '',
    email: '',
    idade: '',
    cidade: '',
    estado: '',
    
    // Informações trabalhistas
    ultimaEmpresa: '',
    cargo: '',
    tempoTrabalho: '',
    tipoCarteira: '',
    
    // Verbas trabalhistas
    fgts: '',
    ferias: '',
    decimoTerceiro: '',
    horasExtras: '',
    verbasRescisao: '',
    
    // Problemas enfrentados
    assedio: '',
    humilhacoes: '',
    acumuloFuncoes: '',
    semRegistro: '',
    atrasoSalario: '',
    
    // Situações específicas
    situacoesEnfrentadas: '',
    recebeuDireitos: '',
    aceitaConsultoria: '',
    
    // Observações
    mensagem: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('🚀 Enviando dados completos do modal:', formData)
      
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
            empresa: vaga.company || vaga.empresa,
            localizacao: vaga.location || vaga.localizacao
          } : null,
          fonte: 'modal_pesquisa_trabalhista',
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
          nomeCompleto: '',
          whatsapp: '',
          email: '',
          idade: '',
          cidade: '',
          estado: '',
          ultimaEmpresa: '',
          cargo: '',
          tempoTrabalho: '',
          tipoCarteira: '',
          fgts: '',
          ferias: '',
          decimoTerceiro: '',
          horasExtras: '',
          verbasRescisao: '',
          assedio: '',
          humilhacoes: '',
          acumuloFuncoes: '',
          semRegistro: '',
          atrasoSalario: '',
          situacoesEnfrentadas: '',
          recebeuDireitos: '',
          aceitaConsultoria: '',
          mensagem: ''
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {vaga ? `Candidatar-se: ${vaga.title}` : 'Pesquisa Trabalhista - Seus Direitos'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Etapa {step} de 5</span>
              <span>{Math.round((step / 5) * 100)}% concluído</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">👤 Dados Pessoais</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomeCompleto}
                    onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
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
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idade
                    </label>
                    <input
                      type="number"
                      value={formData.idade}
                      onChange={(e) => handleInputChange('idade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="PR">Paraná</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="BA">Bahia</option>
                      <option value="GO">Goiás</option>
                      <option value="PE">Pernambuco</option>
                      <option value="CE">Ceará</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continuar →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💼 Informações Trabalhistas</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Última Empresa onde Trabalhou
                  </label>
                  <input
                    type="text"
                    value={formData.ultimaEmpresa}
                    onChange={(e) => handleInputChange('ultimaEmpresa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo/Função
                    </label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => handleInputChange('cargo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Seu cargo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo de Trabalho
                    </label>
                    <input
                      type="text"
                      value={formData.tempoTrabalho}
                      onChange={(e) => handleInputChange('tempoTrabalho', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2 anos"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Carteira de Trabalho
                  </label>
                  <div className="space-y-2">
                    {['CLT', 'PJ', 'Terceirizado', 'Sem Registro', 'Outros'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="tipoCarteira"
                          value={option}
                          checked={formData.tipoCarteira === option}
                          onChange={(e) => handleInputChange('tipoCarteira', e.target.value)}
                          className="mr-2"
                        />
                        {option}
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
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Verbas Trabalhistas</h3>
                <p className="text-sm text-gray-600 mb-4">Você recebeu adequadamente essas verbas?</p>
                
                {[
                  { field: 'fgts', label: 'FGTS (Fundo de Garantia)' },
                  { field: 'ferias', label: 'Férias' },
                  { field: 'decimoTerceiro', label: '13º Salário' },
                  { field: 'horasExtras', label: 'Horas Extras' },
                  { field: 'verbasRescisao', label: 'Verbas Rescisórias' }
                ].map(item => (
                  <div key={item.field} className="border-b pb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {item.label}
                    </label>
                    <div className="flex space-x-4">
                      {['Sim', 'Não', 'Parcialmente', 'Não sei'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name={item.field}
                            value={option}
                            checked={formData[item.field] === option}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            className="mr-1"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Problemas Enfrentados</h3>
                <p className="text-sm text-gray-600 mb-4">Você enfrentou alguma dessas situações?</p>
                
                {[
                  { field: 'assedio', label: 'Assédio (moral ou sexual)' },
                  { field: 'humilhacoes', label: 'Humilhações ou constrangimentos' },
                  { field: 'acumuloFuncoes', label: 'Acúmulo de funções sem pagamento adicional' },
                  { field: 'semRegistro', label: 'Trabalho sem registro em carteira' },
                  { field: 'atrasoSalario', label: 'Atraso no pagamento do salário' }
                ].map(item => (
                  <div key={item.field} className="border-b pb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {item.label}
                    </label>
                    <div className="flex space-x-4">
                      {['Sim', 'Não', 'Às vezes'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name={item.field}
                            value={option}
                            checked={formData[item.field] === option}
                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                            className="mr-1"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Finalização</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conte mais sobre sua situação trabalhista
                  </label>
                  <textarea
                    value={formData.situacoesEnfrentadas}
                    onChange={(e) => handleInputChange('situacoesEnfrentadas', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva outras situações que enfrentou..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Você acredita que recebeu todos os seus direitos?
                  </label>
                  <div className="space-y-2">
                    {['Sim', 'Não', 'Não tenho certeza'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="recebeuDireitos"
                          value={option}
                          checked={formData.recebeuDireitos === option}
                          onChange={(e) => handleInputChange('recebeuDireitos', e.target.value)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gostaria de uma consultoria gratuita para analisar seus direitos?
                  </label>
                  <div className="space-y-2">
                    {['Sim', 'Não', 'Talvez'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="aceitaConsultoria"
                          value={option}
                          checked={formData.aceitaConsultoria === option}
                          onChange={(e) => handleInputChange('aceitaConsultoria', e.target.value)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem adicional (opcional)
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => handleInputChange('mensagem', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Alguma informação adicional que gostaria de compartilhar..."
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : '📤 Enviar Pesquisa'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
