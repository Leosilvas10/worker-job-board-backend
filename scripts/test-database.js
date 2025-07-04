import db from '../database.js';

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Testar leads
    const leads = await db.allAsync('SELECT COUNT(*) as total FROM leads');
    console.log(`📊 Total de leads: ${leads[0].total}`);
    
    // Testar vagas
    const vagas = await db.allAsync('SELECT COUNT(*) as total FROM vagas_cache');
    console.log(`💼 Total de vagas: ${vagas[0].total}`);
    
    // Testar estrutura das tabelas
    const leadsColunas = await db.allAsync('PRAGMA table_info(leads)');
    const vagasColunas = await db.allAsync('PRAGMA table_info(vagas_cache)');
    
    console.log(`📋 Tabela leads tem ${leadsColunas.length} colunas`);
    console.log(`📋 Tabela vagas_cache tem ${vagasColunas.length} colunas`);
    
    console.log('✅ Banco de dados funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro no banco de dados:', error.message);
  }
}

// Se executado diretamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  testDatabase().then(() => process.exit(0));
}

export default testDatabase;
