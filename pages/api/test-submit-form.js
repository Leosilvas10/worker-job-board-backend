
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    console.log('🧪 TESTE DE ENVIO DO FORMULÁRIO')
    
    const testData = {
      ultimaEmpresa: "Empresa Teste LTDA",
      tipoCarteira: "sim",
      recebeuTudoCertinho: "nao",
      situacoesDuranteTrabalho: ["horas_extras_nao_pagas", "assedio_moral"],
      aceitaConsultoria: "sim",
      nomeCompleto: "João Teste Frontend",
      whatsapp: "(11) 98765-4321"
    }
    
    console.log('📤 ENVIANDO DADOS DE TESTE:', JSON.stringify(testData, null, 2))
    
    const response = await fetch('https://worker-job-board-backend-leonardosilvas2.replit.app/api/labor-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('📨 RESPOSTA DO BACKEND:', result)

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Teste realizado com sucesso!',
        data: result
      })
    } else {
      return res.status(response.status).json({
        success: false,
        message: 'Teste falhou: ' + (result.message || 'Erro desconhecido')
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
