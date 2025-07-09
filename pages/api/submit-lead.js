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

    // Preparar dados no formato exato que o backend espera
    const leadData = {
      nome: name,
      telefone: whatsapp,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@temporario.com`, // Email temporário para manter compatibilidade
      
      // Campos básicos obrigatórios
      empresa: company || 'Vaga de Emprego',
      cidade: 'Não informado',
      estado: 'Não informado',
      idade: null,
      
      // Mensagem detalhada
      mensagem: `PESQUISA TRABALHISTA - ${jobTitle || 'Vaga de Interesse'}

DADOS PESSOAIS:
Nome: ${name}
WhatsApp: ${whatsapp}

VAGA DE INTERESSE:
${jobTitle ? `Título: ${jobTitle}` : ''}
${company ? `Empresa: ${company}` : ''}
${originalLocation ? `Localização: ${originalLocation}` : ''}
${jobId ? `ID da Vaga: ${jobId}` : ''}

PESQUISA SOBRE ÚLTIMO EMPREGO:
Última empresa: ${lastCompany || 'Não informado'}
Tipo de carteira: ${workStatus || 'Não informado'}
Recebeu direitos trabalhistas: ${receivedRights || 'Não informado'}
Situações enfrentadas: ${Array.isArray(workProblems) ? workProblems.join(', ') : (workProblems || 'Nenhuma')}
Aceita consultoria gratuita: ${wantConsultation || 'Não informado'}

DADOS ADICIONAIS:
Fonte: ${fonte || 'Site do Trabalhador'}
Página: ${paginaOrigem || 'Homepage'}
Timestamp: ${new Date().toISOString()}
LGPD Aceito: ${lgpdConsent ? 'Sim' : 'Não'}`,

      // Campos estruturados para análise (obrigatórios para o backend)
      ultima_empresa: lastCompany || 'Não informado',
      tipo_carteira: workStatus || 'Não informado', 
      recebeu_direitos: receivedRights || 'Não informado',
      situacoes_enfrentadas: Array.isArray(workProblems) ? workProblems.join(', ') : (workProblems || 'Nenhuma'),
      aceita_consultoria: wantConsultation || 'Não informado',
      
      // Campos de direitos trabalhistas (estruturados)
      fgts: receivedRights === 'Sim, recebi tudo certinho' ? 'Sim' : 'Não',
      ferias: receivedRights === 'Sim, recebi tudo certinho' ? 'Sim' : 'Não',
      decimo_terceiro: receivedRights === 'Sim, recebi tudo certinho' ? 'Sim' : 'Não',
      horas_extras: Array.isArray(workProblems) && workProblems.includes('hora-extra') ? 'Não' : 'Sim',
      verbas_rescisao: receivedRights === 'Sim, recebi tudo certinho' ? 'Sim' : 'Não',
      
      // Campos de problemas trabalhistas (estruturados)  
      assedio: Array.isArray(workProblems) && workProblems.includes('assedio') ? 'Sim' : 'Não',
      humilhacoes: Array.isArray(workProblems) && workProblems.includes('assedio') ? 'Sim' : 'Não',
      acumulo_funcoes: Array.isArray(workProblems) && workProblems.includes('acumulo-funcoes') ? 'Sim' : 'Não',
      sem_registro: workStatus === 'Sem carteira assinada' ? 'Sim' : 'Não',
      atraso_salario: 'Não informado',
      
      // Dados da vaga
      vaga_id: jobId,
      vaga_titulo: jobTitle,
      vaga_empresa: company,
      vaga_localizacao: originalLocation,
      vaga_link: jobLink,
      
      // Metadata
      fonte: fonte || 'Site do Trabalhador',
      pagina_origem: paginaOrigem || 'Homepage',
      lgpd_consent: lgpdConsent,
      data_submissao: new Date().toISOString(),
      data_criacao: new Date().toISOString(),
      created_at: new Date().toISOString(),
      
      // Status
      status: 'novo',
      contatado: false,
      convertido: false
    }

    // Enviar para o backend usando a URL correta
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('📤 Enviando lead para backend:', backendUrl)
    console.log('📋 Dados do lead sendo enviados:', JSON.stringify(leadData, null, 2))
    
    const response = await fetch(`${backendUrl}/api/labor-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Frontend'
      },
      body: JSON.stringify(leadData)
    })

    const responseText = await response.text()
    console.log('📨 Status da resposta:', response.status)
    console.log('📨 Headers da resposta:', Object.fromEntries(response.headers.entries()))
    console.log('📨 Resposta bruta do backend:', responseText)
    
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError)
      result = { success: false, message: 'Resposta inválida do servidor' }
    }
    
    console.log('📊 Resultado processado:', result)

    if (!response.ok) {
      console.error('❌ Erro HTTP:', response.status, response.statusText)
      return res.status(response.status).json({
        success: false,
        message: result.message || `Erro HTTP ${response.status}`
      })
    }

    // Resposta de sucesso com dados de redirecionamento
    res.status(200).json({
      success: true,
      message: 'Candidatura enviada com sucesso!',
      leadId: result.id || `lead_${Date.now()}`,
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
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}
