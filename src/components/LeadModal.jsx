
import React, { useState, useCallback } from 'react'

export default function LeadModal({ isOpen, onClose, vaga = null }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Dados pessoais
    nomeCompleto: '',
    whatsapp: '',
    idade: 18,
    cidade: '',
    estado: '',

    // Pesquisa trabalhista - 6 questões específicas
    nomeUltimaEmpresa: '',
    tipoCarteira: '',
    recebeuTudoCertinho: '',
    situacoesEnfrentadas: [],
    aceitaConsultoria: '',

    // Observações
    mensagem: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cidades por estado
  const cidadesPorEstado = {
    'SP': ['São Paulo', 'Campinas', 'Santos', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba', 'Mauá', 'São José dos Campos'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'São Gonçalo', 'Volta Redonda', 'Petrópolis', 'Magé', 'Itaboraí', 'Cabo Frio'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó', 'Itajaí', 'Lages', 'Jaraguá do Sul', 'Palhoça'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá']
  }

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSituacaoChange = useCallback((situacao, checked) => {
    setFormData(prev => ({
      ...prev,
      situacoesEnfrentadas: checked 
        ? [...prev.situacoesEnfrentadas, situacao]
        : prev.situacoesEnfrentadas.filter(s => s !== situacao)
    }))
  }, [])

  const formatWhatsApp = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{0,5})/, '($1) $2')
        .replace(/(\d{0,2})/, '($1')
    }
    
    // Limita a 15 caracteres no total
    return value.substring(0, 15)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('🚀 Enviando dados da pesquisa trabalhista:', formData)

      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Mapear campos para compatibilidade com backend
          nome_ultima_empresa: formData.nomeUltimaEmpresa,
          tipo_carteira: formData.tipoCarteira,
          recebeu_tudo_certinho: formData.recebeuTudoCertinho,
          situacoes_enfrentadas: formData.situacoesEnfrentadas.join(', '),
          aceita_consultoria: formData.aceitaConsultoria,
          vaga: vaga ? {
            id: vaga.id,
            titulo: vaga.title || vaga.titulo,
            empresa: vaga.company || vaga.empresa,
            localizacao: vaga.location || vaga.localizacao
          } : null,
          fonte: 'modal_pesquisa_trabalhista_rapida',
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
          idade: 18,
          cidade: '',
          estado: '',
          nomeUltimaEmpresa: '',
          tipoCarteira: '',
          recebeuTudoCertinho: '',
          situacoesEnfrentadas: [],
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
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                PESQUISA RÁPIDA SOBRE SEU ÚLTIMO EMPREGO
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Leva menos de 1 minuto! Suas respostas podem te ajudar a descobrir se a empresa te deve algum valor.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Etapa {step} de 3</span>
              <span>{Math.round((step / 3) * 100)}% concluído</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="text-blue-600 font-semibold">1.</span> Qual foi o nome da última empresa onde você trabalhou?
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomeUltimaEmpresa}
                    onChange={(e) => handleInputChange('nomeUltimaEmpresa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="text-blue-600 font-semibold">2.</span> Você trabalhou com ou sem carteira assinada?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'com_carteira', label: 'Com carteira assinada' },
                      { value: 'sem_carteira', label: 'Sem carteira assinada' },
                      { value: 'comecou_sem_depois_registrou', label: 'Comecei sem, depois registraram' },
                      { value: 'nao_tenho_certeza', label: 'Não tenho certeza' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="tipoCarteira"
                          value={option.value}
                          checked={formData.tipoCarteira === option.value}
                          onChange={(e) => handleInputChange('tipoCarteira', e.target.value)}
                          className="mr-3"
                          required
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="text-blue-600 font-semibold">3.</span> Quando saiu da empresa, recebeu tudo certinho?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'sim', label: 'Sim' },
                      { value: 'nao_recebi_nada', label: 'Não recebi nada' },
                      { value: 'recebi_so_uma_parte', label: 'Recebi só uma parte' },
                      { value: 'nao_sei_dizer', label: 'Não sei dizer' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="recebeuTudoCertinho"
                          value={option.value}
                          checked={formData.recebeuTudoCertinho === option.value}
                          onChange={(e) => handleInputChange('recebeuTudoCertinho', e.target.value)}
                          className="mr-3"
                          required
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={useCallback(() => setStep(2), [])}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continuar →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="text-blue-600 font-semibold">4.</span> Durante o trabalho, você passou por alguma dessas situações?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'hora_extra_sem_receber', label: 'Fazia hora extra sem receber' },
                      { value: 'domingos_feriados_sem_adicional', label: 'Trabalhei domingos/feriados sem adicional ou folga' },
                      { value: 'assedio_humilhacoes', label: 'Sofri assédio ou humilhações' },
                      { value: 'acumulo_funcoes_sem_aumento', label: 'Acúmulo de funções sem aumento salarial' },
                      { value: 'nenhuma_dessas', label: 'Nenhuma dessas' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.situacoesEnfrentadas.includes(option.value)}
                          onChange={(e) => handleSituacaoChange(option.value, e.target.checked)}
                          className="mr-3"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="text-blue-600 font-semibold">5.</span> Podemos encaminhar suas respostas para um parceiro especializado em consultas trabalhistas gratuitas, que pode te orientar sobre seus direitos?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'sim', label: 'Sim, quero saber se tenho algo a receber' },
                      { value: 'nao', label: 'Não, obrigado(a)' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="aceitaConsultoria"
                          value={option.value}
                          checked={formData.aceitaConsultoria === option.value}
                          onChange={(e) => handleInputChange('aceitaConsultoria', e.target.value)}
                          className="mr-3"
                          required
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={useCallback(() => setStep(1), [])}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={useCallback(() => setStep(3), [])}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="text-blue-600 font-semibold">6.</span> Para isso, informe seu nome e WhatsApp para contato:
                  </label>
                  
                  <div className="space-y-4">
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.whatsapp}
                        onChange={(e) => {
                          const formatted = formatWhatsApp(e.target.value)
                          handleInputChange('whatsapp', formatted)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(11) 99999-9999"
                        maxLength="15"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Idade *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="18"
                            max="100"
                            value={formData.idade}
                            onChange={(e) => {
                              const valor = parseInt(e.target.value) || 18;
                              if (valor >= 18) {
                                handleInputChange('idade', valor);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="18"
                          />
                          <div className="absolute right-1 top-1 flex flex-col">
                            <button
                              type="button"
                              onClick={useCallback(() => {
                                const novaIdade = Math.min(100, (formData.idade || 18) + 1);
                                handleInputChange('idade', novaIdade);
                              }, [formData.idade, handleInputChange])}
                              className="text-xs px-1 py-0 text-gray-600 hover:text-blue-600"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={useCallback(() => {
                                const novaIdade = Math.max(18, (formData.idade || 18) - 1);
                                handleInputChange('idade', novaIdade);
                              }, [formData.idade, handleInputChange])}
                              className="text-xs px-1 py-0 text-gray-600 hover:text-blue-600"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Mínimo: 18 anos</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado *
                        </label>
                        <select
                          required
                          value={formData.estado}
                          onChange={(e) => {
                            handleInputChange('estado', e.target.value);
                            handleInputChange('cidade', ''); // Reset cidade quando mudar estado
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione o Estado</option>
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cidade *
                        </label>
                        <select
                          required
                          value={formData.cidade}
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                          disabled={!formData.estado}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">
                            {formData.estado ? 'Selecione a Cidade' : 'Primeiro selecione o Estado'}
                          </option>
                          {formData.estado && cidadesPorEstado[formData.estado]?.map(cidade => (
                            <option key={cidade} value={cidade}>
                              {cidade}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações adicionais (opcional)
                  </label>
                  <textarea
                    value={formData.mensagem}
                    onChange={(e) => handleInputChange('mensagem', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Algo mais que gostaria de nos contar..."
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>📞 Próximos passos:</strong> Nossa equipe entrará em contato em até 24 horas para uma consultoria gratuita sobre seus direitos trabalhistas.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={useCallback(() => setStep(2), [])}
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
