// Função corrigida para sincronizar vagas
import sqlite3 from 'sqlite3';
import JobScraper from './services/jobScraper.js';

const db = new sqlite3.Database('./leads.db');
const jobScraper = new JobScraper();

async function syncVagasCorrigido() {
  console.log('🔄 Iniciando sincronização corrigida...');
  
  try {
    // Buscar vagas do scraper
    const externalJobs = await jobScraper.fetchAllJobs();
    console.log(`📊 ${externalJobs.length} vagas obtidas do scraper`);
    
    // Usar serialize para garantir ordem das operações
    db.serialize(() => {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO vagas (
          external_id, titulo, empresa, localizacao, salario, descricao,
          tipo, categoria, fonte, external_url, tags, ativa, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let inseridos = 0;
      let erros = 0;
      
      externalJobs.forEach((job, index) => {
        stmt.run([
          job.external_id,
          job.titulo,
          job.empresa,
          job.localizacao,
          job.salario,
          job.descricao,
          job.tipo,
          job.categoria,
          job.fonte,
          job.external_url,
          job.tags,
          job.ativa,
          job.featured
        ], function(err) {
          if (err) {
            console.error(`❌ Erro ao inserir vaga ${index}:`, err);
            erros++;
          } else {
            inseridos++;
            if (inseridos % 10 === 0) {
              console.log(`✅ ${inseridos} vagas inseridas...`);
            }
          }
          
          // Quando terminar todas as inserções
          if (inseridos + erros === externalJobs.length) {
            stmt.finalize();
            
            // Verificar resultado
            db.get('SELECT COUNT(*) as total FROM vagas WHERE ativa = 1', (err, row) => {
              if (err) {
                console.error('❌ Erro ao contar vagas:', err);
              } else {
                console.log(`✅ Sincronização concluída: ${inseridos} inseridas, ${erros} erros`);
                console.log(`📊 Total de vagas ativas no banco: ${row.total}`);
              }
              
              db.close();
            });
          }
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

syncVagasCorrigido();
