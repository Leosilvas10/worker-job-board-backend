
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('🔍 Buscando leads do backend EXATO onde estão salvos...')

    // Primeiro: tentar o endpoint principal de leads
    const leadsResponse = await fetch(`${backendUrl}/api/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Frontend'
      }
    })

    if (leadsResponse.ok) {
      const leadsData = await leadsResponse.json()
      console.log('✅ Dados EXATOS recebidos do /api/leads:', leadsData)

      // Se tem dados, processar
      if (leadsData.leads && leadsData.leads.length > 0) {
        return res.status(200).json({
          success: true,
          leads: leadsData.leads,
          stats: {
            total: leadsData.leads.length,
            novos: leadsData.leads.filter(l => l.status === 'novo').length,
            contatados: leadsData.leads.filter(l => l.contatado).length,
            convertidos: leadsData.leads.filter(l => l.convertido).length
          },
          message: `${leadsData.leads.length} leads encontrados`
        })
      }
    }

    // Segundo: tentar o endpoint labor-research onde enviamos os dados
    console.log('⚠️ Endpoint /api/leads vazio, buscando em /api/labor-research...')
    const laborResponse = await fetch(`${backendUrl}/api/labor-research`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Frontend'
      }
    })

    if (laborResponse.ok) {
      const laborText = await laborResponse.text()
      console.log('📋 Resposta de /api/labor-research:', laborText)
      
      try {
        const laborData = JSON.parse(laborText)
        
        // Se tem submissions/responses/data
        if (laborData.submissions || laborData.responses || laborData.data) {
          const submissions = laborData.submissions || laborData.responses || laborData.data || []
          
          return res.status(200).json({
            success: true,
            leads: submissions,
            stats: {
              total: submissions.length,
              novos: submissions.filter(l => l.status === 'novo').length,
              contatados: submissions.filter(l => l.contatado).length,
              convertidos: submissions.filter(l => l.convertido).length
            },
            message: `${submissions.length} leads encontrados em labor-research`
          })
        }
      } catch (e) {
        console.log('⚠️ Não foi possível fazer parse da resposta labor-research')
      }
    }

    // Terceiro: tentar endpoints alternativos onde os dados podem estar
    const endpoints = [
      '/api/labor-research/submissions',
      '/api/labor-research/responses', 
      '/api/labor-research/data',
      '/api/submissions',
      '/api/responses'
    ]

    for (const endpoint of endpoints) {
      console.log(`🔎 Tentando endpoint: ${endpoint}`)
      try {
        const response = await fetch(`${backendUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SiteDoTrabalhador-Frontend'
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`✅ DADOS ENCONTRADOS em ${endpoint}:`, data)
          
          const leads = data.submissions || data.responses || data.data || data.leads || []
          
          if (leads.length > 0) {
            return res.status(200).json({
              success: true,
              leads: leads,
              stats: {
                total: leads.length,
                novos: leads.filter(l => l.status === 'novo').length,
                contatados: leads.filter(l => l.contatado).length,
                convertidos: leads.filter(l => l.convertido).length
              },
              message: `${leads.length} leads encontrados em ${endpoint}`
            })
          }
        }
      } catch (e) {
        console.log(`❌ Erro em ${endpoint}:`, e.message)
      }
    }

    // Se chegou aqui, não encontrou dados
    console.log('❌ NENHUM DADO ENCONTRADO em nenhum endpoint')
    return res.status(200).json({
      success: true,
      leads: [],
      stats: {
        total: 0,
        novos: 0,
        contatados: 0,
        convertidos: 0
      },
      message: 'Nenhum lead encontrado. Verifique se os dados estão sendo salvos corretamente no backend.'
    })

  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao buscar leads:', error)
    
    return res.status(500).json({
      success: false,
      leads: [],
      stats: {
        total: 0,
        novos: 0,
        contatados: 0,
        convertidos: 0
      },
      message: 'Erro de conexão com o backend',
      error: error.message
    })
  }
}
