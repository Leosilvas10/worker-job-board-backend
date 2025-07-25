import RealJobFetcher from './services/realJobFetcher.js';

console.log('🔍 Verificando pool de vagas reais...');

const fetcher = new RealJobFetcher();
console.log(`📊 Total de vagas no pool: ${fetcher.realJobsPool.length}`);

// Simular a busca
const selected = [...fetcher.realJobsPool].sort(() => 0.5 - Math.random()).slice(0, 120);
console.log(`📋 Vagas selecionadas para inserção: ${selected.length}`);

// Verificar distribuição por fonte
const bySource = {};
selected.forEach(job => {
  if (!bySource[job.fonte]) bySource[job.fonte] = 0;
  bySource[job.fonte]++;
});

console.log('📊 Distribuição por fonte:');
Object.entries(bySource).forEach(([fonte, count]) => {
  console.log(`   ${fonte}: ${count} vagas`);
});

process.exit(0);
