import AutoJobUpdater from './scripts/auto-job-updater.js';

console.log('🧪 TESTE DO SISTEMA DE VAGAS REAIS');
console.log('=====================================');

const autoJobUpdater = new AutoJobUpdater();

async function testRealJobs() {
  try {
    console.log('🔄 Iniciando teste de busca de vagas reais...\n');
    
    // Verificar se precisa atualizar
    const needsUpdate = await autoJobUpdater.needsUpdate();
    console.log(`📊 Precisa atualizar: ${needsUpdate ? 'SIM' : 'NÃO'}\n`);
    
    // Forçar atualização para teste
    console.log('🚀 Forçando atualização para teste...\n');
    const success = await autoJobUpdater.updateJobs();
    
    if (success) {
      console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
      console.log('📋 Vagas reais foram coletadas e inseridas no banco');
    } else {
      console.log('\n❌ TESTE FALHOU');
      console.log('⚠️ Não foi possível coletar vagas reais');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
  }
  
  process.exit(0);
}

testRealJobs();
