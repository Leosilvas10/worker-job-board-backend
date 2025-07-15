#!/usr/bin/env node

/**
 * Script de Verificação Final do Sistema
 * Executa todos os testes necessários antes do deploy
 */

import { setupDatabase, checkDatabaseIntegrity, backupDatabase } from './database-setup.js'
import fs from 'fs'
import path from 'path'

console.log('🚀 VERIFICAÇÃO FINAL DO SISTEMA - SITE DO TRABALHADOR')
console.log('=' .repeat(60))

const checks = []

// 1. Verificar arquivos de configuração
console.log('\n📋 1. VERIFICANDO CONFIGURAÇÃO...')
try {
  // Verificar .env
  const envPath = './.env'
  if (fs.existsSync(envPath)) {
    console.log('✅ Arquivo .env encontrado')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    const requiredVars = [
      'JWT_SECRET',
      'ADMIN_USERNAME', 
      'ADMIN_PASSWORD',
      'DATABASE_URL',
      'CORS_ORIGIN'
    ]
    
    const missingVars = requiredVars.filter(v => !envContent.includes(v))
    if (missingVars.length === 0) {
      console.log('✅ Todas as variáveis obrigatórias encontradas')
      checks.push({ test: 'Configuração', status: 'OK' })
    } else {
      console.log('❌ Variáveis faltando:', missingVars.join(', '))
      checks.push({ test: 'Configuração', status: 'FALHA', error: `Variáveis faltando: ${missingVars.join(', ')}` })
    }
  } else {
    console.log('❌ Arquivo .env não encontrado')
    checks.push({ test: 'Configuração', status: 'FALHA', error: 'Arquivo .env não encontrado' })
  }

  // Verificar .gitignore
  const gitignorePath = './.gitignore'
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
    if (gitignoreContent.includes('.env')) {
      console.log('✅ .env está no .gitignore')
    } else {
      console.log('⚠️ .env NÃO está no .gitignore - RISCO DE SEGURANÇA')
    }
  }
} catch (error) {
  console.log('❌ Erro na verificação de configuração:', error.message)
  checks.push({ test: 'Configuração', status: 'ERRO', error: error.message })
}

// 2. Verificar banco de dados
console.log('\n💾 2. VERIFICANDO BANCO DE DADOS...')
try {
  const dbResult = await setupDatabase()
  if (dbResult.success) {
    console.log('✅ Banco de dados configurado corretamente')
    console.log(`📍 Localização: ${dbResult.dbPath}`)
    console.log(`📊 Leads: ${dbResult.stats.leads}, Vagas: ${dbResult.stats.vagas}`)
    checks.push({ test: 'Banco de Dados', status: 'OK', details: dbResult.stats })
  } else {
    console.log('❌ Erro no banco de dados:', dbResult.error)
    checks.push({ test: 'Banco de Dados', status: 'FALHA', error: dbResult.error })
  }
} catch (error) {
  console.log('❌ Erro na verificação do banco:', error.message)
  checks.push({ test: 'Banco de Dados', status: 'ERRO', error: error.message })
}

// 3. Verificar integridade dos dados
console.log('\n🔍 3. VERIFICANDO INTEGRIDADE DOS DADOS...')
try {
  const integrityResult = await checkDatabaseIntegrity()
  if (integrityResult.success) {
    console.log('✅ Integridade dos dados verificada')
    checks.push({ test: 'Integridade', status: 'OK', details: integrityResult.stats })
  } else {
    console.log('❌ Erro na integridade:', integrityResult.error)
    checks.push({ test: 'Integridade', status: 'FALHA', error: integrityResult.error })
  }
} catch (error) {
  console.log('❌ Erro na verificação de integridade:', error.message)
  checks.push({ test: 'Integridade', status: 'ERRO', error: error.message })
}

// 4. Verificar dependências
console.log('\n📦 4. VERIFICANDO DEPENDÊNCIAS...')
try {
  const packageJsonPath = './package.json'
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    
    const requiredDeps = [
      'express',
      'prisma',
      '@prisma/client',
      'jsonwebtoken',
      'bcryptjs',
      'helmet',
      'cors',
      'express-rate-limit'
    ]
    
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies }
    const missingDeps = requiredDeps.filter(dep => !allDeps[dep])
    
    if (missingDeps.length === 0) {
      console.log('✅ Todas as dependências encontradas')
      checks.push({ test: 'Dependências', status: 'OK' })
    } else {
      console.log('❌ Dependências faltando:', missingDeps.join(', '))
      checks.push({ test: 'Dependências', status: 'FALHA', error: `Dependências faltando: ${missingDeps.join(', ')}` })
    }
  }
} catch (error) {
  console.log('❌ Erro na verificação de dependências:', error.message)
  checks.push({ test: 'Dependências', status: 'ERRO', error: error.message })
}

// 5. Criar backup
console.log('\n💾 5. CRIANDO BACKUP...')
try {
  const backupResult = await backupDatabase()
  if (backupResult.success) {
    console.log('✅ Backup criado:', backupResult.backupPath)
    checks.push({ test: 'Backup', status: 'OK' })
  } else {
    console.log('⚠️ Backup não criado:', backupResult.message)
    checks.push({ test: 'Backup', status: 'AVISO', error: backupResult.message })
  }
} catch (error) {
  console.log('❌ Erro no backup:', error.message)
  checks.push({ test: 'Backup', status: 'ERRO', error: error.message })
}

// 6. Relatório final
console.log('\n📊 RELATÓRIO FINAL')
console.log('=' .repeat(60))

const okCount = checks.filter(c => c.status === 'OK').length
const failCount = checks.filter(c => c.status === 'FALHA').length
const errorCount = checks.filter(c => c.status === 'ERRO').length
const warningCount = checks.filter(c => c.status === 'AVISO').length

console.log(`✅ Testes OK: ${okCount}`)
console.log(`❌ Falhas: ${failCount}`)
console.log(`🔴 Erros: ${errorCount}`)
console.log(`⚠️ Avisos: ${warningCount}`)

console.log('\nDetalhes:')
checks.forEach(check => {
  const icon = check.status === 'OK' ? '✅' : 
               check.status === 'FALHA' ? '❌' : 
               check.status === 'ERRO' ? '🔴' : '⚠️'
  console.log(`${icon} ${check.test}: ${check.status}`)
  if (check.error) {
    console.log(`   └─ ${check.error}`)
  }
  if (check.details) {
    console.log(`   └─ ${JSON.stringify(check.details)}`)
  }
})

// Status final
const allOk = failCount === 0 && errorCount === 0
console.log('\n' + '=' .repeat(60))
if (allOk) {
  console.log('🎉 SISTEMA PRONTO PARA PRODUÇÃO!')
  console.log('✅ Todos os testes passaram com sucesso')
  process.exit(0)
} else {
  console.log('⚠️ SISTEMA PRECISA DE AJUSTES')
  console.log('❌ Corrija os erros antes do deploy')
  process.exit(1)
}
