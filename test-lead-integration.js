import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testLeadIntegration() {
  try {
    console.log('🔍 Verificando vagas no banco...')
    
    // Buscar vagas existentes
    const vagas = await prisma.vaga.findMany({
      where: { ativa: true },
      take: 5
    })
    
    console.log(`📊 Total de vagas ativas: ${vagas.length}`)
    
    if (vagas.length > 0) {
      console.log('✅ Vagas encontradas:')
      vagas.forEach(vaga => {
        console.log(`  - ID: ${vaga.id}, Título: ${vaga.titulo}, URL: ${vaga.urlOriginal}`)
      })
      
      // Criar um lead de teste
      console.log('\n🧪 Criando lead de teste...')
      const testLead = await prisma.lead.create({
        data: {
          nome: 'João Silva Teste',
          whatsapp: '11999887766',
          ultimaEmpresa: 'Empresa Teste Ltda',
          tipoContrato: 'CLT (carteira assinada)',
          recebeuVerbas: 'Às vezes atrasava',
          situacoesVividas: 'Trabalhei horas extras não pagas',
          desejaConsulta: 'Sim, quero a consulta gratuita',
          vagaId: vagas[0].id
        },
        include: {
          vaga: true
        }
      })
      
      console.log('✅ Lead criado com sucesso!')
      console.log(`   - ID: ${testLead.id}`)
      console.log(`   - Nome: ${testLead.nome}`)
      console.log(`   - Vaga: ${testLead.vaga?.titulo}`)
      console.log(`   - Consulta: ${testLead.desejaConsulta}`)
      
      // Buscar todos os leads
      console.log('\n📋 Listando todos os leads...')
      const allLeads = await prisma.lead.findMany({
        include: {
          vaga: {
            select: {
              titulo: true,
              empresa: true,
              urlOriginal: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      console.log(`📊 Total de leads: ${allLeads.length}`)
      allLeads.forEach(lead => {
        console.log(`  - ${lead.nome} (${lead.whatsapp}) - Vaga: ${lead.vaga?.titulo || 'Sem vaga'} - Consulta: ${lead.desejaConsulta}`)
      })
      
    } else {
      console.log('❌ Nenhuma vaga encontrada no banco!')
      console.log('💡 Execute primeiro o script de importação de vagas.')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLeadIntegration()
