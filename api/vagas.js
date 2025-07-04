import express from 'express';
import db from '../database.js';

const router = express.Router();

// Função para buscar vagas de APIs externas
async function buscarVagasExternas() {
  const vagas = [];
  
  try {
    // Simular busca de APIs externas (substitua pelas APIs reais)
    const vagasSimuladas = [
      {
        external_id: 'ext_domestica_1',
        titulo: 'Empregada Doméstica',
        empresa: 'Família Particular',
        localizacao: 'São Paulo, SP',
        salario: 'R$ 1.320,00',
        descricao: 'Limpeza geral da casa, organização, preparo de refeições simples.',
        tipo: 'CLT',
        categoria: 'Doméstica',
        fonte: 'SINE',
        external_url: 'https://www.sine.br/vagas/empregada-domestica',
        tags: JSON.stringify(['doméstica', 'limpeza', 'organização'])
      },
      {
        external_id: 'ext_porteiro_1',
        titulo: 'Porteiro Noturno',
        empresa: 'Condomínio Residencial Elite',
        localizacao: 'Rio de Janeiro, RJ',
        salario: 'R$ 1.500,00',
        descricao: 'Controle de acesso, recebimento de correspondências, rondas de segurança.',
        tipo: 'CLT',
        categoria: 'Portaria',
        fonte: 'Catho',
        external_url: 'https://www.catho.com.br/vagas/porteiro',
        tags: JSON.stringify(['porteiro', 'segurança', 'noturno'])
      },
      {
        external_id: 'ext_limpeza_1',
        titulo: 'Auxiliar de Limpeza',
        empresa: 'Empresa Clean Service',
        localizacao: 'Belo Horizonte, MG',
        salario: 'R$ 1.400,00',
        descricao: 'Limpeza de escritórios, banheiros, organização de materiais de limpeza.',
        tipo: 'CLT',
        categoria: 'Limpeza',
        fonte: 'InfoJobs',
        external_url: 'https://www.infojobs.com.br/vagas-de-limpeza',
        tags: JSON.stringify(['limpeza', 'escritório', 'organização'])
      },
      {
        external_id: 'ext_cuidador_1',
        titulo: 'Cuidador de Idosos',
        empresa: 'Casa de Repouso Esperança',
        localizacao: 'Salvador, BA',
        salario: 'R$ 1.600,00',
        descricao: 'Acompanhamento de idosos, auxílio em atividades diárias, administração de medicamentos.',
        tipo: 'CLT',
        categoria: 'Cuidados',
        fonte: 'Vagas.com',
        external_url: 'https://www.vagas.com.br/vagas-de-cuidador',
        tags: JSON.stringify(['cuidador', 'idosos', 'saúde'])
      },
      {
        external_id: 'ext_motorista_1',
        titulo: 'Motorista Entregador',
        empresa: 'Delivery Express',
        localizacao: 'Curitiba, PR',
        salario: 'R$ 2.000,00',
        descricao: 'Entrega de produtos, atendimento ao cliente, manutenção básica do veículo.',
        tipo: 'CLT',
        categoria: 'Transporte',
        fonte: 'Indeed',
        external_url: 'https://br.indeed.com/vagas-motorista',
        tags: JSON.stringify(['motorista', 'entregador', 'delivery'])
      }
    ];

    return vagasSimuladas;

  } catch (error) {
    console.error('Erro ao buscar vagas externas:', error);
    return [];
  }
}

