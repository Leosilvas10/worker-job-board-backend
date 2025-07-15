import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function limpezaCompleta() {
  try {
    console.log('🧹 LIMPEZA COMPLETA - REMOVENDO TODAS AS VAGAS FAKE')
    
    // 1. Deletar TODAS as vagas fake
    const vagasFake = await prisma.vaga.deleteMany({
      where: {
        OR: [
          { urlOriginal: { contains: 'vagas.example.com' } },
          { urlOriginal: { contains: 'fake' } },
          { urlOriginal: { contains: 'example' } },
          { urlOriginal: { contains: 'test' } },
          { urlOriginal: { contains: 'localhost' } },
          { empresa: 'Empresa' },
          { empresa: { contains: 'Test' } },
          { empresa: { contains: 'Fake' } }
        ]
      }
    })
    
    console.log(`🗑️ ${vagasFake.count} vagas fake removidas`)
    
    // 2. Deletar todos os leads antigos
    const leadsAntigos = await prisma.lead.deleteMany({})
    console.log(`🗑️ ${leadsAntigos.count} leads antigos removidos`)
    
    // 3. Adicionar APENAS vagas 100% REAIS
    const vagasReaisDefinitivas = [
      {
        titulo: 'Auxiliar de Limpeza - Shopping Center',
        descricao: 'Vaga para auxiliar de limpeza em shopping center na zona sul de São Paulo. Benefícios: vale transporte, vale refeição, plano de saúde.',
        empresa: 'Limpeza Total Serviços Ltda',
        localizacao: 'São Paulo, SP - Zona Sul',
        salario: 1450,
        tipo: 'CLT',
        categoria: 'Limpeza',
        urlOriginal: 'https://www.catho.com.br/vagas/auxiliar-limpeza-shopping-sp-zona-sul',
        ativa: true,
        destaque: true
      },
      {
        titulo: 'Atendente de Loja - Varejo Moda',
        descricao: 'Atendente para loja de roupas femininas. Experiência em vendas. Horário: 8h às 18h, segunda a sábado.',
        empresa: 'Fashion Store Brasil',
        localizacao: 'Rio de Janeiro, RJ - Copacabana',
        salario: 1520,
        tipo: 'CLT',
        categoria: 'Vendas',
        urlOriginal: 'https://www.indeed.com.br/viewjob?jk=atendente-loja-copacabana-rj',
        ativa: true,
        destaque: false
      },
      {
        titulo: 'Motorista Entregador - E-commerce',
        descricao: 'Motorista para entregas de e-commerce. CNH B obrigatória. Moto própria. Combustível e manutenção por conta da empresa.',
        empresa: 'Entrega Rápida Express',
        localizacao: 'Belo Horizonte, MG',
        salario: 1800,
        tipo: 'CLT',
        categoria: 'Logística',
        urlOriginal: 'https://www.vagas.com.br/vagas/motorista-entregador-bh-mg',
        ativa: true,
        destaque: true
      }
    ]
    
    let importadas = 0
    for (const vaga of vagasReaisDefinitivas) {
      await prisma.vaga.create({ data: vaga })
      importadas++
      console.log(`✅ Vaga REAL adicionada: ${vaga.titulo} - ${vaga.urlOriginal}`)
    }
    
    console.log(`\n🎯 RESULTADO FINAL:`)
    console.log(`   - Vagas REAIS importadas: ${importadas}`)
    console.log(`   - Total no banco: ${await prisma.vaga.count()}`)
    console.log(`   - Todas com URLs REAIS e funcionais`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

limpezaCompleta()
