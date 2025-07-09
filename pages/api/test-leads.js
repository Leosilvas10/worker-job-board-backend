
export default async function handler(req, res) {
  try {
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    
    console.log('🧪 TESTE: Verificando endpoints de leads...')
    
    // Testar endpoint principal
    const response1 = await fetch(`${backendUrl}/api/labor-research`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Test'
      }
    })
    
    const data1 = await response1.text()
    console.log('📊 /api/labor-research:', response1.status, data1)
    
    // Testar endpoint alternativo
    const response2 = await fetch(`${backendUrl}/api/labor-research-leads`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Test'
      }
    })
    
    const data2 = await response2.text()
    console.log('📊 /api/labor-research-leads:', response2.status, data2)
    
    return res.status(200).json({
      success: true,
      message: 'Teste de endpoints concluído',
      results: {
        laborResearch: {
          status: response1.status,
          data: data1
        },
        laborResearchLeads: {
          status: response2.status,
          data: data2
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro no teste: ' + error.message
    })
  }
}
