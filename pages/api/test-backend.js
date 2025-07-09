
export default async function handler(req, res) {
  try {
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    
    // Teste 1: Health check
    console.log('🔍 Testando conexão com backend...')
    const healthResponse = await fetch(`${backendUrl}/api/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Test'
      }
    })
    
    const healthText = await healthResponse.text()
    console.log('📡 Status Health:', healthResponse.status)
    console.log('📄 Resposta Health:', healthText)
    
    let healthData
    try {
      healthData = JSON.parse(healthText)
    } catch (e) {
      healthData = { raw: healthText }
    }
    
    // Teste 2: Submissão de lead de teste
    const testLead = {
      nome: 'Teste Frontend',
      telefone: '(11) 99999-9999',
      email: 'teste@frontend.com',
      empresa: 'Teste',
      mensagem: 'Lead de teste do frontend',
      ultima_empresa: 'Empresa Teste',
      tipo_carteira: 'CLT',
      recebeu_direitos: 'Sim',
      situacoes_enfrentadas: 'Nenhuma',
      aceita_consultoria: 'Sim',
      fonte: 'Teste Frontend'
    }
    
    console.log('📤 Enviando lead de teste...')
    const submitResponse = await fetch(`${backendUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Test'
      },
      body: JSON.stringify(testLead)
    })
    
    const submitText = await submitResponse.text()
    console.log('📡 Status Submit:', submitResponse.status)
    console.log('📄 Resposta Submit:', submitText)
    
    let submitData
    try {
      submitData = JSON.parse(submitText)
    } catch (e) {
      submitData = { raw: submitText }
    }
    
    res.status(200).json({
      success: true,
      message: 'Teste de backend completo',
      tests: {
        health: {
          status: healthResponse.status,
          data: healthData
        },
        submit: {
          status: submitResponse.status,
          data: submitData
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    res.status(500).json({
      success: false,
      message: 'Erro no teste de backend',
      error: error.message
    })
  }
}
