export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('🎯 Buscando leads no endpoint CORRETO onde estão salvos...')

    const response = await fetch(`${backendUrl}/api/labor-research-leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Frontend'
      }
    })

    console.log('📊 Status da resposta:', response.status)
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const responseText = await response.text()
      console.log('📋 Resposta bruta do /api/labor-research-leads:', responseText)

      try {
        const data = JSON.parse(responseText)
        console.log('✅ Dados CORRETOS recebidos do /api/labor-research-leads:', data)

        // O backend retorna um array direto ou um objeto com leads
        const leads = Array.isArray(data) ? data : (data.leads || data.data || [])
        console.log('🔥 ' + leads.length + ' leads encontrados!')

        // Converter dados para o formato esperado pelo painel admin
        const formattedLeads = leads.map(lead => ({
          id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nome: lead.nomeCompleto || lead.nome || 'Não informado',
          email: lead.email || `${(lead.nomeCompleto || 'user').toLowerCase().replace(/\s+/g, '.')}@temporario.com`,
          telefone: lead.whatsapp || lead.telefone || 'Não informado',
          empresa: lead.ultimaEmpresa || 'Não informado',
          vaga: 'Pesquisa Trabalhista',
          interesse: lead.aceitaConsultoria === 'sim' ? 'Consultoria Trabalhista' : 'Informação',
          fonte: 'Pesquisa Trabalhista',
          status: lead.status || 'novo',
          contatado: lead.contatado || false,
          convertido: lead.convertido || false,
          data: lead.createdAt || new Date().toISOString(),

          // Dados específicos da pesquisa trabalhista
          dadosCompletos: {
            ultimaEmpresa: lead.ultimaEmpresa,
            tipoCarteira: lead.tipoCarteira,
            recebeuTudoCertinho: lead.recebeuTudoCertinho,
            situacoesDuranteTrabalho: lead.situacoesDuranteTrabalho,
            aceitaConsultoria: lead.aceitaConsultoria,
            nomeCompleto: lead.nomeCompleto,
            whatsapp: lead.whatsapp
          }
        }))

        return res.status(200).json({
          success: true,
          leads: formattedLeads,
          stats: {
            total: formattedLeads.length,
            novos: formattedLeads.filter(l => l.status === 'novo').length,
            contatados: formattedLeads.filter(l => l.contatado).length,
            convertidos: formattedLeads.filter(l => l.convertido).length
          },
          message: `${formattedLeads.length} leads encontrados na pesquisa trabalhista`
        })

      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da resposta:', parseError)
        console.error('📋 Resposta que causou erro:', responseText)

        return res.status(500).json({
          success: false,
          leads: [],
          stats: { total: 0, novos: 0, contatados: 0, convertidos: 0 },
          message: 'Erro ao processar dados do backend',
          error: parseError.message
        })
      }
    }

    // Se não conseguiu buscar os dados
    console.error('❌ Erro HTTP:', response.status, response.statusText)
    const errorText = await response.text()
    console.error('❌ Resposta de erro:', errorText)

    return res.status(response.status).json({
      success: false,
      leads: [],
      stats: { total: 0, novos: 0, contatados: 0, convertidos: 0 },
      message: `Erro ao buscar leads: ${response.status} - ${errorText}`,
      error: errorText
    })

  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao buscar leads:', error)

    return res.status(500).json({
      success: false,
      leads: [],
      stats: { total: 0, novos: 0, contatados: 0, convertidos: 0 },
      message: 'Erro de conexão com o backend',
      error: error.message
    })
  }
}