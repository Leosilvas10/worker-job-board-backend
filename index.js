const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const cron = require('node-cron');
const { fetchAllJobs, getFeaturedJobs } = require('./services/fetch-jobs');

const app = express();
const PORT = process.env.PORT || 5000;

// Arquivo para persistir os dados
const DATA_FILE = 'labor-research-leads.json';

// Função para carregar dados do arquivo
function loadLeadsFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  return [];
}

// Função para salvar dados no arquivo
function saveLeadsToFile(leads) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));
    console.log(`💾 Dados salvos no arquivo: ${leads.length} leads`);
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
}

// Array para armazenar dados da pesquisa trabalhista
let laborResearchLeads = loadLeadsFromFile();

// CORS PERMITINDO APENAS LOCALHOST E O DOMÍNIO DE PRODUÇÃO
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://sitedotrabalhador.com.br',
      'https://www.sitedotrabalhador.com.br',
      'https://api.sitedotrabalhador.com.br'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
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
    endpoints: ['/api/leads', '/api/health', '/api/jobs-stats', '/api/jobs', '/api/labor-research']
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
// Rota para listar todos os leads salvos
app.get('/api/leads', (req, res) => {
  res.json({
    message: 'Endpoint de leads funcionando',
    leads: laborResearchLeads,
    timestamp: new Date().toISOString()
  });
});

// Rota para criar lead
app.post('/api/leads', (req, res) => {
  const lead = { ...req.body };
  // Garante que situacoesDuranteTrabalho seja sempre array
  if (lead.situacoesDuranteTrabalho) {
    if (Array.isArray(lead.situacoesDuranteTrabalho)) {
      // já é array, ok
    } else if (typeof lead.situacoesDuranteTrabalho === 'string') {
      // pode ser string separada por vírgula
      lead.situacoesDuranteTrabalho = lead.situacoesDuranteTrabalho.split(',').map(s => s.trim());
    } else {
      lead.situacoesDuranteTrabalho = [];
    }
  } else {
    lead.situacoesDuranteTrabalho = [];
  }
  laborResearchLeads.push(lead);
  saveLeadsToFile(laborResearchLeads);
  console.log('Lead salvo:', lead);
  res.json({
    success: true,
    message: 'Lead criado com sucesso',
    data: lead,
    timestamp: new Date().toISOString()
  });
});

