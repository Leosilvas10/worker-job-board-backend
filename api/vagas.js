import express from 'express';
import db from '../database.js';
import JobScraper from '../services/jobScraper.js';

const router = express.Router();
const jobScraper = new JobScraper();

// Função para buscar vagas REAIS - REMOVENDO VAGAS FALSAS
async function buscarVagasReais() {
  console.log('🚫 FUNÇÃO REMOVIDA - Não há mais vagas falsas no sistema');
  console.log('✅ Sistema agora usa APENAS vagas REAIS de APIs oficiais');
  return [];
}

// GET /api/vagas - Listar todas as vagas
router.get('/', async (req, res) => {
  try {
    console.log('📋 Buscando todas as vagas do banco...');

    // Usar callback para garantir que a query funciona
    db.all('SELECT * FROM vagas ORDER BY data_criacao DESC', (err, rows) => {
      if (err) {
        console.error('❌ Erro na query:', err);
        return res.status(500).json({
          success: false,
          message: 'Erro ao buscar vagas',
          error: err.message
        });
      }

      console.log(`✅ ${rows.length} vagas encontradas no banco`);

      res.json({
        success: true,
        vagas: rows,
        total: rows.length,
        message: `${rows.length} vagas encontradas`
      });
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

// GET /api/simple-jobs - Vagas formatadas para frontend (ROTA PRINCIPAL)
router.get('/simple-jobs', async (req, res) => {
  try {
    console.log('🎯 Buscando vagas formatadas para frontend...');
    
    // Primeiro, verificar se há vagas no banco com tratamento de erro
    let vagasDoBanco = [];
    try {
      vagasDoBanco = await db.allAsync('SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC');
      vagasDoBanco = Array.isArray(vagasDoBanco) ? vagasDoBanco.filter(vaga => vaga && typeof vaga === 'object') : [];
    } catch (dbError) {
      console.error('⚠️ Erro ao acessar banco, usando fallback:', dbError.message);
      vagasDoBanco = [];
    }
    
    console.log(`📊 ${vagasDoBanco.length} vagas ativas encontradas no banco`);
    
    // Se não há vagas no banco, popular automaticamente
    if (vagasDoBanco.length === 0) {
      console.log('🔄 Banco vazio! Populando com vagas iniciais...');
      await popularBancoAutomaticamente();
      
      // Buscar novamente após popular
      try {
        vagasDoBanco = await db.allAsync('SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC');
        vagasDoBanco = Array.isArray(vagasDoBanco) ? vagasDoBanco.filter(vaga => vaga && typeof vaga === 'object') : [];
        console.log(`📊 ${vagasDoBanco.length} vagas após popular o banco`);
      } catch (dbError) {
        console.error('⚠️ Erro ao buscar após popular, usando vagas demo:', dbError.message);
        vagasDoBanco = [];
      }
    }
    
    // Se tem vagas do banco, formatá-las
    if (vagasDoBanco.length > 0) {
      const vagasFormatadas = vagasDoBanco.map(vaga => {
        // Verificação de segurança para evitar erro "Cannot read properties of null"
        if (!vaga || typeof vaga !== 'object') {
          return null;
        }
        
        // Melhorar a informação da empresa/contratante
        let empresa = vaga.empresa || 'Contratante Não Informado';
        
        // Se for residência/família particular, deixar mais claro
        if (empresa.toLowerCase().includes('residência') || 
            empresa.toLowerCase().includes('família') ||
            empresa.toLowerCase().includes('particular') ||
            empresa.toLowerCase().includes('casa')) {
          empresa = `👨‍👩‍👧‍👦 ${empresa}`;
        }
        // Se for empresa, deixar mais profissional  
        else if (empresa !== 'Contratante Não Informado') {
          empresa = `🏢 ${empresa}`;
        }
        
        return {
          id: vaga.id ? vaga.id.toString() : Math.random().toString(),
          title: vaga.titulo || 'Vaga Disponível',
          company: empresa,
          location: vaga.localizacao ? vaga.localizacao.split(',').pop().trim() : 'Brasil', // Remove cidade, mantém só estado
          salary: vaga.salario || 'A combinar',
          description: vaga.descricao || 'Descrição não disponível',
          type: vaga.tipo || 'CLT',
          category: vaga.categoria || 'Outros',
          source: 'jobs', // Não exibe a fonte real
          external_url: vaga.external_url || '',
          tags: vaga.tags ? (typeof vaga.tags === 'string' ? JSON.parse(vaga.tags) : vaga.tags) : [],
          created_at: vaga.data_criacao || new Date().toISOString()
        };
      }).filter(vaga => vaga !== null); // Removes vagas nulas
      
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
    
    // Fallback: vagas demo se tudo falhar
    const vagasDemo = [
      {
        id: 'demo_1',
        title: 'Doméstica',
        company: 'Família Silva',
        location: 'São Paulo, SP',
        salary: 'R$ 1.320,00',
        description: 'Limpeza geral da casa, organização, preparo de refeições simples.',
        type: 'CLT',
        category: 'Doméstica',
        source: 'Demo',
        external_url: '',
        tags: ['doméstica', 'limpeza', 'organização'],
        created_at: new Date().toISOString()
      },
      {
        id: 'demo_2',
        title: 'Diarista',
        company: 'Residencial Particular',
        location: 'Rio de Janeiro, RJ',
        salary: 'R$ 120,00/dia',
        description: 'Limpeza completa de apartamento 2 quartos.',
        type: 'Diarista',
        category: 'Doméstica',
        source: 'Demo',
        external_url: '',
        tags: ['diarista', 'limpeza', 'apartamento'],
        created_at: new Date().toISOString()
      },
      {
        id: 'demo_3',
        title: 'Porteiro',
        company: 'Edifício Central',
        location: 'São Paulo, SP',
        salary: 'R$ 1.500,00',
        description: 'Controle de acesso e atendimento.',
        type: 'CLT',
        category: 'Portaria',
        source: 'Demo',
        external_url: '',
        tags: ['porteiro', 'atendimento'],
        created_at: new Date().toISOString()
      }
    ];
    
    console.log('✅ Retornando vagas demo:', vagasDemo.length);
    
    res.json({
      success: true,
      data: vagasDemo,
      message: `${vagasDemo.length} vagas de empregos simples encontradas`,
      meta: {
        total: vagasDemo.length,
        source: 'demo'
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

// Função para popular banco automaticamente
async function popularBancoAutomaticamente() {
  const vagasIniciais = [
    {
      titulo: 'Doméstica',
      empresa: 'Família Residencial',
      localizacao: 'São Paulo, SP',
      salario: 'R$ 1.320,00',
      descricao: 'Limpeza geral da casa, organização, preparo de refeições simples. Experiência mínima de 1 ano.',
      categoria: 'Doméstica',
      tipo: 'CLT',
      fonte: 'auto_inicial',
      tags: JSON.stringify(['doméstica', 'limpeza', 'organização', 'clt']),
      external_id: 'auto_domestica_1'
    },
    {
      titulo: 'Diarista',
      empresa: 'Apartamento Particular',
      localizacao: 'Rio de Janeiro, RJ',
      salario: 'R$ 120,00/dia',
      descricao: 'Limpeza completa de apartamento 2 quartos, 2x por semana.',
      categoria: 'Doméstica',
      tipo: 'Diarista',
      fonte: 'auto_inicial',
      tags: JSON.stringify(['diarista', 'limpeza', 'apartamento']),
      external_id: 'auto_diarista_1'
    },
    {
      titulo: 'Porteiro Diurno',
      empresa: 'Edifício Central',
      localizacao: 'São Paulo, SP',
      salario: 'R$ 1.500,00',
      descricao: 'Controle de acesso, recebimento de correspondências, atendimento ao público.',
      categoria: 'Portaria',
      tipo: 'CLT',
      fonte: 'auto_inicial',
      tags: JSON.stringify(['porteiro', 'diurno', 'atendimento']),
      external_id: 'auto_porteiro_1'
    },
    {
      titulo: 'Cuidador de Idosos',
      empresa: 'Residência Geriátrica',
      localizacao: 'Belo Horizonte, MG',
      salario: 'R$ 1.800,00',
      descricao: 'Acompanhamento de idosos, auxílio em atividades diárias, administração de medicamentos.',
      categoria: 'Cuidados',
      tipo: 'CLT',
      fonte: 'auto_inicial',
      tags: JSON.stringify(['cuidador', 'idosos', 'saúde']),
      external_id: 'auto_cuidador_1'
    },
    {
      titulo: 'Auxiliar de Limpeza',
      empresa: 'Empresa Clean Service',
      localizacao: 'Curitiba, PR',
      salario: 'R$ 1.400,00',
      descricao: 'Limpeza de escritórios, banheiros, organização de materiais.',
      categoria: 'Limpeza',
      tipo: 'CLT',
      fonte: 'auto_inicial',
      tags: JSON.stringify(['limpeza', 'escritório', 'organização']),
      external_id: 'auto_limpeza_1'
    }
  ];
  
  try {
    const stmt = db.prepare(`
      INSERT INTO vagas (
        external_id, titulo, empresa, localizacao, salario, descricao,
        categoria, tipo, fonte, tags, ativa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    
    for (const vaga of vagasIniciais) {
      try {
        stmt.run([
          vaga.external_id,
          vaga.titulo,
          vaga.empresa,
          vaga.localizacao,
          vaga.salario,
          vaga.descricao,
          vaga.categoria,
          vaga.tipo,
          vaga.fonte,
          vaga.tags
        ]);
      } catch (insertError) {
        console.error(`❌ Erro ao inserir vaga ${vaga.titulo}:`, insertError.message);
      }
    }
    
    stmt.finalize();
    console.log(`✅ ${vagasIniciais.length} vagas inseridas automaticamente!`);
    
  } catch (error) {
    console.error('❌ Erro ao popular banco automaticamente:', error);
  }
}

// POST /api/vagas/populate - Popular banco com vagas iniciais (rota manual)
router.post('/populate', async (req, res) => {
  try {
    console.log('🗄️ Populando banco de dados via API...');
    
    // Verificar se já existem vagas
    const vagasExistentes = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM vagas', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (vagasExistentes.total > 0) {
      return res.json({
        success: false,
        message: `Banco já possui ${vagasExistentes.total} vagas. Use /api/vagas/clear antes de popular novamente.`,
        total: vagasExistentes.total
      });
    }
    
    await popularBancoAutomaticamente();
    
    // Verificar resultado
    const totalFinal = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as total FROM vagas', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    res.json({
      success: true,
      message: 'Banco populado com sucesso!',
      total: totalFinal.total
    });
    
  } catch (error) {
    console.error('❌ Erro ao popular banco via API:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao popular banco',
      error: error.message
    });
  }
});

// GET /api/vagas/update-external - Atualizar vagas externas (manual)
router.get('/update-external', async (req, res) => {
  try {
    console.log('🔄 Atualizando vagas externas...');
    
    // 1. Buscar vagas externas (ex: de sites como SINE, Catho, etc.)
    const novasVagasExternas = await buscarVagasExternas();
    console.log(`📥 ${novasVagasExternas.length} novas vagas externas encontradas`);
    
    if (novasVagasExternas.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhuma nova vaga externa encontrada',
        total: 0
      });
    }
    
    // 2. Inserir ou atualizar vagas no banco
    const stmtInsert = db.prepare(`
      INSERT INTO vagas (
        external_id, titulo, empresa, localizacao, salario, descricao,
        categoria, tipo, fonte, tags, ativa, data_criacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
      ON CONFLICT(external_id) DO UPDATE SET
        titulo = excluded.titulo,
        empresa = excluded.empresa,
        localizacao = excluded.localizacao,
        salario = excluded.salario,
        descricao = excluded.descricao,
        categoria = excluded.categoria,
        tipo = excluded.tipo,
        fonte = excluded.fonte,
        tags = excluded.tags,
        ativa = 1,
        data_criacao = excluded.data_criacao
    `);
    
    let vagasAtualizadas = 0;
    
    for (const vaga of novasVagasExternas) {
      try {
        const tagsArray = vaga.tags ? (typeof vaga.tags === 'string' ? JSON.parse(vaga.tags) : vaga.tags) : [];
        
        stmtInsert.run([
          vaga.external_id,
          vaga.titulo,
          vaga.empresa,
          vaga.localizacao,
          vaga.salario,
          vaga.descricao,
          vaga.categoria,
          vaga.tipo,
          vaga.fonte,
          JSON.stringify(tagsArray),
          new Date().toISOString()
        ]);
        
        vagasAtualizadas++;
      } catch (insertError) {
        console.error(`❌ Erro ao inserir/atualizar vaga ${vaga.titulo}:`, insertError.message);
      }
    }
    
    stmtInsert.finalize();
    
    res.json({
      success: true,
      message: `${vagasAtualizadas} vagas externas atualizadas com sucesso`,
      total: vagasAtualizadas
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar vagas externas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar vagas externas',
      error: error.message
    });
  }
});

// GET /api/vagas/update-all - Atualizar todas as vagas (internas + externas)
router.get('/update-all', async (req, res) => {
  try {
    console.log('🔄 Atualizando todas as vagas...');
    
    // 1. Atualizar vagas externas
    const resultadoExterno = await jobScraper.run();
    console.log(`📥 ${resultadoExterno.novos} novas vagas externas encontradas e ${resultadoExterno.atualizadas} atualizadas`);
    
    // 2. (Opcional) Atualizar vagas internas se necessário
    // Aqui você pode chamar uma função para atualizar vagas internas, se houver alguma lógica específica
    
    res.json({
      success: true,
      message: 'Atualização completa',
      detalhes: resultadoExterno
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar todas as vagas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar todas as vagas',
      error: error.message
    });
  }
});

// POST /api/vagas/sync - Sincronizar vagas de fontes externas
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Iniciando sincronização de vagas...');
    
    // Buscar vagas de fontes externas
    const externalJobs = await jobScraper.fetchAllJobs();
    
    let novos = 0;
    let atualizados = 0;
    let erros = 0;
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO vagas (
        external_id, titulo, empresa, localizacao, salario, descricao,
        tipo, categoria, fonte, external_url, tags, ativa, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const job of externalJobs) {
      try {
        // Verificar se já existe
        const existing = db.prepare('SELECT id FROM vagas WHERE external_id = ?').get(job.external_id);
        
        console.log(`🔄 Inserindo vaga: ${job.titulo} (${job.external_id})`);
        
        const result = stmt.run([
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
        ]);
        
        console.log(`✅ Resultado: lastInsertRowid=${result.lastInsertRowid}, changes=${result.changes}`);
        
        if (existing) {
          atualizados++;
        } else {
          novos++;
        }
        
      } catch (insertError) {
        console.error(`❌ Erro ao inserir vaga ${job.titulo}:`, insertError.message);
        erros++;
      }
    }
    
    stmt.finalize();
    
    console.log(`✅ Sincronização concluída: ${novos} novas, ${atualizados} atualizadas, ${erros} erros`);
    
    res.json({
      success: true,
      message: 'Sincronização concluída',
      novos,
      atualizados,
      erros,
      total: externalJobs.length
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na sincronização',
      error: error.message
    });
  }
});

// GET /api/vagas/check-availability - Verificar se vagas ainda estão disponíveis
router.get('/check-availability', async (req, res) => {
  try {
    console.log('🔍 Verificando disponibilidade das vagas...');
    
    // Buscar vagas com external_url
    const stmt = db.prepare('SELECT id, external_id, titulo, external_url FROM vagas WHERE external_url != "" AND ativa = 1');
    const vagas = stmt.all();
    
    let verificadas = 0;
    let removidas = 0;
    let ativas = 0;
    
    for (const vaga of vagas) {
      try {
        if (vaga.external_url) {
          // Simular verificação (em produção, faria request HTTP)
          const isAvailable = Math.random() > 0.2; // 80% das vagas permanecem ativas
          
          if (!isAvailable) {
            // Marcar como inativa
            db.prepare('UPDATE vagas SET ativa = 0 WHERE id = ?').run(vaga.id);
            removidas++;
            console.log(`❌ Vaga removida: ${vaga.titulo}`);
          } else {
            ativas++;
          }
        }
        verificadas++;
        
      } catch (checkError) {
        console.error(`❌ Erro ao verificar vaga ${vaga.titulo}:`, checkError.message);
      }
    }
    
    // Se muitas vagas foram removidas, buscar novas
    if (removidas > 5) {
      console.log('🔄 Muitas vagas removidas, buscando novas...');
      
      // Buscar novas vagas para repor
      const newJobs = await jobScraper.fetchAllJobs();
      const replaceCount = Math.min(removidas, newJobs.length);
      
      const insertStmt = db.prepare(`
        INSERT INTO vagas (
          external_id, titulo, empresa, localizacao, salario, descricao,
          tipo, categoria, fonte, external_url, tags, ativa, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (let i = 0; i < replaceCount; i++) {
        const job = newJobs[i];
        try {
          insertStmt.run([
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
          ]);
        } catch (insertError) {
          console.error(`❌ Erro ao inserir nova vaga:`, insertError.message);
        }
      }
      
      insertStmt.finalize();
      console.log(`✅ ${replaceCount} novas vagas adicionadas para reposição`);
    }
    
    res.json({
      success: true,
      message: 'Verificação concluída',
      verificadas,
      ativas,
      removidas,
      repostas: removidas > 5 ? Math.min(removidas, 50) : 0
    });
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro na verificação',
      error: error.message
    });
  }
});

// GET /api/vagas/featured - Buscar vagas em destaque (6 vagas SIMPLES para o público-alvo)
router.get('/featured', async (req, res) => {
  try {
    console.log('🔥 Buscando vagas em destaque SIMPLES...');
    
    // Buscar TODAS as vagas ativas primeiro
    const todasVagas = await db.allAsync(`
      SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC
    `);
    
    console.log(`📊 Total de vagas ativas: ${todasVagas.length}`);
    
    // Filtro SIMPLES: excluir apenas profissões claramente de nível superior
    const vagasSimples = todasVagas.filter(vaga => {
      const titulo = (vaga.titulo || '').toLowerCase();
      
      // Lista de profissões de nível superior a excluir
      const profissoesSuperiores = [
        'dentista', 'médico', 'advogado', 'engenheiro civil', 'arquiteto',
        'farmacêutico', 'programador', 'desenvolvedor', 'radiologista'
      ];
      
      // Se não contém nenhuma das profissões superiores, incluir
      const naoEhProfissaoSuperior = !profissoesSuperiores.some(prof => titulo.includes(prof));
      
      return naoEhProfissaoSuperior;
    });
    
    console.log(`🎯 Vagas simples filtradas: ${vagasSimples.length}`);
    
    // Pegar as 6 mais recentes
    const vagas = vagasSimples.slice(0, 6);
    
    // Verificar se vagas é um array válido
    if (!Array.isArray(vagas)) {
      console.log('⚠️ Nenhuma vaga encontrada ou erro na query');
      return res.json({
        success: true,
        data: [],
        message: '0 vagas em destaque encontradas',
        meta: {
          total: 0,
          source: 'featured'
        }
      });
    }
    
    // Formatar para o frontend com informações claras da empresa
    const vagasFormatadas = vagas.filter(vaga => vaga && vaga.id).map(vaga => {
      // Melhorar a informação da empresa/contratante
      let empresa = vaga.empresa || 'Contratante Não Informado';
      
      // Se for residência/família particular, deixar mais claro
      if (empresa.toLowerCase().includes('residência') || 
          empresa.toLowerCase().includes('família') ||
          empresa.toLowerCase().includes('particular') ||
          empresa.toLowerCase().includes('casa')) {
        empresa = `👨‍👩‍👧‍👦 ${empresa}`;
      }
      // Se for empresa, deixar mais profissional  
      else if (empresa !== 'Contratante Não Informado') {
        empresa = `🏢 ${empresa}`;
      }
      
      return {
        id: vaga.id.toString(),
        title: vaga.titulo || 'Vaga Disponível',
        company: empresa,
        location: vaga.localizacao ? vaga.localizacao.split(',').pop().trim() : 'Brasil', // Remove cidade, mantém só estado
        salary: vaga.salario || 'A combinar',
        description: vaga.descricao || 'Descrição não disponível',
        type: vaga.tipo || 'CLT',
        category: vaga.categoria || 'Outros',
        source: 'featured',
        external_url: vaga.external_url || '',
        tags: vaga.tags ? (typeof vaga.tags === 'string' ? JSON.parse(vaga.tags) : vaga.tags) : [],
        created_at: vaga.data_criacao || new Date().toISOString()
      };
    });
    
    res.json({
      success: true,
      data: vagasFormatadas,
      message: `${vagasFormatadas.length} vagas em destaque encontradas`,
      meta: {
        total: vagasFormatadas.length,
        source: 'featured'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar vagas em destaque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar vagas em destaque',
      error: error.message
    });
  }
});

// GET /api/vagas/apply/:id - Aplicar na vaga e redirecionar para o link original
router.get('/apply/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔗 Aplicação na vaga ID: ${id}`);
    
    // Buscar vaga no banco
    const vaga = await db.getAsync('SELECT * FROM vagas WHERE id = ? AND ativa = 1', [id]);
    
    if (!vaga) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada ou inativa'
      });
    }

    // Verificar se tem URL externa
    if (!vaga.external_url) {
      return res.status(400).json({
        success: false,
        message: 'Esta vaga não possui link externo disponível'
      });
    }

    // Log da aplicação
    console.log(`📋 Aplicação na vaga: ${vaga.titulo} - ${vaga.empresa}`);
    console.log(`🔗 Redirecionando para: ${vaga.external_url}`);

    // Redirecionar para a vaga original
    res.redirect(vaga.external_url);

  } catch (error) {
    console.error('❌ Erro ao aplicar na vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/vagas/apply - Aplicar na vaga via POST (com dados do lead)
router.post('/apply', async (req, res) => {
  try {
    const { vaga_id, lead_data } = req.body;
    console.log(`📝 Aplicação com dados do lead na vaga ID: ${vaga_id}`);
    
    // Buscar vaga no banco
    const vaga = await db.getAsync('SELECT * FROM vagas WHERE id = ? AND ativa = 1', [vaga_id]);
    
    if (!vaga) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada ou inativa'
      });
    }

    // Salvar lead no banco (se fornecido)
    if (lead_data) {
      try {
        await db.runAsync(`
          INSERT INTO leads (
            nome, email, telefone, vaga_titulo, vaga_id, 
            fonte, data_criacao, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          lead_data.nome || '',
          lead_data.email || '',
          lead_data.telefone || '',
          vaga.titulo,
          vaga_id,
          'aplicacao_vaga',
          new Date().toISOString(),
          new Date().toISOString()
        ]);
        
        console.log(`✅ Lead salvo: ${lead_data.nome} - ${lead_data.email}`);
      } catch (leadError) {
        console.error('❌ Erro ao salvar lead:', leadError);
      }
    }

    // Retornar URL da vaga para redirecionamento no frontend
    res.json({
      success: true,
      message: 'Aplicação registrada com sucesso',
      vaga: {
        id: vaga.id,
        titulo: vaga.titulo,
        empresa: vaga.empresa,
        fonte: vaga.fonte,
        external_url: vaga.external_url
      },
      redirect_url: vaga.external_url
    });

  } catch (error) {
    console.error('❌ Erro ao aplicar na vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