// GET /api/vagas - Listar todas as vagas
router.get('/', async (req, res) => {
  try {
    console.log('📋 Buscando todas as vagas do banco...');

    const stmt = db.prepare('SELECT * FROM vagas ORDER BY data_criacao DESC');
    const rows = stmt.all();

    console.log(`✅ ${rows.length} vagas encontradas no banco`);

    res.json({
      success: true,
      vagas: rows,
      total: rows.length,
      message: `${rows.length} vagas encontradas`
    });

  } catch (error) {
    console.error('❌ Erro ao buscar vagas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// POST /api/vagas - Criar nova vaga
router.post('/', async (req, res) => {
  try {
    const {
      titulo, empresa, localizacao, salario, descricao, tipo,
      categoria, fonte, external_id, external_url, tags
    } = req.body;

    if (!titulo || !empresa || !localizacao) {
      return res.status(400).json({
        success: false,
        message: 'Título, empresa e localização são obrigatórios'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO vagas (
        titulo, empresa, localizacao, salario, descricao, tipo,
        categoria, fonte, external_id, external_url, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run([
      titulo, empresa, localizacao, salario || '', descricao || '',
      tipo || 'CLT', categoria || 'Outros', fonte || 'manual',
      external_id || '', external_url || '', JSON.stringify(tags || [])
    ]);

    res.json({
      success: true,
      message: 'Vaga criada com sucesso!',
      vagaId: info.lastInsertRowid
    });

  } catch (error) {
    console.error('❌ Erro ao criar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/vagas/:id - Atualizar vaga
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo, empresa, localizacao, salario, descricao, tipo,
      categoria, fonte, external_url, tags, ativa
    } = req.body;

    const stmt = db.prepare(`
      UPDATE vagas SET
        titulo = ?, empresa = ?, localizacao = ?, salario = ?,
        descricao = ?, tipo = ?, categoria = ?, fonte = ?,
        external_url = ?, tags = ?, ativa = ?
      WHERE id = ?
    `);

    const info = stmt.run([
      titulo, empresa, localizacao, salario || '', descricao || '',
      tipo || 'CLT', categoria || 'Outros', fonte || 'manual',
      external_url || '', JSON.stringify(tags || []), ativa !== undefined ? ativa : 1,
      id
    ]);

    if (info.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Vaga atualizada com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/vagas/:id - Excluir vaga
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM vagas WHERE id = ?');
    const info = stmt.run([id]);

    if (info.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Vaga excluída com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao excluir vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/vagas/sync - Sincronizar vagas
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronização de vagas...');
    
    const vagasExternas = await buscarVagasExternas();
    let vagasAtualizadas = 0;
    let vagasNovas = 0;

    for (const vaga of vagasExternas) {
      try {
        // Verificar se a vaga já existe
        const existingVaga = await db.getAsync(
          'SELECT id FROM vagas_cache WHERE external_id = ?',
          [vaga.external_id]
        );

        if (existingVaga) {
          // Atualizar vaga existente
          await db.runAsync(`
            UPDATE vagas_cache SET 
              titulo = ?, empresa = ?, localizacao = ?, salario = ?,
              descricao = ?, tipo = ?, categoria = ?, fonte = ?,
              external_url = ?, tags = ?, data_atualizacao = CURRENT_TIMESTAMP
            WHERE external_id = ?
          `, [
            vaga.titulo, vaga.empresa, vaga.localizacao, vaga.salario,
            vaga.descricao, vaga.tipo, vaga.categoria, vaga.fonte,
            vaga.external_url, vaga.tags, vaga.external_id
          ]);
          vagasAtualizadas++;
        } else {
          // Inserir nova vaga
          await db.runAsync(`
            INSERT INTO vagas_cache (
              external_id, titulo, empresa, localizacao, salario,
              descricao, tipo, categoria, fonte, external_url, tags,
              published_date, ativo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, TRUE)
          `, [
            vaga.external_id, vaga.titulo, vaga.empresa, vaga.localizacao,
            vaga.salario, vaga.descricao, vaga.tipo, vaga.categoria,
            vaga.fonte, vaga.external_url, vaga.tags
          ]);
          vagasNovas++;
        }
      } catch (error) {
        console.error(`Erro ao processar vaga ${vaga.external_id}:`, error);
      }
    }

    // Atualizar estatísticas
    const hoje = new Date().toISOString().split('T')[0];
    const totalVagas = await db.getAsync('SELECT COUNT(*) as total FROM vagas_cache WHERE ativo = TRUE');
    
    await db.runAsync(`
      INSERT OR REPLACE INTO estatisticas_diarias (data, vagas_ativas)
      VALUES (?, ?)
    `, [hoje, totalVagas.total]);

    console.log(`✅ Sincronização concluída: ${vagasNovas} novas, ${vagasAtualizadas} atualizadas`);

    res.json({
      success: true,
      message: 'Vagas sincronizadas com sucesso!',
      estatisticas: {
        vagasNovas,
        vagasAtualizadas,
        totalVagas: totalVagas.total
      }
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao sincronizar vagas'
    });
  }
});

// Esta rota foi removida pois está duplicada - já existe uma rota GET / acima

// GET /api/vagas/stats - Estatísticas das vagas
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getAsync(`
      SELECT 
        COUNT(*) as total_vagas,
        COUNT(CASE WHEN ativo = TRUE THEN 1 END) as vagas_ativas,
        COUNT(CASE WHEN featured = TRUE THEN 1 END) as vagas_destaque,
        COUNT(DISTINCT categoria) as categorias
      FROM vagas_cache
    `);

    const porCategoria = await db.allAsync(`
      SELECT categoria, COUNT(*) as total
      FROM vagas_cache 
      WHERE ativo = TRUE 
      GROUP BY categoria 
      ORDER BY total DESC
    `);

    res.json({
      success: true,
      estatisticas: {
        ...stats,
        por_categoria: porCategoria
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas'
    });
  }
});

// POST /api/vagas/import-from-frontend - Importar vagas do frontend
router.post('/import-from-frontend', async (req, res) => {
  try {
    console.log('📥 Importando vagas do frontend para o backend...');
    
    // Buscar vagas do frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const response = await fetch(`${frontendUrl}/api/all-jobs-combined?admin=true`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar vagas do frontend: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.jobs) {
      throw new Error('Dados inválidos recebidos do frontend');
    }
    
    console.log(`📊 ${data.jobs.length} vagas recebidas do frontend`);
    
    let vagasImportadas = 0;
    let vagasAtualizadas = 0;
    let erros = 0;
    
    for (const job of data.jobs) {
      try {
        // Verificar se já existe no banco
        const existingStmt = db.prepare('SELECT id FROM vagas WHERE external_id = ? OR (titulo = ? AND empresa = ?)');
        const existing = existingStmt.get([job.id, job.title, job.company?.name || job.company]);
        
        if (existing) {
          // Atualizar vaga existente
          const updateStmt = db.prepare(`
            UPDATE vagas SET
              titulo = ?, empresa = ?, localizacao = ?, salario = ?,
              descricao = ?, tipo = ?, categoria = ?, fonte = ?,
              external_url = ?, tags = ?, data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ?
          `);
          
          updateStmt.run([
            job.title,
            job.company?.name || job.company || 'Empresa Não Informada',
            job.location,
            job.salary,
            job.description || job.requirements || '',
            job.type || 'CLT',
            job.category || 'Outros',
            job.source || 'frontend',
            job.external_url || '',
            JSON.stringify(job.tags || []),
            existing.id
          ]);
          
          vagasAtualizadas++;
        } else {
          // Inserir nova vaga
          const insertStmt = db.prepare(`
            INSERT INTO vagas (
              external_id, titulo, empresa, localizacao, salario, descricao,
              tipo, categoria, fonte, external_url, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          insertStmt.run([
            job.id,
            job.title,
            job.company?.name || job.company || 'Empresa Não Informada',
            job.location,
            job.salary,
            job.description || job.requirements || '',
            job.type || 'CLT',
            job.category || 'Outros',
            job.source || 'frontend',
            job.external_url || '',
            JSON.stringify(job.tags || [])
          ]);
          
          vagasImportadas++;
        }
      } catch (error) {
        console.error(`❌ Erro ao processar vaga ${job.id}:`, error);
        erros++;
      }
    }
    
    console.log(`✅ Importação concluída: ${vagasImportadas} novas, ${vagasAtualizadas} atualizadas, ${erros} erros`);
    
    res.json({
      success: true,
      message: 'Importação concluída com sucesso!',
      stats: {
        vagasImportadas,
        vagasAtualizadas,
        erros,
        total: data.jobs.length
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao importar vagas do frontend',
      error: error.message
    });
  }
});

// GET /api/simple-jobs - Vagas formatadas para frontend
router.get('/simple-jobs', async (req, res) => {
  try {
    console.log('🎯 Buscando vagas formatadas para frontend...');
    
    // Primeiro, verificar se há vagas no banco com verificação de null
    let vagasDoBanco = [];
    try {
      const stmt = db.prepare('SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC LIMIT 50');
      const rows = stmt.all();
      vagasDoBanco = rows || [];
    } catch (dbError) {
      console.error('⚠️ Erro ao acessar banco, usando fallback:', dbError.message);
      vagasDoBanco = [];
    }
    
    console.log(`📊 ${vagasDoBanco.length} vagas ativas encontradas no banco`);
    
    // Se há vagas no banco, formatá-las com verificação de null
    if (vagasDoBanco.length > 0) {
      const vagasFormatadas = vagasDoBanco.filter(vaga => vaga && vaga.id).map(vaga => ({
        id: vaga.id ? vaga.id.toString() : `temp_${Date.now()}`,
        title: vaga.titulo || 'Vaga Disponível',
        company: vaga.empresa || 'Empresa Não Informada',
        location: vaga.localizacao || 'Local Não Informado',
        salary: vaga.salario || 'A combinar',
        description: vaga.descricao || 'Descrição não disponível',
        type: vaga.tipo || 'CLT',
        category: vaga.categoria || 'Outros',
        source: vaga.fonte || 'database',
        external_url: vaga.external_url || '',
        tags: vaga.tags ? (typeof vaga.tags === 'string' ? JSON.parse(vaga.tags) : vaga.tags) : [],
        created_at: vaga.data_criacao || new Date().toISOString()
      }));
      
      return res.json({
        success: true,
        data: vagasFormatadas,
        message: `${vagasFormatadas.length} vagas encontradas do banco`,
        meta: {
          total: vagasFormatadas.length,
          source: 'database'
        }
      });
    }
    
    // Se não há vagas no banco, popular automaticamente
    console.log('🔄 Banco vazio! Populando com vagas iniciais...');
    await popularBancoAutomaticamente();
    
    // Buscar novamente após popular com verificação
    try {
      const stmt = db.prepare('SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC LIMIT 50');
      const vagasAposPopular = stmt.all() || [];
      
      if (vagasAposPopular.length > 0) {
        const vagasFormatadas = vagasAposPopular.filter(vaga => vaga && vaga.id).map(vaga => ({
          id: vaga.id ? vaga.id.toString() : `temp_${Date.now()}`,
          title: vaga.titulo || 'Vaga Disponível',
          company: vaga.empresa || 'Empresa Não Informada',
          location: vaga.localizacao || 'Local Não Informado',
          salary: vaga.salario || 'A combinar',
          description: vaga.descricao || 'Descrição não disponível',
          type: vaga.tipo || 'CLT',
          category: vaga.categoria || 'Outros',
          source: vaga.fonte || 'auto_populated',
          external_url: vaga.external_url || '',
          tags: vaga.tags ? (typeof vaga.tags === 'string' ? JSON.parse(vaga.tags) : vaga.tags) : [],
          created_at: vaga.data_criacao || new Date().toISOString()
        }));
        
        return res.json({
          success: true,
          data: vagasFormatadas,
          message: `${vagasFormatadas.length} vagas encontradas (banco populado automaticamente)`,
          meta: {
            total: vagasFormatadas.length,
            source: 'database_populated'
          }
        });
      }
    } catch (dbError) {
      console.error('⚠️ Erro ao buscar após popular:', dbError.message);
    }
    
    // Fallback final - vagas demo seguras
    const vagasFallback = [
      {
        id: 'fallback_1',
        title: 'Doméstica',
        company: 'Família Particular',
        location: 'São Paulo, SP',
        salary: 'R$ 1.320,00',
        description: 'Limpeza geral da casa, organização, preparo de refeições simples.',
        type: 'CLT',
        category: 'Doméstica',
        source: 'Fallback',
        external_url: '',
        tags: ['doméstica', 'limpeza', 'organização'],
        created_at: new Date().toISOString()
      },
      {
        id: 'fallback_2',
        title: 'Diarista',
        company: 'Residencial Particular',
        location: 'Rio de Janeiro, RJ',
        salary: 'R$ 120,00/dia',
        description: 'Limpeza completa de apartamento 2 quartos.',
        type: 'Diarista',
        category: 'Doméstica',
        source: 'Fallback',
        external_url: '',
        tags: ['diarista', 'limpeza', 'apartamento'],
        created_at: new Date().toISOString()
      },
      {
        id: 'fallback_3',
        title: 'Porteiro',
        company: 'Edifício Central',
        location: 'São Paulo, SP',
        salary: 'R$ 1.500,00',
        description: 'Controle de acesso e atendimento.',
        type: 'CLT',
        category: 'Portaria',
        source: 'Fallback',
        external_url: '',
        tags: ['porteiro', 'atendimento'],
        created_at: new Date().toISOString()
      }
    ];
    
    console.log('✅ Retornando vagas fallback:', vagasFallback.length);
    
    return res.json({
      success: true,
      data: vagasFallback,
      message: `${vagasFallback.length} vagas de fallback`,
      meta: {
        total: vagasFallback.length,
        source: 'fallback'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na rota /api/simple-jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar vagas simples',
      error: error.message
    });
  }
});

export default router;
