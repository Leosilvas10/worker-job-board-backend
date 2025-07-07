import JobScraper from './services/jobScraper.js';

const scraper = new JobScraper();

async function testarScraper() {
  console.log('🧪 Testando JobScraper...');
  
  const jobs = await scraper.fetchAllJobs();
  
  console.log(`📊 Total de vagas geradas: ${jobs.length}`);
  
  if (jobs.length > 0) {
    console.log('🔍 Primeira vaga:');
    console.log(jobs[0]);
    
    console.log('\n🔍 Campos obrigatórios:');
    console.log('- external_id:', jobs[0].external_id);
    console.log('- titulo:', jobs[0].titulo);
    console.log('- empresa:', jobs[0].empresa);
    console.log('- localizacao:', jobs[0].localizacao);
    console.log('- salario:', jobs[0].salario);
    console.log('- ativa:', jobs[0].ativa);
    console.log('- featured:', jobs[0].featured);
  }
}

testarScraper();
