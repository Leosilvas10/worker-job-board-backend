import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Marca as 10 vagas com maior salário como destaque
  const vagas = await prisma.vaga.findMany({
    where: { ativa: true },
    orderBy: { salario: 'desc' },
    take: 10
  });
  for (const vaga of vagas) {
    await prisma.vaga.update({
      where: { id: vaga.id },
      data: { destaque: true }
    });
  }
  console.log(`✅ ${vagas.length} vagas marcadas como destaque!`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
