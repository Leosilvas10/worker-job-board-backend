const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do CORS para aceitar os domínios do frontend
const corsOptions = {
  origin: [
    'https://worker-job-board-frontend-leonardosilvas2.replit.app',
    'https://sitedotrabalhador.com.br',
    'http://localhost:3000', // Para desenvolvimento local
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend Worker Job Board rodando!',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/leads', '/api/health', '/api/jobs-stats', '/api/jobs']
  });
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota para leads (exemplo básico)
app.get('/api/leads', (req, res) => {
  res.json({
    message: 'Endpoint de leads funcionando',
    leads: [],
    timestamp: new Date().toISOString()
  });
});

// Rota para criar lead
app.post('/api/leads', (req, res) => {
  console.log('Dados recebidos:', req.body);
  res.json({
    message: 'Lead criado com sucesso',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

// Rota para estatísticas de vagas
app.get('/api/jobs-stats', (req, res) => {
  res.json({
    totalJobs: 120,
    recentJobs: 25,
    activeJobs: 95,
    timestamp: new Date().toISOString()
  });
});

// Rota para listar vagas (SEM cidade)
app.get('/api/jobs', (req, res) => {
  const jobs = [
    {
      id: 1,
      title: "Empregada Doméstica",
      company: "Família Particular",
      salary: "R$ 1.320,00",
      type: "CLT",
      timeAgo: "Há 2 horas",
      description: "Limpeza geral da casa, organização, preparo de refeições simples. Experiência mínima de 1 ano.",
      tags: ["Doméstica", "CATHO"]
    },
    {
      id: 2,
      title: "Diarista",
      company: "Residência Particular",
      salary: "R$ 120,00/dia",
      type: "Diarista",
      timeAgo: "Há 3 horas",
      description: "Limpeza e organização residencial. Disponibilidade para trabalhar 2x por semana.",
      tags: ["Diarista", "Limpeza"]
    },
    {
      id: 3,
      title: "Auxiliar de Limpeza",
      company: "Empresa de Serviços",
      salary: "R$ 1.500,00",
      type: "CLT",
      timeAgo: "Há 1 hora",
      description: "Limpeza de escritórios e áreas comuns. Experiência em limpeza comercial.",
      tags: ["Limpeza", "Comercial"]
    }
  ];

  res.json({
    jobs,
    total: jobs.length,
    timestamp: new Date().toISOString()
  });
});

// Rota para receber dados da pesquisa trabalhista
app.post('/api/labor-research', (req, res) => {
  console.log('Dados da pesquisa trabalhista recebidos:', req.body);

  // Dados esperados do formulário:
  // ultimaEmpresa, tipoCarteira, recebeuTudoCertinho, situacoesDuranteTrabalho, 
  // aceitaConsultoria, nomeCompleto, whatsapp

  res.json({
    message: 'Pesquisa trabalhista recebida com sucesso',
    data: req.body,
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL local: http://0.0.0.0:${PORT}`);
  console.log(`🌐 URL de produção: https://worker-job-board-backend-leonardosilvas2.replit.app`);
  console.log(`✅ CORS configurado para:`);
  console.log(`   - https://worker-job-board-frontend-leonardosilvas2.replit.app`);
  console.log(`   - https://sitedotrabalhador.com.br`);
});