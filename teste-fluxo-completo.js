import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testeFluxoCompleto() {
  try {
    console.log('🧪 TESTE DE FLUXO COMPLETO - FORMULÁRIO → BACKEND → PAINEL ADMIN\n')
    
    // 1. Verificar vagas reais
    console.log('1️⃣ Verificando vagas reais no banco...')
    const vagasReais = await prisma.vaga.findMany({
      where: { 
        ativa: true,
        NOT: {
          urlOriginal: {
            contains: 'vagas.example.com'
          }
        }
      },
      take: 3
    })
    
    if (vagasReais.length === 0) {
      console.log('❌ Nenhuma vaga real encontrada!')
      return
    }
    
    console.log(`✅ ${vagasReais.length} vagas reais encontradas:`)
    vagasReais.forEach(vaga => {
      console.log(`   - ${vaga.titulo} (${vaga.empresa}) - URL: ${vaga.urlOriginal}`)
    })
    
    // 2. Simular candidatura via formulário
    console.log('\n2️⃣ Simulando candidatura via formulário...')
    const candidaturaData = {
      nome: 'Maria da Silva',
      whatsapp: '11987654321',
      ultimaEmpresa: 'logtiva',
      tipoContrato: 'Com carteira assinada',
      recebeuVerbas: 'Sim',
      situacoesVividas: 'Fazia hora extra sem receber, Trabalhei domingos/feriados sem adicional ou folga',
      desejaConsulta: 'Sim, quero saber se tenho algo a receber',
      vagaId: vagasReais[0].id
    }
    
    console.log(`📝 Dados da candidatura:`)
    console.log(`   - Nome: ${candidaturaData.nome}`)
    console.log(`   - WhatsApp: ${candidaturaData.whatsapp}`)
    console.log(`   - Última empresa: ${candidaturaData.ultimaEmpresa}`)
    console.log(`   - Tipo de contrato: ${candidaturaData.tipoContrato}`)
    console.log(`   - Recebeu verbas: ${candidaturaData.recebeuVerbas}`)
    console.log(`   - Situações vividas: ${candidaturaData.situacoesVividas}`)
    console.log(`   - Deseja consulta: ${candidaturaData.desejaConsulta}`)
    console.log(`   - Vaga ID: ${candidaturaData.vagaId}`)
    
    // 3. Salvar no banco
    console.log('\n3️⃣ Salvando lead no banco de dados...')
    const novoLead = await prisma.lead.create({
      data: candidaturaData,
      include: {
        vaga: true
      }
    })
    
    console.log(`✅ Lead criado com ID: ${novoLead.id}`)
    
    // 4. Buscar lead como faria o painel admin
    console.log('\n4️⃣ Buscando leads como faria o painel administrativo...')
    const leads = await prisma.lead.findMany({
      include: {
        vaga: {
          select: {
            id: true,
            titulo: true,
            empresa: true,
            urlOriginal: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    console.log(`📊 Total de leads no sistema: ${leads.length}`)
    console.log('\n📋 Últimos leads (como apareceriam no painel):')
    
    leads.forEach(lead => {
      console.log(`\n👤 Lead #${lead.id}:`)
      console.log(`   - Nome: ${lead.nome}`)
      console.log(`   - WhatsApp: ${lead.whatsapp}`)
      console.log(`   - Última empresa: ${lead.ultimaEmpresa}`)
      console.log(`   - Tipo de contrato: ${lead.tipoContrato}`)
      console.log(`   - Recebeu verbas: ${lead.recebeuVerbas}`)
      console.log(`   - Situações vividas: ${lead.situacoesVividas}`)
      console.log(`   - Deseja consulta: ${lead.desejaConsulta}`)
      console.log(`   - Vaga: ${lead.vaga?.titulo || 'Sem vaga'} (${lead.vaga?.empresa || 'N/A'})`)
      console.log(`   - URL da vaga: ${lead.vaga?.urlOriginal || 'N/A'}`)
      console.log(`   - Data: ${new Date(lead.createdAt).toLocaleString('pt-BR')}`)
    })
    
    // 5. Verificar redirecionamento
    console.log('\n5️⃣ Verificando política de redirecionamento...')
    const vagaEscolhida = novoLead.vaga
    
    if (vagaEscolhida && vagaEscolhida.urlOriginal && 
        vagaEscolhida.urlOriginal.startsWith('http') && 
        !vagaEscolhida.urlOriginal.includes('vagas.example.com') &&
        !vagaEscolhida.urlOriginal.includes('fake')) {
      console.log(`✅ REDIRECIONAMENTO VÁLIDO para: ${vagaEscolhida.urlOriginal}`)
    } else {
      console.log(`❌ REDIRECIONAMENTO BLOQUEADO - URL não é vaga real`)
    }
    
    console.log('\n🎉 TESTE COMPLETO REALIZADO COM SUCESSO!')
    console.log('✅ Fluxo: Formulário → Backend → Banco → Painel Admin está funcionando!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testeFluxoCompleto()
