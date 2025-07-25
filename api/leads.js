import express from 'express';
import db from '../database.js';

const router = express.Router();

// Função para preservar caracteres UTF-8 (incluindo acentos)
function preserveUTF8(text) {
  if (!text || typeof text !== 'string') return text;
  
  try {
    // Remove apenas caracteres de controle realmente perigosos (null, backspace, etc)
    // Preserva TODOS os caracteres acentuados e especiais
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  } catch (error) {
    console.error('Erro ao processar texto:', error);
    return text;
  }
}

// Função para sanitizar dados de entrada preservando acentos
function sanitizeLeadData(data) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = preserveUTF8(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// POST /api/leads - Criar novo lead
router.post('/', async (req, res) => {
  try {
    // Sanitizar dados de entrada
    const sanitizedData = sanitizeLeadData(req.body);
    
    const {
      nome, email, telefone, empresa, vaga_titulo, vaga_id,
      trabalhou_antes, ultimo_emprego, tempo_ultimo_emprego,
      motivo_demissao, salario_anterior, experiencia_anos,
      idade, cidade, estado, disponibilidade, pretensao_salarial,
      observacoes, mensagem, fonte, utm_source, utm_medium, utm_campaign
    } = sanitizedData;
    
    if (!nome) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nome é obrigatório!' 
      });
    }

    const stmt = db.prepare(`
      INSERT INTO leads (
        nome, email, telefone, empresa, vaga_titulo, vaga_id,
        trabalhou_antes, ultimo_emprego, tempo_ultimo_emprego,
        motivo_demissao, salario_anterior, experiencia_anos,
        idade, cidade, estado, disponibilidade, pretensao_salarial,
        observacoes, mensagem, fonte, utm_source, utm_medium, utm_campaign
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run([
      nome, email || '', telefone || '', empresa || '', vaga_titulo || '', vaga_id || '',
      trabalhou_antes || '', ultimo_emprego || '', tempo_ultimo_emprego || '',
      motivo_demissao || '', salario_anterior || '', experiencia_anos || 0,
      idade || null, cidade || '', estado || '', disponibilidade || '', pretensao_salarial || '',
      observacoes || '', mensagem || '', fonte || 'site', utm_source || '', utm_medium || '', utm_campaign || ''
    ]);

    // Atualizar estatísticas do dia
    const hoje = new Date().toISOString().split('T')[0];
    const updateStats = db.prepare(`
      INSERT OR REPLACE INTO estatisticas_diarias (data, leads_novos, candidaturas)
      VALUES (?, COALESCE((SELECT leads_novos FROM estatisticas_diarias WHERE data = ?), 0) + 1,
                 COALESCE((SELECT candidaturas FROM estatisticas_diarias WHERE data = ?), 0) + 1)
    `);
    updateStats.run([hoje, hoje, hoje]);

    res.json({ 
      success: true, 
      message: 'Lead salvo com sucesso!',
      leadId: info.lastInsertRowid
    });

  } catch (error) {
    console.error('Erro ao salvar lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/leads - Listar todos os leads
router.get('/', async (req, res) => {
  try {
    db.all('SELECT * FROM leads ORDER BY data_criacao DESC', (err, rows) => {
      if (err) {
        console.error('Erro ao buscar leads:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao buscar leads' 
        });
      }

      res.json({ 
        success: true, 
        leads: rows 
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// GET /api/leads/:id - Buscar lead específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Erro ao buscar lead:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao buscar lead' 
        });
      }

      if (!row) {
        return res.status(404).json({ 
          success: false, 
          message: 'Lead não encontrado' 
        });
      }

      res.json({ 
        success: true, 
        lead: row 
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// PUT /api/leads/:id - Atualizar lead específico
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, contatado, convertido } = req.body;
    
    // Verificar se o lead existe
    db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Erro ao buscar lead:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao buscar lead' 
        });
      }

      if (!row) {
        return res.status(404).json({ 
          success: false, 
          message: 'Lead não encontrado' 
        });
      }

      // Atualizar o lead
      const updateFields = [];
      const updateValues = [];
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      
      if (contatado !== undefined) {
        updateFields.push('contatado = ?');
        updateValues.push(contatado ? 1 : 0);
      }
      
      if (convertido !== undefined) {
        updateFields.push('convertido = ?');
        updateValues.push(convertido ? 1 : 0);
      }
      
      updateFields.push('data_atualizacao = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const updateQuery = `UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`;
      
      db.run(updateQuery, updateValues, (err) => {
        if (err) {
          console.error('Erro ao atualizar lead:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erro ao atualizar lead' 
          });
        }

        console.log(`✅ Lead ${id} atualizado com sucesso`);
        
        // Buscar o lead atualizado
        db.get('SELECT * FROM leads WHERE id = ?', [id], (err, updatedRow) => {
          if (err) {
            console.error('Erro ao buscar lead atualizado:', err);
            return res.status(500).json({ 
              success: false, 
              message: 'Erro ao buscar lead atualizado' 
            });
          }

          res.json({ 
            success: true, 
            message: 'Lead atualizado com sucesso!',
            lead: updatedRow
          });
        });
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/leads/:id - Excluir lead específico
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o lead existe
    db.get('SELECT * FROM leads WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Erro ao buscar lead:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao buscar lead' 
        });
      }

      if (!row) {
        return res.status(404).json({ 
          success: false, 
          message: 'Lead não encontrado' 
        });
      }

      // Excluir o lead
      db.run('DELETE FROM leads WHERE id = ?', [id], (err) => {
        if (err) {
          console.error('Erro ao excluir lead:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Erro ao excluir lead' 
          });
        }

        console.log(`✅ Lead ${id} excluído com sucesso`);
        res.json({ 
          success: true, 
          message: 'Lead excluído com sucesso!' 
        });
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/leads - Limpar todos os leads
router.delete('/', async (req, res) => {
  try {
    db.run('DELETE FROM leads', (err) => {
      if (err) {
        console.error('Erro ao limpar leads:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erro ao limpar leads' 
        });
      }

      console.log('✅ Todos os leads foram excluídos');
      res.json({ 
        success: true, 
        message: 'Todos os leads foram excluídos com sucesso!' 
      });
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
});

export default router;
