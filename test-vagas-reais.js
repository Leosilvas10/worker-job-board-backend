
console.log('🔍 Testando conexão com vagas REAIS do backend...');

const BACKEND_URL = 'https://api.sitedotrabalhador.com.br';

async function testRealJobs() {
  try {
    console.log('📡 Conectando ao backend:', BACKEND_URL);
    
    // Teste 1: Endpoint /api/jobs (vagas reais)
    console.log('\n🎯 Testando /api/jobs (vagas reais)...');
    const jobsResponse = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Frontend-Test-Real-Jobs'
      }
    });
    
    console.log('Status Response:', jobsResponse.status);
    console.log('Headers:', Object.fromEntries(jobsResponse.headers.entries()));
    
    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log('\n✅ DADOS COMPLETOS RECEBIDOS:');
      console.log(JSON.stringify(jobsData, null, 2));
      
      if (jobsData.jobs && jobsData.jobs.length > 0) {
        console.log(`\n🎉 SUCESSO! ${jobsData.jobs.length} vagas REAIS encontradas!`);
        console.log('📊 Total:', jobsData.total || jobsData.jobs.length);
        console.log('🕒 Última atualização:', jobsData.lastUpdate);
        
        console.log('\n📋 Primeiras 5 vagas:');
        jobsData.jobs.slice(0, 5).forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} - ${job.company}`);
          console.log(`   💰 ${job.salary} | 📍 ${job.location || 'N/A'}`);
          console.log(`   🆔 ID: ${job.id} | ⏰ ${job.timeAgo || 'N/A'}`);
        });
      } else {
        console.log('⚠️ Nenhuma vaga encontrada no array jobs');
      }
    } else {
      console.log('❌ Erro na resposta:', jobsResponse.status, jobsResponse.statusText);
      const errorText = await jobsResponse.text();
      console.log('Erro detalhado:', errorText);
    }
    
    // Teste 2: Health check
    console.log('\n🏥 Testando health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    console.log('Health Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health Data:', healthData);
    }
    
    // Teste 3: Stats
    console.log('\n📊 Testando stats...');
    const statsResponse = await fetch(`${BACKEND_URL}/api/stats`);
    console.log('Stats Status:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('Stats Data:', statsData);
    }
    
  } catch (error) {
    console.error('❌ Erro completo:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Executar teste
testRealJobs().then(() => {
  console.log('\n✅ Teste concluído!');
}).catch(error => {
  console.error('\n❌ Erro no teste:', error);
});
