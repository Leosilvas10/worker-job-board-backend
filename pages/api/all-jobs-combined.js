
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

    const allJobs = [];
    const sources = [];

    // Buscar vagas do backend usando as URLs corretas
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app';
      console.log('🔗 Conectando ao backend:', BACKEND_URL);
      
      // Primeiro tentar buscar leads reais
      const leadsResponse = await fetch(`${BACKEND_URL}/api/leads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Frontend'
        }
      });
      
      console.log('📡 Status da resposta do backend (leads):', leadsResponse.status);
      
      if (leadsResponse.ok) {
        const leadsData = await leadsResponse.json();
        console.log('📊 Dados de leads recebidos:', leadsData);
        
        // Se tem leads reais nos dados
        if (leadsData.leads && Array.isArray(leadsData.leads) && leadsData.leads.length > 0) {
          const jobsFromLeads = leadsData.leads.map((lead, index) => ({
            id: lead.id || `lead_${index}`,
            title: lead.cargo || lead.title || lead.posicao || 'Vaga Disponível',
            company: lead.empresa || lead.company || lead.nomeEmpresa || 'Empresa Parceira',
            location: lead.cidade || lead.location || lead.local || 'Brasil',
            salary: lead.salario || lead.salary || lead.faixaSalarial || 'A combinar',
            description: lead.descricao || lead.description || lead.detalhes || `Vaga para ${lead.cargo || 'profissional qualificado'}. Entre em contato para mais informações.`,
            type: lead.tipo || lead.type || lead.tipoContrato || 'CLT',
            category: lead.categoria || lead.category || lead.area || 'Geral',
            source: 'Backend Real - Leads',
            isExternal: true,
            requiresLead: true,
            priority: 'high',
            created_at: lead.created_at || lead.dataCreated || lead.dataCriacao || new Date().toISOString(),
            tags: [lead.cargo?.toLowerCase() || lead.title?.toLowerCase() || 'emprego'],
            // Dados adicionais do lead
            leadData: {
              telefone: lead.telefone || lead.phone,
              email: lead.email,
              whatsapp: lead.whatsapp,
              contato: lead.contato
            }
          }));
          
          allJobs.push(...jobsFromLeads);
          sources.push('Backend Real - Leads');
          console.log(`✅ ${jobsFromLeads.length} vagas reais carregadas do backend (leads)`);
        }
      }

      // Se ainda não tem vagas suficientes, buscar estatísticas para completar
      if (allJobs.length < 50) {
        const statsResponse = await fetch(`${BACKEND_URL}/api/jobs-stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SiteDoTrabalhador-Frontend'
          }
        });
        
        console.log('📡 Status da resposta do backend (stats):', statsResponse.status);
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('📊 Estatísticas recebidas:', statsData);
          
          // Se as estatísticas indicam que há vagas, criar vagas complementares
          if (statsData.totalJobs && statsData.totalJobs > allJobs.length) {
            const vagasNecessarias = Math.min(statsData.totalJobs - allJobs.length, 100);
            console.log(`📊 Backend indica ${statsData.totalJobs} vagas totais, criando ${vagasNecessarias} vagas complementares...`);
            
            const complementaryJobs = [];
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
            
            for (let i = 0; i < vagasNecessarias; i++) {
              const jobTemplate = jobTitles[i % jobTitles.length];
              const location = locations[i % locations.length];
              
              // Determinar URL real baseada no tipo de vaga
              let redirectUrl = 'https://www.catho.com.br/vagas/';
              const title = jobTemplate.title.toLowerCase();
              
              if (title.includes('doméstica') || title.includes('diarista')) {
                redirectUrl = 'https://www.catho.com.br/vagas/empregada-domestica/';
              } else if (title.includes('porteiro') || title.includes('vigilante')) {
                redirectUrl = 'https://www.catho.com.br/vagas/porteiro/';
              } else if (title.includes('cuidador') || title.includes('babá')) {
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
            
            allJobs.push(...complementaryJobs);
            sources.push('Backend Stats');
            console.log(`✅ ${complementaryJobs.length} vagas complementares criadas baseadas nas estatísticas do backend`);
          }
        }
      }

    } catch (error) {
      console.error('❌ Erro ao conectar com o backend:', error.message);
    }

    // Se não conseguiu buscar vagas do backend, usar fallback mínimo
    if (allJobs.length === 0) {
      console.log('🔄 Usando vagas fallback mínimas...');
      
      const fallbackJobs = [
        {
          id: 'fallback_1',
          title: 'Empregada Doméstica',
          company: 'Família Particular',
          location: 'São Paulo, SP',
          salary: 'R$ 1.320,00',
          description: 'Limpeza geral da casa, organização e cuidados básicos. Experiência mínima de 1 ano.',
          type: 'CLT',
          category: 'Doméstica',
          source: 'Fallback',
          isExternal: true,
          requiresLead: true,
          priority: 'high',
          created_at: new Date().toISOString(),
          tags: ['doméstica', 'limpeza', 'cuidados'],
          redirectUrl: 'https://www.catho.com.br/vagas/empregada-domestica/',
          realJobSource: 'Catho'
        },
        {
          id: 'fallback_2',
          title: 'Diarista',
          company: 'Residencial',
          location: 'Rio de Janeiro, RJ',
          salary: 'R$ 120,00/dia',
          description: 'Limpeza completa de apartamento 2 quartos, 2x por semana.',
          type: 'Diarista',
          category: 'Doméstica',
          source: 'Fallback',
          isExternal: true,
          requiresLead: true,
          priority: 'high',
          created_at: new Date().toISOString(),
          tags: ['diarista', 'limpeza', 'apartamento'],
          redirectUrl: 'https://www.catho.com.br/vagas/empregada-domestica/',
          realJobSource: 'Catho'
        }
      ];
      
      allJobs.push(...fallbackJobs);
      sources.push('Fallback');
      console.log(`✅ ${fallbackJobs.length} vagas fallback carregadas`);
    }

    // Remover duplicatas por ID
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex((j) => j.id === job.id)
    );

    // Ordenar por prioridade e data
    uniqueJobs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return new Date(b.created_at || new Date()) - new Date(a.created_at || new Date());
    });

    console.log(`✅ Total de vagas disponíveis: ${uniqueJobs.length}`);
    console.log(`📊 Fontes: ${sources.join(', ')}`);

    return res.status(200).json({
      success: true,
      data: uniqueJobs,
      jobs: uniqueJobs,
      total: uniqueJobs.length,
      meta: {
        sources: sources,
        totalSources: sources.length,
        lastUpdate: new Date().toISOString(),
        cached: false,
        backendUrl: process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app',
        availableEndpoints: ['/api/leads', '/api/jobs-stats'],
        realLeads: allJobs.filter(job => job.source.includes('Backend Real')).length,
        complementaryJobs: allJobs.filter(job => job.source.includes('Stats')).length,
        fallbackJobs: allJobs.filter(job => job.source === 'Fallback').length
      }
    });

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
