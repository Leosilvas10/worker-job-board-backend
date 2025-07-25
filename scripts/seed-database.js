import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Populando banco de dados com vagas iniciais...')

  try {
    // Verificar se já existem vagas
    const existingVagas = await prisma.vaga.count()
    
    if (existingVagas > 0) {
      console.log(`✅ Banco já possui ${existingVagas} vagas. Seed cancelado.`)
      return
    }

    // Vagas de exemplo para serem populadas
    const vagasIniciais = [
      {
        titulo: 'Empregada Doméstica',
        descricao: 'Limpeza geral da casa, organização, preparo de refeições simples. Experiência comprovada.',
        salario: 1320.00,
        urlOriginal: 'https://www.catho.com.br/vagas',
        destaque: true
      },
      {
        titulo: 'Diarista',
        descricao: 'Limpeza completa de apartamento 2 quartos, 2x por semana.',
        salario: 150.00,
        urlOriginal: 'https://www.infojobs.com.br',
        destaque: true
      },
      {
        titulo: 'Porteiro Diurno',
        descricao: 'Controle de acesso e atendimento aos moradores em condomínio residencial.',
        salario: 1500.00,
        urlOriginal: 'https://www.sine.com.br/oportunidades',
        destaque: true
      },
      {
        titulo: 'Auxiliar de Limpeza',
        descricao: 'Limpeza de escritórios comerciais no período noturno.',
        salario: 1412.00,
        urlOriginal: 'https://www.vagas.com.br',
        destaque: false
      },
      {
        titulo: 'Garçom/Garçonete',
        descricao: 'Atendimento em restaurante, anotação de pedidos e servir mesas.',
        salario: 1600.00,
        urlOriginal: 'https://www.catho.com.br/vagas',
        destaque: true
      },
      {
        titulo: 'Motorista Entregador',
        descricao: 'Entregas de produtos diversos na região metropolitana. CNH categoria B obrigatória.',
        salario: 2100.00,
        urlOriginal: 'https://www.sine.com.br/oportunidades',
        destaque: true
      },
      {
        titulo: 'Vendedor(a)',
        descricao: 'Vendas de roupas e acessórios em loja física. Experiência em varejo.',
        salario: 1500.00,
        urlOriginal: 'https://www.infojobs.com.br',
        destaque: false
      },
      {
        titulo: 'Auxiliar de Cozinha',
        descricao: 'Preparo e distribuição da merenda escolar em escola municipal.',
        salario: 1380.00,
        urlOriginal: 'https://www.catho.com.br/vagas',
        destaque: false
      },
      {
        titulo: 'Operador de Caixa',
        descricao: 'Operação de caixa e atendimento ao cliente em supermercado.',
        salario: 1450.00,
        urlOriginal: 'https://www.sine.com.br/oportunidades',
        destaque: true
      },
      {
        titulo: 'Babá',
        descricao: 'Cuidados com criança de 2 anos. Experiência comprovada e referências.',
        salario: 1800.00,
        urlOriginal: 'https://www.infojobs.com.br',
        destaque: false
      }
    ]

    // Inserir vagas no banco
    for (const vaga of vagasIniciais) {
      await prisma.vaga.create({
        data: vaga
      })
    }

    console.log(`✅ ${vagasIniciais.length} vagas criadas com sucesso!`)
    
    // Mostrar estatísticas
    const totalVagas = await prisma.vaga.count()
    const vagasDestaque = await prisma.vaga.count({ where: { destaque: true } })
    
    console.log(`📊 Estatísticas:`)
    console.log(`   Total de vagas: ${totalVagas}`)
    console.log(`   Vagas em destaque: ${vagasDestaque}`)

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o seed
seedDatabase()

export { seedDatabase }
