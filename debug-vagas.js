import db from './database.js';

console.log('🔍 Verificando vagas no banco...');

try {
  // Contar total de vagas
  const total = await db.getAsync('SELECT COUNT(*) as total FROM vagas');
  console.log('📊 Total de vagas:', total);

  // Verificar as primeiras 5 vagas
  const vagas = await db.allAsync('SELECT id, titulo, empresa, salario, ativa FROM vagas LIMIT 5');
  console.log('📋 Primeiras 5 vagas:', JSON.stringify(vagas, null, 2));

  // Verificar vagas ativas
  const ativas = await db.getAsync('SELECT COUNT(*) as total FROM vagas WHERE ativa = 1');
  console.log('✅ Vagas ativas:', ativas);

  // Verificar vagas featured
  const featured = await db.allAsync(`
    SELECT id, titulo, empresa, salario, ativa
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
  console.log('🔥 Vagas featured:', JSON.stringify(featured, null, 2));

} catch (error) {
  console.error('❌ Erro:', error);
}
