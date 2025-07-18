import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import axios from 'axios';

// Importações originais
import './database.js';
import jobsStatsRouter from './api/jobs-stats.js';
import leadsRouter from './api/leads.js';
import vagasRouter from './api/vagas.js';
import clearAllDataRouter from './api/clear-all-data.js';
import statsRouter from './api/stats.js';
import AutoJobUpdater from './scripts/auto-job-updater.js';
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

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(securityHeaders);
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ============= IMPORTAÇÃO AUTOMÁTICA VAGAS SIMPLES =============
const KEYWORDS = /clean|limp|aux|atend|driver|cozinh|jardineiro|porteiro|helper|geral|diarista|entry|junior|doméstica|faxina|operador|manutenção|zelador|repositor|coletor|embalador|camareira/i;

async function fetchRemotive() {
  try {
    const res = await axios.get('https://remotive.com/api/remote-jobs');
    return res.data.jobs.filter(j => KEYWORDS.test(j.title + j.category)).map(job => ({
      id: `remotive_${job.id}`,
      title: job.title,
      company: '', // Nunca exibe fonte nem empresa
      location: job.candidate_required_location || 'Brasil',
      salary: job.salary || '',
      description: job.description,
      type: job.job_type,
      category: job.category,
      source: '', // Nunca exibe source
      url: job.url,
      tags: [],
      created_at: job.publication_date || new Date().toISOString()
    }))
  } catch (e) { return [] }
}

async function fetchRemoteOK() {
  try {
    const res = await axios.get('https://remoteok.com/api');
    if (Array.isArray(res.data)) {
      return res.data.filter(j => KEYWORDS.test((j.position || '') + (j.tags?.join(' ') || ''))).map(j => ({
        id: `remoteok_${j.id}`,
        title: j.position,
        company: '',
        location: j.location || 'Brasil',
        salary: j.salary || '',
        description: j.description,
        type: j.type || '',
        category: (j.tags?.join(', ') || 'Geral'),
        source: '',
        url: j.url,
        tags: [],
        created_at: j.date || new Date().toISOString()
      }))
    }
    return []
  } catch (e) { return [] }
}

async function fetchJobspresso() {
  try {
    const res = await axios.get('https://jobspresso.co/api/v1/jobs');
    if (Array.isArray(res.data)) {
      return res.data.filter(j => KEYWORDS.test(j.title + j.category)).map(j => ({
        id: `jobspresso_${j.id}`,
        title: j.title,
        company: '',
        location: j.location || 'Brasil',
        salary: '',
        description: j.description,
        type: j.type || '',
        category: j.category || 'Geral',
        source: '',
        url: j.url,
        tags: [],
        created_at: j.published_at || new Date().toISOString()
      }))
    }
    return []
  } catch (e) { return [] }
}

async function importVagasSimples() {
  let all = [];
  all = all.concat(
    await fetchRemotive(),
    await fetchRemoteOK(),
    await fetchJobspresso()
  );
  // Remove duplicadas por id
  const ids = new Set();
  all = all.filter(j => {
    if (ids.has(j.id)) return false;
    ids.add(j.id);
    return true;
  });
  // Remove qualquer vaga com mock/test/source/catho/infojobs/jooble (nunca aparecerá)
  all = all.filter(j =>
    !/mock|test|source|catho|infojobs|jooble/i.test(j.title + j.description + (j.company || '') + (j.source || ''))
  );
  // Salva para consumo pelo backend
  fs.writeFileSync('jobs-data.json', JSON.stringify(all.slice(0, 100), null, 2));
  console.log(`✅ ${all.length} vagas simples importadas`);
}

// Executa ao iniciar o servidor (garante vagas reais)
importVagasSimples();
// Roda todo dia às 3h da manhã
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ Importando vagas simples (CRON 3h)...');
  await importVagasSimples();
});

// =========== ENDPOINTS DE VAGAS REAIS ===========
// 6 vagas para home (sem fonte visível)
app.get('/api/featured-jobs', (req, res) => {
  let jobs = [];
  if (fs.existsSync('jobs-data.json')) {
    jobs = JSON.parse(fs.readFileSync('jobs-data.json', 'utf8'));
  }
  // 6 primeiras reais (sem fonte, sem mock)
  const featured = jobs.slice(0, 6);
  res.json({
    success: true,
    data: featured,
    count: featured.length,
    timestamp: new Date().toISOString()
  });
});

// Página dedicada de vagas (até 100 reais)
app.get('/api/all-jobs', (req, res) => {
  let jobs = [];
  if (fs.existsSync('jobs-data.json')) {
    jobs = JSON.parse(fs.readFileSync('jobs-data.json', 'utf8'));
  }
  res.json({
    success: true,
    data: jobs.slice(0, 100),
    count: jobs.length,
    timestamp: new Date().toISOString()
  });
});

// =========== SUAS ROTAS ORIGINAIS ===========
// (Manter tudo igual!)
app.use('/api/jobs-stats', jobsStatsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/vagas', vagasRouter);
app.use('/api', vagasRouter); // legacy
app.use('/api/clear-all-data', clearAllDataRouter);
app.use('/api/stats', statsRouter);
// ...autenticação, admin, etc...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: ${process.env.NODE_ENV === 'production' ? 'https://api.sitedotrabalhador.com.br' : `http://localhost:${PORT}`}`);
});
