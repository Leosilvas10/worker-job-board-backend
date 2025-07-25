import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()

async function testCompleteFlow() {
  console.log('🚀 Iniciando teste completo do fluxo de leads...\n')
  
  try {
    // 1. Verificar se existem vagas
    console.log('1️⃣ Verificando vagas disponíveis...')
    const vagas = await prisma.vaga.findMany({
      where: { ativa: true },
      take: 3
    })
    
    if (vagas.length === 0) {
      console.log('❌ Nenhuma vaga encontrada. Execute primeiro o script de importação de vagas.')
      return
    }
    
    console.log(`✅ ${vagas.length} vagas encontradas:`)
    vagas.forEach(vaga => {
      console.log(`   - ${vaga.titulo} (${vaga.empresa}) - ${vaga.urlOriginal}`)
    })
    
    // 2. Simular criação de lead via API
    console.log('\n2️⃣ Testando criação de lead via API...')
    const vagaParaTeste = vagas[0]
    
    const leadData = {
      nome: 'Maria Silva Teste',
      whatsapp: '11987654321',
      ultimaEmpresa: 'Empresa XYZ Ltda',
      tipoContrato: 'CLT (carteira assinada)',
      recebeuVerbas: 'Às vezes atrasava',
      situacoesVividas: 'Trabalhei horas extras não pagas, Não recebi todas as verbas rescisórias',
      desejaConsulta: 'Sim, quero a consulta gratuita',
      vagaId: vagaParaTeste.id
    }
    
    console.log('📝 Dados do lead:', leadData)
    
    // Fazer requisição para a API
    const response = await fetch('http://localhost:3001/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Lead criado com sucesso via API!')
      console.log(`   - ID: ${result.data.id}`)
      console.log(`   - Nome: ${result.data.nome}`)
      console.log(`   - WhatsApp: ${result.data.whatsapp}`)
      console.log(`   - Vaga: ${result.data.vaga?.titulo || 'Não informado'}`)
    } else {
      console.log('❌ Erro ao criar lead via API:', result.message)
    }
    
    // 3. Buscar leads via API
    console.log('\n3️⃣ Testando busca de leads via API...')
    const leadsResponse = await fetch('http://localhost:3001/leads-prisma')
    const leadsResult = await leadsResponse.json()
    
    if (leadsResult.success) {
      console.log(`✅ ${leadsResult.data.length} leads encontrados via API:`)
      leadsResult.data.forEach(lead => {
        console.log(`   - ${lead.nome} (${lead.whatsapp}) - ${lead.vaga?.titulo || 'Sem vaga'} - ${lead.desejaConsulta}`)
      })
    } else {
      console.log('❌ Erro ao buscar leads via API:', leadsResult.message)
    }
    
    // 4. Verificar redirecionamento
    console.log('\n4️⃣ Verificando URLs de redirecionamento...')
    vagas.forEach(vaga => {
      const isReal = vaga.urlOriginal && 
                    vaga.urlOriginal.startsWith('http') && 
                    !vaga.urlOriginal.includes('vagas.example.com') &&
                    !vaga.urlOriginal.includes('fake')
      
      console.log(`   - ${vaga.titulo}: ${vaga.urlOriginal} ${isReal ? '✅ REAL' : '❌ FAKE'}`)
    })
    
    console.log('\n🎉 Teste completo finalizado!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar apenas se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testCompleteFlow()
}

export default testCompleteFlow
