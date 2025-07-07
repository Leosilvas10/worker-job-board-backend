import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import './database.js';
import jobsStatsRouter from './api/jobs-stats.js';
import leadsRouter from './api/leads.js';
import vagasRouter from './api/vagas.js';
import clearAllDataRouter from './api/clear-all-data.js';
import statsRouter from './api/stats.js';
import AutoJobUpdater from './scripts/auto-job-updater.js';

// Se necessário para fetch (Node 18+ já tem, senão descomente)
// import fetch from 'node-fetch';

import { getVagas } from './api/vagas-prisma.js';
import { getVagasDestaque } from './api/vagas-destaque.js';
import { createLead, getLeads } from './api/leads-prisma.js';
import { verificarVagas } from './api/verificar-vagas.js';
import { toggleVagaDestaque, toggleVagaAtiva } from './api/vaga-actions.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { login, verifyToken, logout, authenticateToken, requireAdmin } from './middleware/auth.js';
import { validateLeadData, validateIdParam, securityHeaders, createRateLimit } from './middleware/validation.js';

dotenv.config();

const app = express();
const autoJobUpdater = new AutoJobUpdater();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 tentativas por minuto para desenvolvimento
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet para proteção de cabeçalhos
app.use(helmet({
  contentSecurityPolicy: false, // flexível para dev
  crossOriginEmbedderPolicy: false,
}));

app.use(securityHeaders);
app.use(globalLimiter);

// Morgan para logging dev
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

// ============ CORS UNIVERSAL PARA DEV (SEGURO PARA LOCALHOST) ============
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/, // qualquer porta localhost
  /^https:\/\/.*\.vercel\.app$/, // qualquer deploy Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman etc
    if (allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error('CORS não permitido para esta origem: ' + origin), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));
// ============ FIM DO AJUSTE DE CORS UNIVERSAL ============

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -------------------- ROTAS -----------------------

app.get('/', (req, res) => {
  res.json({
    message: 'API do Site do Trabalhador funcionando!',
    timestamp: new Date().toISOString(),
    features: [
      'Captura de leads completa',
      'Gerenciamento de vagas',
      'Cache de vagas automático',
      'Estatísticas em tempo real',
      'Painel administrativo'
    ]
  });
});

app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /admin/
Disallow: /auth/
Allow: /vagas
Allow: /leads
Allow: /`);
});

// ========== SUAS ROTAS API PRINCIPAIS ==========
app.use('/api/jobs-stats', jobsStatsRouter); // <- ESTA É A MAIS IMPORTANTE PRA VOCÊ AGORA!
app.use('/api/leads', leadsRouter);
app.use('/api/vagas', vagasRouter);
app.use('/api', vagasRouter); // legacy/simples
app.use('/api/clear-all-data', clearAllDataRouter);
app.use('/api/stats', statsRouter); // Nova rota de estatísticas

// ========== AUTENTICAÇÃO ==========
app.post('/auth/login', authLimiter, login);
app.post('/auth/verify', verifyToken);
app.post('/auth/logout', logout);

// ========== ROTAS PRISMA PÚBLICAS ==========
app.get('/vagas', getVagas);
app.get('/vagas/destaque', getVagasDestaque);
app.post('/lead', validateLeadData, createLead);
app.get('/leads-prisma', getLeads);
app.get('/verificar-vagas', verificarVagas);

// ========== IMPORTAÇÃO DE VAGAS ==========
app.post('/import-vagas', async (req, res) => {
  try {
    // use "globalThis.fetch" se node >= 18
    const response = await fetch('http://localhost:3001/api/simple-jobs');
    const data = await response.json();
    if (!data.success || !data.data) throw new Error('Erro ao buscar vagas da API');
    const vagas = data.data;
    let imported = 0;
    let updated = 0;
    for (const vaga of vagas) {
      try {
        const existingVaga = await prisma.vaga.findFirst({
          where: {
            OR: [
              { id: parseInt(vaga.id) || undefined },
              { titulo: vaga.title }
            ]
          }
        });
        const vagaData = {
          titulo: vaga.title || 'Sem título',
          descricao: vaga.description || 'Descrição não informada',
          empresa: vaga.company || 'Empresa',
          localizacao: vaga.location || 'Brasil',
          salario: parseFloat(vaga.salary?.replace(/[^\d,]/g, '')?.replace(',', '.')) || 1320,
          tipo: vaga.type || 'CLT',
          categoria: vaga.category || 'Geral',
          urlOriginal: vaga.originalUrl || vaga.url || 'https://sitedotrabalhador.com.br',
          ativa: true,
          destaque: Math.random() < 0.1
        };
        if (existingVaga) {
          await prisma.vaga.update({ where: { id: existingVaga.id }, data: vagaData });
          updated++;
        } else {
          await prisma.vaga.create({ data: vagaData });
          imported++;
        }
      } catch (vagaError) {
        console.error('Erro ao processar vaga:', vaga.title, vagaError.message);
      }
    }
    const totalVagas = await prisma.vaga.count();
    const vagasAtivas = await prisma.vaga.count({ where: { ativa: true } });
    const vagasDestaque = await prisma.vaga.count({ where: { destaque: true } });
    res.json({
      success: true,
      message: `Importação realizada com sucesso!`,
      data: { imported, updated, totalVagas, vagasAtivas, vagasDestaque }
    });
  } catch (error) {
    console.error('❌ Erro na importação:', error);
    res.status(500).json({ success: false, message: 'Erro na importação', error: error.message });
  }
});

app.get('/import-vagas', (req, res) => {
  res.json({
    message: 'Rota para importação de vagas',
    instructions: 'Envie um POST para esta rota com os dados das vagas no corpo da requisição.'
  });
});

// ========== ADMIN ==========
app.get('/leads-prisma', authenticateToken, requireAdmin, getLeads);
app.patch('/vagas/:id/destaque', validateIdParam, authenticateToken, requireAdmin, (req, res) => {
  toggleVagaDestaque(req, res)
});
app.patch('/vagas/:id/ativa', validateIdParam, authenticateToken, requireAdmin, (req, res) => {
  toggleVagaAtiva(req, res)
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: ${process.env.NODE_ENV === 'production' ? 'https://api.sitedotrabalhador.com.br' : `http://localhost:${PORT}`}`);
  console.log(`💾 Banco SQLite configurado e funcionando!`);
});

// ========== CRONS, EXTRAS e HEALTHCHECK, ERROS, 404 ==========

// ... (aqui mantenha seus crons igual no original) ...

// Handler global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro global capturado:', err);
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('❌ Módulo não encontrado:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Erro interno: módulo não encontrado',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
    });
  }
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// Handler 404 — ÚLTIMO!!!
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /',
      'GET /api/jobs-stats',
      'GET /vagas',
      'GET /vagas/destaque',
      'POST /lead',
      'GET /health',
      'GET /verificar-vagas'
    ]
  });
});
