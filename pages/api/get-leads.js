export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    console.log('🎯 PAINEL ADMIN - Buscando leads do endpoint CORRETO...')

    // ENDPOINT CORRETO onde os dados estão salvos
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    const endpoint = `${backendUrl}/api/labor-research-leads`

    console.log('📡 CONECTANDO EM:', endpoint)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-AdminPanel'
      }
    })

    console.log('📊 Status da resposta:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const responseText = await response.text()
    console.log('📋 Resposta bruta:', responseText.substring(0, 200) + '...')

    const data = JSON.parse(responseText)
    console.log('✅ SUCESSO! Leads recebidos:', data.leads?.length || 0)

    // Transformar dados para o formato do painel admin
    const transformedLeads = (data.leads || []).map(lead => ({
      id: lead.id,
      nome: lead.nomeCompleto || lead.nome || 'Nome não informado',
      telefone: lead.whatsapp || lead.telefone || 'Não informado',
      email: lead.email || 'Não informado',
      empresa: lead.nome_ultima_empresa || lead.ultimaEmpresa || lead.empresa || 'Não informado',
      vaga: lead.vaga_titulo || lead.vagaTitulo || 'Pesquisa Trabalhista',
      status: lead.status || 'novo',
      created_at: lead.createdAt || lead.created_at || new Date().toISOString(),
      // Dados específicos da pesquisa trabalhista - múltiplos formatos
      tipoCarteira: lead.tipo_carteira || lead.tipoCarteira,
      recebeuTudoCertinho: lead.recebeu_tudo_certinho || lead.recebeuTudoCertinho,
      situacoesDuranteTrabalho: Array.isArray(lead.situacoes_enfrentadas) ? lead.situacoes_enfrentadas :
                                typeof lead.situacoes_enfrentadas === 'string' ? lead.situacoes_enfrentadas.split(', ') :
                                lead.situacoesDuranteTrabalho || [],
      aceitaConsultoria: lead.aceita_consultoria || lead.aceitaConsultoria,
      fonte: 'Pesquisa Trabalhista'
    }))

    return res.status(200).json({
      success: true,
      leads: transformedLeads,
      total: transformedLeads.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ ERRO CRÍTICO no painel admin:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar leads do backend',
      error: error.message,
      leads: [],
      total: 0
    })
  }
}