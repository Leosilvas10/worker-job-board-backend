export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    console.log('📥 DADOS RECEBIDOS NO FRONTEND:', JSON.stringify(req.body, null, 2))

    const {
      // Dados pessoais obrigatórios
      name,
      whatsapp,

      // Dados da pesquisa trabalhista
      lastCompany,
      workStatus,
      receivedRights,
      workProblems,
      wantConsultation,

      // Consentimento
      lgpdConsent,

      // Dados da vaga
      jobId,
      jobTitle,
      company,
      jobLink,
      originalLocation,

      // Metadados
      fonte,
      paginaOrigem
    } = req.body

    // Validações básicas - apenas nome e whatsapp são obrigatórios
    if (!name || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Nome e WhatsApp são obrigatórios'
      })
    }

    // Preparar dados no formato EXATO que o backend espera
    const laborResearchData = {
      ultimaEmpresa: lastCompany || jobTitle || 'Vaga de Interesse',
      tipoCarteira: workStatus === 'Com carteira assinada' ? 'sim' : (workStatus === 'Sem carteira assinada' ? 'nao' : 'parcial'),
      recebeuTudoCertinho: receivedRights === 'Sim, recebi tudo certinho' ? 'sim' : (receivedRights === 'Não recebi nada' ? 'nao' : 'parcial'),
      situacoesDuranteTrabalho: Array.isArray(workProblems) ? workProblems : (workProblems ? [workProblems] : ['nenhuma']),
      aceitaConsultoria: wantConsultation === 'Sim, quero saber meus direitos' ? 'sim' : 'nao',
      nomeCompleto: name,
      whatsapp: whatsapp
    }

    console.log('🔄 DADOS FORMATADOS PARA ENVIO:', JSON.stringify(laborResearchData, null, 2))

    // Enviar para o backend usando o endpoint CORRETO
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('📤 ENVIANDO PARA BACKEND:', backendUrl + '/api/labor-research')

    const response = await fetch(`${backendUrl}/api/labor-research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(laborResearchData)
    })

    const responseText = await response.text()
    console.log('📨 Status do backend:', response.status)
    console.log('📨 Resposta do backend:', responseText)

    if (!response.ok) {
      console.error('❌ ERRO do backend:', response.status, responseText)

      return res.status(response.status).json({
        success: false,
        message: 'Falha ao salvar no backend: ' + responseText
      })
    }

    const result = JSON.parse(responseText)
    console.log('✅ DADOS SALVOS COM SUCESSO NO BACKEND:', result)

    // Resposta de sucesso com dados de redirecionamento
    res.status(200).json({
      success: true,
      message: 'Candidatura enviada com sucesso!',
      leadId: result.data?.id || `lead_${Date.now()}`,
      redirect: {
        url: jobLink || `https://www.indeed.com.br/jobs?q=${encodeURIComponent(jobTitle || 'emprego')}&l=${encodeURIComponent((originalLocation || 'Brasil').split(',')[0])}`,
        company: company,
        jobTitle: jobTitle
      }
    })

  } catch (error) {
    console.error('❌ Erro ao processar candidatura:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}