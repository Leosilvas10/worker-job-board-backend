
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    console.log('🧪 TESTE DE ENVIO - Dados recebidos:', req.body)
    
    const testData = {
      ultimaEmpresa: "Teste Frontend",
      tipoCarteira: "sim",
      recebeuTudoCertinho: "sim",
      situacoesDuranteTrabalho: ["nenhuma"],
      aceitaConsultoria: "sim",
      nomeCompleto: req.body.name || "Teste",
      whatsapp: req.body.whatsapp || "(11) 99999-9999"
    }
    
    console.log('📤 ENVIANDO DADOS DE TESTE:', testData)
    
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    const response = await fetch(`${backendUrl}/api/labor-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Test'
      },
      body: JSON.stringify(testData)
    })

    const responseText = await response.text()
    console.log('📨 Status:', response.status)
    console.log('📨 Resposta:', responseText)

    if (response.ok) {
      const result = JSON.parse(responseText)
      console.log('✅ TESTE PASSOU! Dados salvos:', result)
      
      return res.status(200).json({
        success: true,
        message: 'Teste de envio realizado com sucesso!',
        data: result
      })
    } else {
      console.error('❌ TESTE FALHOU:', response.status, responseText)
      return res.status(response.status).json({
        success: false,
        message: 'Teste falhou: ' + responseText
      })
    }

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro no teste: ' + error.message
    })
  }
}
