// API para capturar leads com perguntas sobre demissão
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const leadData = req.body
    
    // Validações básicas
    if (!leadData.name || !leadData.whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Nome e WhatsApp são obrigatórios'
      })
    }

    // Validar formato do WhatsApp
    const whatsappRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/
    if (!whatsappRegex.test(leadData.whatsapp) && leadData.whatsapp.length < 10) {
      console.log('⚠️ WhatsApp com formato inválido:', leadData.whatsapp)
    }

    // Gerar ID único para o lead
    const leadId = `LEAD_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // Criar estrutura completa do lead
    const completeLead = {
      id: leadId,
      timestamp: new Date().toISOString(),
      
      // Dados de contato
      nome: leadData.name,
      whatsapp: leadData.whatsapp,
      email: leadData.email || 'Não informado',
      
      // Respostas das perguntas trabalhistas
      ultimaEmpresa: leadData.lastCompany || 'Não informado',
      statusTrabalho: leadData.workStatus || 'Não informado',
      recebeuDireitos: leadData.receivedRights || 'Não informado',
      problemasTrabalho: Array.isArray(leadData.workProblems) ? leadData.workProblems.join(', ') : (leadData.workProblems || 'Não informado'),
      desejaConsultoria: leadData.wantConsultation || 'Não informado',
      
      // Dados da vaga
      vaga: {
        id: leadData.jobId,
        titulo: leadData.jobTitle,
        empresa: leadData.company,
        link: leadData.jobLink,
        localizacao: leadData.originalLocation
      },
      
      // Metadados
      fonte: leadData.fonte || 'Site do Trabalhador',
      paginaOrigem: leadData.paginaOrigem,
      userAgent: leadData.userAgent,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      
      // Consentimento LGPD
      lgpdConsent: leadData.lgpdConsent,
      
      // Status
      status: 'novo',
      contatado: false,
      convertido: false,
      
      // Timestamps
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    // Log para desenvolvimento
    console.log('📥 Novo lead capturado:', {
      id: leadId,
      nome: completeLead.nome,
      ultimaEmpresa: completeLead.ultimaEmpresa,
      statusTrabalho: completeLead.statusTrabalho,
      desejaConsultoria: completeLead.desejaConsultoria,
      vaga: completeLead.vaga.titulo
    })

    // Em produção, você salvaria no banco de dados aqui
    // Para desenvolvimento, vamos simular o salvamento
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Preparar resposta com redirecionamento
    const response = {
      success: true,
      message: 'Lead capturado com sucesso!',
      leadId: leadId,
      data: {
        nome: completeLead.nome,
        vaga: completeLead.vaga.titulo,
        empresa: completeLead.vaga.empresa
      }
    }

    // Se há um link da vaga, incluir no redirecionamento
    if (leadData.jobLink && leadData.jobLink !== '#') {
      response.redirect = {
        url: leadData.jobLink,
        company: leadData.company
      }
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('❌ Erro ao processar lead:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
