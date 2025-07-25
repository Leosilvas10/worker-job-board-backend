import express from 'express';
import db from '../database.js';

const router = express.Router();

// DELETE /api/clear-all-data - Zerar todos os dados
router.delete('/', async (req, res) => {
  try {
    console.log('🗑️ Iniciando limpeza completa dos dados...');

    // Deletar todos os leads
    const deleteLeads = db.prepare('DELETE FROM leads');
    const leadsResult = deleteLeads.run();
    console.log(`✅ ${leadsResult.changes} leads deletados`);

    // Deletar todas as estatísticas diárias
    const deleteStats = db.prepare('DELETE FROM estatisticas_diarias');
    const statsResult = deleteStats.run();
    console.log(`✅ ${statsResult.changes} estatísticas deletadas`);

    // Resetar o auto-increment das tabelas
    db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run('leads');
    db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run('estatisticas_diarias');
    console.log('✅ Contadores de ID resetados');

    res.json({ 
      success: true, 
      message: 'Todos os dados foram zerados com sucesso!',
      deleted: {
        leads: leadsResult.changes,
        statistics: statsResult.changes
      }
    });

  } catch (error) {
    console.error('❌ Erro ao zerar dados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor ao zerar dados',
      error: error.message 
    });
  }
});

export default router;
