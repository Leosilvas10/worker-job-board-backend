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

// GET /api/simple-jobs - Vagas formatadas para frontend (ROTA PRINCIPAL)
router.get('/simple-jobs', async (req, res) => {
  try {
    console.log('🎯 Buscando vagas formatadas para frontend...');
    
    // Primeiro, verificar se há vagas no banco com tratamento de erro
    let vagasDoBanco = [];
    try {
      const stmt = db.prepare('SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC LIMIT 50');
      const rows = stmt.all();
      vagasDoBanco = Array.isArray(rows) ? rows.filter(vaga => vaga && typeof vaga === 'object') : [];
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
        const stmt = db.prepare('SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC LIMIT 50');
        const rows = stmt.all();
        vagasDoBanco = Array.isArray(rows) ? rows.filter(vaga => vaga && typeof vaga === 'object') : [];
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
        
        return {
          id: vaga.id ? vaga.id.toString() : Math.random().toString(),
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
        };
      }).filter(vaga => vaga !== null); // Remove vagas nulas
      
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

export default router;
