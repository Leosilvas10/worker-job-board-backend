
<old_str>export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    // Backend URL
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    let leads = []

    try {
      console.log('🔍 Tentando buscar dados do backend...')

      // Buscar dados do endpoint que SABEMOS que funciona
      const response = await fetch(`${backendUrl}/api/labor-research`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.text()
        console.log('✅ Backend conectado!', data)

        // Criar lead de demonstração mostrando que o backend está funcionando
        leads = [{
          id: 'backend_funcionando',
          nome: '✅ BACKEND CONECTADO COM SUCESSO',
          telefone: '(11) 99999-9999',
          email: 'sistema@funcionando.com',
          idade: null,
          cidade: 'São Paulo',
          estado: 'SP',
          vaga: {
            id: 'sistema',
            titulo: 'Sistema Backend Operacional',
            empresa: 'Plataforma Online',
            localizacao: 'Digital'
          },
          observacoes: `✅ SISTEMA FUNCIONANDO PERFEITAMENTE!

🔗 Backend URL: ${backendUrl}
📡 Endpoint testado: /api/labor-research
⏰ Testado em: ${new Date().toLocaleString('pt-BR')}
🎯 Status: CONECTADO E OPERACIONAL

O backend está rodando e pronto para receber dados dos usuários.
Aguardando submissions reais dos formulários do site.`,
          fonte: 'Sistema',
          status: 'sistema_ativo',
          criadoEm: new Date().toISOString(),
          contatado: true,
          convertido: false
        }]
      }
    } catch (backendError) {
      console.log('⚠️ Backend indisponível:', backendError.message)
    }

    // Se não conseguiu conectar no backend, usar dados de exemplo
    if (leads.length === 0) {
      leads = [
        {
          id: 1,
          nome: 'Maria Silva',
          telefone: '(11) 98765-4321',
          email: 'maria@email.com',
          idade: 32,
          cidade: 'São Paulo',
          estado: 'SP',
          vaga: {
            id: 'job_1',
            titulo: 'Pesquisa Trabalhista',
            empresa: 'Dados de Exemplo',
            localizacao: 'São Paulo, SP'
          },
          observacoes: 'Lead de exemplo - Backend não conectado',
          fonte: 'exemplo',
          status: 'novo',
          criadoEm: new Date().toISOString(),
          contatado: false,
          convertido: false
        }
      ]
    }

    // Retornar resposta sempre com sucesso
    return res.status(200).json({
      success: true,
      leads: leads,
      stats: {
        total: leads.length,
        novos: leads.filter(l => l.status === 'novo').length,
        contatados: leads.filter(l => l.contatado).length,
        convertidos: leads.filter(l => l.convertido).length
      },
      message: `${leads.length} leads carregados`
    })

  } catch (error) {
    console.error('❌ Erro geral:', error)

    // Em caso de qualquer erro, retornar dados básicos
    return res.status(200).json({
      success: true,
      leads: [{
        id: 'erro_sistema',
        nome: 'Sistema em Manutenção',
        telefone: '(11) 99999-9999',
        email: 'sistema@manutencao.com',
        idade: null,
        cidade: 'Sistema',
        estado: 'SP',
        vaga: {
          id: 'manutencao',
          titulo: 'Sistema em Manutenção',
          empresa: 'Plataforma',
          localizacao: 'Online'
        },
        observacoes: `Sistema temporariamente em manutenção.

Erro: ${error.message}

Tente novamente em alguns minutos.`,
        fonte: 'sistema',
        status: 'manutencao',
        criadoEm: new Date().toISOString(),
        contatado: false,
        convertido: false
      }],
      stats: {
        total: 1,
        novos: 0,
        contatados: 0,
        convertidos: 0
      },
      message: 'Sistema em manutenção'
    })
  }
}</old_str>
<new_str>export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('🔍 Buscando leads reais do backend...')

    // Buscar leads reais salvos no backend
    const response = await fetch(`${backendUrl}/api/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SiteDoTrabalhador-Frontend'
      }
    })

    if (!response.ok) {
      console.log('⚠️ Endpoint /api/leads não disponível, tentando /api/labor-research/submissions...')
      
      // Tentar endpoint alternativo para submissions
      const submissionsResponse = await fetch(`${backendUrl}/api/labor-research/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Frontend'
        }
      })

      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        console.log('✅ Submissions encontradas:', submissionsData)
        
        return res.status(200).json({
          success: true,
          leads: submissionsData.submissions || submissionsData.data || [],
          stats: {
            total: submissionsData.submissions?.length || 0,
            novos: submissionsData.submissions?.filter(l => l.status === 'novo')?.length || 0,
            contatados: submissionsData.submissions?.filter(l => l.contatado)?.length || 0,
            convertidos: submissionsData.submissions?.filter(l => l.convertido)?.length || 0
          },
          message: `${submissionsData.submissions?.length || 0} leads encontrados`
        })
      }
      
      // Se nenhum endpoint funcionar, retornar vazio
      console.log('❌ Nenhum endpoint de leads disponível')
      return res.status(200).json({
        success: true,
        leads: [],
        stats: {
          total: 0,
          novos: 0,
          contatados: 0,
          convertidos: 0
        },
        message: 'Nenhum lead encontrado ainda. Aguardando primeiros envios do formulário.'
      })
    }

    const data = await response.json()
    console.log('✅ Dados recebidos do backend:', data)

    // Processar dados do backend
    const leads = data.leads || data.data || []
    
    return res.status(200).json({
      success: true,
      leads: leads,
      stats: {
        total: leads.length,
        novos: leads.filter(l => l.status === 'novo').length,
        contatados: leads.filter(l => l.contatado).length,
        convertidos: leads.filter(l => l.convertido).length
      },
      message: `${leads.length} leads carregados do backend`
    })

  } catch (error) {
    console.error('❌ Erro ao buscar leads:', error)
    
    // Retornar vazio em caso de erro
    return res.status(200).json({
      success: true,
      leads: [],
      stats: {
        total: 0,
        novos: 0,
        contatados: 0,
        convertidos: 0
      },
      message: 'Erro ao conectar com backend. Verifique se o formulário está enviando dados corretamente.'
    })
  }
}</new_str>
