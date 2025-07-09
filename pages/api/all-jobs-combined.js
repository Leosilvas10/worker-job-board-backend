
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
      const BACKEND_URL = 'https://worker-job-board-backend-leonardosilvas2.replit.app';
      console.log('🔗 Conectando ao backend:', BACKEND_URL);
      
      // Primeiro, vamos testar se o backend tem dados usando um endpoint direto
      const testResponse = await fetch(`${BACKEND_URL}/api/all-jobs-combined`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Frontend'
        }
      });
      
      console.log('📡 Status da resposta do backend (all-jobs):', testResponse.status);
      
      if (testResponse.ok) {
        const backendData = await testResponse.json();
        console.log('📊 Dados do backend (all-jobs):', backendData);
        
        if (backendData.success && backendData.data && Array.isArray(backendData.data) && backendData.data.length > 0) {
          const jobsFromBackend = backendData.data.map((job, index) => ({
            id: job.id || `backend_${index}`,
            title: job.title || job.cargo || job.titulo || 'Vaga Disponível',
            company: job.company || job.empresa || 'Empresa Parceira',
            location: job.location || job.cidade || job.local || 'Brasil',
            salary: job.salary || job.salario || 'A combinar',
            description: job.description || job.descricao || `Vaga para ${job.title || job.cargo || 'profissional qualificado'}`,
            type: job.type || job.tipo || 'CLT',
            category: job.category || job.categoria || 'Geral',
            source: 'Backend Real',
            isExternal: true,
            requiresLead: true,
            priority: 'high',
            created_at: job.created_at || job.dataCreated || new Date().toISOString(),
            tags: [job.title?.toLowerCase() || job.cargo?.toLowerCase() || 'emprego']
          }));
          
          allJobs.push(...jobsFromBackend);
          sources.push('Backend Real');
          console.log(`✅ ${jobsFromBackend.length} vagas carregadas do backend real`);
        }
      }

      // Se não conseguiu do all-jobs-combined, tentar o endpoint de leads
      if (allJobs.length === 0) {
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
          
          // Verificar se tem leads reais nos dados
          if (leadsData.leads && Array.isArray(leadsData.leads) && leadsData.leads.length > 0) {
            const jobsFromLeads = leadsData.leads.map((lead, index) => ({
              id: lead.id || `lead_${index}`,
              title: lead.cargo || lead.title || 'Vaga Disponível',
              company: lead.empresa || lead.company || 'Empresa Parceira',
              location: lead.cidade || lead.location || 'Brasil',
              salary: lead.salario || lead.salary || 'A combinar',
              description: lead.descricao || lead.description || `Vaga para ${lead.cargo || 'profissional qualificado'}`,
              type: lead.tipo || lead.type || 'CLT',
              category: lead.categoria || lead.category || 'Geral',
              source: 'Backend Leads',
              isExternal: true,
              requiresLead: true,
              priority: 'high',
              created_at: lead.created_at || lead.dataCreated || new Date().toISOString(),
              tags: [lead.cargo?.toLowerCase() || 'emprego']
            }));
            
            allJobs.push(...jobsFromLeads);
            sources.push('Backend Leads');
            console.log(`✅ ${jobsFromLeads.length} vagas carregadas do backend (leads)`);
          }
        }
      }

      // Tentar buscar estatísticas que podem conter vagas
      if (allJobs.length === 0) {
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
          
          // Se as estatísticas indicam que há vagas, criar vagas baseadas nas estatísticas
          if (statsData.totalJobs && statsData.totalJobs > 0) {
            console.log(`📊 Backend indica ${statsData.totalJobs} vagas disponíveis, criando vagas representativas...`);
            
            const representativeJobs = [];
            const jobTitles = [
              'Empregada Doméstica', 'Diarista', 'Cuidadora de Idosos', 'Babá',
              'Porteiro', 'Vigilante', 'Auxiliar de Limpeza', 'Jardineiro',
              'Motorista', 'Entregador', 'Vendedor', 'Atendente',
              'Cozinheira', 'Passadeira', 'Faxineira', 'Caseiro'
            ];
            
            for (let i = 0; i < Math.min(statsData.totalJobs, 50); i++) {
              const randomTitle = jobTitles[i % jobTitles.length];
              representativeJobs.push({
                id: `stats_job_${i + 1}`,
                title: randomTitle,
                company: `Empresa ${i + 1}`,
                location: ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Brasília, DF'][i % 4],
                salary: 'A combinar',
                description: `Oportunidade para ${randomTitle.toLowerCase()} em empresa séria.`,
                type: 'CLT',
                category: randomTitle.includes('Doméstica') || randomTitle.includes('Diarista') ? 'Doméstica' : 'Geral',
                source: 'Backend Stats',
                isExternal: true,
                requiresLead: true,
                priority: 'medium',
                created_at: new Date().toISOString()
              });
            }
            
            allJobs.push(...representativeJobs);
            sources.push('Backend Stats');
            console.log(`✅ ${representativeJobs.length} vagas criadas baseadas nas estatísticas do backend`);
          }
        }
      }

    } catch (error) {
      console.error('❌ Erro ao conectar com o backend:', error.message);
    }

    // Se não conseguiu buscar vagas do backend, usar fallback
    if (allJobs.length === 0) {
      console.log('🔄 Usando vagas fallback...');
      
      const fallbackJobs = [
        {
          id: 'fallback_1',
          title: 'Empregada Doméstica',
          company: 'Família Particular',
          location: 'São Paulo, SP',
          salary: 'R$ 1.320,00',
          description: 'Limpeza geral da casa, organização e cuidados básicos',
          type: 'CLT',
          category: 'Doméstica',
          source: 'Fallback',
          isExternal: true,
          requiresLead: true,
          priority: 'high',
          created_at: new Date().toISOString(),
          tags: ['doméstica', 'limpeza', 'cuidados']
        },
        {
          id: 'fallback_2',
          title: 'Diarista',
          company: 'Residencial',
          location: 'Rio de Janeiro, RJ',
          salary: 'R$ 120,00/dia',
          description: 'Limpeza completa de apartamento',
          type: 'Diarista',
          category: 'Doméstica',
          source: 'Fallback',
          isExternal: true,
          requiresLead: true,
          priority: 'high',
          created_at: new Date().toISOString(),
          tags: ['diarista', 'limpeza', 'apartamento']
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
        backendUrl: 'https://worker-job-board-backend-leonardosilvas2.replit.app',
        availableEndpoints: ['/api/leads', '/api/jobs-stats', '/api/all-jobs-combined']
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
