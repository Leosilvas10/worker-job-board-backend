import sqlite3 from 'sqlite3';

async function testarSQLite() {
  console.log('🧪 Testando SQLite diretamente...');
  
  const db = new sqlite3.Database('./test.db');
  
  // Criar tabela simples
  db.run(`
    CREATE TABLE IF NOT EXISTS teste (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela:', err);
      return;
    }
    
    console.log('✅ Tabela criada');
    
    // Inserir dados
    const stmt = db.prepare('INSERT INTO teste (nome) VALUES (?)');
    stmt.run(['Teste 1'], function(err) {
      if (err) {
        console.error('❌ Erro ao inserir:', err);
        return;
      }
      
      console.log('✅ Dados inseridos, ID:', this.lastID);
      
      // Buscar dados
      db.all('SELECT * FROM teste', (err, rows) => {
        if (err) {
          console.error('❌ Erro ao buscar:', err);
          return;
        }
        
        console.log('📊 Dados encontrados:', rows);
        
        db.close();
      });
    });
    
    stmt.finalize();
  });
}

testarSQLite();
