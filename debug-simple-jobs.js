import db from './database.js';

console.log('🔍 Testando rota /api/simple-jobs internamente...');

// Testar a query diretamente
try {
  const stmt = db.prepare('SELECT * FROM vagas WHERE ativa = 1 ORDER BY data_criacao DESC');
  const rows = stmt.all();
  
  console.log('📊 Tipo do retorno:', typeof rows);
  console.log('📊 É array?:', Array.isArray(rows));
  console.log('📊 Conteúdo do rows:', rows);
  
  if (!Array.isArray(rows)) {
    console.log('❌ Problema: rows não é um array!');
    process.exit(1);
  }
  
  console.log(`📊 ${rows.length} vagas ativas encontradas`);
  console.log('📋 Primeiras 5 vagas ativas:');
  
  rows.slice(0, 5).forEach((vaga, index) => {
    console.log(`${index + 1}. ${vaga.titulo} - ${vaga.empresa} - ${vaga.salario}`);
  });
  
  // Simular a formatação da rota
  const vagasFormatadas = rows.map(vaga => {
    if (!vaga || typeof vaga !== 'object') {
      console.log('❌ Vaga inválida:', vaga);
      return null;
    }
    
    return {
      id: vaga.id ? vaga.id.toString() : Math.random().toString(),
      title: vaga.titulo || 'Vaga Disponível',
      company: vaga.empresa || 'Empresa Não Informada',
      location: vaga.localizacao ? vaga.localizacao.split(',').pop().trim() : 'Brasil',
      salary: vaga.salario || 'A combinar',
      description: vaga.descricao || 'Descrição não disponível',
      type: vaga.tipo || 'CLT',
      category: vaga.categoria || 'Outros',
      source: 'jobs',
      external_url: vaga.external_url || '',
      tags: vaga.tags ? (typeof vaga.tags === 'string' ? JSON.parse(vaga.tags) : vaga.tags) : [],
      created_at: vaga.data_criacao || new Date().toISOString()
    };
  }).filter(vaga => vaga !== null);
  
  console.log(`✅ ${vagasFormatadas.length} vagas formatadas com sucesso`);
  
  // Verificar se há problemas com tags
  const vagasComProblemas = rows.filter(vaga => {
    try {
      if (vaga.tags && typeof vaga.tags === 'string') {
        JSON.parse(vaga.tags);
      }
      return false;
    } catch (e) {
      return true;
    }
  });
  
  if (vagasComProblemas.length > 0) {
    console.log(`⚠️ ${vagasComProblemas.length} vagas com problemas de formatação de tags`);
  }
  
} catch (error) {
  console.error('❌ Erro ao testar query:', error);
}
