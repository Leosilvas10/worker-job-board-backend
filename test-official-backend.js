
async function testOfficialBackend() {
  console.log('🧪 Testando conexão com API oficial do backend...');
  
  const BACKEND_URL = 'https://worker-job-board-backend-leonardosilvas2.replit.app';
  
  try {
    // Teste 1: Endpoint /api/jobs
    console.log('\n📊 Testando /api/jobs...');
    const jobsResponse = await fetch(`${BACKEND_URL}/api/jobs`);
    console.log('Status:', jobsResponse.status);
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log('✅ Vagas encontradas:', jobsData.jobs?.length || 0);
      console.log('🕒 Última atualização:', jobsData.lastUpdate);
      
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        console.log('\n📋 Primeiras 3 vagas:');
        jobsData.jobs.slice(0, 3).forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} - ${job.company} (${job.location})`);
          console.log(`   💰 ${job.salary} - ⏰ ${job.timeAgo}`);
        });
      }
    }
    
    // Teste 2: Endpoint /api/stats
    console.log('\n📊 Testando /api/stats...');
    const statsResponse = await fetch(`${BACKEND_URL}/api/stats`);
    console.log('Status:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Estatísticas:', statsData);
    }
    
    // Teste 3: Health check
    console.log('\n🏥 Testando health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    console.log('Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Status do backend:', healthData.status);
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testOfficialBackend();
