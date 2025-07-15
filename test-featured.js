import express from 'express';
import db from './database.js';

const app = express();

// Teste da rota featured
app.get('/test-featured', async (req, res) => {
  try {
    console.log('🔥 Testando vagas em destaque...');
    
    // Buscar vagas ativas e ordenar por salário
    const vagas = await db.allAsync(`
      SELECT *
      FROM vagas 
      WHERE ativa = 1 
      ORDER BY 
        CASE 
          WHEN salario LIKE '%R$%' THEN 
            CAST(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(salario, 'R$ ', ''), 
                    '.', ''
                  ), 
                  ',00', ''
                ),
                ',',
                ''
              ) AS INTEGER
            )
          ELSE 1000 
        END DESC, 
        data_criacao DESC 
      LIMIT 6
    `);
    
    console.log('📊 Vagas encontradas:', vagas.length);
    console.log('📋 Primeiras vagas:', vagas.slice(0, 2));
    
    res.json({
      success: true,
      count: vagas.length,
      data: vagas.slice(0, 6)
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => {
  console.log('🧪 Servidor de teste rodando na porta 3002');
});
