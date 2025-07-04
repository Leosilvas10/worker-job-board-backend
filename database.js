import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database('./leads.db');

// Configurar SQLite para UTF-8
db.run("PRAGMA encoding = 'UTF-8'");

// Promisificar métodos do SQLite
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Criar tabelas
db.serialize(() => {
  // Tabela de leads completa
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      telefone TEXT,
      empresa TEXT,
      vaga_titulo TEXT,
      vaga_id TEXT,
      
      -- Dados da pesquisa trabalhista
      trabalhou_antes TEXT,
      ultimo_emprego TEXT,
      tempo_ultimo_emprego TEXT,
      motivo_demissao TEXT,
      salario_anterior TEXT,
      experiencia_anos INTEGER,
      
      -- Dados complementares
      idade INTEGER,
      cidade TEXT,
      estado TEXT,
      disponibilidade TEXT,
      pretensao_salarial TEXT,
      observacoes TEXT,
      mensagem TEXT,
      
      -- Dados de rastreamento
      fonte TEXT DEFAULT 'site',
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      
      -- Status e controle
      status TEXT DEFAULT 'novo',
      contatado BOOLEAN DEFAULT FALSE,
      convertido BOOLEAN DEFAULT FALSE,
      
      -- Timestamps
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de vagas cache
  db.run(`
    CREATE TABLE IF NOT EXISTS vagas_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      titulo TEXT NOT NULL,
      empresa TEXT,
      localizacao TEXT,
      salario TEXT,
      descricao TEXT,
      tipo TEXT,
      categoria TEXT,
      fonte TEXT,
      external_url TEXT,
      tags TEXT,
      ativo BOOLEAN DEFAULT TRUE,
      featured BOOLEAN DEFAULT FALSE,
      published_date DATETIME,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de vagas principal
  db.run(`
    CREATE TABLE IF NOT EXISTS vagas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      titulo TEXT NOT NULL,
      empresa TEXT NOT NULL,
      localizacao TEXT NOT NULL,
      salario TEXT,
      descricao TEXT,
      requisitos TEXT,
      beneficios TEXT,
      tipo TEXT DEFAULT 'CLT',
      categoria TEXT DEFAULT 'Outros',
      nivel TEXT DEFAULT 'Iniciante',
      fonte TEXT DEFAULT 'manual',
      external_url TEXT,
      tags TEXT DEFAULT '[]',
      
      -- Status e controle
      ativa BOOLEAN DEFAULT TRUE,
      destaque BOOLEAN DEFAULT FALSE,
      urgente BOOLEAN DEFAULT FALSE,
      aprovada BOOLEAN DEFAULT TRUE,
      
      -- Contadores
      visualizacoes INTEGER DEFAULT 0,
      candidaturas INTEGER DEFAULT 0,
      
      -- Datas
      data_publicacao DATETIME,
      data_expiracao DATETIME,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de estatísticas
  db.run(`
    CREATE TABLE IF NOT EXISTS estatisticas_diarias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data DATE UNIQUE,
      leads_novos INTEGER DEFAULT 0,
      vagas_ativas INTEGER DEFAULT 0,
      candidaturas INTEGER DEFAULT 0,
      conversoes INTEGER DEFAULT 0,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

console.log('✅ Banco de dados SQLite inicializado com estrutura completa!');

export default db;
