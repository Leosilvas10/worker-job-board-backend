
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    console.log('🎯 MODAL ÚNICO - Dados recebidos:', req.body)

    const {
      nome,
      telefone,
      email,
      ultimaEmpresa,
      tipoCarteira,
      recebeuTudoCertinho,
      situacoesDuranteTrabalho,
      aceitaConsultoria,
      vaga,
      fonte,
      timestamp
    } = req.body

    // Preparar dados para envio ao backend
    const leadData = {
      nomeCompleto: nome,
      whatsapp: telefone,
      email: email || `${nome.toLowerCase().replace(/\s+/g, '')}@contato.com`,
      ultimaEmpresa,
      tipoCarteira,
      recebeuTudoCertinho,
      situacoesDuranteTrabalho: Array.isArray(situacoesDuranteTrabalho) 
        ? situacoesDuranteTrabalho 
        : [situacoesDuranteTrabalho],
      aceitaConsultoria,
      vagaTitulo: vaga?.titulo || 'Pesquisa Trabalhista',
      fonte: fonte || 'modal_unico',
      createdAt: timestamp || new Date().toISOString()
    }

    console.log('📤 Enviando para backend:', leadData)

    // Enviar para o backend correto - ENDPOINT CORRIGIDO
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    const endpoint = `${backendUrl}/api/labor-research`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Modal'
      },
      body: JSON.stringify(leadData)
    })

    const responseText = await response.text()
    console.log('📥 Resposta do backend:', responseText.substring(0, 200))

    if (!response.ok) {
      throw new Error(`Backend erro: ${response.status} - ${responseText}`)
    }

    const result = JSON.parse(responseText)
    console.log('✅ SUCESSO! Lead salvo:', result)

    return res.status(200).json({
      success: true,
      message: 'Pesquisa trabalhista enviada com sucesso!',
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ ERRO no envio:', error)

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
