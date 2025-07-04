// API que combina vagas internas + vagas externas - VERSÃO CORRIGIDA
export default async function handler(req, res) {
  try {
    console.log('🔄 Buscando TODAS as vagas (internas + externas)...');
    
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Método não permitido'
      });
    }

    const allJobs = [];
    const sources = [];

    // CORREÇÃO URGENTE - Buscar vagas DIRETAMENTE DO BACKEND
    try {
      console.log('🚨 CORREÇÃO URGENTE - Buscando vagas DIRETAMENTE DO BACKEND...');
      
      // URL HARDCODED DEFINITIVA - RAILWAY
      const BACKEND_URL_PRODUCTION = 'https://sitedotrabalhador-backend-production.up.railway.app';
      console.log('🔗 URL RAILWAY DEFINITIVA:', BACKEND_URL_PRODUCTION);
      
      const simpleResponse = await fetch(`${BACKEND_URL_PRODUCTION}/api/simple-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SiteDoTrabalhador-Production'
        }
      });
      
      console.log('📡 Status da resposta do backend:', simpleResponse.status, simpleResponse.statusText);
      
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.json();
        console.log('📋 Dados recebidos do backend:', simpleData);
        
        if (simpleData.success && simpleData.data) {
          const simpleJobs = simpleData.data.map(job => ({
            ...job,
            isExternal: true,
            requiresLead: true,
            priority: 'high'
          }));
          
          allJobs.push(...simpleJobs);
          sources.push('Backend Empregos Simples');
          console.log(`✅ ${simpleJobs.length} vagas carregadas DIRETAMENTE DO BACKEND`);
        }
      } else {
        console.log(`⚠️ Backend retornou status ${simpleResponse.status}, usando dados demo`);
        
        // Fallback com dados demo se o backend não responder
        const demoJobs = [
          {
            id: 'demo_1',
            title: 'Empregada Doméstica',
            company: 'Família Particular - Zona Sul',
            location: 'São Paulo, SP',
            salary: 'R$ 1.320,00',
            description: 'Limpeza geral da casa, organização, preparo de refeições simples.',
            type: 'CLT',
            category: 'Doméstica',
            source: 'Demo',
            isExternal: true,
            requiresLead: true,
            priority: 'high'
          },
          {
            id: 'demo_2',
            title: 'Diarista',
            company: 'Residencial Particular',
            location: 'Rio de Janeiro, RJ',
            salary: 'R$ 120,00/dia',
            description: 'Limpeza completa de apartamento 2 quartos.',
            type: 'Diarista',
            category: 'Doméstica',
            source: 'Demo',
            isExternal: true,
            requiresLead: true,
            priority: 'high'
          }
        ];
        
        allJobs.push(...demoJobs);
        sources.push('Dados Demo');
        console.log(`✅ ${demoJobs.length} vagas demo carregadas como fallback`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vagas do backend:', error);
      
      // Fallback final com dados demo
      const fallbackJobs = [
        {
          id: 'fallback_1',
          title: 'Empregada Doméstica',
          company: 'Família Particular',
          location: 'São Paulo, SP',
          salary: 'R$ 1.320,00',
          description: 'Vaga disponível - Entre em contato',
          type: 'CLT',
          category: 'Doméstica',
          source: 'Fallback',
          isExternal: true,
          requiresLead: true,
          priority: 'high'
        }
      ];
      
      allJobs.push(...fallbackJobs);
      sources.push('Fallback Demo');
      console.log(`⚠️ Usando fallback: ${fallbackJobs.length} vagas`);
    }

    // Remover duplicatas por ID
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex((j) => j.id === job.id)
    );

    // Ordenar por prioridade e data
    uniqueJobs.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return new Date(b.created_at || new Date()) - new Date(a.created_at || new Date());
    });

    console.log(`✅ Total de vagas carregadas: ${uniqueJobs.length}`);
    console.log(`📊 Fontes ativas: ${sources.join(', ')}`);

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
        internalJobs: 0,
        externalJobs: uniqueJobs.length
      }
    });

  } catch (error) {
    console.error('❌ Erro geral na API all-jobs-combined:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar vagas combinadas',
      data: [],
      jobs: [],
      total: 0
    });
  }
}
