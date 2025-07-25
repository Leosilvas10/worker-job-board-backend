import db from './database.js';

async function testarInsercao() {
  console.log('🧪 Testando inserção manual no banco...');
  
  try {
    const stmt = db.prepare(`
      INSERT INTO vagas (
        external_id, titulo, empresa, localizacao, salario, descricao,
        tipo, categoria, fonte, external_url, tags, ativa, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run([
      'teste_' + Date.now(),
      'Vaga de Teste',
      'Empresa Teste',
      'São Paulo, SP',
      'R$ 1.500,00',
      'Descrição de teste',
      'CLT',
      'Teste',
      'manual',
      'https://teste.com',
      '["teste"]',
      1,
      0
    ]);
    
    console.log('✅ Inserção realizada:', result);
    console.log('- lastInsertRowid:', result.lastInsertRowid);
    console.log('- changes:', result.changes);
    
    // Verificar se foi inserido
    const verificacao = db.prepare('SELECT COUNT(*) as total FROM vagas').get();
    console.log('📊 Total de vagas no banco:', verificacao.total);
    
    // Buscar a vaga inserida
    const vagaInserida = db.prepare('SELECT * FROM vagas ORDER BY id DESC LIMIT 1').get();
    console.log('🔍 Última vaga inserida:', vagaInserida);
    
  } catch (error) {
    console.error('❌ Erro na inserção:', error);
  }
}

testarInsercao();
