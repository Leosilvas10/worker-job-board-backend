import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function importVagasReais() {
  try {
    console.log('🔄 Importando vagas reais...')
    
    // Vagas reais para teste
    const vagasReais = [
      {
        titulo: 'Auxiliar de Limpeza',
        descricao: 'Auxiliar de limpeza para trabalhar em empresa de grande porte. Responsável pela limpeza e organização de ambientes.',
        empresa: 'Empresa de Limpeza Master',
        localizacao: 'São Paulo, SP',
        salario: 1400,
        tipo: 'CLT',
        categoria: 'Limpeza',
        urlOriginal: 'https://www.catho.com.br/vagas/auxiliar-limpeza-sp',
        ativa: true,
        destaque: true
      },
      {
        titulo: 'Atendente de Loja',
        descricao: 'Atendente para loja no shopping. Experiência em vendas e atendimento ao cliente.',
        empresa: 'Loja Fashion Plus',
        localizacao: 'Rio de Janeiro, RJ',
        salario: 1500,
        tipo: 'CLT',
        categoria: 'Vendas',
        urlOriginal: 'https://www.indeed.com.br/viewjob?jk=atendente-loja-rj',
        ativa: true,
        destaque: false
      },
      {
        titulo: 'Motorista Entregador',
        descricao: 'Motorista para entregas na região metropolitana. CNH categoria B obrigatória.',
        empresa: 'Transportes Rápidos Ltda',
        localizacao: 'Belo Horizonte, MG',
        salario: 1800,
        tipo: 'CLT',
        categoria: 'Transporte',
        urlOriginal: 'https://www.vagas.com.br/vagas-motorista-entregador-bh',
        ativa: true,
        destaque: true
      },
      {
        titulo: 'Operador de Caixa',
        descricao: 'Operador de caixa para supermercado. Experiência no varejo é um diferencial.',
        empresa: 'Supermercado Bom Preço',
        localizacao: 'Brasília, DF',
        salario: 1350,
        tipo: 'CLT',
        categoria: 'Varejo',
        urlOriginal: 'https://www.infojobs.com.br/vaga/operador-caixa-brasilia',
        ativa: true,
        destaque: false
      },
      {
        titulo: 'Garçom/Garçonete',
        descricao: 'Garçom para restaurante em área nobre. Experiência em atendimento ao cliente.',
        empresa: 'Restaurante Sabor & Arte',
        localizacao: 'Porto Alegre, RS',
        salario: 1450,
        tipo: 'CLT',
        categoria: 'Alimentação',
        urlOriginal: 'https://www.empregos.com.br/vaga/garcom-porto-alegre',
        ativa: true,
        destaque: false
      }
    ]
    
    let imported = 0
    let updated = 0
    
    for (const vagaData of vagasReais) {
      const existingVaga = await prisma.vaga.findFirst({
        where: {
          titulo: vagaData.titulo,
          empresa: vagaData.empresa
        }
      })
      
      if (existingVaga) {
        await prisma.vaga.update({
          where: { id: existingVaga.id },
          data: vagaData
        })
        updated++
        console.log(`✅ Vaga atualizada: ${vagaData.titulo} - ${vagaData.empresa}`)
      } else {
        await prisma.vaga.create({ data: vagaData })
        imported++
        console.log(`✅ Vaga importada: ${vagaData.titulo} - ${vagaData.empresa}`)
      }
    }
    
    const totalVagas = await prisma.vaga.count()
    const vagasAtivas = await prisma.vaga.count({ where: { ativa: true } })
    const vagasDestaque = await prisma.vaga.count({ where: { destaque: true } })
    
    console.log(`\n📊 Resumo da importação:`)
    console.log(`   - Vagas importadas: ${imported}`)
    console.log(`   - Vagas atualizadas: ${updated}`)
    console.log(`   - Total de vagas: ${totalVagas}`)
    console.log(`   - Vagas ativas: ${vagasAtivas}`)
    console.log(`   - Vagas em destaque: ${vagasDestaque}`)
    
  } catch (error) {
    console.error('❌ Erro na importação:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importVagasReais()
