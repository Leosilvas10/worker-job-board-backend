
// API para deletar leads do painel admin

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const { leadId, leadIds } = req.body

    // URL do backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    
    let endpoint
    let requestBody = {}

    if (leadId) {
      // Deletar um lead específico
      endpoint = `${backendUrl}/api/labor-research-leads/${leadId}`
      console.log(`🗑️ Deletando lead específico: ${leadId}`)
    } else if (leadIds && Array.isArray(leadIds)) {
      // Deletar múltiplos leads
      endpoint = `${backendUrl}/api/labor-research-leads`
      requestBody = { ids: leadIds }
      console.log(`🗑️ Deletando múltiplos leads: ${leadIds.join(', ')}`)
    } else {
      return res.status(400).json({
        success: false,
        message: 'ID do lead ou lista de IDs é obrigatório'
      })
    }

    console.log('📡 CONECTANDO EM:', endpoint)

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-AdminPanel'
      },
      body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
    })

    console.log('📊 Status da resposta:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const responseText = await response.text()
    console.log('📋 Resposta bruta:', responseText)

    const data = JSON.parse(responseText)
    console.log('✅ SUCESSO! Lead(s) deletado(s):', data)

    return res.status(200).json({
      success: true,
      message: leadId ? 'Lead deletado com sucesso!' : 'Leads deletados com sucesso!',
      data: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ ERRO CRÍTICO ao deletar lead(s):', error)
    return res.status(500).json({
      success: false,
      message: 'Erro ao deletar lead(s)',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
