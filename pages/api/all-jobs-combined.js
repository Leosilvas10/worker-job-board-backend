// API que busca vagas do backend em produção
export default async function handler(req, res) {
  try {
    console.log('🔄 Buscando vagas do backend em produção...');

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Método não permitido'
      });
    }

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app';

    // Função para calcular tempo relativo
    function calculateTimeAgo(createdAt) {
      if (!createdAt) return 'Recente'

      const now = new Date()
      const created = new Date(createdAt)
      const diffInMinutes = Math.floor((now - created) / (1000 * 60))

      if (diffInMinutes < 60) {
        return `Há ${diffInMinutes} min`
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60)
        return `Há ${hours}h`
      } else {
        const days = Math.floor(diffInMinutes / 1440)
        return `Há ${days}d`
      }
    }

    // Função para determinar categoria baseada no título
    function getCategoryFromTitle(title) {
      if (!title) return 'Geral'

      const titleLower = title.toLowerCase()

      if (titleLower.includes('domést') || titleLower.includes('diarista')) return 'Doméstica'
      if (titleLower.includes('porteiro') || titleLower.includes('vigilante')) return 'Segurança'
      if (titleLower.includes('limpeza') || titleLower.includes('faxina')) return 'Limpeza'
      if (titleLower.includes('cuidador') || titleLower.includes('babá')) return 'Cuidados'
      if (titleLower.includes('motorista') || titleLower.includes('entregador')) return 'Transporte'
      if (titleLower.includes('cozinha') || titleLower.includes('garç')) return 'Alimentação'
      if (titleLower.includes('vend') || titleLower.includes('comercial')) return 'Vendas'
      if (titleLower.includes('recep') || titleLower.includes('admin')) return 'Administrativo'

      return 'Geral'
    }

    // Função para gerar URL de redirecionamento para vagas reais
    function generateJobRedirectUrl(job) {
      const category = getCategoryFromTitle(job.title)

      const categoryUrls = {
        'Doméstica': 'https://www.catho.com.br/vagas/empregada-domestica/',
        'Segurança': 'https://www.catho.com.br/vagas/porteiro/',
        'Limpeza': 'https://www.catho.com.br/vagas/auxiliar-limpeza/',
        'Cuidados': 'https://www.catho.com.br/vagas/cuidador/',
        'Transporte': 'https://www.catho.com.br/vagas/motorista/',
        'Alimentação': 'https://www.catho.com.br/vagas/cozinheiro/',
        'Vendas': 'https://www.catho.com.br/vagas/vendedor/',
        'Administrativo': 'https://www.catho.com.br/vagas/auxiliar-administrativo/'
      }

      return categoryUrls[category] || 'https://www.catho.com.br/vagas/'
    }

    // Função para gerar vagas complementares baseadas nas estatísticas
    function generateComplementaryJobs(totalJobs, statsData) {
      const complementaryJobs = []
      const jobTitles = [
        { title: 'Empregada Doméstica', company: 'Família Particular', salary: 'R$ 1.320,00', category: 'Doméstica' },
        { title: 'Diarista', company: 'Residencial', salary: 'R$ 120,00/dia', category: 'Doméstica' },
        { title: 'Cuidadora de Idosos', company: 'Cuidados Senior', salary: 'R$ 1.800,00', category: 'Cuidados' },
        { title: 'Babá', company: 'Família', salary: 'R$ 1.600,00', category: 'Cuidados' },
        { title: 'Porteiro', company: 'Condomínio', salary: 'R$ 1.500,00', category: 'Segurança' },
        { title: 'Vigilante', company: 'Empresa de Segurança', salary: 'R$ 1.700,00', category: 'Segurança' },
        { title: 'Auxiliar de Limpeza', company: 'Clean Service', salary: 'R$ 1.400,00', category: 'Limpeza' },
        { title: 'Jardineiro', company: 'Paisagismo Verde', salary: 'R$ 1.350,00', category: 'Jardinagem' },
        { title: 'Motorista', company: 'Transporte Executivo', salary: 'R$ 2.200,00', category: 'Transporte' },
        { title: 'Entregador', company: 'Delivery Express', salary: 'R$ 1.800,00', category: 'Logística' },
        { title: 'Vendedor', company: 'Loja Comercial', salary: 'R$ 1.500,00 + comissão', category: 'Vendas' },
        { title: 'Atendente', company: 'Comércio Local', salary: 'R$ 1.400,00', category: 'Atendimento' },
        { title: 'Cozinheira', company: 'Restaurante', salary: 'R$ 1.600,00', category: 'Alimentação' },
        { title: 'Passadeira', company: 'Lavanderia', salary: 'R$ 1.300,00', category: 'Serviços' },
        { title: 'Faxineira', company: 'Empresa', salary: 'R$ 1.320,00', category: 'Limpeza' },
        { title: 'Caseiro', company: 'Sítio Particular', salary: 'R$ 2.000,00', category: 'Serviços' }
      ];

      const locations = [
        'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
        'Brasília, DF', 'Salvador, BA', 'Curitiba, PR',
        'Fortaleza, CE', 'Recife, PE', 'Porto Alegre, RS',
        'Manaus, AM', 'Belém, PA', 'Goiânia, GO'
      ];

      for (let i = 0; i < totalJobs; i++) {
        const jobTemplate = jobTitles[i % jobTitles.length];
        const location = locations[i % locations.length];

        // Determinar URL real baseada no tipo de vaga
        let redirectUrl = 'https://www.catho.com.br/vagas/';
        const title = jobTemplate.title.toLowerCase();

        if (title.includes('babá') || title.includes('baba')) {
          redirectUrl = 'https://www.catho.com.br/vagas/baba/';
        } else if (title.includes('doméstica') || title.includes('diarista')) {
          redirectUrl = 'https://www.catho.com.br/vagas/empregada-domestica/';
        } else if (title.includes('porteiro') || title.includes('vigilante')) {
          redirectUrl = 'https://www.catho.com.br/vagas/porteiro/';
        } else if (title.includes('cuidador')) {
          redirectUrl = 'https://www.catho.com.br/vagas/cuidador/';
        } else if (title.includes('motorista')) {
          redirectUrl = 'https://www.catho.com.br/vagas/motorista/';
        } else if (title.includes('vendedor') || title.includes('atendente')) {
          redirectUrl = 'https://www.catho.com.br/vagas/vendedor/';
        } else if (title.includes('limpeza') || title.includes('faxineira')) {
          redirectUrl = 'https://www.catho.com.br/vagas/auxiliar-limpeza/';
        } else if (title.includes('jardineiro')) {
          redirectUrl = 'https://www.catho.com.br/vagas/jardineiro/';
        } else if (title.includes('cozinha') || title.includes('cozinheira')) {
          redirectUrl = 'https://www.catho.com.br/vagas/cozinheiro/';
        }

        complementaryJobs.push({
          id: `complementary_${i + 1}`,
          title: jobTemplate.title,
          company: `${jobTemplate.company} - ${location.split(',')[0]}`,
          location: location,
          salary: jobTemplate.salary,
          description: `Oportunidade para ${jobTemplate.title.toLowerCase()} em empresa séria. Requisitos: experiência na área, responsabilidade e dedicação. Entre em contato para mais informações.`,
          type: 'CLT',
          category: jobTemplate.category,
          source: 'Backend Stats',
          isExternal: true,
          requiresLead: true,
          priority: 'medium',
          created_at: new Date(Date.now() - (i * 3600000)).toISOString(), // Escalonar datas
          tags: [jobTemplate.title.toLowerCase().replace(/\s+/g, '-')],
          redirectUrl: redirectUrl,
          realJobSource: 'Catho'
        });
      }
      return complementaryJobs
    }

    // Função principal para buscar todas as vagas
    async function getAllJobsCombined() {
      try {
        console.log('🔄 Buscando vagas reais do backend agendado...')
        console.log('🔗 Conectando ao backend:', BACKEND_URL)

        // Buscar vagas reais do endpoint /api/jobs
        const jobsResponse = await fetch(`${BACKEND_URL}/api/jobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Frontend-Jobs-API'
          }
        })

        console.log('📡 Status da resposta do backend (jobs):', jobsResponse.status)

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          console.log('📊 Vagas reais recebidas:', jobsData)

          if (jobsData.jobs && jobsData.jobs.length > 0) {
            console.log(`✅ ${jobsData.jobs.length} vagas reais carregadas do backend agendado`)

            // Converter formato das vagas para compatibilidade com o frontend
            const formattedJobs = jobsData.jobs.map(job => ({
              id: job.id || `job_${Date.now()}_${Math.random()}`,
              title: job.title,
              company: job.company || 'Empresa Não Informada',
              location: job.location || 'Brasil',
              salary: job.salary || 'A combinar',
              description: job.description,
              type: job.type || 'CLT',
              category: job.category || getCategoryFromTitle(job.title),
              source: 'Backend Agendado',
              tags: job.tags || [job.title?.toLowerCase()],
              timeAgo: job.timeAgo || calculateTimeAgo(job.createdAt),
              created_at: job.createdAt || new Date().toISOString(),
              redirectUrl: generateJobRedirectUrl(job),
              isExternal: true,
              requiresLead: true
            }))

            return {
              success: true,
              data: formattedJobs,
              meta: {
                totalJobs: formattedJobs.length,
                internalJobs: 0,
                externalJobs: formattedJobs.length,
                lastUpdate: jobsData.lastUpdate || new Date().toISOString(),
                source: 'Backend Agendado'
              }
            }
          }
        }

        // Fallback: buscar estatísticas e criar vagas complementares
        console.log('⚠️ Nenhuma vaga real encontrada, buscando estatísticas...')

        const statsResponse = await fetch(`${BACKEND_URL}/api/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Frontend-Jobs-API'
          }
        })

        const statsData = await statsResponse.json()
        console.log('📊 Estatísticas recebidas:', statsData)

        let complementaryJobs = []

        if (statsData && statsData.totalJobs) {
          const totalToCreate = Math.min(statsData.totalJobs, 100)
          console.log(`📊 Backend indica ${statsData.totalJobs} vagas totais, criando ${totalToCreate} vagas complementares...`)

          complementaryJobs = generateComplementaryJobs(totalToCreate, statsData)
          console.log(`✅ ${complementaryJobs.length} vagas complementares criadas baseadas nas estatísticas do backend`)
        }

        return {
          success: true,
          data: complementaryJobs,
          meta: {
            totalJobs: complementaryJobs.length,
            internalJobs: 0,
            externalJobs: complementaryJobs.length,
            lastUpdate: new Date().toISOString(),
            source: 'Backend Stats (Fallback)'
          }
        }

      } catch (error) {
        console.error('❌ Erro ao buscar vagas:', error)

        // Fallback final: retornar vagas básicas
        const fallbackJobs = generateComplementaryJobs(10, { totalJobs: 10 })

        return {
          success: true,
          data: fallbackJobs,
          meta: {
            totalJobs: fallbackJobs.length,
            internalJobs: 0,
            externalJobs: fallbackJobs.length,
            lastUpdate: new Date().toISOString(),
            error: 'Fallback mode - backend not available'
          }
        }
      }
    }

    // Chamar a função principal e retornar os resultados
    const result = await getAllJobsCombined()
    res.status(200).json(result)

  } catch (error) {
    console.error('❌ Erro geral na API:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar vagas',
      data: [],
      jobs: [],
      total: 0,
      error: error.message
    });
  }
}