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
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const {
      // Dados pessoais obrigatórios
      name,
      whatsapp,
      
      // Dados da pesquisa trabalhista
      lastCompany,
      workStatus,
      receivedRights,
      workProblems,
      wantConsultation,
      
      // Consentimento
      lgpdConsent,
      
      // Dados da vaga
      jobId,
      jobTitle,
      company,
      jobLink,
      originalLocation,
      
      // Metadados
      fonte,
      paginaOrigem,
      timestamp,
      source
    } = req.body

    // Validações básicas - apenas nome e whatsapp são obrigatórios
    if (!name || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Nome e WhatsApp são obrigatórios'
      })
    }

    if (!lgpdConsent) {
      return res.status(400).json({
        success: false,
        message: 'É necessário aceitar os termos de uso'
      })
    }

    // Preparar dados para enviar ao backend
    const leadData = {
      nome: name,
      telefone: whatsapp,
      email: null, // Email não é obrigatório
      empresa: company || 'Não especificada',
      cargo: jobTitle || 'Vaga de Emprego',
      
      // Dados estruturados da pesquisa trabalhista
      ultima_empresa: lastCompany,
      tipo_carteira: workStatus,
      recebeu_direitos: receivedRights,
      situacoes_enfrentadas: Array.isArray(workProblems) ? workProblems.join(', ') : (workProblems || 'Nenhuma'),
      aceita_consultoria: wantConsultation,
      
      // Dados da vaga
      vaga_id: jobId,
      vaga_titulo: jobTitle,
      vaga_empresa: company,
      vaga_localizacao: originalLocation,
      vaga_link: jobLink,
      
      // Metadata
      fonte: fonte || 'Site do Trabalhador',
      lgpd_consent: lgpdConsent,
      timestamp: new Date().toISOString(),
      
      mensagem: `PESQUISA RÁPIDA SOBRE ÚLTIMO EMPREGO

DADOS PESSOAIS:
Nome: ${name}
WhatsApp: ${whatsapp}

VAGA DE INTERESSE:
Título: ${jobTitle || 'Não especificado'}
Empresa: ${company || 'Não especificada'}
Localização: ${originalLocation || 'Não especificada'}
ID: ${jobId || 'Não especificado'}

PESQUISA TRABALHISTA:
1. Última empresa: ${lastCompany || 'Não informado'}
2. Tipo de carteira: ${workStatus || 'Não informado'}
3. Recebeu certinho: ${receivedRights || 'Não informado'}
4. Situações enfrentadas: ${Array.isArray(workProblems) ? workProblems.join(', ') : (workProblems || 'Nenhuma')}
5. Aceita consulta: ${wantConsultation || 'Não informado'}

CONSENTIMENTO LGPD: ${lgpdConsent ? 'Aceito' : 'Não aceito'}

DADOS DE ORIGEM:
Fonte: ${fonte || source || 'Site do Trabalhador'}
Página: ${paginaOrigem || 'Não especificada'}
Timestamp: ${timestamp || new Date().toISOString()}`,
      
      // Dados adicionais estruturados
      ultimaEmpresa: lastCompany,
      tipoCarteira: workStatus,
      recebeuCertinho: receivedRights,
      situacoesEnfrentadas: workProblems,
      aceitaConsulta: wantConsultation,
      consentimentoLGPD: lgpdConsent,
      vagaId: jobId,
      vagaTitulo: jobTitle,
      vagaEmpresa: company,
      vagaLink: jobLink,
      vagaLocalizacao: originalLocation
    }

    // Enviar para o backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('📤 Enviando lead para backend:', backendUrl)
    
    const response = await fetch(`${backendUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })

    const result = await response.json()
    console.log('📨 Resposta do backend:', result)

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || 'Erro ao salvar candidatura'
      })
    }

    // Resposta de sucesso com dados de redirecionamento
    res.status(200).json({
      success: true,
      message: 'Candidatura enviada com sucesso!',
      redirect: {
        url: jobLink || `https://www.indeed.com.br/jobs?q=${encodeURIComponent(jobTitle || 'emprego')}&l=${encodeURIComponent((originalLocation || 'Brasil').split(',')[0])}`,
        company: company,
        jobTitle: jobTitle
      }
    })

  } catch (error) {
    console.error('❌ Erro ao processar candidatura:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
