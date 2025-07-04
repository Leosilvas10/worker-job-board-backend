import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import './database.js'; // Inicializar banco de dados
import jobsStatsRouter from './api/jobs-stats.js';
import leadsRouter from './api/leads.js';
import vagasRouter from './api/vagas.js';
import clearAllDataRouter from './api/clear-all-data.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://worker-job-board-frontend.vercel.app',
  'https://worker-job-board-frontend-git-main-leosilvas10.vercel.app',
  'https://worker-job-board-frontend-leosilvas10.vercel.app',
  // Adicionar todas as possíveis URLs da Vercel
  'https://sitedotrabalhador.vercel.app',
  'https://sitedotrabalhador-git-main-leosilvas10.vercel.app',
  'https://sitedotrabalhador-leosilvas10.vercel.app',
  // Aceitar qualquer subdomínio .vercel.app
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como Postman) em desenvolvimento
    if (!origin) return callback(null, true);
    
    // Verificar se origin está na lista ou se corresponde ao padrão regex
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('❌ CORS rejeitado para origem:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Rota de teste
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

// Rotas
app.use('/api/jobs-stats', jobsStatsRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/vagas', vagasRouter);
app.use('/api', vagasRouter); // Adicionar rota /api/simple-jobs
app.use('/api/clear-all-data', clearAllDataRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}`);
  console.log(`💾 Banco SQLite configurado e funcionando!`);
  console.log(`🔄 Rotas disponíveis:`);
  console.log(`   📋 GET  /api/vagas - Listar vagas`);
  console.log(`   🎯 GET  /api/simple-jobs - Vagas simples (para frontend)`);
  console.log(`   📥 POST /api/vagas - Criar vaga`);
  console.log(`   📥 POST /api/vagas/import-from-frontend - Importar do frontend`);
  console.log(`   👥 GET  /api/leads - Listar leads`);
  console.log(`   📊 GET  /api/jobs-stats - Estatísticas`);
  console.log(`   🗑️ DELETE /api/clear-all-data - Zerar todos os dados`);
});
