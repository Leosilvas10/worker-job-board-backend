import db from '../database.js';
import RealJobFetcher from '../services/realJobFetcher.js';

class AutoJobUpdater {
  constructor() {
    this.realJobFetcher = new RealJobFetcher();
  }

  // Atualizar vagas automaticamente
  async updateJobs() {
    console.log('🔄 Iniciando atualização automática de vagas REAIS...');
    console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}`);
    
    try {
      // Limpar vagas antigas (mais de 7 dias)
      await this.clearOldJobs();
      
      // Buscar novas vagas 100% reais
      const newJobs = await this.realJobFetcher.fetchAllRealJobs();
      
      if (newJobs.length === 0) {
        console.warn('⚠️ Nenhuma vaga real foi encontrada! Mantendo vagas existentes.');
        return false;
      }

      // Desativar todas as vagas atuais
      await this.deactivateAllJobs();
      
      // Inserir novas vagas
      let insertedCount = 0;
      for (const job of newJobs) {
        try {
          await this.insertJob(job);
          insertedCount++;
        } catch (err) {
          console.error('Erro ao inserir vaga:', err.message);
        }
      }

      console.log(`✅ Atualização concluída: ${insertedCount} vagas REAIS adicionadas`);
      console.log(`🔥 Vagas em destaque: ${newJobs.filter(job => job.featured).length}`);
      
      // Log de estatísticas
      await this.logStats();
      
      return true;

    } catch (error) {
      console.error('❌ Erro na atualização automática:', error);
      return false;
    }
  }

  // Limpar vagas antigas
  async clearOldJobs() {
    return new Promise((resolve, reject) => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      db.run(
        'DELETE FROM vagas WHERE data_criacao < ?',
        [sevenDaysAgo.toISOString()],
        function(err) {
          if (err) {
            reject(err);
          } else {
            console.log(`🗑️ ${this.changes} vagas antigas removidas`);
            resolve(this.changes);
          }
        }
      );
    });
  }

  // Desativar todas as vagas atuais
  async deactivateAllJobs() {
    return new Promise((resolve, reject) => {
      db.run('UPDATE vagas SET ativa = 0', function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`💤 ${this.changes} vagas desativadas`);
          resolve(this.changes);
        }
      });
    });
  }

  // Inserir nova vaga
  async insertJob(job) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO vagas (
          external_id, titulo, empresa, localizacao, salario, descricao,
          tipo, categoria, fonte, external_url, tags, ativa, featured,
          data_criacao, data_atualizacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

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
        job.featured ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString()
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });

      stmt.finalize();
    });
  }

  // Log de estatísticas
  async logStats() {
    return new Promise((resolve) => {
      db.all(`
        SELECT 
          fonte,
          categoria,
          COUNT(*) as total,
          SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) as featured
        FROM vagas 
        WHERE ativa = 1 
        GROUP BY fonte, categoria
        ORDER BY fonte, categoria
      `, (err, rows) => {
        if (!err && rows) {
          console.log('\n📊 ESTATÍSTICAS DE VAGAS REAIS:');
          console.log('================================');
          
          const bySource = {};
          rows.forEach(row => {
            if (!bySource[row.fonte]) {
              bySource[row.fonte] = { total: 0, featured: 0, categories: [] };
            }
            bySource[row.fonte].total += row.total;
            bySource[row.fonte].featured += row.featured;
            bySource[row.fonte].categories.push(`${row.categoria}: ${row.total}`);
          });

          Object.entries(bySource).forEach(([fonte, stats]) => {
            console.log(`📌 ${fonte}: ${stats.total} vagas (${stats.featured} em destaque)`);
            stats.categories.forEach(cat => console.log(`   - ${cat}`));
          });
          
          console.log('================================\n');
        }
        resolve();
      });
    });
  }

  // Verificar se precisa atualizar
  async needsUpdate() {
    return new Promise((resolve) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          MAX(data_criacao) as last_update
        FROM vagas 
        WHERE ativa = 1
      `, (err, row) => {
        if (err || !row) {
          resolve(true); // Se erro, forçar atualização
          return;
        }

        const lastUpdate = new Date(row.last_update);
        const now = new Date();
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

        // Atualizar se:
        // - Menos de 50 vagas ativas
        // - Última atualização há mais de 12 horas
        const needsUpdate = row.total < 50 || hoursSinceUpdate > 12;
        
        console.log(`📊 Vagas ativas: ${row.total} | Última atualização: ${hoursSinceUpdate.toFixed(1)}h atrás`);
        console.log(`🔄 Precisa atualizar: ${needsUpdate ? 'SIM' : 'NÃO'}`);
        
        resolve(needsUpdate);
      });
    });
  }
}

export default AutoJobUpdater;
