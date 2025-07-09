import { useState } from 'react'

const LeadModal = ({ isOpen, onClose, jobData }) => {
  const [formData, setFormData] = useState({
    // Dados do formulário conforme os prints
    ultimaEmpresa: '',
    tipoCarteira: '',
    recebeuCertinho: '',
    situacoes: [],
    consultaGratuita: '',
    nomeCompleto: '',
    whatsapp: '',
    aceitoTratamento: false
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'situacoes') {
      setFormData(prev => ({
        ...prev,
        situacoes: checked 
          ? [...prev.situacoes, value]
          : prev.situacoes.filter(item => item !== value)
      }))
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Validação
    if (!formData.nomeCompleto || !formData.whatsapp || !formData.aceitoTratamento) {
      setMessage('❌ Preencha todos os campos obrigatórios e aceite o tratamento de dados')
      setLoading(false)
      return
    }

    try {
      const candidaturaData = {
        nome: formData.nomeCompleto,
        telefone: formData.whatsapp,
        email: '', // Não é coletado neste formulário
        empresa: formData.ultimaEmpresa,
        mensagem: `PESQUISA RÁPIDA SOBRE ÚLTIMO EMPREGO - ${jobData?.title || 'Vaga'}

DADOS DA VAGA:
Vaga: ${jobData?.title || 'N/A'}
Empresa: ${jobData?.company?.name || jobData?.company || 'N/A'}
Localização: ${jobData?.location || 'N/A'}

PESQUISA:
1. Última empresa: ${formData.ultimaEmpresa}
2. Tipo de carteira: ${formData.tipoCarteira}
3. Recebeu certinho: ${formData.recebeuCertinho}
4. Situações enfrentadas: ${formData.situacoes.join(', ')}
5. Aceita consulta gratuita: ${formData.consultaGratuita}

CONTATO:
Nome: ${formData.nomeCompleto}
WhatsApp: ${formData.whatsapp}`,
        vagaId: jobData?.id,
        vagaTitulo: jobData?.title,
        vagaEmpresa: jobData?.company?.name || jobData?.company,
        vagaLocalizacao: jobData?.location,
        fonte: 'site'
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
        setMessage('✅ Candidatura enviada com sucesso! Redirecionando para a vaga...')
        
        // Resetar formulário e redirecionar após 2 segundos
        setTimeout(() => {
          setFormData({
            ultimaEmpresa: '',
            tipoCarteira: '',
            recebeuCertinho: '',
            situacoes: [],
            consultaGratuita: '',
            nomeCompleto: '',
            whatsapp: '',
            aceitoTratamento: false
          })
          setMessage('')
          onClose()
          
          // Redirecionar para a vaga original
          if (jobData?.redirectUrl) {
            window.open(jobData.redirectUrl, '_blank')
          } else if (jobData?.originalUrl) {
            window.open(jobData.originalUrl, '_blank')
          } else if (jobData?.externalUrl) {
            window.open(jobData.externalUrl, '_blank')
          } else {
            // Usar o externalUrl da vaga ou uma URL genérica de busca
            const externalUrl = jobData?.externalUrl || jobData?.redirectUrl || jobData?.originalUrl
            
            if (externalUrl) {
              window.open(externalUrl, '_blank')
            } else {
              // Fallback genérico para busca de emprego
              const jobTitle = encodeURIComponent(jobData?.title || 'vagas de emprego')
              window.open(`https://www.google.com/search?q=${jobTitle}+vagas+emprego+brasil`, '_blank')
            }
          }
        }, 2000)
        
      } else {
        setMessage('❌ ' + (data.message || 'Erro ao enviar candidatura'))
      }
    } catch (error) {
      console.error('Erro:', error)
      setMessage('❌ Erro ao enviar candidatura. Tente novamente.')
    }
    
    setLoading(false)
  }

  const formatWhatsApp = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica máscara (11) 99999-9999
    if (numbers.length === 0) {
      return ''
    } else if (numbers.length <= 2) {
      return `(${numbers}`
    } else if (numbers.length <= 7) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`
    } else {
      // Limita a 11 dígitos
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`
    }
  }

  const handleWhatsAppChange = (e) => {
    const formatted = formatWhatsApp(e.target.value)
    setFormData(prev => ({
      ...prev,
      whatsapp: formatted
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white mb-2">
            PESQUISA RÁPIDA SOBRE SEU ÚLTIMO EMPREGO
          </h2>
          <p className="text-slate-300 text-sm">
            Leva menos de 1 minuto! Suas respostas podem te ajudar a descobrir se a empresa te deve algum valor.
            <br />
            <span className="text-blue-300 font-medium">Após enviar, você será redirecionado para se candidatar à vaga.</span>
          </p>
          <div className="mt-3">
            <span className="text-green-400 font-semibold">
              {jobData?.company?.name || jobData?.company || 'Atendente de Fast Food'} - {jobData?.company?.name || "McDonald's"}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Pergunta 1 */}
          <div>
            <label className="block text-white font-semibold mb-3">
              1. Qual foi o nome da última empresa onde você trabalhou? *
            </label>
            <input
              type="text"
              name="ultimaEmpresa"
              value={formData.ultimaEmpresa}
              onChange={handleChange}
              placeholder="Nome da empresa (ex: 'Lojas Americanas', 'Condomínio XYZ')"
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Pergunta 2 */}
          <div>
            <label className="block text-white font-semibold mb-3">
              2. Você trabalhou com ou sem carteira assinada? *
            </label>
            <div className="space-y-2">
              {[
                'Com carteira assinada',
                'Sem carteira assinada', 
                'Comecei sem, depois registraram',
                'Não tenho certeza'
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 text-slate-300">
                  <input
                    type="radio"
                    name="tipoCarteira"
                    value={option}
                    checked={formData.tipoCarteira === option}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500"
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 3 */}
          <div>
            <label className="block text-white font-semibold mb-3">
              3. Quando saiu da empresa, recebeu tudo certinho? *
            </label>
            <div className="space-y-2">
              {[
                'Sim',
                'Não recebi nada',
                'Recebi só uma parte',
                'Não sei dizer'
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 text-slate-300">
                  <input
                    type="radio"
                    name="recebeuCertinho"
                    value={option}
                    checked={formData.recebeuCertinho === option}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500"
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 4 */}
          <div>
            <label className="block text-white font-semibold mb-3">
              4. Durante o trabalho, você passou por alguma dessas situações? *
            </label>
            <div className="space-y-2">
              {[
                'Fazia hora extra sem receber',
                'Trabalhei domingos/feriados sem adicional ou folga',
                'Sofri assédio ou humilhações',
                'Acúmulo de funções sem aumento salarial',
                'Nenhuma dessas'
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 text-slate-300">
                  <input
                    type="checkbox"
                    name="situacoes"
                    value={option}
                    checked={formData.situacoes.includes(option)}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pergunta 5 */}
          <div>
            <label className="block text-white font-semibold mb-3">
              5. Podemos encaminhar suas respostas para um parceiro especializado em consultas trabalhistas gratuitas, que pode te orientar sobre seus direitos? *
            </label>
            <div className="space-y-2">
              {[
                'Sim, quero saber se tenho algo a receber',
                'Não, obrigado(a)'
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3 text-slate-300">
                  <input
                    type="radio"
                    name="consultaGratuita"
                    value={option}
                    checked={formData.consultaGratuita === option}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500"
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dados de contato */}
          <div className="border border-blue-500 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">
              6. Para isso, informe seu nome e WhatsApp para contato: *
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Nome Completo: *
                </label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  WhatsApp: * <span className="text-slate-400 text-sm">(com DDD)</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  placeholder="(11) 99999-9999"
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                  required
                />
                <p className="text-slate-400 text-xs mt-1">
                  Digite apenas números, a formatação será aplicada automaticamente
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox de aceite */}
          <div>
            <label className="flex items-start space-x-3 text-slate-300">
              <input
                type="checkbox"
                name="aceitoTratamento"
                checked={formData.aceitoTratamento}
                onChange={handleChange}
                className="w-4 h-4 text-blue-500 mt-1"
                required
              />
              <span className="text-sm">
                Aceito o tratamento dos meus dados conforme a{' '}
                <a href="/politica-privacidade" className="text-blue-400 underline">
                  Política de Privacidade
                </a>{' '}
                e autorizo o contato para oportunidades de trabalho e consultoria jurídica trabalhista gratuita. *
              </span>
            </label>
          </div>

          {/* Mensagem de status */}
          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes('✅') ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ✕ Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : '✓ Enviar Candidatura'}
            </button>
          </div>

          {/* Segurança */}
          <div className="text-center">
            <p className="text-slate-400 text-xs flex items-center justify-center space-x-1">
              <span>🔒</span>
              <span>Seus dados estão seguros e serão usados apenas para esta oportunidade</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeadModal
