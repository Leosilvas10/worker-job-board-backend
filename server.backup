/* ======================= index.js (server) ======================= */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import axios from 'axios';

/* ---------- importações de outros módulos ---------- */
import './database.js';
import jobsStatsRouter    from './api/jobs-stats.js';
import leadsRouter        from './api/leads.js';
import vagasRouter        from './api/vagas.js';
import clearAllDataRouter from './api/clear-all-data.js';
import statsRouter        from './api/stats.js';
import AutoJobUpdater     from './scripts/auto-job-updater.js';
import { PrismaClient }   from '@prisma/client';
import {
  login, verifyToken, logout,
  authenticateToken, requireAdmin,
} from './middleware/auth.js';
import {
  validateLeadData, validateIdParam,
  securityHeaders, createRateLimit,
} from './middleware/validation.js';

/* -------------------------------------------------- */
dotenv.config();

const app  = express();
const prisma = new PrismaClient();
const autoJobUpdater = new AutoJobUpdater();

/* ---------------- middlewares globais ------------- */
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(securityHeaders);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

/* ============ IMPORTAÇÃO AUTOMÁTICA DE VAGAS ============ */
const KEYWORDS =
  /clean|limp|aux|atend|driver|cozinh|jardineiro|porteiro|helper|geral|diarista|entry|junior|doméstica|faxina|operador|manutenção|zelador|repositor|coletor|embalador|camareira/i;

async function fetchRemotive() {
  try {
    const { data } = await axios.get('https://remotive.com/api/remote-jobs');
    return data.jobs
      .filter(j => KEYWORDS.test(j.title + j.category))
      .map(j => ({
        id: `remotive_${j.id}`,
        title: j.title,
        company: '',
        location: j.candidate_required_location || 'Brasil',
        salary: j.salary || '',
        description: j.description,
        type: j.job_type,
        category: j.category,
        source: '',
        url: j.url,
        tags: [],
        created_at: j.publication_date || new Date().toISOString(),
      }));
  } catch { return []; }
}

async function fetchRemoteOK() {
  try {
    const { data } = await axios.get('https://remoteok.com/api');
    if (!Array.isArray(data)) return [];
    return data
      .filter(j => KEYWORDS.test((j.position || '') + (j.tags?.join(' ') || '')))
      .map(j => ({
        id: `remoteok_${j.id}`,
        title: j.position,
        company: '',
        location: j.location || 'Brasil',
        salary: j.salary || '',
        description: j.description,
        type: j.type || '',
        category: j.tags?.join(', ') || 'Geral',
        source: '',
        url: j.url,
        tags: [],
        created_at: j.date || new Date().toISOString(),
      }));
  } catch { return []; }
}

async function fetchJobspresso() {
  try {
    const { data } = await axios.get('https://jobspresso.co/api/v1/jobs');
    if (!Array.isArray(data)) return [];
    return data
      .filter(j => KEYWORDS.test(j.title + j.category))
      .map(j => ({
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
        created_at: j.published_at || new Date().toISOString(),
      }));
  } catch { return []; }
}

async function importVagasSimples() {
  const lista = [
    ...await fetchRemotive(),
    ...await fetchRemoteOK(),
    ...await fetchJobspresso(),
  ];

  /* Remove duplicadas por id */
  const uniques = [];
  const ids = new Set();
  for (const v of lista) {
    if (ids.has(v.id)) continue;
    ids.add(v.id);
    uniques.push(v);
  }

  /* Remove vagas de teste / mock */
  const filtradas = uniques.filter(v =>
    !/mock|test|source|catho|infojobs|jooble/i.test(v.title + v.description + v.company + v.source)
  );

  /* Salvar até 100 vagas no arquivo */
  fs.writeFileSync(
    'jobs-data.json',
    JSON.stringify(filtradas.slice(0, 100), null, 2)
  );
  console.log(`✅ ${filtradas.length} vagas importadas`);
}

/* Executa na inicialização e diariamente às 03h */
importVagasSimples();
cron.schedule('0 3 * * *', () => {
  console.log('⏰ CRON 03h – importando vagas simples...');
  importVagasSimples();
});

/* =================== ENDPOINTS DE VAGAS =================== */

/* 6 vagas em destaque – usado na HOME */
app.get('/api/featured-jobs', (req, res) => {
  let jobs = [];
  if (fs.existsSync('jobs-data.json'))
    jobs = JSON.parse(fs.readFileSync('jobs-data.json', 'utf8'));

  const featured = jobs.slice(0, 6);
  res.json({ success: true, data: featured, count: featured.length, timestamp: new Date().toISOString() });
});

/* Até 100 vagas – página dedicada */
app.get('/api/all-jobs', (req, res) => {
  let jobs = [];
  if (fs.existsSync('jobs-data.json'))
    jobs = JSON.parse(fs.readFileSync('jobs-data.json', 'utf8'));

  res.json({ success: true, data: jobs.slice(0, 100), count: jobs.length, timestamp: new Date().toISOString() });
});

/* ---------- ALIAS /vagas ----------- *//* NOVO */
app.get('/api/vagas/featured', (req, res) => {
  let jobs = [];
  if (fs.existsSync('jobs-data.json'))
    jobs = JSON.parse(fs.readFileSync('jobs-data.json', 'utf8'));

  res.json({ success: true, data: jobs.slice(0, 6), count: 6, timestamp: new Date().toISOString() });
});

/* Lista completa (até 100) *//* NOVO */
app.get('/api/vagas', (req, res) => {
  let jobs = [];
  if (fs.existsSync('jobs-data.json'))
    jobs = JSON.parse(fs.readFileSync('jobs-data.json', 'utf8'));

  res.json({ success: true, data: jobs.slice(0, 100), count: jobs.length, timestamp: new Date().toISOString() });
});

/* Health-check simples *//* NOVO */
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ================== ROTAS ORIGINAIS ================== */
app.use('/api/jobs-stats', jobsStatsRouter);
app.use('/api/leads',       leadsRouter);
app.use('/api/vagas',       vagasRouter);          // legacy router
app.use('/api',             vagasRouter);          // outro alias
app.use('/api/clear-all-data', clearAllDataRouter);
app.use('/api/stats',          statsRouter);
/* ===================================================== */

/* Porta padrão 5000 (ou variável PORT) */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📚 API disponível em: http://localhost:${PORT}`);
});
/* ===================================================== */
