import Head from 'next/head'
import { useState } from 'react'

const Contato = () => {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: '',
    lgpdConsent: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nomeCompleto || !formData.email || !formData.assunto || !formData.mensagem || !formData.lgpdConsent) {
      setMessage('Por favor, preencha todos os campos obrigatórios e aceite os termos.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const leadData = {
        nome: formData.nomeCompleto,
        telefone: formData.telefone,
        email: formData.email,
        mensagem: `CONTATO - ${formData.assunto}

${formData.mensagem}

---
Enviado através da página de contato
Data: ${new Date().toLocaleString()}`,
        fonte: 'pagina_contato',
        assunto: formData.assunto
      }

      const response = await fetch('/api/submit-candidatura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('✅ Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.')
        setFormData({
          nomeCompleto: '',
          email: '',
          telefone: '',
          assunto: '',
          mensagem: '',
          lgpdConsent: false
        })
      } else {
        setMessage('❌ Erro ao enviar mensagem. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro:', error)
      setMessage('❌ Erro ao enviar mensagem. Tente novamente.')
    }

    setIsSubmitting(false)
  }

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        .replace(/(\d{2})(\d{0,5})/, '($1) $2')
        .replace(/(\d{0,2})/, '($1')
    }
    return value
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({
      ...prev,
      telefone: formatted
    }))
  }

  return (
    <>
      <Head>
        <title>Contato - Site do Trabalhador</title>
        <meta name="description" content="Entre em contato conosco para tirar suas dúvidas sobre direitos trabalhistas" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-600 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Entre em Contato Conosco</h1>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Estamos aqui para ajudar com suas dúvidas sobre direitos trabalhistas. Nossa equipe de especialistas 
              está pronta para atendê-lo.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Formulário de Contato */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600">✉️</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Envie sua Mensagem</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto *
                    </label>
                    <select
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Selecione o assunto</option>
                      <option value="Dúvidas sobre direitos trabalhistas">Dúvidas sobre direitos trabalhistas</option>
                      <option value="Cálculo de verbas rescisórias">Cálculo de verbas rescisórias</option>
                      <option value="Horas extras não pagas">Horas extras não pagas</option>
                      <option value="Assédio no trabalho">Assédio no trabalho</option>
                      <option value="Demissão sem justa causa">Demissão sem justa causa</option>
                      <option value="Trabalho sem carteira assinada">Trabalho sem carteira assinada</option>
                      <option value="Consultoria jurídica">Consultoria jurídica</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleInputChange}
                      placeholder="Descreva sua dúvida ou mensagem..."
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="lgpdConsent"
                      checked={formData.lgpdConsent}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <label className="text-sm text-gray-600">
                      Aceito o tratamento dos meus dados conforme a{' '}
                      <a href="/politica-privacidade" className="text-blue-600 hover:underline">
                        Política de Privacidade
                      </a>{' '}
                      e LGPD. *
                    </label>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-lg ${
                      message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '📤 Enviando...' : '📤 Enviar Mensagem'}
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar com informações de contato */}
            <div className="space-y-6">
              
              {/* Fale Conosco Diretamente */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600">💬</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Fale Conosco Diretamente</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">📱</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-600">Atendimento rápido via WhatsApp</p>
                      <a 
                        href="https://wa.me/5511999999999" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Iniciar conversa →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">📧</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">E-mail</p>
                      <p className="text-sm text-gray-600">contato@sitedotrabalhador.com.br</p>
                      <p className="text-xs text-gray-500">Resposta em até 24h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horário de Atendimento */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600">🕐</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Horário de Atendimento</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Segunda a Sexta:</span>
                    <span className="font-medium">8h às 18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sábado:</span>
                    <span className="font-medium">8h às 12h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Domingo:</span>
                    <span className="font-medium">Fechado</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    * WhatsApp disponível 24h para emergências trabalhistas
                  </p>
                </div>
              </div>

              {/* Dúvidas Frequentes */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600">❓</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Dúvidas Frequentes</h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">A calculadora é gratuita?</p>
                    <p className="text-gray-600">Sim, todas as calculadoras são 100% gratuitas.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Posso confiar nos resultados?</p>
                    <p className="text-gray-600">Os cálculos são estimativos. Para análise jurídica precisa, consulte um especialista.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Vocês oferecem consulta jurídica?</p>
                    <p className="text-gray-600">Conectamos você com parceiros especializados em direito trabalhista.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contato
