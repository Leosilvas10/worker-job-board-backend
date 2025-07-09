// API para capturar leads de candidatos que se candidatam às vagas

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    const {
      // Dados pessoais
      nome,
      telefone,
      email,
      idade,
      cidade,
      estado,
      
      // Dados da vaga
      vagaId,
      vagaTitulo,
      vagaEmpresa,
      vagaLocalizacao,
      vagaUrl,
      
      // Dados sobre trabalho anterior (para análise de demissão)
      trabalhouAntes,
      ultimoEmprego,
      tempoUltimoEmprego,
      motivoDemissao,
      salarioAnterior,
      experienciaAnos,
      
      // Dados complementares
      disponibilidade,
      pretensaoSalarial,
      observacoes,
      
      // Dados de rastreamento
      fonte,
      utm_source,
      utm_medium,
      utm_campaign
    } = req.body

    // Validações básicas
    if (!nome || !telefone) {
      return res.status(400).json({
        success: false,
        message: 'Nome e telefone são obrigatórios'
      })
    }

    // Preparar dados para enviar ao backend
    const leadData = {
      nome,
      telefone,
      email,
      empresa: vagaEmpresa,
      mensagem: `CANDIDATURA - ${vagaTitulo}
Vaga: ${vagaTitulo}
Empresa: ${vagaEmpresa}
Localização: ${vagaLocalizacao}
ID da Vaga: ${vagaId}
URL da Vaga: ${vagaUrl}

DADOS PESSOAIS:
Idade: ${idade}
Cidade: ${cidade}
Estado: ${estado}

EXPERIÊNCIA PROFISSIONAL:
Trabalhou antes: ${trabalhouAntes}
Último emprego: ${ultimoEmprego}
Tempo no último emprego: ${tempoUltimoEmprego}
Motivo da demissão: ${motivoDemissao}
Salário anterior: ${salarioAnterior}
Anos de experiência: ${experienciaAnos}

PREFERÊNCIAS:
Disponibilidade: ${disponibilidade}
Pretensão salarial: ${pretensaoSalarial}

OBSERVAÇÕES:
${observacoes}

TRACKING:
Fonte: ${fonte}
UTM Source: ${utm_source}
UTM Medium: ${utm_medium}
UTM Campaign: ${utm_campaign}`
    }

    // Enviar para o backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })

    const result = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: result.message || 'Erro ao salvar candidatura'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Candidatura enviada com sucesso!',
      data: {
        vagaUrl: vagaUrl,
        vagaTitulo: vagaTitulo,
        vagaEmpresa: vagaEmpresa,
        backendResponse: result
      }
    })

  } catch (error) {
    console.error('Erro ao processar candidatura:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
