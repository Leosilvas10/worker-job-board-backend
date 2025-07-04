// API que combina vagas internas + vagas externas
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

    // Obter a URL base correta
    const baseUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;

    // 1. Buscar vagas internas
    try {
      console.log('📋 Buscando vagas internas...');
      const internalResponse = await fetch(`${baseUrl}/api/jobs`);
      
      let internalData = { success: false, data: [] };
      try {
        if (internalResponse.ok) {
          internalData = await internalResponse.json();
        } else {
          console.log(`⚠️ API interna retornou status ${internalResponse.status}`);
        }
      } catch (jsonError) {
        console.log('⚠️ Erro ao parsear JSON da API interna, usando array vazio');
      }
      
      if (internalData.success && internalData.data) {
        const internalJobs = internalData.data.map(job => ({
          ...job,
          isExternal: false,
          requiresLead: false
        }));
        
        allJobs.push(...internalJobs);
        sources.push('Vagas Internas');
        console.log(`✅ ${internalJobs.length} vagas internas carregadas`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vagas internas:', error);
    }

    // 2. Buscar vagas externas da API principal
    try {
      console.log('🌐 Buscando vagas externas...');
      const externalResponse = await fetch(`${baseUrl}/api/public-jobs-new`);
      const externalData = await externalResponse.json();
      
      if (externalData.success && externalData.data) {
        const externalJobs = externalData.data.map(job => ({
          ...job,
          isExternal: true,
          requiresLead: true // SEMPRE requer lead para vagas externas
        }));
        
        allJobs.push(...externalJobs);
        sources.push('Vagas Externas Gerais');
        console.log(`✅ ${externalJobs.length} vagas externas carregadas`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vagas externas:', error);
    }

    // 2.1. Buscar vagas de empregos simples DIRETAMENTE DO BACKEND
    try {
      console.log('🎯 Buscando vagas de empregos simples DIRETAMENTE DO BACKEND...');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend.onrender.com';
      console.log('🔗 Conectando diretamente ao backend:', backendUrl);
      
      const simpleResponse = await fetch(`${backendUrl}/api/simple-jobs`);
      const simpleData = await simpleResponse.json();
      
      if (simpleData.success && simpleData.data) {
        const simpleJobs = simpleData.data.map(job => ({
          ...job,
          isExternal: true,
          requiresLead: true,
          priority: 'high' // Prioridade alta para empregos simples
        }));
        
        allJobs.push(...simpleJobs);
        sources.push('Empregos Simples');
        console.log(`✅ ${simpleJobs.length} vagas de empregos simples carregadas DIRETAMENTE DO BACKEND`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vagas de empregos simples do backend:', error);
    }

    // 3. Buscar vagas de tecnologia
    try {
      console.log('💻 Buscando vagas de tecnologia...');
      const techResponse = await fetch(`${baseUrl}/api/public-jobs-tech`);
      const techData = await techResponse.json();
      
      if (techData.success && techData.jobs) {
        const techJobs = techData.jobs.map(job => ({
          ...job,
          isExternal: true,
          requiresLead: true
        }));
        
        allJobs.push(...techJobs);
        sources.push('Vagas de Tecnologia');
        console.log(`✅ ${techJobs.length} vagas de tecnologia carregadas`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vagas de tecnologia:', error);
    }

    // 4. Buscar vagas de saúde
    try {
      console.log('🏥 Buscando vagas de saúde...');
      const healthResponse = await fetch(`${baseUrl}/api/public-jobs-health`);
      const healthData = await healthResponse.json();
      
      if (healthData.success && healthData.jobs) {
        const healthJobs = healthData.jobs.map(job => ({
          ...job,
          isExternal: true,
          requiresLead: true
        }));
        
        allJobs.push(...healthJobs);
        sources.push('Vagas de Saúde');
        console.log(`✅ ${healthJobs.length} vagas de saúde carregadas`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vagas de saúde:', error);
    }

    // 5. Buscar vagas de serviços gerais
    try {
      console.log('🔧 Buscando vagas de serviços gerais...');
      const servicesResponse = await fetch(`${baseUrl}/api/public-jobs-services`);
      
      let servicesData = { success: false, jobs: [] };
      try {
        if (servicesResponse.ok) {
          servicesData = await servicesResponse.json();
        } else {
          console.log(`⚠️ API de serviços retornou status ${servicesResponse.status}`);
        }
      } catch (jsonError) {
        console.log('⚠️ Erro ao parsear JSON da API de serviços, usando array vazio');
      }
      
      if (servicesData.success && servicesData.jobs) {
        const servicesJobs = servicesData.jobs.map(job => ({
          ...job,
          isExternal: true,
          requiresLead: true
        }));
        
        allJobs.push(...servicesJobs);
        sources.push('Vagas de Serviços Gerais');
        console.log(`✅ ${servicesJobs.length} vagas de serviços gerais carregadas`);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar vagas de serviços gerais:', error);
    }

    // Remover duplicatas por título + empresa
    const uniqueJobs = [];
    const seen = new Set();
    
    for (const job of allJobs) {
      const key = `${job.title}-${job.company?.name || job.company}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueJobs.push(job);
      }
    }
    
    // Ordenar por prioridade (empregos simples primeiro) e depois por data
    uniqueJobs.sort((a, b) => {
      // Primeiro critério: prioridade (empregos simples primeiro)
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      
      // Segundo critério: data de publicação (mais recentes primeiro)
      const dateA = new Date(a.publishedDate || a.publishedAt || a.createdAt || 0);
      const dateB = new Date(b.publishedDate || b.publishedAt || b.createdAt || 0);
      return dateB - dateA;
    });

    console.log(`✅ Total de vagas carregadas: ${uniqueJobs.length}`);
    console.log(`📊 Fontes ativas: ${sources.join(', ')}`);

    return res.status(200).json({
      success: true,
      data: uniqueJobs,
      jobs: uniqueJobs, // Compatibilidade
      total: uniqueJobs.length,
      meta: {
        sources: sources,
        totalSources: sources.length,
        lastUpdate: new Date().toISOString(),
        cached: false
      }
    });

  } catch (error) {
    console.error('❌ Erro geral na API all-jobs-combined:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar vagas combinadas',
      data: [],
      jobs: [],
      total: 0
    });
  }
}
