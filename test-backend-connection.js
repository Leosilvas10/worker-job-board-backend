
const backendUrl = 'https://api.sitedotrabalhador.com.br';

async function testBackendConnection() {
  console.log('🧪 Testando conexão com backend...');
  console.log('🔗 URL:', backendUrl);
  try {
    // Teste 1: Health check
    console.log('\n📊 Testando /api/jobs-stats...');
    const statsResponse = await fetch(`${backendUrl}/api/jobs-stats`);
    console.log('Status:', statsResponse.status);
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('Stats:', stats);
    }
    
    // Teste 2: All jobs
    console.log('\n📋 Testando /api/all-jobs-combined...');
    const jobsResponse = await fetch(`${backendUrl}/api/all-jobs-combined`);
    console.log('Status:', jobsResponse.status);
    if (jobsResponse.ok) {
      const jobs = await jobsResponse.json();
      console.log('Jobs count:', jobs.data?.length || 0);
    }
    
    // Teste 3: Simple jobs
    console.log('\n📝 Testando /api/simple-jobs...');
    const simpleResponse = await fetch(`${backendUrl}/api/simple-jobs`);
    console.log('Status:', simpleResponse.status);
    if (simpleResponse.ok) {
      const simple = await simpleResponse.json();
      console.log('Simple jobs count:', simple.data?.length || 0);
    }
    
    console.log('\n✅ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testBackendConnection();
