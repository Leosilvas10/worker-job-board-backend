
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
      
      // Buscar leads (vagas) usando o endpoint correto
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
        
        // Processar os leads como vagas
        if (leadsData.success && leadsData.data && Array.isArray(leadsData.data)) {
          const jobsFromLeads = leadsData.data.map((lead, index) => ({
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
            tags: [lead.cargo?.toLowerCase() || 'emprego', lead.categoria?.toLowerCase() || 'geral']
          }));
          
          allJobs.push(...jobsFromLeads);
          sources.push('Backend Leads');
          console.log(`✅ ${jobsFromLeads.length} vagas carregadas do backend (leads)`);
        }
      }

      // Buscar estatísticas das vagas
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
        
        // Se as estatísticas contiverem vagas adicionais, processar
        if (statsData.jobs && Array.isArray(statsData.jobs)) {
          const additionalJobs = statsData.jobs.map((job, index) => ({
            id: job.id || `stats_job_${index}`,
            title: job.titulo || job.title || 'Vaga Disponível',
            company: job.empresa || job.company || 'Empresa Parceira',
            location: job.local || job.location || 'Brasil',
            salary: job.salario || job.salary || 'A combinar',
            description: job.descricao || job.description || `Vaga para ${job.titulo || 'profissional qualificado'}`,
            type: job.tipo || job.type || 'CLT',
            category: job.categoria || job.category || 'Geral',
            source: 'Backend Stats',
            isExternal: true,
            requiresLead: true,
            priority: 'medium',
            created_at: job.created_at || job.dataCreated || new Date().toISOString()
          }));
          
          allJobs.push(...additionalJobs);
          sources.push('Backend Stats');
          console.log(`✅ ${additionalJobs.length} vagas adicionais carregadas do backend (stats)`);
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
      // Prioridade: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Se mesma prioridade, ordenar por data
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
        availableEndpoints: ['/api/leads', '/api/jobs-stats']
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
