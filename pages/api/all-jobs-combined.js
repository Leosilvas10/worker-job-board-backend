
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

    // Buscar vagas diretamente do backend em produção
    try {
      const BACKEND_URL = 'https://worker-job-board-backend-leonardosilvas2.replit.app';
      console.log('🔗 Conectando ao backend:', BACKEND_URL);
      
      // Buscar estatísticas de vagas
      const statsResponse = await fetch(`${BACKEND_URL}/api/jobs-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Frontend'
        }
      });
      
      console.log('📡 Status da resposta do backend:', statsResponse.status);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('📊 Dados recebidos do backend:', Object.keys(statsData));
        
        // Se o backend retornar as vagas diretamente
        if (statsData.jobs && Array.isArray(statsData.jobs)) {
          const backendJobs = statsData.jobs.map(job => ({
            id: job.id || `job_${Date.now()}_${Math.random()}`,
            title: job.title || job.titulo || 'Vaga Disponível',
            company: job.company || job.empresa || 'Empresa Parceira',
            location: job.location || job.localizacao || 'Não informado',
            salary: job.salary || job.salario || 'A combinar',
            description: job.description || job.descricao || 'Descrição não disponível',
            type: job.type || job.tipo || 'CLT',
            category: job.category || job.categoria || 'Geral',
            source: 'Backend Produção',
            isExternal: true,
            requiresLead: true,
            priority: 'high',
            created_at: job.created_at || job.data_criacao || new Date().toISOString()
          }));
          
          allJobs.push(...backendJobs);
          sources.push('Backend Produção');
          console.log(`✅ ${backendJobs.length} vagas carregadas do backend`);
        } else {
          console.log('⚠️ Backend não retornou vagas no formato esperado');
        }
      } else {
        console.log(`⚠️ Erro no backend: ${statsResponse.status} ${statsResponse.statusText}`);
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
          created_at: new Date().toISOString()
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
          created_at: new Date().toISOString()
        }
      ];
      
      allJobs.push(...fallbackJobs);
      sources.push('Fallback');
      console.log(`✅ ${fallbackJobs.length} vagas fallback carregadas`);
    }

    // Remover duplicatas
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex((j) => j.id === job.id)
    );

    // Ordenar por prioridade
    uniqueJobs.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
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
        backendUrl: 'https://worker-job-board-backend-leonardosilvas2.replit.app'
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
