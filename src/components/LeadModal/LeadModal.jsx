import React, { useState } from 'react'

const LeadModal = ({ isOpen, onClose, jobData }) => {
  const [formData, setFormData] = useState({
    // Dados de contato
    name: '',
    whatsapp: '',

    // Perguntas obrigatórias
    lastCompany: '',
    workStatus: '',
    receivedRights: '',
    workProblems: [],
    wantConsultation: '',

    // Consentimento
    lgpdConsent: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Se o modal não está aberto, não renderiza nada
  if (!isOpen) return null

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'whatsapp') {
      // Aplicar formatação automática no WhatsApp
      const formattedValue = formatWhatsApp(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else if (name === 'workProblems') {
      // Gerenciar array de problemas de trabalho
      setFormData(prev => {
        const currentProblems = prev.workProblems || []
        if (checked) {
          return {
            ...prev,
            workProblems: [...currentProblems, value]
          }
        } else {
          return {
            ...prev,
            workProblems: currentProblems.filter(problem => problem !== value)
          }
        }
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const formatWhatsApp = (value) => {
    // Remove tudo que não é número
    const onlyNumbers = value.replace(/\D/g, '')

    // Aplica formatação brasileira
    if (onlyNumbers.length === 0) {
      return ''
    } else if (onlyNumbers.length <= 2) {
      return `(${onlyNumbers}`
    } else if (onlyNumbers.length <= 7) {
      return `(${onlyNumbers.substring(0, 2)}) ${onlyNumbers.substring(2)}`
    } else if (onlyNumbers.length <= 11) {
      return `(${onlyNumbers.substring(0, 2)}) ${onlyNumbers.substring(2, 7)}-${onlyNumbers.substring(7)}`
    } else {
      // Limita a 11 dígitos
      return `(${onlyNumbers.substring(0, 2)}) ${onlyNumbers.substring(2, 7)}-${onlyNumbers.substring(7, 11)}`
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.whatsapp) {
        alert('❌ Por favor, preencha nome e WhatsApp')
        setIsSubmitting(false)
        return
      }

      if (!formData.lastCompany) {
        alert('❌ Por favor, informe o nome da última empresa')
        setIsSubmitting(false)
        return
      }

      if (!formData.workStatus) {
        alert('❌ Por favor, informe o tipo de carteira de trabalho')
        setIsSubmitting(false)
        return
      }

      if (!formData.receivedRights) {
        alert('❌ Por favor, informe se recebeu os direitos trabalhistas')
        setIsSubmitting(false)
        return
      }

      if (!formData.wantConsultation) {
        alert('❌ Por favor, informe se deseja consultoria jurídica')
        setIsSubmitting(false)
        return
      }

      if (!formData.lgpdConsent) {
        alert('❌ É necessário aceitar os termos de uso para continuar')
        setIsSubmitting(false)
        return
      }

      // Preparar dados no formato EXATO que o backend espera
      const leadData = {
        ultimaEmpresa: formData.lastCompany || '',
        tipoCarteira: formData.workStatus === 'Com carteira assinada' ? 'sim' : 
                     formData.workStatus === 'Sem carteira assinada' ? 'nao' : 
                     formData.workStatus === 'Começei sem, depois registraram' ? 'parcial' : 'nao',
        recebeuTudoCertinho: formData.receivedRights === 'Sim, recebi tudo certinho' ? 'sim' : 
                           formData.receivedRights === 'Não recebi nada' ? 'nao' : 
                           formData.receivedRights === 'Recebi só uma parte' ? 'parcial' : 'nao',
        situacoesDuranteTrabalho: Array.isArray(formData.workProblems) ? formData.workProblems : [],
        aceitaConsultoria: formData.wantConsultation === 'Sim, quero saber meus direitos' ? 'sim' : 'nao',
        nomeCompleto: formData.name || '',
        whatsapp: formData.whatsapp || ''
      }

      console.log('📤 DADOS DO FORMULÁRIO ANTES DO ENVIO:', formData)
      console.log('📋 DADOS DA VAGA:', jobData)
      console.log('🚀 DADOS FORMATADOS PARA BACKEND:', leadData)
      console.log('🔍 VERIFICANDO CAMPOS OBRIGATÓRIOS:')
      console.log('- Nome:', leadData.nomeCompleto)
      console.log('- WhatsApp:', leadData.whatsapp)
      console.log('- Empresa:', leadData.ultimaEmpresa)
      console.log('- Carteira:', leadData.tipoCarteira)
      console.log('- Recebeu:', leadData.recebeuTudoCertinho)
      console.log('- Situações:', leadData.situacoesDuranteTrabalho)
      console.log('- Consultoria:', leadData.aceitaConsultoria)

      const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app/api/labor-research'
      console.log('🎯 ENVIANDO PARA URL:', backendUrl)
      console.log('📋 PAYLOAD COMPLETO:', JSON.stringify(leadData, null, 2))

      // Enviar direto para o backend
      console.log('⏳ INICIANDO REQUISIÇÃO...')
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Modal'
        },
        body: JSON.stringify(leadData)
      })

      console.log('📊 STATUS DA RESPOSTA:', response.status)
      console.log('📊 STATUS TEXT:', response.statusText)
      console.log('📊 HEADERS DA RESPOSTA:', Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log('📋 RESPOSTA BRUTA DO BACKEND:', responseText)
      console.log('📏 TAMANHO DA RESPOSTA:', responseText.length)

      let result
      try {
        if (!responseText || responseText.trim() === '') {
          throw new Error('Resposta vazia do servidor')
        }
        result = JSON.parse(responseText)
        console.log('✅ RESPOSTA PARSEADA COM SUCESSO:', result)
      } catch (parseError) {
        console.error('❌ ERRO AO FAZER PARSE DA RESPOSTA:', parseError)
        console.error('📋 RESPOSTA ORIGINAL:', responseText)
        console.error('📋 TIPO DA RESPOSTA:', typeof responseText)
        alert(`❌ Erro ao processar resposta do servidor: ${parseError.message}`)
        setIsSubmitting(false)
        return
      }

      console.log('🔍 VERIFICANDO SUCESSO DA REQUISIÇÃO...')
      console.log('- response.ok:', response.ok)
      console.log('- result.status:', result.status)
      console.log('- result.success:', result.success)
      console.log('- result.message:', result.message)

      if (response.ok && (result.status === 'success' || result.success === true)) {
        console.log('🎉 SUCESSO! Dados enviados com sucesso!')
        // Preparar mensagem de sucesso
        let successMessage = `✅ Pesquisa trabalhista enviada com sucesso!`
        successMessage += `\n\n📋 Dados registrados:`
        successMessage += `\n👤 Nome: ${formData.name}`
        successMessage += `\n📱 WhatsApp: ${formData.whatsapp}`
        successMessage += `\n🏢 Última empresa: ${formData.lastCompany}`
        successMessage += `\n💼 Vaga: ${jobData?.title || 'Vaga de Emprego'}`

        if (jobData?.company?.name || jobData?.company) {
          successMessage += `\n🏢 Empresa da vaga: ${jobData.company?.name || jobData.company}`
        }

        successMessage += '\n\n🔗 Redirecionando para a vaga original...'

        alert(successMessage)

        // Fechar modal
        onClose()

        // Tentar redirecionar para vaga real
        const redirectUrl = jobData?.url || 
                           jobData?.link || 
                           jobData?.apply_url || 
                           jobData?.original_url ||
                           jobData?.jobLink

        if (redirectUrl && redirectUrl !== '#') {
          // Redirecionamento para vaga real
          setTimeout(() => {
            window.open(redirectUrl, '_blank')
          }, 1000)
        } else {
          // Fallback: buscar vaga similar no Indeed
          const encodedTitle = encodeURIComponent((jobData?.title || 'emprego').replace(/[^\w\s]/gi, '').replace(/\s+/g, '+'))
          const encodedLocation = encodeURIComponent((jobData?.location || 'Brasil').split(',')[0].replace(/\s+/g, '+'))
          const fallbackUrl = `https://www.indeed.com.br/jobs?q=${encodedTitle}&l=${encodedLocation}`

          setTimeout(() => {
            window.open(fallbackUrl, '_blank')
          }, 1000)
        }

      } else {
        console.error('❌ FALHA NA REQUISIÇÃO!')
        console.error('- Status:', response.status)
        console.error('- Status Text:', response.statusText)
        console.error('- Result:', result)
        
        const errorMessage = result?.message || result?.error || 'Erro desconhecido ao enviar pesquisa trabalhista'
        alert('❌ Erro: ' + errorMessage)
        
        // Log para debug
        console.error('📊 DETALHES DO ERRO:')
        console.error('- URL:', backendUrl)
        console.error('- Payload:', leadData)
        console.error('- Response Status:', response.status)
        console.error('- Response Text:', responseText)
      }
    } catch (error) {
      console.error('❌ ERRO CRÍTICO ao enviar candidatura:', error)
      console.error('📊 STACK TRACE:', error.stack)
      console.error('📋 DADOS QUE ESTAVAM SENDO ENVIADOS:', leadData)
      console.error('📋 DADOS DO FORMULÁRIO:', formData)
      console.error('📋 DADOS DA VAGA:', jobData)
      
      // Mostrar erro mais detalhado
      let errorMessage = 'Erro ao enviar candidatura. '
      if (error.message.includes('fetch')) {
        errorMessage += 'Problema de conexão com o servidor.'
      } else if (error.message.includes('JSON')) {
        errorMessage += 'Problema ao processar resposta do servidor.'
      } else {
        errorMessage += error.message
      }
      
      alert('❌ ' + errorMessage + '\n\nTente novamente em alguns segundos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-govgray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-govgray-600">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                PESQUISA RÁPIDA SOBRE SEU ÚLTIMO EMPREGO
              </h2>
              <p className="text-govgray-300 text-sm">
                Leva menos de 1 minuto! Suas respostas podem te ajudar a descobrir se a empresa te deve algum valor.
              </p>
              <p className="text-govgreen-400 text-sm mt-2">
                <strong>{jobData?.title || 'Vaga de Emprego'}</strong> - {jobData?.company?.name || jobData?.company || 'Empresa não informada'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-govgray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Pergunta 1 */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-white font-medium mb-3">
              1. Qual foi o nome da última empresa onde você trabalhou? *
            </label>
            <input
              type="text"
              name="lastCompany"
              value={formData.lastCompany}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
              placeholder="Nome da empresa (ex: 'Lojas Americanas', 'Condomínio XYZ')"
              required
            />
          </div>

          {/* Pergunta 2 */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-white font-medium mb-3">
              2. Você trabalhou com ou sem carteira assinada? *
            </label>
            <div className="space-y-2">
              {[
                'Com carteira assinada',
                'Sem carteira assinada',
                'Começei sem, depois registraram',
                'Não tenho certeza'
              ].map((option) => (
                <label key={option} className="flex items-center text-govgray-300 cursor-pointer hover:text-white">
                  <input
                    type="radio"
                    name="workStatus"
                    value={option}
                    checked={formData.workStatus === option}
                    onChange={handleInputChange}
                    className="mr-3"
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 3 */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-white font-medium mb-3">
              3. Quando saiu da empresa, recebeu tudo certinho? *
            </label>
            <div className="space-y-2">
              {[
                'Sim, recebi tudo certinho',
                'Não recebi nada',
                'Recebi só uma parte',
                'Não sei dizer / Ainda trabalho lá'
              ].map((option) => (
                <label key={option} className="flex items-center text-govgray-300 cursor-pointer hover:text-white">
                  <input
                    type="radio"
                    name="receivedRights"
                    value={option}
                    checked={formData.receivedRights === option}
                    onChange={handleInputChange}
                    className="mr-3"
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 4 */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-white font-medium mb-3">
              4. Durante o trabalho, você passou por alguma dessas situações? *
            </label>
            <div className="space-y-2">
              {[
                { value: 'horas_extras_nao_pagas', label: 'Fazia hora extra sem receber' },
                { value: 'trabalho_domingos_feriados', label: 'Trabalhei domingos/feriados sem adicional ou folga' },
                { value: 'assedio_moral', label: 'Sofri assédio ou humilhações' },
                { value: 'acumulo_funcoes', label: 'Acúmulo de funções sem aumento salarial' },
                { value: 'nenhuma', label: 'Nenhuma dessas' }
              ].map((option) => (
                <label key={option.value} className="flex items-center text-govgray-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    name="workProblems"
                    value={option.value}
                    checked={formData.workProblems.includes(option.value)}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 5 */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <label className="block text-white font-medium mb-3">
              5. Gostaria de uma consultoria trabalhista gratuita? *
            </label>
            <div className="space-y-2">
              {[
                'Sim, quero saber meus direitos',
                'Não, só a vaga mesmo',
                'Talvez no futuro'
              ].map((option) => (
                <label key={option} className="flex items-center text-govgray-300 cursor-pointer hover:text-white">
                  <input
                    type="radio"
                    name="wantConsultation"
                    value={option}
                    checked={formData.wantConsultation === option}
                    onChange={handleInputChange}
                    className="mr-3"
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Dados de contato */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-4">Seus dados para contato:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  WhatsApp * <span className="text-govgray-300 text-xs">(com DDD)</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                  placeholder="(11) 99999-9999"
                  maxLength="15"
                  required
                />
                <p className="text-govgray-400 text-xs mt-1">
                  Digite apenas números, a formatação será aplicada automaticamente
                </p>
              </div>
            </div>
          </div>

          {/* Consentimento LGPD */}
          <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border border-blue-500">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="lgpdConsent"
                checked={formData.lgpdConsent}
                onChange={handleInputChange}
                className="mt-1"
                required
              />
              <label className="text-govgray-300 text-sm">
                <strong className="text-white">Aceito o tratamento dos meus dados</strong> conforme a{' '}
                <button type="button" className="text-blue-400 hover:underline">
                  Política de Privacidade
                </button>{' '}
                e autorizo o contato para oportunidades de trabalho e consultoria jurídica trabalhista gratuita. *
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? '⏳ Enviando...' : '✅ Enviar Candidatura'}
            </button>
          </div>

          <div className="text-center text-govgray-300 text-xs mt-4">
            🔒 Seus dados estão seguros e serão usados apenas para esta oportunidade
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeadModal