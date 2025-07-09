
export default async function handler(req, res) {
  console.log('🔄 API /api/submit-lead chamada')
  console.log('🔍 Método:', req.method)
  console.log('📥 Headers:', req.headers)
  
  if (req.method !== 'POST') {
    console.log('❌ Método não permitido:', req.method)
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const data = req.body
    console.log('📋 Dados recebidos:', JSON.stringify(data, null, 2))

    // Validação rigorosa dos campos obrigatórios
    const requiredFields = {
      nomeCompleto: 'Nome completo',
      whatsapp: 'WhatsApp',
      ultimaEmpresa: 'Última empresa',
      tipoCarteira: 'Tipo de carteira',
      recebeuTudoCertinho: 'Recebeu tudo certinho',
      aceitaConsultoria: 'Aceita consultoria'
    }

    const errors = []
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`${label} é obrigatório`)
        console.log(`❌ Campo obrigatório não preenchido: ${field}`)
      }
    }

    if (errors.length > 0) {
      console.log('❌ Erros de validação:', errors)
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
        errors: errors
      })
    }

    // Validar formato do WhatsApp
    const whatsappNumbers = data.whatsapp.replace(/\D/g, '')
    if (whatsappNumbers.length < 10 || whatsappNumbers.length > 11) {
      console.log('❌ WhatsApp inválido:', data.whatsapp)
      return res.status(400).json({
        success: false,
        message: 'WhatsApp deve ter formato válido (10 ou 11 dígitos)'
      })
    }

    // Preparar dados para o backend
    const leadData = {
      nomeCompleto: data.nomeCompleto.trim(),
      whatsapp: data.whatsapp.trim(),
      ultimaEmpresa: data.ultimaEmpresa.trim(),
      tipoCarteira: data.tipoCarteira,
      recebeuTudoCertinho: data.recebeuTudoCertinho,
      situacoesDuranteTrabalho: data.situacoesDuranteTrabalho || [],
      aceitaConsultoria: data.aceitaConsultoria,
      vagaId: data.vagaId || 'sem-vaga',
      vagaTitulo: data.vagaTitulo || 'Vaga não especificada',
      vagaEmpresa: data.vagaEmpresa || 'Empresa não especificada',
      timestamp: new Date().toISOString(),
      fonte: 'Site do Trabalhador'
    }

    console.log('📤 Enviando para backend:', JSON.stringify(leadData, null, 2))

    // Enviar para o backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    const backendResponse = await fetch(`${backendUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(leadData)
    })

    const backendResult = await backendResponse.json()
    
    console.log('📨 Resposta do backend:', backendResponse.status, backendResult)

    if (backendResponse.ok && backendResult.success) {
      console.log('✅ Lead enviado com sucesso!')
      return res.status(200).json({
        success: true,
        message: 'Candidatura enviada com sucesso!',
        data: backendResult.data
      })
    } else {
      console.log('❌ Erro no backend:', backendResult)
      return res.status(500).json({
        success: false,
        message: backendResult.message || 'Erro ao processar candidatura'
      })
    }

  } catch (error) {
    console.error('❌ Erro na API submit-lead:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}
