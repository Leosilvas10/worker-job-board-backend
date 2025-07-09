
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    console.log('🎯 PESQUISA TRABALHISTA COMPLETA - Dados recebidos:', req.body)

    const {
      // Dados pessoais
      nomeCompleto,
      whatsapp,
      email,
      idade,
      cidade,
      estado,
      
      // Informações trabalhistas
      ultimaEmpresa,
      cargo,
      tempoTrabalho,
      tipoCarteira,
      
      // Verbas trabalhistas
      fgts,
      ferias,
      decimoTerceiro,
      horasExtras,
      verbasRescisao,
      
      // Problemas enfrentados
      assedio,
      humilhacoes,
      acumuloFuncoes,
      semRegistro,
      atrasoSalario,
      
      // Situações específicas
      situacoesEnfrentadas,
      recebeuDireitos,
      aceitaConsultoria,
      mensagem,
      
      // Dados da vaga (se houver)
      vaga,
      fonte,
      timestamp
    } = req.body

    // Preparar dados completos para envio ao backend
    const leadData = {
      // Dados pessoais
      nome: nomeCompleto,
      telefone: whatsapp,
      email: `${nomeCompleto.toLowerCase().replace(/\s+/g, '')}@pesquisatrabalhista.com`,
      idade: idade || 18,
      cidade: cidade || '',
      estado: estado || '',
      
      // Informações trabalhistas
      ultima_empresa: ultimaEmpresa || '',
      cargo: cargo || '',
      tempo_trabalho: tempoTrabalho || '',
      tipo_carteira: tipoCarteira || '',
      
      // Verbas trabalhistas (formato esperado pelo backend)
      fgts: fgts || 'Não informado',
      ferias: ferias || 'Não informado',
      decimo_terceiro: decimoTerceiro || 'Não informado',
      horas_extras: horasExtras || 'Não informado',
      verbas_rescisao: verbasRescisao || 'Não informado',
      
      // Problemas enfrentados
      assedio: assedio || 'Não informado',
      humilhacoes: humilhacoes || 'Não informado',
      acumulo_funcoes: acumuloFuncoes || 'Não informado',
      sem_registro: semRegistro || 'Não informado',
      atraso_salario: atrasoSalario || 'Não informado',
      
      // Situações específicas
      situacoes_enfrentadas: situacoesEnfrentadas || '',
      recebeu_direitos: recebeuDireitos || 'Não informado',
      aceita_consultoria: aceitaConsultoria || 'Não informado',
      mensagem: mensagem || '',
      
      // Dados da vaga (se aplicável)
      vaga_id: vaga?.id || null,
      vaga_titulo: vaga?.titulo || 'Pesquisa Trabalhista',
      vaga_empresa: vaga?.empresa || '',
      vaga_localizacao: vaga?.localizacao || '',
      
      // Controle e rastreamento
      fonte: fonte || 'modal_pesquisa_trabalhista',
      status: 'novo',
      contatado: false,
      convertido: false,
      data_criacao: timestamp || new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    console.log('📤 Enviando dados completos para backend:', leadData)

    // Enviar para o endpoint correto do backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    const endpoint = `${backendUrl}/api/labor-research`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-PesquisaTrabalhista'
      },
      body: JSON.stringify(leadData)
    })

    const responseText = await response.text()
    console.log('📥 Resposta do backend:', responseText.substring(0, 500))

    if (!response.ok) {
      throw new Error(`Backend erro: ${response.status} - ${responseText}`)
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta JSON:', parseError)
      throw new Error('Resposta inválida do backend')
    }

    console.log('✅ SUCESSO! Pesquisa trabalhista salva:', result)

    return res.status(200).json({
      success: true,
      message: 'Pesquisa trabalhista enviada com sucesso! Entraremos em contato em breve.',
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ ERRO no envio da pesquisa trabalhista:', error)

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao processar pesquisa trabalhista',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
