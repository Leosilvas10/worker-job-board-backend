
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Buscar todas as vagas reais do SQLite via API
  const { data } = await axios.get('http://localhost:3001/api/vagas');
  if (!data.success || !Array.isArray(data.vagas)) {
    console.error('Erro ao buscar vagas do SQLite');
    process.exit(1);
  }
  const vagas = data.vagas;
  let importadas = 0;
  for (const vaga of vagas) {
    // Importar apenas vagas com urlOriginal e título
    if (!vaga.external_url || !vaga.titulo) continue;
    let salario = 0;
    if (typeof vaga.salario === 'string') {
      const match = vaga.salario.replace(/\./g, '').replace(/R\$/g, '').replace(/\s/g, '').replace(/,/, '.').match(/\d+(\.\d+)?/);
      if (match) {
        salario = parseFloat(match[0]);
      }
    } else if (typeof vaga.salario === 'number') {
      salario = vaga.salario;
    }
    if (isNaN(salario)) salario = 0;
    // UPSERT: atualiza se já existe, cria se não existe
    await prisma.vaga.upsert({
      where: { urlOriginal: vaga.external_url },
      update: {
        titulo: vaga.titulo,
        descricao: vaga.descricao || '',
        salario: salario,
        destaque: Boolean(vaga.destaque),
        ativa: true,
        updatedAt: vaga.data_atualizacao ? new Date(vaga.data_atualizacao) : new Date(),
      },
      create: {
        titulo: vaga.titulo,
        descricao: vaga.descricao || '',
        salario: salario,
        urlOriginal: vaga.external_url,
        destaque: Boolean(vaga.destaque),
        ativa: true,
        createdAt: vaga.data_criacao ? new Date(vaga.data_criacao) : new Date(),
        updatedAt: vaga.data_atualizacao ? new Date(vaga.data_atualizacao) : new Date(),
      }
    });
    importadas++;
  }
  console.log(`✅ Importação concluída: ${importadas} novas vagas importadas para o Prisma!`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
