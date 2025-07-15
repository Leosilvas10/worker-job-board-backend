import { useState } from 'react'
import Head from 'next/head'

const EmpresasPage = () => {
  const [formData, setFormData] = useState({
    // Dados da empresa
    nomeEmpresa: '',
    cnpj: '',
    email: '',
    telefone: '',
    segmento: '',
    cidade: '',
    descricaoEmpresa: '',
    
    // Dados da vaga
    cargo: '',
    area: '',
    tipoContrato: 'CLT',
    salario: '',
    descricaoVaga: '',
    requisitos: '',
    beneficios: '',
    localTrabalho: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [openFaqItem, setOpenFaqItem] = useState(null)

  const toggleFaq = (id) => {
    setOpenFaqItem(openFaqItem === id ? null : id)
  }

  // Dados do FAQ
  const faqData = [
    {
      id: 1,
      question: "Quanto custa para publicar uma vaga?",
      answer: "Nosso serviço de publicação de vagas é totalmente gratuito. Não cobramos taxas pela publicação nem pela intermediação do processo de contratação."
    },
    {
      id: 2,
      question: "Em quanto tempo minha vaga será publicada?",
      answer: "Após o envio da solicitação, nossa equipe analisa e publica a vaga em até 24 horas úteis. Em casos urgentes, entre em contato conosco diretamente."
    },
    {
      id: 3,
      question: "Como funciona o processo de seleção?",
      answer: "Você receberá os currículos e contatos dos candidatos interessados diretamente por email. O processo de seleção e entrevistas fica por sua conta."
    },
    {
      id: 4,
      question: "Posso editar ou remover minha vaga depois de publicada?",
      answer: "Sim! Entre em contato conosco por email ou WhatsApp e faremos as alterações necessárias ou removeremos a vaga conforme solicitado."
    },
    {
      id: 5,
      question: "Que tipos de profissionais posso encontrar aqui?",
      answer: "Temos profissionais para serviços domésticos (empregadas, cozinheiras, babás), segurança (porteiros, vigilantes), limpeza, cuidados (cuidadores de idosos), transporte (motoristas) e muito mais."
    },
    {
      id: 6,
      question: "Como garantir que os candidatos são confiáveis?",
      answer: "Recomendamos sempre verificar referências, solicitar documentos e realizar entrevistas presenciais. Nossa plataforma facilita o contato, mas a verificação final fica a critério do contratante."
    }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar dados no formato da API de leads
      const leadData = {
        nome: `Empresa: ${formData.nomeEmpresa}`,
        email: formData.email,
        telefone: formData.telefone,
        whatsapp: formData.telefone,
        experiencia: `EMPRESA - CNPJ: ${formData.cnpj} | Segmento: ${formData.segmento} | Cidade: ${formData.cidade} | Descrição: ${formData.descricaoEmpresa}`,
        statusAtual: 'empresa_recrutadora',
        ultimaEmpresa: formData.nomeEmpresa,
        lgpdConsent: true,
        source: 'formulario_empresas',
        type: 'empresa',
        // Dados específicos da empresa
        nomeEmpresa: formData.nomeEmpresa,
        cnpj: formData.cnpj,
        segmento: formData.segmento,
        cidade: formData.cidade,
        descricaoEmpresa: formData.descricaoEmpresa,
        // Dados da vaga
        cargo: formData.cargo,
        area: formData.area,
        tipoContrato: formData.tipoContrato,
        salario: formData.salario,
        descricaoVaga: formData.descricaoVaga,
        requisitos: formData.requisitos,
        beneficios: formData.beneficios,
        localTrabalho: formData.localTrabalho,
        jobTitle: formData.cargo,
        company: formData.nomeEmpresa
      }

      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setFormData({
          nomeEmpresa: '',
          cnpj: '',
          email: '',
          telefone: '',
          segmento: '',
          cidade: '',
          descricaoEmpresa: '',
          cargo: '',
          area: '',
          tipoContrato: 'CLT',
          salario: '',
          descricaoVaga: '',
          requisitos: '',
          beneficios: '',
          localTrabalho: ''
        })
      } else {
        console.error('Erro na resposta:', result.message)
      }
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Encontre os Melhores Talentos para Sua Casa ou Empresa. Contrate com Agilidade e Segurança! | Site do Trabalhador</title>
        <meta name="description" content="Simplifique sua contratação e conecte-se a profissionais qualificados em todo o Brasil. Doméstica, porteiro, limpeza, cuidador - encontre o profissional ideal!" />
        <meta name="keywords" content="contratar doméstica, vagas porteiro, recrutamento simples, contratação segura, profissionais qualificados, empregada doméstica, porteiro condomínio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-govblue-50">
        <div className="container mx-auto px-4 py-12">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-govblue-800 mb-6">
              Encontre os Melhores Talentos para Sua Casa ou Empresa. Contrate com Agilidade e Segurança!
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-govgray-700 mb-6">
              Simplifique sua contratação e conecte-se a profissionais qualificados em todo o Brasil.
            </h2>
            
            <div className="max-w-4xl mx-auto mb-8 space-y-4">
              <p className="text-lg text-govgray-700 leading-relaxed">
                Sabemos como pode ser desafiador encontrar o profissional certo para as suas necessidades. 
                Seja você uma família buscando uma <strong>doméstica de confiança</strong>, uma <strong>cuidadora dedicada</strong>, 
                ou uma empresa precisando de um <strong>porteiro atencioso</strong> ou uma <strong>equipe de limpeza eficiente</strong>, 
                nosso portal foi feito para você.
              </p>
              
              <p className="text-lg text-govgray-700 leading-relaxed">
                Chega de processos burocráticos e demorados! Oferecemos uma plataforma intuitiva e uma rede de 
                <strong> talentos verificados</strong>, prontos para a sua vaga. <strong>Economize tempo</strong>, 
                <strong> minimize riscos</strong> e faça a escolha certa.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-govblue-600-light">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="font-semibold text-govblue-800 mb-2">Mais Visibilidade</h3>
                <p className="text-govgray-700 text-sm">Suas vagas serão vistas por milhares de candidatos qualificados</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-govblue-600-light">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-govblue-800 mb-2">Processo Rápido</h3>
                <p className="text-govgray-700 text-sm">Análise e publicação em até 24 horas úteis</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-govblue-600-light">
                <div className="text-3xl mb-3">💯</div>
                <h3 className="font-semibold text-govblue-800 mb-2">Candidatos Pré-Filtrados</h3>
                <p className="text-govgray-700 text-sm">Receba apenas candidatos que atendem aos requisitos</p>
              </div>
            </div>
          </div>

          {/* Seção de Benefícios */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-govblue-800 mb-4">
                Vantagens de Anunciar Suas Vagas Conosco
              </h2>
              <p className="text-lg text-govgray-700 max-w-3xl mx-auto">
                Descubra por que empresas e famílias de todo o Brasil escolhem nossa plataforma
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-govblue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-3 text-center">Agilidade na Contratação</h3>
                <p className="text-govgray-700 text-center">
                  Publique sua vaga em poucos minutos e comece a receber currículos de candidatos interessados rapidamente.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-govgreen-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-3 text-center">Profissionais Qualificados</h3>
                <p className="text-govgray-700 text-center">
                  Nossa base de dados conta com um grande número de candidatos com experiência e referências, prontos para atender suas expectativas.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-govyellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🇧🇷</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-3 text-center">Cobertura Nacional</h3>
                <p className="text-govgray-700 text-center">
                  Alcance talentos em todo o Brasil, ou foque em sua região para encontrar quem está perto de você.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-3 text-center">Facilidade de Uso</h3>
                <p className="text-govgray-700 text-center">
                  Nosso sistema é intuitivo e fácil de usar, tanto para publicar quanto para gerenciar suas vagas e candidatos.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-3 text-center">Segurança e Confiança</h3>
                <p className="text-govgray-700 text-center">
                  Priorizamos a segurança dos seus dados e dos candidatos. Informações claras e transparentes em todo o processo.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-govgray-200 hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-3 text-center">Suporte Dedicado</h3>
                <p className="text-govgray-700 text-center">
                  Conte com nossa equipe para tirar dúvidas e ajudar no que precisar durante sua busca.
                </p>
              </div>
            </div>
          </div>

          {/* Divisor Moderno 1 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-center py-8">
              <div className="flex-grow border-t border-govgray-200"></div>
              <div className="flex-shrink-0 px-4">
                <div className="w-12 h-12 bg-gradient-to-r from-govblue-500 to-govgreen-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">⚙️</span>
                </div>
              </div>
              <div className="flex-grow border-t border-govgray-200"></div>
            </div>
          </div>

          {/* Seção Como Funciona */}
          <div className="mb-16 bg-govgray-50 rounded-xl p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-govblue-800 mb-4">
                Contratar o Profissional Ideal é Fácil Assim
              </h2>
              <p className="text-lg text-govgray-700">
                Nosso processo simplificado em apenas 3 passos
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 bg-govblue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-4">Cadastre sua Vaga</h3>
                <p className="text-govgray-700">
                  Preencha um formulário simples com os detalhes da vaga, requisitos e benefícios. <strong>Leva menos de 5 minutos!</strong>
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-govgreen-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-4">Receba Candidaturas</h3>
                <p className="text-govgray-700">
                  Candidatos interessados e com o perfil ideal se aplicarão à sua vaga. <strong>Acesse os currículos e perfis diretamente em seu email.</strong>
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-govyellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-govblue-800 mb-4">Contrate com Sucesso</h3>
                <p className="text-govgray-700">
                  Entre em contato com os candidatos que mais se destacam, realize entrevistas e <strong>faça a sua melhor escolha!</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Divisor Moderno 3 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-center py-8">
              <div className="flex-grow border-t border-govgray-200"></div>
              <div className="flex-shrink-0 px-4">
                <div className="w-12 h-12 bg-gradient-to-r from-govgreen-500 to-govblue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🚀</span>
                </div>
              </div>
              <div className="flex-grow border-t border-govgray-200"></div>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="text-center mb-16 bg-gradient-to-r from-govblue-600 to-govblue-700 rounded-xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para Encontrar seu Próximo Colaborador?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Dê o primeiro passo para uma contratação eficiente e sem preocupações. 
              Clique no botão abaixo e comece agora mesmo a publicar suas vagas.
            </p>
            <a 
              href="#formulario" 
              className="inline-block bg-govgreen-600 hover:bg-govgreen-700 text-white font-bold text-lg py-4 px-8 rounded-lg transition-colors shadow-lg"
            >
              🚀 Publique sua Vaga
            </a>
          </div>

          {/* Divisor Moderno 3 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-center py-8">
              <div className="flex-grow border-t border-govgray-200"></div>
              <div className="flex-shrink-0 px-4">
                <div className="w-12 h-12 bg-gradient-to-r from-govyellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📝</span>
                </div>
              </div>
              <div className="flex-grow border-t border-govgray-200"></div>
            </div>
          </div>

          {success ? (
            /* Mensagem de Sucesso */
            <div className="max-w-2xl mx-auto bg-govgreen-100 border-2 border-govgreen-600 rounded-lg p-8 text-center shadow-xl">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-govgreen-800 mb-4">Solicitação Enviada com Sucesso!</h2>
              <p className="text-govgreen-700 mb-6">
                Recebemos sua solicitação e entraremos em contato em até 24 horas úteis 
                para análise e publicação da vaga.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="bg-govblue-600 hover:bg-govblue-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Enviar Nova Solicitação
              </button>
            </div>
          ) : (
            /* Formulário */
            <div id="formulario" className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-xl border border-govblue-600-light">
              <h2 className="text-2xl font-bold text-govblue-800 mb-8 text-center">
                📝 Solicitar Publicação de Vaga
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Dados da Empresa */}
                <div>
                  <h3 className="text-xl font-semibold text-govblue-800 mb-6 flex items-center">
                    🏢 Dados da Empresa
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Nome da Empresa *
                      </label>
                      <input
                        type="text"
                        name="nomeEmpresa"
                        value={formData.nomeEmpresa}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        CNPJ *
                      </label>
                      <input
                        type="text"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleChange}
                        placeholder="00.000.000/0000-00"
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        E-mail Corporativo *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Segmento *
                      </label>
                      <select
                        name="segmento"
                        value={formData.segmento}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      >
                        <option value="">Selecione o segmento</option>
                        <option value="servicos-gerais">Serviços Gerais</option>
                        <option value="limpeza">Limpeza e Conservação</option>
                        <option value="seguranca">Segurança e Portaria</option>
                        <option value="domestico">Serviços Domésticos</option>
                        <option value="cuidados">Cuidados e Saúde</option>
                        <option value="transporte">Transporte e Logística</option>
                        <option value="vendas">Vendas e Atendimento</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        name="cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                        placeholder="Ex: São Paulo, SP"
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-govgray-700 mb-2">
                      Descrição da Empresa
                    </label>
                    <textarea
                      name="descricaoEmpresa"
                      value={formData.descricaoEmpresa}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                      placeholder="Conte um pouco sobre sua empresa..."
                    />
                  </div>
                </div>

                {/* Dados da Vaga */}
                <div>
                  <h3 className="text-xl font-semibold text-govblue-800 mb-6 flex items-center">
                    💼 Dados da Vaga
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Cargo/Função *
                      </label>
                      <input
                        type="text"
                        name="cargo"
                        value={formData.cargo}
                        onChange={handleChange}
                        placeholder="Ex: Auxiliar de Limpeza"
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Área *
                      </label>
                      <select
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      >
                        <option value="">Selecione a área</option>
                        <option value="limpeza">Limpeza e Conservação</option>
                        <option value="domestica">Serviços Domésticos</option>
                        <option value="porteiro">Segurança e Portaria</option>
                        <option value="cuidador">Cuidados e Saúde</option>
                        <option value="motorista">Transporte e Logística</option>
                        <option value="vendedor">Vendas e Atendimento</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Tipo de Contrato *
                      </label>
                      <select
                        name="tipoContrato"
                        value={formData.tipoContrato}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      >
                        <option value="CLT">CLT</option>
                        <option value="temporario">Temporário</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="estagio">Estágio</option>
                        <option value="meio-periodo">Meio Período</option>
                        <option value="diarista">Diarista</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Salário *
                      </label>
                      <input
                        type="text"
                        name="salario"
                        value={formData.salario}
                        onChange={handleChange}
                        placeholder="Ex: R$ 1.500,00 ou A combinar"
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Local de Trabalho *
                      </label>
                      <input
                        type="text"
                        name="localTrabalho"
                        value={formData.localTrabalho}
                        onChange={handleChange}
                        placeholder="Ex: São Paulo, SP - Centro"
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Descrição da Vaga *
                      </label>
                      <textarea
                        name="descricaoVaga"
                        value={formData.descricaoVaga}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        placeholder="Descreva as principais atividades e responsabilidades..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Requisitos
                      </label>
                      <textarea
                        name="requisitos"
                        value={formData.requisitos}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        placeholder="Ex: Ensino fundamental, experiência anterior..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-govgray-700 mb-2">
                        Benefícios
                      </label>
                      <textarea
                        name="beneficios"
                        value={formData.beneficios}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-govgray-300 rounded-lg focus:ring-2 focus:ring-govblue-600 focus:border-govblue-600 outline-none transition-colors bg-white"
                        placeholder="Ex: Vale transporte, vale alimentação..."
                      />
                    </div>
                  </div>
                </div>

                {/* Botão de envio */}
                <div className="text-center pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-govblue-600 hover:bg-govblue-800 disabled:bg-gov-gray text-white font-semibold text-lg px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⏳</span>
                        Enviando Solicitação...
                      </>
                    ) : (
                      <>
                        📤 Enviar Solicitação
                      </>
                    )}
                  </button>
                  
                  <p className="text-govgray-700 text-sm mt-4">
                    * Campos obrigatórios. Analisaremos sua solicitação em até 24 horas úteis.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Divisor Moderno 4 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-center py-8">
              <div className="flex-grow border-t border-govgray-200"></div>
              <div className="flex-shrink-0 px-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-govblue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">❓</span>
                </div>
              </div>
              <div className="flex-grow border-t border-govgray-200"></div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-govblue-800 mb-4">
                Perguntas Frequentes de Empresas e Famílias
              </h2>
              <p className="text-lg text-govgray-700">
                Tire suas dúvidas mais comuns sobre nosso serviço
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl shadow-lg border-2 border-govgray-200 hover:border-govblue-300 transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(item.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-govblue-50 transition-all duration-300"
                  >
                    <h3 className="text-lg font-bold text-govblue-800 pr-4">
                      {item.question}
                    </h3>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-govblue-600 flex items-center justify-center transition-transform duration-300 ${
                      openFaqItem === item.id ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out ${
                    openFaqItem === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}>
                    <div className="px-6 pb-6 pt-0">
                      <div className="border-t border-govgray-200 pt-4">
                        <p className="text-govgray-700 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divisor Moderno 5 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-center py-8">
              <div className="flex-grow border-t border-govgray-200"></div>
              <div className="flex-shrink-0 px-4">
                <div className="w-12 h-12 bg-gradient-to-r from-govgreen-500 to-govyellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">💬</span>
                </div>
              </div>
              <div className="flex-grow border-t border-govgray-200"></div>
            </div>
          </div>

          {/* Seção de Contato Direto */}
          <div className="text-center bg-govgray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-govblue-800 mb-4">
              Ainda com Dúvidas ou Precisa de Ajuda Personalizada?
            </h3>
            <p className="text-lg text-govgray-700 mb-6 max-w-3xl mx-auto">
              Nossa equipe está à disposição para te auxiliar em todas as etapas da sua busca por talentos. 
              Fale conosco!
            </p>
            <a 
              href="/contato" 
              className="inline-block bg-govblue-600 hover:bg-govblue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
            >
              💬 FALE COM NOSSA EQUIPE COMERCIAL
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default EmpresasPage