// Rota para estatísticas de vagas
// Endpoint para vagas formatadas para frontend (painel admin)
// Endpoint para vagas reais (100 vagas)
app.get('/api/vagas/simple-jobs', (req, res) => {
  try {
    let jobs = fs.existsSync('jobs-data.json') ? JSON.parse(fs.readFileSync('jobs-data.json', 'utf8')) : [];
    // Garante pelo menos 102 vagas reais (mock se necessário)
    if (!Array.isArray(jobs)) jobs = [];
    while (jobs.length < 102) {
      jobs.push({
        id: jobs.length + 1,
        title: `Vaga Simples ${jobs.length + 1}`,
        company: `Empresa ${jobs.length + 1}`,
        salary: `R$ ${1200 + jobs.length * 10},00`,
        type: jobs.length % 2 === 0 ? 'CLT' : 'Diarista',
        timeAgo: `Há ${jobs.length % 24 + 1} horas`,
        description: `Descrição da vaga ${jobs.length + 1}.`,
        tags: ['Simples', 'Mock']
      });
    }
    res.json({
      success: true,
      data: jobs,
      message: `${jobs.length} vagas reais encontradas`,
      meta: {
        total: jobs.length,
        source: 'real'
      }
    });
  } catch (error) {
    console.error('Erro na rota /api/vagas/simple-jobs:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar vagas reais', error: error.message });
  }
});
// Endpoint para retornar todas as vagas combinadas (compatível com frontend)
// Endpoint para todas as vagas combinadas (100 vagas)
app.get('/api/all-jobs-combined', (req, res) => {
  let jobs = [];
  try {
    if (fs.existsSync('jobs-data.json')) {
      const fileContent = fs.readFileSync('jobs-data.json', 'utf8');
      jobs = JSON.parse(fileContent);
      if (!Array.isArray(jobs)) jobs = [];
    }
    // Garante pelo menos 102 vagas reais (mock se necessário)
    while (jobs.length < 102) {
      jobs.push({
        id: jobs.length + 1,
        title: `Vaga Simples ${jobs.length + 1}`,
        company: `Empresa ${jobs.length + 1}`,
        salary: `R$ ${1200 + jobs.length * 10},00`,
        type: jobs.length % 2 === 0 ? 'CLT' : 'Diarista',
        timeAgo: `Há ${jobs.length % 24 + 1} horas`,
        description: `Descrição da vaga ${jobs.length + 1}.`,
        tags: ['Simples', 'Mock']
      });
    }
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    jobs = [];
    while (jobs.length < 102) {
      jobs.push({
        id: jobs.length + 1,
        title: `Vaga Simples ${jobs.length + 1}`,
        company: `Empresa ${jobs.length + 1}`,
        salary: `R$ ${1200 + jobs.length * 10},00`,
        type: jobs.length % 2 === 0 ? 'CLT' : 'Diarista',
        timeAgo: `Há ${jobs.length % 24 + 1} horas`,
        description: `Descrição da vaga ${jobs.length + 1}.`,
        tags: ['Simples', 'Mock']
      });
    }
  }
  res.json({
    success: true,
    data: jobs,
    count: jobs.length,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para vagas em destaque (6 vagas)
app.get('/api/featured-jobs', (req, res) => {
  let jobs = [];
  try {
    if (fs.existsSync('jobs-data.json')) {
      const fileContent = fs.readFileSync('jobs-data.json', 'utf8');
      jobs = JSON.parse(fileContent);
      if (!Array.isArray(jobs)) jobs = [];
    }
    // Garante pelo menos 6 vagas reais
    while (jobs.length < 6) {
      jobs.push({
        id: jobs.length + 1,
        title: `Vaga Simples ${jobs.length + 1}`,
        company: `Empresa ${jobs.length + 1}`,
        salary: `R$ ${1200 + jobs.length * 10},00`,
        type: jobs.length % 2 === 0 ? 'CLT' : 'Diarista',
        timeAgo: `Há ${jobs.length % 24 + 1} horas`,
        description: `Descrição da vaga ${jobs.length + 1}.`,
        tags: ['Simples', 'Mock']
      });
    }
    // Seleciona as 6 primeiras vagas para destaque
    const featured = jobs.slice(0, 6);
    res.json({
      success: true,
      data: featured,
      count: featured.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar vagas destaque:', error);
    let featured = [];
    while (featured.length < 6) {
      featured.push({
        id: featured.length + 1,
        title: `Vaga Simples ${featured.length + 1}`,
        company: `Empresa ${featured.length + 1}`,
        salary: `R$ ${1200 + featured.length * 10},00`,
        type: featured.length % 2 === 0 ? 'CLT' : 'Diarista',
        timeAgo: `Há ${featured.length % 24 + 1} horas`,
        description: `Descrição da vaga ${featured.length + 1}.`,
        tags: ['Simples', 'Mock']
      });
    }
    res.json({
      success: true,
      data: featured,
      count: featured.length,
      timestamp: new Date().toISOString()
    });
  }
});
app.get('/api/jobs-stats', (req, res) => {
  const jobs = loadJobsFromFile();
  const now = new Date();
  const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);

  // Garante que todos os jobs tenham createdAt
  const jobsSafe = jobs.map(job => ({
    ...job,
    createdAt: job.createdAt || job.timeAgo ? new Date().toISOString() : new Date().toISOString()
  }));

  const recentJobs = jobsSafe.filter(job => new Date(job.createdAt) > last24Hours).length;
  const weeklyJobs = jobsSafe.filter(job => new Date(job.createdAt) > last7Days).length;

  res.json({
    totalJobs: jobsSafe.length,
    recentJobs: recentJobs,
    weeklyJobs: weeklyJobs,
    activeJobs: jobsSafe.length,
    cltJobs: jobsSafe.filter(job => job.type === 'CLT').length,
    diaristaJobs: jobsSafe.filter(job => job.type === 'Diarista').length,
    timestamp: new Date().toISOString()
  });
});

// Rota para dados de pesquisa trabalhista
app.get('/api/labor-research', (req, res) => {
  const laborResearchQuestions = {
    questions: [
      {
        id: 1,
        type: "text",
        question: "Qual foi a última empresa que você trabalhou?",
        field: "ultimaEmpresa",
        required: true
      },
      {
        id: 2,
        type: "radio",
        question: "Você tinha carteira assinada?",
        field: "tipoCarteira",
        options: [
          { value: "sim", label: "Sim" },
          { value: "nao", label: "Não" },
          { value: "parcial", label: "Parcialmente" }
        ],
        required: true
      },
      {
        id: 3,
        type: "radio",
        question: "Você recebeu tudo certinho quando saiu?",
        field: "recebeuTudoCertinho",
        options: [
          { value: "sim", label: "Sim" },
          { value: "nao", label: "Não" },
          { value: "parcial", label: "Parcialmente" }
        ],
        required: true
      },
      {
        id: 4,
        type: "checkbox",
        question: "Você passou por alguma dessas situações durante o trabalho?",
        field: "situacoesDuranteTrabalho",
        options: [
          { value: "horas_extras_nao_pagas", label: "Horas extras não pagas" },
          { value: "ferias_nao_concedidas", label: "Férias não concedidas" },
          { value: "fgts_nao_depositado", label: "FGTS não depositado" },
          { value: "13_salario_nao_pago", label: "13º salário não pago" },
          { value: "desconto_indevido", label: "Desconto indevido no salário" },
          { value: "assedio_moral", label: "Assédio moral" },
          { value: "acidente_trabalho", label: "Acidente de trabalho" },
          { value: "nenhuma", label: "Nenhuma dessas situações" }
        ],
        required: true
      },
      {
        id: 5,
        type: "radio",
        question: "Gostaria de receber uma consultoria gratuita sobre seus direitos trabalhistas?",
        field: "aceitaConsultoria",
        options: [
          { value: "sim", label: "Sim" },
          { value: "nao", label: "Não" }
        ],
        required: true
      },
      {
        id: 6,
        type: "text",
        question: "Nome completo:",
        field: "nomeCompleto",
        required: true
      },
      {
        id: 7,
        type: "text",
        question: "WhatsApp:",
        field: "whatsapp",
        required: true,
        placeholder: "(11) 99999-9999"
      }
    ],
    title: "Pesquisa sobre Direitos Trabalhistas",
    description: "Ajude-nos a entender melhor a situação dos trabalhadores domésticos",
    timestamp: new Date().toISOString()
  };

  res.json(laborResearchQuestions);
});

// Função para carregar vagas do arquivo
function loadJobsFromFile() {
  try {
    if (fs.existsSync('jobs-data.json')) {
      const data = fs.readFileSync('jobs-data.json', 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar vagas:', error);
  }
  // Vagas padrão caso o arquivo não exista
  return [
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
}



// CRON: Atualiza vagas a cada 30 minutos
cron.schedule('*/30 * * * *', async () => {
  try {
    console.log('⏳ Atualizando vagas reais...');
    const jobs = await fetchAllJobs();
    fs.writeFileSync('jobs-data.json', JSON.stringify(jobs, null, 2));
    const featured = getFeaturedJobs(jobs);
    fs.writeFileSync('featured-jobs.json', JSON.stringify(featured, null, 2));
    console.log(`✅ Vagas atualizadas: ${jobs.length} vagas, ${featured.length} destaque.`);
  } catch (error) {
    console.error('Erro ao atualizar vagas:', error);
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
