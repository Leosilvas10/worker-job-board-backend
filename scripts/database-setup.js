import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Função para verificar e configurar o banco de dados
export const setupDatabase = async () => {
  try {
    console.log('🔍 Verificando configuração do banco de dados...')
    
    // Verificar se o arquivo do banco existe
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './leads.db'
    const absoluteDbPath = path.resolve(dbPath)
    
    console.log(`📍 Caminho do banco: ${absoluteDbPath}`)
    
    if (fs.existsSync(absoluteDbPath)) {
      console.log('✅ Arquivo do banco de dados encontrado')
      
      // Verificar tamanho do arquivo
      const stats = fs.statSync(absoluteDbPath)
      console.log(`📊 Tamanho do banco: ${(stats.size / 1024).toFixed(2)} KB`)
    } else {
      console.log('🆕 Criando novo arquivo de banco de dados...')
    }
    
    // Testar conexão com Prisma
    await prisma.$connect()
    console.log('✅ Conexão com Prisma estabelecida')
    
    // Contar registros existentes
    const leadsCount = await prisma.lead.count()
    const vagasCount = await prisma.vaga.count()
    
    console.log(`📊 Registros existentes:`)
    console.log(`   - Leads: ${leadsCount}`)
    console.log(`   - Vagas: ${vagasCount}`)
    
    // Se não há vagas, criar algumas de exemplo
    if (vagasCount === 0) {
      console.log('🌱 Criando vagas de exemplo...')
      await createSampleJobs()
    }
    
    return {
      success: true,
      dbPath: absoluteDbPath,
      stats: { leads: leadsCount, vagas: vagasCount }
    }
    
  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error)
    return {
      success: false,
      error: error.message
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Função para criar vagas de exemplo
const createSampleJobs = async () => {
  const sampleJobs = [
    {
      titulo: 'Doméstica - Zona Sul',
      descricao: 'Vaga para doméstica experiente, meio período, zona sul de São Paulo.',
      salario: 1500.00,
      urlOriginal: 'https://exemplo.com/vaga1',
      destaque: true,
      ativa: true
    },
    {
      titulo: 'Cuidadora de Idosos',
      descricao: 'Procuramos cuidadora experiente para cuidar de idoso, horário flexível.',
      salario: 1800.00,
      urlOriginal: 'https://exemplo.com/vaga2',
      destaque: false,
      ativa: true
    },
    {
      titulo: 'Auxiliar de Limpeza',
      descricao: 'Auxiliar de limpeza para empresa de médio porte, período integral.',
      salario: 1400.00,
      urlOriginal: 'https://exemplo.com/vaga3',
      destaque: false,
      ativa: true
    }
  ]
  
  for (const job of sampleJobs) {
    await prisma.vaga.create({ data: job })
  }
  
  console.log(`✅ ${sampleJobs.length} vagas de exemplo criadas`)
}

// Função para backup do banco
export const backupDatabase = async () => {
  try {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './leads.db'
    const backupPath = `${dbPath}.backup.${new Date().toISOString().split('T')[0]}`
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath)
      console.log(`✅ Backup criado: ${backupPath}`)
      return { success: true, backupPath }
    } else {
      console.log('⚠️ Arquivo do banco não encontrado para backup')
      return { success: false, message: 'Arquivo não encontrado' }
    }
  } catch (error) {
    console.error('❌ Erro no backup:', error)
    return { success: false, error: error.message }
  }
}

// Função para verificar integridade
export const checkDatabaseIntegrity = async () => {
  try {
    await prisma.$connect()
    
    // Testar operações básicas
    const leadsCount = await prisma.lead.count()
    const vagasCount = await prisma.vaga.count()
    
    // Verificar relações
    const leadsWithVagas = await prisma.lead.findMany({
      where: { vagaId: { not: null } },
      include: { vaga: true }
    })
    
    console.log('✅ Integridade do banco verificada:')
    console.log(`   - ${leadsCount} leads`)
    console.log(`   - ${vagasCount} vagas`)
    console.log(`   - ${leadsWithVagas.length} leads com vagas vinculadas`)
    
    return {
      success: true,
      stats: { leads: leadsCount, vagas: vagasCount, linked: leadsWithVagas.length }
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação de integridade:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Executando verificação do banco de dados...')
  setupDatabase().then(result => {
    console.log('📋 Resultado:', result)
    process.exit(result.success ? 0 : 1)
  })
}
