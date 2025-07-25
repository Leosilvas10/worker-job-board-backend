
console.log('🔍 Testando URLs das vagas reais...');

const BACKEND_URL = 'https://api.sitedotrabalhador.com.br';

async function testJobsUrls() {
  try {
    console.log('📡 Buscando vagas com URLs...');
    
    const response = await fetch(`${BACKEND_URL}/api/jobs`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${data.jobs.length} vagas encontradas`);
      
      // Verificar primeiras 10 vagas e suas URLs
      console.log('\n📋 URLs das primeiras 10 vagas:');
      data.jobs.slice(0, 10).forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} - ${job.company}`);
        console.log(`   🔗 URL: ${job.url || 'URL NÃO ENCONTRADA'}`);
        console.log(`   🆔 ID: ${job.id}`);
        console.log('');
      });
      
      // Estatísticas das URLs
      const jobsWithUrls = data.jobs.filter(job => job.url);
      const jobsWithoutUrls = data.jobs.filter(job => !job.url);
      
      console.log('\n📊 ESTATÍSTICAS DAS URLs:');
      console.log(`✅ Vagas COM URL: ${jobsWithUrls.length}`);
      console.log(`❌ Vagas SEM URL: ${jobsWithoutUrls.length}`);
      console.log(`📈 Percentual com URL: ${((jobsWithUrls.length / data.jobs.length) * 100).toFixed(1)}%`);
      
      if (jobsWithoutUrls.length > 0) {
        console.log('\n⚠️ Primeiras 5 vagas SEM URL:');
        jobsWithoutUrls.slice(0, 5).forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} - ${job.company} (ID: ${job.id})`);
        });
      }
      
    } else {
      console.log('❌ Erro ao buscar vagas:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testJobsUrls().then(() => {
  console.log('\n✅ Teste de URLs concluído!');
});
