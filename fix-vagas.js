import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndFixVagas() {
  try {
    console.log('🔍 Verificando status das vagas...');
    
    // Verificar quantas vagas estão ativas
    const vagasAtivas = await prisma.vaga.count({ where: { ativa: true } });
    const vagasInativas = await prisma.vaga.count({ where: { ativa: false } });
    const totalVagas = await prisma.vaga.count();
    
    console.log(`📊 Total de vagas: ${totalVagas}`);
    console.log(`✅ Vagas ativas: ${vagasAtivas}`);
    console.log(`❌ Vagas inativas: ${vagasInativas}`);
    
    if (vagasAtivas === 0 && totalVagas > 0) {
      console.log('🔧 Ativando todas as vagas...');
      const result = await prisma.vaga.updateMany({
        data: { ativa: true }
      });
      console.log(`✅ ${result.count} vagas ativadas!`);
    }
    
    // Marcar algumas vagas como destaque
    const vagasDestaque = await prisma.vaga.count({ where: { destaque: true } });
    console.log(`⭐ Vagas em destaque: ${vagasDestaque}`);
    
    if (vagasDestaque === 0) {
      console.log('🌟 Marcando 6 vagas como destaque...');
      const vagasParaDestaque = await prisma.vaga.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' }
      });
      
      for (const vaga of vagasParaDestaque) {
        await prisma.vaga.update({
          where: { id: vaga.id },
          data: { destaque: true }
        });
      }
      console.log(`⭐ ${vagasParaDestaque.length} vagas marcadas como destaque!`);
    }
    
    // Verificação final
    console.log('\n📋 Status final:');
    const finalAtivas = await prisma.vaga.count({ where: { ativa: true } });
    const finalDestaque = await prisma.vaga.count({ where: { destaque: true } });
    console.log(`✅ Vagas ativas: ${finalAtivas}`);
    console.log(`⭐ Vagas em destaque: ${finalDestaque}`);
    
    await prisma.$disconnect();
    console.log('✅ Correção concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkAndFixVagas();
