export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    console.log('🎯 PESQUISA TRABALHISTA - Dados recebidos:', req.body)

    const {
      // Dados pessoais
      nomeCompleto,
      email,
      whatsapp,
      idade,
      cidade,
      estado,

      // Pesquisa trabalhista
      nomeUltimaEmpresa,
      nome_ultima_empresa,
      tipoCarteira,
      tipo_carteira,
      recebeuTudoCertinho,
      recebeu_tudo_certinho,
      situacoesEnfrentadas,
      situacoes_enfrentadas,
      aceitaConsultoria,
      aceita_consultoria,

      // Observações
      mensagem,

      // Dados da vaga
      vaga,
      fonte,
      timestamp
    } = req.body

    // Preparar dados para o backend
    const leadData = {
      nome: nomeCompleto,
      telefone: whatsapp,
      email: email || 'Não informado',
      idade: idade || 18,
      cidade: cidade || '',
      estado: estado || '',

      nome_ultima_empresa: nomeUltimaEmpresa || nome_ultima_empresa || 'Não informado',
      tipo_carteira: tipoCarteira || tipo_carteira || 'Não informado',
      recebeu_tudo_certinho: recebeuTudoCertinho || recebeu_tudo_certinho || 'Não informado',
      situacoes_enfrentadas: situacoesEnfrentadas || situacoes_enfrentadas || 'Não informado',
      aceita_consultoria: aceitaConsultoria || aceita_consultoria || 'Não informado',

      mensagem: mensagem || '',

      vaga_id: vaga?.id || null,
      vaga_titulo: vaga?.titulo || vaga?.title || 'Pesquisa Trabalhista',
      vaga_empresa: vaga?.empresa || vaga?.company || '',
      vaga_localizacao: vaga?.localizacao || vaga?.location || '',
      vaga_url: vaga?.url || vaga?.redirectUrl || vaga?.external_url || vaga?.externalUrl || '',

      fonte: fonte || 'modal_pesquisa_trabalhista',
      status: 'novo',
      data_criacao: timestamp || new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    console.log('📤 Enviando para backend:', leadData)

    // Enviar para o endpoint correto
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    const endpoint = `${backendUrl}/api/labor-research`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(leadData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend erro: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ SUCESSO! Lead salvo:', result)

    // Extrair URL real da vaga para redirecionamento
    let vagaUrl = null

    if (vaga?.url) {
      vagaUrl = vaga.url
    } else if (vaga?.redirectUrl) {
      vagaUrl = vaga.redirectUrl
    } else if (vaga?.external_url) {
      vagaUrl = vaga.external_url
    } else if (vaga?.externalUrl) {
      vagaUrl = vaga.externalUrl
    }

    // Se não temos vaga específica, buscar uma vaga aleatória
    if (!vagaUrl) {
      try {
        console.log('🔍 Buscando vaga aleatória para redirecionamento...');
        const jobsResponse = await fetch('https://worker-job-board-backend-leonardosilvas2.replit.app/api/jobs');
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          if (jobsData.jobs && jobsData.jobs.length > 0) {
            const randomJob = jobsData.jobs[Math.floor(Math.random() * jobsData.jobs.length)];
            vagaUrl = randomJob.url;
            console.log('✅ URL aleatória selecionada:', vagaUrl);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar vaga aleatória:', error);
      }
    }
    // 🎯 URLs VÁLIDAS E SEGURAS PARA REDIRECIONAMENTO
      const urlsSeguras = [
        'https://www.catho.com.br/vagas/',
        'https://www.indeed.com.br/empregos',
        'https://www.vagas.com.br/',
        'https://www.infojobs.com.br/'
      ];

      const urlSegura = urlsSeguras[Math.floor(Math.random() * urlsSeguras.length)];
      console.log('✅ URL segura selecionada:', urlSegura);


    console.log('🔗 URL da vaga identificada:', vagaUrl)

    return res.status(200).json({
      success: true,
      message: 'Lead salvo com sucesso!',
      data: {
        ...result,
        vagaUrl: vagaUrl,
        vagaId: vaga?.id,
        vagaTitulo: vaga?.titulo || vaga?.title,
        vagaEmpresa: vaga?.empresa || vaga?.company
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ ERRO:', error)

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}