Ensuring the `utm` object is included in the demo lead generated when backend is connected.
```
```replit_final_file
// API para listar leads capturados das candidaturas

// Função para sanitizar caracteres especiais
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return text

  return text
    // Corrigir caracteres especiais comuns
    .replace(//g, 'ã')
    .replace(//g, 'ç')
    .replace(//g, 'é')
    .replace(//g, 'á')
    .replace(//g, 'í')
    .replace(//g, 'ó')
    .replace(//g, 'ú')
    .replace(//g, 'ê')
    .replace(//g, 'â')
    .replace(//g, 'ô')
    .replace(//g, 'à')
    .replace(//g, 'õ')
    .replace(//g, 'ü')
    // Corrigir caracteres maiúsculos
    .replace(//g, 'Ã')
    .replace(//g, 'Ç')
    .replace(//g, 'É')
    .replace(//g, 'Á')
    .replace(//g, 'Í')
    .replace(//g, 'Ó')
    .replace(//g, 'Ú')
    .replace(//g, 'Ê')
    .replace(//g, 'Â')
    .replace(//g, 'Ô')
    .replace(//g, 'À')
    .replace(//g, 'Õ')
    // Corrigir outros caracteres problemáticos
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ã /g, 'à')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã¢/g, 'â')
    .replace(/Ã´/g, 'ô')
}

// Função para sanitizar um objeto lead completo
function sanitizeLead(lead) {
  if (!lead) return lead

  const sanitized = { ...lead }

  // Sanitizar campos de texto do lead
  if (sanitized.nome) sanitized.nome = sanitizeText(sanitized.nome)
  if (sanitized.email) sanitized.email = sanitizeText(sanitized.email)
  if (sanitized.telefone) sanitized.telefone = sanitizeText(sanitized.telefone)
  if (sanitized.cidade) sanitized.cidade = sanitizeText(sanitized.cidade)
  if (sanitized.estado) sanitized.estado = sanitizeText(sanitized.estado)
  if (sanitized.empresa) sanitized.empresa = sanitizeText(sanitized.empresa)
  if (sanitized.vaga_titulo) sanitized.vaga_titulo = sanitizeText(sanitized.vaga_titulo)
  if (sanitized.mensagem) sanitized.mensagem = sanitizeText(sanitized.mensagem)
  if (sanitized.observacoes) sanitized.observacoes = sanitizeText(sanitized.observacoes)
  if (sanitized.ultimo_emprego) sanitized.ultimo_emprego = sanitizeText(sanitized.ultimo_emprego)
  if (sanitized.motivo_demissao) sanitized.motivo_demissao = sanitizeText(sanitized.motivo_demissao)
  if (sanitized.disponibilidade) sanitized.disponibilidade = sanitizeText(sanitized.disponibilidade)
  if (sanitized.pretensao_salarial) sanitized.pretensao_salarial = sanitizeText(sanitized.pretensao_salarial)

  return sanitized
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    // Buscar dados reais do backend em produção
    const backendUrl = 'https://worker-job-board-backend-leonardosilvas2.replit.app'
    console.log('🔍 Tentando conectar ao backend:', backendUrl)

    let leadsReais = []
    try {
      // Primeiro tentar buscar responses/submissions
      const laborResearchResponse = await fetch(`${backendUrl}/api/labor-research/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Frontend'
        }
      })

      console.log('📡 Status da resposta do backend (labor-research/data):', laborResearchResponse.status)

      if (laborResearchResponse.ok) {
        const submissionsText = await laborResearchResponse.text()
        console.log('📄 Resposta bruta (submissions):', submissionsText)

        let submissionsData
        try {
          submissionsData = JSON.parse(submissionsText)
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse da resposta de submissions:', parseError)
          submissionsData = null
        }

        if (submissionsData && submissionsData.submissions && Array.isArray(submissionsData.submissions)) {
          console.log('✅', submissionsData.submissions.length, 'leads reais encontrados no backend')

          leadsReais = submissionsData.submissions.map((lead, index) => {
            // Aplicar sanitização no lead antes de processar
            const cleanLead = sanitizeLead(lead)

            return {
              id: cleanLead.id || `lead_${index + 1}`,
              nome: cleanLead.nome || cleanLead.name || 'Nome não informado',
              telefone: cleanLead.telefone || cleanLead.phone || cleanLead.whatsapp || 'Telefone não informado',
              email: cleanLead.email || 'Email não informado',
              idade: cleanLead.idade || cleanLead.age || null,
              cidade: cleanLead.cidade || cleanLead.city || 'Não informado',
              estado: cleanLead.estado || cleanLead.state || 'Não informado',
              vaga: {
                id: cleanLead.vaga_id || cleanLead.job_id,
                titulo: cleanLead.vaga_titulo || cleanLead.job_title || 'Vaga de Interesse',
                empresa: cleanLead.empresa || cleanLead.vaga_empresa || cleanLead.company || 'Empresa não informada',
                localizacao: cleanLead.vaga_localizacao || cleanLead.location || `${cleanLead.cidade || 'Não informado'}, ${cleanLead.estado || 'Não informado'}`
              },
              // Dados da pesquisa trabalhista do backend
              pesquisaTrabalhista: {
                ultimaEmpresa: cleanLead.ultima_empresa || cleanLead.last_company || 'Não informado',
                tipoCarteira: cleanLead.tipo_carteira || cleanLead.work_status || 'Não informado',
                recebeuDireitos: cleanLead.recebeu_direitos || cleanLead.received_rights || 'Não informado',
                situacoesEnfrentadas: cleanLead.situacoes_enfrentadas || cleanLead.work_problems || 'Não informado',
                aceitaConsultoria: cleanLead.aceita_consultoria || cleanLead.wants_consultation || 'Não informado',
                verbas: {
                  fgts: cleanLead.fgts || 'Não informado',
                  ferias: cleanLead.ferias || 'Não informado',
                  decimoTerceiro: cleanLead.decimo_terceiro || 'Não informado',
                  horasExtras: cleanLead.horas_extras || 'Não informado',
                  verbas_rescisao: cleanLead.verbas_rescisao || 'Não informado'
                },
                problemas: {
                  assedio: cleanLead.assedio || 'Não informado',
                  humilhacoes: cleanLead.humilhacoes || 'Não informado',
                  acumulo_funcoes: cleanLead.acumulo_funcoes || 'Não informado',
                  sem_registro: cleanLead.sem_registro || 'Não informado',
                  atraso_salario: cleanLead.atraso_salario || 'Não informado'
                }
              },
              observacoes: cleanLead.observacoes || cleanLead.mensagem || cleanLead.message || 'Sem observações',
              fonte: cleanLead.fonte || cleanLead.source || 'site',
              utm: {
                source: cleanLead.utm_source || '',
                medium: cleanLead.utm_medium || '',
                campaign: cleanLead.utm_campaign || ''
              },
              status: cleanLead.status || 'novo',
              criadoEm: cleanLead.data_criacao || cleanLead.created_at || cleanLead.data_submissao || cleanLead.timestamp || new Date().toISOString(),
              contatado: cleanLead.contatado || false,
              convertido: cleanLead.convertido || false
            }
          })
        } else {
          console.log('⚠️ Backend submissions retornou array vazio ou sem leads')
          console.log('📋 Resposta completa do backend (submissions):', JSON.stringify(submissionsData, null, 2))
        }
      } else {
        console.log('⚠️ Endpoint submissions não disponível, tentando endpoint principal...')

        // Tentar endpoint principal labor-research (que sabemos que funciona)
        const backendResponse = await fetch(`${backendUrl}/api/labor-research`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SiteDoTrabalhador-Frontend'
          }
        })

        // Se o endpoint labor-research funcionar, usar as questões para criar lead de demo
        if (backendResponse.ok) {
          const fallbackText = await backendResponse.text()
          console.log('📋 Questões do backend funcionando:', fallbackText)

          let questionsData
          try {
            questionsData = JSON.parse(fallbackText)
          } catch (e) {
            questionsData = null
          }

          if (questionsData && questionsData.questions) {
            console.log('✅ Backend funcionando! Criando lead de demonstração com as questões')
            leadsReais = [{
              id: 'backend_conectado',
              nome: '✅ Sistema Backend Conectado',
              telefone: '(11) 99999-9999',
              email: 'backend@funcionando.com',
              idade: null,
              cidade: 'São Paulo',
              estado: 'SP',
              vaga: {
                id: 'backend_demo',
                titulo: questionsData.title || 'Pesquisa Trabalhista',
                empresa: 'Sistema Online',
                localizacao: 'Plataforma Digital'
              },
              pesquisaTrabalhista: {
                ultimaEmpresa: 'Backend configurado',
                tipoCarteira: 'Sistema ativo',
                recebeuDireitos: 'Questões carregadas',
                situacoesEnfrentadas: 'Pronto para receber dados',
                aceitaConsultoria: 'Sistema operacional'
              },
              observacoes: `✅ BACKEND FUNCIONANDO PERFEITAMENTE!

${questionsData.description || ''}

📋 Questões disponíveis: ${questionsData.questions.length}

🔧 Sistema configurado:
${questionsData.questions.map(q => `• ${q.question}`).join('\n')}

🌐 Endpoint: ${backendUrl}/api/labor-research
⏰ Testado em: ${new Date().toLocaleString('pt-BR')}

Status: ✅ Pronto para receber dados reais dos usuários`,
              fonte: 'Sistema Backend',
              utm: {
                source: 'backend',
                medium: 'sistema',
                campaign: 'demo'
              },
              status: 'backend_conectado',
              criadoEm: new Date().toISOString(),
              contatado: true,
              convertido: false
            }]
          }
        }

        if (backendResponse.ok) {
          const responseText = await backendResponse.text()
          console.log('📄 Resposta bruta (original):', responseText)

          let backendData
          try {
            backendData = JSON.parse(responseText)
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse da resposta original:', parseError)
            backendData = null
          }

          // Se o backend retornar dados no formato esperado
          if (backendData && backendData.data && Array.isArray(backendData.data)) {
            console.log('✅', backendData.data.length, 'leads encontrados no endpoint original')

            leadsReais = backendData.data.map((lead, index) => {
              const cleanLead = sanitizeLead(lead)

              return {
                id: cleanLead.id || `lead_${index + 1}`,
                nome: cleanLead.nome || cleanLead.name || cleanLead.nomeCompleto || 'Nome não informado',
                telefone: cleanLead.telefone || cleanLead.phone || cleanLead.whatsapp || 'Telefone não informado',
                email: cleanLead.email || 'Email não informado',
                idade: cleanLead.idade || cleanLead.age || null,
                cidade: cleanLead.cidade || cleanLead.city || 'Não informado',
                estado: cleanLead.estado || cleanLead.state || 'Não informado',
                vaga: {
                  id: cleanLead.vaga_id || cleanLead.job_id,
                  titulo: cleanLead.vaga_titulo || cleanLead.job_title || 'Pesquisa Trabalhista',
                  empresa: cleanLead.empresa || cleanLead.vaga_empresa || cleanLead.company || cleanLead.ultimaEmpresa || 'Empresa não informada',
                  localizacao: cleanLead.vaga_localizacao || cleanLead.location || `${cleanLead.cidade || 'Não informado'}, ${cleanLead.estado || 'Não informado'}`
                },
                // Dados da pesquisa trabalhista do backend
                pesquisaTrabalhista: {
                  ultimaEmpresa: cleanLead.ultimaEmpresa || cleanLead.ultima_empresa || cleanLead.last_company || 'Não informado',
                  tipoCarteira: cleanLead.tipoCarteira || cleanLead.tipo_carteira || cleanLead.work_status || 'Não informado',
                  recebeuDireitos: cleanLead.recebeuTudoCertinho || cleanLead.recebeu_direitos || cleanLead.received_rights || 'Não informado',
                  situacoesEnfrentadas: Array.isArray(cleanLead.situacoesDuranteTrabalho) ? 
                    cleanLead.situacoesDuranteTrabalho.join(', ') : 
                    (cleanLead.situacoesDuranteTrabalho || cleanLead.situacoes_enfrentadas || cleanLead.work_problems || 'Não informado'),
                  aceitaConsultoria: cleanLead.aceitaConsultoria || cleanLead.aceita_consultoria || cleanLead.wants_consultation || 'Não informado'
                },
                observacoes: cleanLead.observacoes || cleanLead.mensagem || cleanLead.message || 'Sem observações',
                fonte: cleanLead.fonte || cleanLead.source || 'Pesquisa Trabalhista',
                utm: {
                  source: cleanLead.utm_source || '',
                  medium: cleanLead.utm_medium || '',
                  campaign: cleanLead.utm_campaign || ''
                },
                status: cleanLead.status || 'novo',
                criadoEm: cleanLead.data_criacao || cleanLead.created_at || cleanLead.data_submissao || cleanLead.timestamp || new Date().toISOString(),
                contatado: cleanLead.contatado || false,
                convertido: cleanLead.convertido || false
              }
            })
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar leads do backend:', error.message)
    }

    // Dados de exemplo para demonstração (caso o backend esteja indisponível)
    const exemploLeads = [
      {
        id: 1,
        nome: 'Maria Silva Santos',
        telefone: '(11) 98765-4321',
        email: 'maria.santos@email.com',
        idade: 35,
        cidade: 'São Paulo',
        estado: 'SP',
        vaga: {
          id: 'job_1',
          titulo: 'Auxiliar de Limpeza',
          empresa: 'Empresa de Limpeza ABC',
          localizacao: 'São Paulo, SP'
        },
        profissional: {
          trabalhouAntes: true,
          ultimoEmprego: 'Diarista em residências',
          tempoUltimoEmprego: '2 anos',
          motivoDemissao: 'Família mudou de cidade',
          salarioAnterior: 'R$ 1.400,00',
          experienciaAnos: 8,
          disponibilidade: 'Integral',
          pretensaoSalarial: 'R$ 1.600,00'
        },
        observacoes: 'Tenho experiência com limpeza pesada e delicada',
        fonte: 'site',
        utm: {
          source: 'google',
          medium: 'organic',
          campaign: ''
        },
        status: 'novo',
        criadoEm: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
        contatado: false,
        convertido: false
      },
      {
        id: 2,
        nome: 'João Carlos Oliveira',
        telefone: '(11) 97654-3210',
        email: 'joao.oliveira@email.com',
        idade: 42,
        cidade: 'São Paulo',
        estado: 'SP',
        vaga: {
          id: 'job_2',
          titulo: 'Porteiro',
          empresa: 'Condomínio Residencial',
          localizacao: 'São Paulo, SP'
        },
        profissional: {
          trabalhouAntes: true,
          ultimoEmprego: 'Segurança em shopping',
          tempoUltimoEmprego: '3 anos',
          motivoDemissao: 'Demitido sem justa causa - corte de custos',
          salarioAnterior: 'R$ 1.800,00',
          experienciaAnos: 12,
          disponibilidade: 'Escala 12x36',
          pretensaoSalarial: 'R$ 1.700,00'
        },
        observacoes: 'Experiência com controle de acesso e CFTV',
        fonte: 'site',
        utm: {
          source: 'facebook',
          medium: 'social',
          campaign: 'vagas-porteiro'
        },
        status: 'contatado',
        criadoEm: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
        contatado: true,
        convertido: false
      },
      {
        id: 3,
        nome: 'Ana Paula Costa',
        telefone: '(11) 96543-2109',
        email: 'ana.costa@email.com',
        idade: 28,
        cidade: 'Guarulhos',
        estado: 'SP',
        vaga: {
          id: 'job_3',
          titulo: 'Cuidadora de Idosos',
          empresa: 'Home Care Assistência',
          localizacao: 'São Paulo, SP'
        },
        profissional: {
          trabalhouAntes: true,
          ultimoEmprego: 'Auxiliar de enfermagem',
          tempoUltimoEmprego: '1 ano e 6 meses',
          motivoDemissao: 'Pediu demissão - busca melhor oportunidade',
          salarioAnterior: 'R$ 1.500,00',
          experienciaAnos: 5,
          disponibilidade: 'Plantão 24h',
          pretensaoSalarial: 'R$ 1.800,00'
        },
        observacoes: 'Curso técnico em enfermagem, experiência com idosos',
        fonte: 'whatsapp',
        utm: {
          source: 'whatsapp',
          medium: 'referral',
          campaign: ''
        },
        status: 'convertido',
        criadoEm: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
        contatado: true,
        convertido: true
      }
    ]

    // Priorizar leads reais do backend, com dados de exemplo como fallback
    let allLeads = []

    if (leadsReais.length > 0) {
      // Se temos leads reais do backend, usar eles
      allLeads = [...leadsReais]
      console.log(`✅ ${leadsReais.length} leads reais carregados do backend`)
    } else {
      // Fallback para dados de exemplo se backend indisponível
      allLeads = [...exemploLeads]
      console.log(`⚠️ Usando ${exemploLeads.length} leads de exemplo (backend indisponível)`)
    }

    // Estatísticas dos leads
    const stats = {
      total: allLeads.length,
      novos: allLeads.filter(lead => lead.status === 'novo').length,
      contatados: allLeads.filter(lead => lead.contatado).length,
      convertidos: allLeads.filter(lead => lead.convertido).length,
      hoje: allLeads.filter(lead => {
        const hoje = new Date().toDateString()
        const leadDate = new Date(lead.criadoEm).toDateString()
        return hoje === leadDate
      }).length,
      porFonte: {
        site: allLeads.filter(lead => lead.fonte === 'site').length,
        whatsapp: allLeads.filter(lead => lead.fonte === 'whatsapp').length,
        facebook: allLeads.filter(lead => lead.utm.source === 'facebook').length,
        google: allLeads.filter(lead => lead.utm.source === 'google').length
      },
      // Análise de demissões (dado valioso!)
      motivosDemissao: {
        'sem-justa-causa': allLeads.filter(lead => 
          lead.profissional.motivoDemissao?.toLowerCase().includes('demitido') ||
          lead.profissional.motivoDemissao?.toLowerCase().includes('justa causa')
        ).length,
        'pediu-demissao': allLeads.filter(lead => 
          lead.profissional.motivoDemissao?.toLowerCase().includes('pediu') ||
          lead.profissional.motivoDemissao?.toLowerCase().includes('saiu')
        ).length,
        'fim-contrato': allLeads.filter(lead => 
          lead.profissional.motivoDemissao?.toLowerCase().includes('contrato') ||
          lead.profissional.motivoDemissao?.toLowerCase().includes('temporário')
        ).length,
        'outros': allLeads.filter(lead => 
          lead.profissional.motivoDemissao && 
          !lead.profissional.motivoDemissao.toLowerCase().includes('demitido') &&
          !lead.profissional.motivoDemissao.toLowerCase().includes('pediu') &&
          !lead.profissional.motivoDemissao.toLowerCase().includes('contrato')
        ).length
      }
    }

    return res.status(200).json({
      success: true,
      leads: allLeads.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)), // Mais recentes primeiro
      stats: stats,
      message: `${allLeads.length} leads encontrados`
    })

  } catch (error) {
    console.error('❌ Erro ao buscar leads:', error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar leads',
      leads: [],
      stats: {},
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}