export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('🔍 Buscando leads reais do backend...')

    // Buscar leads reais salvos no backend
    const response = await fetch(`${backendUrl}/api/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Frontend'
      }
    })

    if (!response.ok) {
      console.log('⚠️ Endpoint /api/leads não disponível, tentando /api/labor-research/submissions...')

      // Tentar endpoint alternativo para submissions
      const submissionsResponse = await fetch(`${backendUrl}/api/labor-research/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Frontend'
        }
      })

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        console.log('✅ Submissions encontradas:', submissionsData)

        return res.status(200).json({
          success: true,
          leads: submissionsData.submissions || submissionsData.data || [],
          stats: {
            total: submissionsData.submissions?.length || 0,
            novos: submissionsData.submissions?.filter(l => l.status === 'novo')?.length || 0,
            contatados: submissionsData.submissions?.filter(l => l.contatado)?.length || 0,
            convertidos: submissionsData.submissions?.filter(l => l.convertido)?.length || 0
          },
          message: `${submissionsData.submissions?.length || 0} leads encontrados`
        })
      }

      // Se nenhum endpoint funcionar, retornar vazio
      console.log('❌ Nenhum endpoint de leads disponível')
      return res.status(200).json({
        success: true,
        leads: [],
        stats: {
          total: 0,
          novos: 0,
          contatados: 0,
          convertidos: 0
        },
        message: 'Nenhum lead encontrado ainda. Aguardando primeiros envios do formulário.'
      })
    }

    const data = await response.json()
    console.log('✅ Dados recebidos do backend:', data)

    // Processar dados do backend
    const leads = data.leads || data.data || []

    return res.status(200).json({
      success: true,
      leads: leads,
      stats: {
        total: leads.length,
        novos: leads.filter(l => l.status === 'novo').length,
        contatados: leads.filter(l => l.contatado).length,
        convertidos: leads.filter(l => l.convertido).length
      },
      message: `${leads.length} leads carregados do backend`
    })

  } catch (error) {
    console.error('❌ Erro ao buscar leads:', error)

    // Retornar vazio em caso de erro
    return res.status(200).json({
      success: true,
      leads: [],
      stats: {
        total: 0,
        novos: 0,
        contatados: 0,
        convertidos: 0
      },
      message: 'Erro ao conectar com backend. Verifique se o formulário está enviando dados corretamente.'
    })
  }
}