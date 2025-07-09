const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

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
  const jobs = loadJobsFromFile();
  const now = new Date();
  const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
  
  const recentJobs = jobs.filter(job => new Date(job.createdAt) > last24Hours).length;
  const weeklyJobs = jobs.filter(job => new Date(job.createdAt) > last7Days).length;
  
  res.json({
    totalJobs: jobs.length,
    recentJobs: recentJobs,
    weeklyJobs: weeklyJobs,
    activeJobs: jobs.length,
    cltJobs: jobs.filter(job => job.type === 'CLT').length,
    diaristaJobs: jobs.filter(job => job.type === 'Diarista').length,
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

// Rota para listar vagas (carrega do arquivo)
app.get('/api/jobs', (req, res) => {
  const jobs = loadJobsFromFile();

  res.json({
    jobs,
    total: jobs.length,
    timestamp: new Date().toISOString(),
    lastUpdate: jobs[0]?.createdAt || new Date().toISOString()
  });
});

// Função para carregar vagas em destaque do arquivo
function loadFeaturedJobsFromFile() {
  try {
    if (fs.existsSync('featured-jobs.json')) {
      const data = fs.readFileSync('featured-jobs.json', 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar vagas em destaque:', error);
  }
  
  // Vagas em destaque padrão para a home page
  return [
    {
      id: 'featured-1',
      title: "Empregada Doméstica",
      company: "Família Silva - Morumbi",
      salary: "R$ 1.450,00",
      type: "CLT",
      timeAgo: "Há 1 hora",
      description: "Experiência em limpeza e organização. Meio período. Excelente oportunidade!",
      tags: ["Empregada", "CLT", "Destaque"],
      featured: true,
      priority: 1,
      url: "https://www.indeed.com.br/viewjob?jk=8a2f5e1b9c7d3a84",
      location: "São Paulo - SP",
      schedule: "Meio período"
    },
    {
      id: 'featured-2',
      title: "Diarista",
      company: "Residência Jardins",
      salary: "R$ 150,00/dia",
      type: "Diarista",
      timeAgo: "Há 2 horas",
      description: "2x por semana. Ótima remuneração. Ambiente familiar.",
      tags: ["Diarista", "Flexível", "Destaque"],
      featured: true,
      priority: 2,
      url: "https://www.indeed.com.br/viewjob?jk=6b4d8f3e2a9c1d75",
      location: "São Paulo - SP",
      schedule: "2x por semana"
    },
    {
      id: 'featured-3',
      title: "Cuidadora de Idosos",
      company: "Família Particular",
      salary: "R$ 1.600,00",
      type: "CLT",
      timeAgo: "Há 30 min",
      description: "Cuidados especializados. Período integral. Carteira assinada.",
      tags: ["Cuidadora", "CLT", "Destaque"],
      featured: true,
      priority: 3,
      url: "https://www.indeed.com.br/viewjob?jk=2d5f9e8a3c6b1h47",
      location: "São Paulo - SP",
      schedule: "Período integral"
    },
    {
      id: 'featured-4',
      title: "Babá",
      company: "Família Moderna",
      salary: "R$ 1.500,00",
      type: "CLT",
      timeAgo: "Há 1 hora",
      description: "Cuidados com 2 crianças. Experiência necessária. Benefícios.",
      tags: ["Babá", "CLT", "Destaque"],
      featured: true,
      priority: 4,
      url: "https://www.indeed.com.br/viewjob?jk=4f8e3d9a2c7b6j91",
      location: "São Paulo - SP",
      schedule: "Segunda a Sexta"
    },
    {
      id: 'featured-5',
      title: "Auxiliar de Limpeza",
      company: "Empresa Comercial",
      salary: "R$ 1.400,00",
      type: "CLT",
      timeAgo: "Há 45 min",
      description: "Limpeza comercial. Vale transporte + alimentação.",
      tags: ["Auxiliar", "CLT", "Destaque"],
      featured: true,
      priority: 5,
      url: "https://www.indeed.com.br/viewjob?jk=5g9d2f7e4a8c1l73",
      location: "São Paulo - SP",
      schedule: "Segunda a Sábado"
    },
    {
      id: 'featured-6',
      title: "Governanta",
      company: "Residência de Alto Padrão",
      salary: "R$ 2.200,00",
      type: "CLT",
      timeAgo: "Há 15 min",
      description: "Experiência em casas grandes. Excelente salário + benefícios.",
      tags: ["Governanta", "CLT", "Destaque"],
      featured: true,
      priority: 6,
      url: "https://www.indeed.com.br/viewjob?jk=3h7e2f9d6a4c8n94",
      location: "São Paulo - SP",
      schedule: "Período integral"
    }
  ];
}

// Rota para vagas em destaque da home page
app.get('/api/featured-jobs', (req, res) => {
  const featuredJobs = loadFeaturedJobsFromFile();

  res.json({
    featuredJobs,
    total: featuredJobs.length,
    timestamp: new Date().toISOString(),
    description: "Vagas em destaque para a home page"
  });
});

// Rota para atualizar vagas em destaque (admin)
app.post('/api/featured-jobs', (req, res) => {
  const { jobs } = req.body;

  if (!Array.isArray(jobs) || jobs.length !== 6) {
    return res.status(400).json({
      error: 'Deve fornecer exatamente 6 vagas em destaque',
      timestamp: new Date().toISOString()
    });
  }

  // Validar estrutura das vagas
  const requiredFields = ['title', 'company', 'salary', 'type', 'description', 'url'];
  for (const job of jobs) {
    for (const field of requiredFields) {
      if (!job[field]) {
        return res.status(400).json({
          error: `Campo obrigatório '${field}' não encontrado na vaga: ${job.title || 'Sem título'}`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Adicionar campos necessários para vagas em destaque
  const featuredJobs = jobs.map((job, index) => ({
    ...job,
    id: job.id || `featured-${index + 1}`,
    featured: true,
    priority: index + 1,
    timeAgo: job.timeAgo || "Há poucos minutos",
    tags: job.tags || [job.title.split(' ')[0], job.type, "Destaque"],
    location: job.location || "São Paulo - SP",
    schedule: job.schedule || "A combinar",
    createdAt: new Date().toISOString()
  }));

  try {
    // Salvar vagas em destaque no arquivo
    fs.writeFileSync('featured-jobs.json', JSON.stringify(featuredJobs, null, 2));
    console.log(`✅ ${featuredJobs.length} vagas em destaque atualizadas!`);
    
    res.json({
      message: 'Vagas em destaque atualizadas com sucesso!',
      featuredJobs: featuredJobs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao salvar vagas em destaque:', error);
    res.status(500).json({
      error: 'Erro ao salvar vagas em destaque',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota para candidaturas às vagas
app.post('/api/job-applications', (req, res) => {
  console.log('Candidatura recebida:', req.body);

  const {
    // Dados da vaga
    jobId,
    jobTitle,
    jobCompany,
    jobUrl,
    jobSalary,
    jobType,
    
    // Dados do candidato
    nomeCompleto,
    email,
    telefone,
    whatsapp,
    cidade,
    estado,
    idade,
    experiencia,
    disponibilidade,
    observacoes,
    
    ...outrosDados
  } = req.body;

  // Salvar candidatura
  const applicationData = {
    id: Date.now(),
    
    // Dados da vaga
    jobId,
    jobTitle,
    jobCompany,
    jobUrl,
    jobSalary,
    jobType,
    
    // Dados do candidato
    nomeCompleto,
    email,
    telefone,
    whatsapp,
    cidade,
    estado,
    idade,
    experiencia,
    disponibilidade,
    observacoes,
    
    ...outrosDados,
    
    createdAt: new Date().toISOString(),
    status: 'Pendente'
  };

  // Carregar candidaturas existentes
  let applications = [];
  try {
    if (fs.existsSync('job-applications.json')) {
      const data = fs.readFileSync('job-applications.json', 'utf8');
      applications = JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar candidaturas:', error);
  }

  // Adicionar nova candidatura
  applications.push(applicationData);

  // Salvar candidaturas
  try {
    fs.writeFileSync('job-applications.json', JSON.stringify(applications, null, 2));
    console.log(`✅ Candidatura salva! Total: ${applications.length}`);
  } catch (error) {
    console.error('Erro ao salvar candidatura:', error);
  }

  console.log(`📋 Candidato: ${nomeCompleto} se candidatou para ${jobTitle} na ${jobCompany}`);
  console.log(`🔗 URL da vaga: ${jobUrl}`);

  res.json({
    message: 'Candidatura enviada com sucesso!',
    data: applicationData,
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Rota para listar candidaturas
app.get('/api/job-applications', (req, res) => {
  let applications = [];
  try {
    if (fs.existsSync('job-applications.json')) {
      const data = fs.readFileSync('job-applications.json', 'utf8');
      applications = JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar candidaturas:', error);
  }

  res.json({
    applications,
    total: applications.length,
    timestamp: new Date().toISOString()
  });
});

// Rota para receber dados da pesquisa trabalhista + dados pessoais
app.post('/api/labor-research', (req, res) => {
  console.log('Dados da pesquisa trabalhista recebidos:', req.body);

  // Extrair dados pessoais e da pesquisa trabalhista
  const {
    // Dados pessoais
    nomeCompleto,
    email,
    telefone,
    cidade,
    estado,
    idade,
    
    // Dados da pesquisa trabalhista
    ultimaEmpresa,
    tipoCarteira,
    recebeuTudoCertinho,
    situacoesDuranteTrabalho,
    aceitaConsultoria,
    whatsapp,
    
    // Qualquer outro campo adicional
    ...outrosDados
  } = req.body;

  // Salvar dados no array com ID único
  const leadData = {
    id: Date.now(),
    
    // Dados pessoais
    nomeCompleto,
    email,
    telefone,
    cidade,
    estado,
    idade,
    
    // Dados da pesquisa trabalhista
    ultimaEmpresa,
    tipoCarteira,
    recebeuTudoCertinho,
    situacoesDuranteTrabalho,
    aceitaConsultoria,
    whatsapp,
    
    // Outros dados
    ...outrosDados,
    
    createdAt: new Date().toISOString()
  };
  
  laborResearchLeads.push(leadData);
  
  // SALVAR NO ARQUIVO PARA PERSISTÊNCIA
  saveLeadsToFile(laborResearchLeads);
  
  console.log(`✅ Lead completo salvo! Total de leads: ${laborResearchLeads.length}`);
  console.log(`📋 Dados pessoais: ${nomeCompleto}, ${email}, ${telefone}, ${cidade}, ${estado}, ${idade}`);
  console.log(`💼 Dados trabalhistas: ${ultimaEmpresa}, ${tipoCarteira}, ${aceitaConsultoria}`);

  res.json({
    message: 'Pesquisa trabalhista recebida com sucesso',
    data: leadData,
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Rota para listar todos os leads da pesquisa trabalhista
app.get('/api/labor-research-leads', (req, res) => {
  res.json({
    leads: laborResearchLeads,
    total: laborResearchLeads.length,
    timestamp: new Date().toISOString()
  });
});

// Rota para deletar um lead específico
app.delete('/api/labor-research-leads/:id', (req, res) => {
  const leadId = parseInt(req.params.id);
  
  console.log(`🗑️ Tentando deletar lead com ID: ${leadId}`);
  
  const leadIndex = laborResearchLeads.findIndex(lead => lead.id === leadId);
  
  if (leadIndex === -1) {
    return res.status(404).json({
      error: 'Lead não encontrado',
      id: leadId,
      timestamp: new Date().toISOString()
    });
  }
  
  // Remover lead do array
  const deletedLead = laborResearchLeads.splice(leadIndex, 1)[0];
  
  // SALVAR NO ARQUIVO PARA PERSISTIR A EXCLUSÃO
  saveLeadsToFile(laborResearchLeads);
  
  console.log(`✅ Lead deletado permanentemente! Total restante: ${laborResearchLeads.length}`);
  console.log(`📋 Lead deletado: ${deletedLead.nomeCompleto} (${deletedLead.email})`);
  
  res.json({
    message: 'Lead deletado com sucesso',
    deletedLead: deletedLead,
    totalRemaining: laborResearchLeads.length,
    timestamp: new Date().toISOString()
  });
});

// Rota para deletar múltiplos leads
app.delete('/api/labor-research-leads', (req, res) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      error: 'IDs devem ser fornecidos como array',
      timestamp: new Date().toISOString()
    });
  }
  
  console.log(`🗑️ Tentando deletar ${ids.length} leads:`, ids);
  
  const deletedLeads = [];
  
  // Deletar cada lead pelos IDs fornecidos
  ids.forEach(id => {
    const leadIndex = laborResearchLeads.findIndex(lead => lead.id === parseInt(id));
    if (leadIndex !== -1) {
      const deletedLead = laborResearchLeads.splice(leadIndex, 1)[0];
      deletedLeads.push(deletedLead);
    }
  });
  
  // SALVAR NO ARQUIVO PARA PERSISTIR AS EXCLUSÕES
  saveLeadsToFile(laborResearchLeads);
  
  console.log(`✅ ${deletedLeads.length} leads deletados permanentemente! Total restante: ${laborResearchLeads.length}`);
  
  res.json({
    message: `${deletedLeads.length} leads deletados com sucesso`,
    deletedLeads: deletedLeads,
    totalRemaining: laborResearchLeads.length,
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

// Rota para atualizar vagas (webhook seguro)
app.post('/api/update-jobs', (req, res) => {
  const { webhook_secret } = req.body;
  
  // Verificação de segurança
  if (webhook_secret !== 'SUA_CHAVE_SECRETA_AQUI') {
    return res.status(401).json({
      error: 'Token de segurança inválido',
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('🔄 Atualizando vagas via webhook...');
  
  updateJobsAutomatically().then(() => {
    res.json({
      message: 'Vagas atualizadas com sucesso via webhook',
      timestamp: new Date().toISOString()
    });
  }).catch(error => {
    res.status(500).json({
      error: 'Erro ao atualizar vagas',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl 
  });
});

// Importar o módulo de atualização de vagas
const { updateJobs } = require('./update-jobs.js');

// Função para atualizar vagas automaticamente
async function updateJobsAutomatically() {
  console.log('🔄 Atualizando vagas automaticamente de múltiplas fontes...');
  
  try {
    // Usar o sistema robusto de atualização
    const updatedJobs = await updateJobs();
    console.log(`✅ ${updatedJobs.length} vagas atualizadas automaticamente!`);
    console.log(`📅 Última atualização: ${new Date().toISOString()}`);
    return updatedJobs;
  } catch (error) {
    console.error('❌ Erro ao atualizar vagas automaticamente:', error);
    
    // Fallback com algumas vagas básicas
    const fallbackJobs = [
      {
        id: Date.now(),
        title: "Empregada Doméstica",
        company: "Família Silva",
        salary: "R$ 1.400,00",
        type: "CLT",
        timeAgo: "Há 1 hora",
        description: "Limpeza, organização e cuidados com a casa. Experiência de 2 anos.",
        tags: ["Doméstica", "CLT"],
        createdAt: new Date().toISOString()
      }
    ];
    
    fs.writeFileSync('jobs-data.json', JSON.stringify(fallbackJobs, null, 2));
    return fallbackJobs;
  }
}

// Configurar agendamento para atualizar vagas
// Executa todos os dias às 8:00 da manhã
cron.schedule('0 8 * * *', updateJobsAutomatically, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

// Executa a cada 6 horas
cron.schedule('0 */6 * * *', updateJobsAutomatically, {
  scheduled: true,
  timezone: "America/Sao_Paulo"
});

console.log('⏰ Agendamento configurado:');
console.log('   - Atualização diária às 8:00');
console.log('   - Atualização a cada 6 horas');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL local: http://0.0.0.0:${PORT}`);
  console.log(`🌐 URL de produção: https://worker-job-board-backend-leonardosilvas2.replit.app`);
  console.log(`✅ CORS configurado para:`);
  console.log(`   - https://worker-job-board-frontend-leonardosilvas2.replit.app`);
  console.log(`   - https://sitedotrabalhador.com.br`);
  console.log(`💾 Dados carregados: ${laborResearchLeads.length} leads salvos`);
  
  // Executar uma vez ao iniciar o servidor
  updateJobsAutomatically();
});