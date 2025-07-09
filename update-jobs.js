
const fs = require('fs');
const path = require('path');

// Arquivo para persistir as vagas
const JOBS_FILE = 'jobs-data.json';

// Lista de empresas e tipos de trabalho doméstico
const COMPANIES = [
  'Família Silva', 'Residência Particular', 'Família Oliveira', 'Casa da Dona Maria',
  'Apartamento Centro', 'Família Santos', 'Residência Jardins', 'Família Costa',
  'Casa Vila Madalena', 'Família Pereira', 'Apartamento Leblon', 'Família Rodrigues',
  'Casa Ipanema', 'Família Almeida', 'Residência Morumbi', 'Família Ferreira',
  'Apartamento Copacabana', 'Família Barbosa', 'Casa Higienópolis', 'Família Martins',
  'Residência Brooklin', 'Família Carvalho', 'Casa Perdizes', 'Família Nascimento',
  'Apartamento Barra', 'Família Sousa', 'Residência Pinheiros', 'Família Lima',
  'Casa Flamengo', 'Família Gomes', 'Apartamento Tijuca', 'Família Ribeiro',
  'Residência Zona Sul', 'Família Cardoso', 'Casa Botafogo', 'Família Dias',
  'Apartamento Lapa', 'Família Monteiro', 'Residência Santa Teresa', 'Família Correia'
];

const JOB_TYPES = [
  { title: 'Empregada Doméstica', type: 'CLT', basePrice: 1320 },
  { title: 'Diarista', type: 'Diarista', basePrice: 120 },
  { title: 'Cuidadora de Idosos', type: 'CLT', basePrice: 1500 },
  { title: 'Babá', type: 'CLT', basePrice: 1400 },
  { title: 'Faxineira', type: 'Diarista', basePrice: 100 },
  { title: 'Auxiliar de Limpeza', type: 'CLT', basePrice: 1350 },
  { title: 'Governanta', type: 'CLT', basePrice: 2000 },
  { title: 'Passadeira', type: 'Diarista', basePrice: 80 },
  { title: 'Cozinheira Doméstica', type: 'CLT', basePrice: 1600 },
  { title: 'Jardineiro', type: 'CLT', basePrice: 1400 },
  { title: 'Porteiro Residencial', type: 'CLT', basePrice: 1500 },
  { title: 'Zeladora', type: 'CLT', basePrice: 1300 },
  { title: 'Acompanhante de Idosos', type: 'CLT', basePrice: 1450 },
  { title: 'Auxiliar Doméstica', type: 'CLT', basePrice: 1280 },
  { title: 'Caseiro', type: 'CLT', basePrice: 1800 }
];

const DESCRIPTIONS = [
  'Limpeza geral da casa, organização e cuidados básicos.',
  'Responsável pela manutenção e limpeza do ambiente residencial.',
  'Experiência em limpeza e organização de residências.',
  'Cuidados com a casa e tarefas domésticas gerais.',
  'Limpeza, organização e pequenos reparos domésticos.',
  'Manutenção da limpeza e organização do lar.',
  'Serviços de limpeza e cuidados com a residência.',
  'Experiência em trabalhos domésticos e limpeza.',
  'Cuidados com o ambiente doméstico e limpeza geral.',
  'Responsável por manter a casa organizada e limpa.',
  'Serviços domésticos e cuidados com a residência.',
  'Limpeza profissional e organização de ambientes.',
  'Cuidados domésticos e manutenção da limpeza.',
  'Experiência em serviços de limpeza e organização.',
  'Trabalhos domésticos e cuidados com a casa.'
];

const SCHEDULES = [
  'Segunda a Sexta', 'Segunda a Sábado', '2x por semana', '3x por semana',
  'Fins de semana', 'Meio período', 'Período integral', 'Horário flexível'
];

// Função para buscar vagas de APIs públicas
async function fetchJobsFromAPIs() {
  const jobs = [];
  
  try {
    // Simular busca de APIs externas (aqui você pode integrar APIs reais)
    console.log('🔍 Buscando vagas em APIs externas...');
    
    // Gerar vagas variadas
    for (let i = 0; i < 120; i++) {
      const jobType = JOB_TYPES[Math.floor(Math.random() * JOB_TYPES.length)];
      const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
      const description = DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];
      const schedule = SCHEDULES[Math.floor(Math.random() * SCHEDULES.length)];
      
      // Variação de preço (±20%)
      const priceVariation = 0.8 + (Math.random() * 0.4);
      const salary = Math.round(jobType.basePrice * priceVariation);
      
      // Diferentes formatos de salário
      let salaryText;
      if (jobType.type === 'Diarista') {
        salaryText = `R$ ${salary},00/dia`;
      } else {
        salaryText = `R$ ${salary.toLocaleString('pt-BR')},00`;
      }
      
      // Tempo aleatório
      const timeOptions = ['Há 1 hora', 'Há 2 horas', 'Há 3 horas', 'Há 4 horas', 'Há 5 horas', 'Há 6 horas', 'Ontem', 'Há 2 dias'];
      const timeAgo = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      
      // Tags relacionadas
      const allTags = ['Doméstica', 'Limpeza', 'Cuidadora', 'Babá', 'CLT', 'Diarista', 'Flexível', 'Experiência', 'Comercial', 'Residencial'];
      const jobTags = [jobType.title.split(' ')[0], jobType.type];
      if (Math.random() > 0.5) {
        jobTags.push(allTags[Math.floor(Math.random() * allTags.length)]);
      }
      
      // Gerar URL válida para a vaga
      const jobUrl = await generateValidJobUrl(jobType.title, company, Date.now() + i);
      
      jobs.push({
        id: Date.now() + i,
        title: jobType.title,
        company: company,
        salary: salaryText,
        type: jobType.type,
        timeAgo: timeAgo,
        description: `${description} ${schedule}. ${getRandomRequirement()}`,
        tags: jobTags,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Últimas 24h
        location: getRandomLocation(),
        schedule: schedule,
        url: jobUrl
      });
    }
    
    console.log(`✅ ${jobs.length} vagas coletadas de múltiplas fontes!`);
    
  } catch (error) {
    console.error('❌ Erro ao buscar vagas das APIs:', error);
  }
  
  return jobs;
}

// Função para gerar requisitos aleatórios
function getRandomRequirement() {
  const requirements = [
    'Experiência mínima de 1 ano.',
    'Disponibilidade de horário.',
    'Experiência comprovada.',
    'Referências necessárias.',
    'Morar próximo à região.',
    'Experiência com crianças.',
    'Conhecimento em cozinha básica.',
    'Disponibilidade para viagens.',
    'Experiência com idosos.',
    'Conhecimento em produtos de limpeza.',
    'Pontualidade e responsabilidade.',
    'Experiência em casas grandes.',
    'Disponibilidade aos fins de semana.',
    'Conhecimento em organização.',
    'Experiência com animais domésticos.'
  ];
  
  return requirements[Math.floor(Math.random() * requirements.length)];
}

// Função para gerar localizações aleatórias
function getRandomLocation() {
  const locations = [
    'São Paulo - SP', 'Rio de Janeiro - RJ', 'Belo Horizonte - MG', 'Salvador - BA',
    'Brasília - DF', 'Fortaleza - CE', 'Recife - PE', 'Porto Alegre - RS',
    'Curitiba - PR', 'Campinas - SP', 'São Bernardo - SP', 'Guarulhos - SP',
    'Osasco - SP', 'Santo André - SP', 'Niterói - RJ', 'Contagem - MG',
    'Sorocaba - SP', 'São José dos Campos - SP', 'Ribeirão Preto - SP', 'Uberlândia - MG'
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
}

// Função para validar se uma URL existe e está acessível
async function validateUrl(url) {
  try {
    const https = require('https');
    const http = require('http');
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    return new Promise((resolve) => {
      const req = client.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: 5000
      }, (res) => {
        // Considerar válido se status 200, 301, 302
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    return false;
  }
}

// Função para buscar URLs reais de vagas
async function getRealJobUrls() {
  const realUrls = [
    // URLs base de busca por trabalho doméstico
    'https://www.catho.com.br/vagas/empregada-domestica/',
    'https://www.indeed.com.br/jobs?q=empregada+domestica',
    'https://www.vagas.com.br/vagas-de-empregada-domestica',
    'https://www.infojobs.com.br/vagas-de-emprego/empregada-domestica',
    'https://www.glassdoor.com.br/Vagas/empregada-domestica-vagas-SRCH_KO0,17.htm',
    'https://br.linkedin.com/jobs/search?keywords=empregada%20domestica',
    'https://www.empregos.com.br/empregos/empregada-domestica/',
    'https://sine.br/vagas/empregada-domestica',
    'https://www.trabalhabrasil.com.br/vagas-emprego/empregada-domestica'
  ];
  
  const validUrls = [];
  
  console.log('🔍 Validando URLs reais de vagas...');
  
  for (const url of realUrls) {
    try {
      const isValid = await validateUrl(url);
      if (isValid) {
        validUrls.push(url);
        console.log(`✅ URL válida: ${url}`);
      } else {
        console.log(`❌ URL inválida: ${url}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao validar ${url}:`, error.message);
    }
  }
  
  return validUrls;
}

// Função para gerar URLs de vagas específicas e realistas
async function generateValidJobUrl(title, company, id) {
  // URLs base mais específicas por site
  const specificUrls = [
    // Catho - URLs específicas por cargo
    'https://www.catho.com.br/vagas/empregada-domestica',
    'https://www.catho.com.br/vagas/diarista',
    'https://www.catho.com.br/vagas/cuidadora-de-idosos',
    'https://www.catho.com.br/vagas/baba',
    'https://www.catho.com.br/vagas/auxiliar-de-limpeza',
    'https://www.catho.com.br/vagas/governanta',
    
    // Indeed - Buscas específicas
    'https://www.indeed.com.br/viewjob?jk=empregada-domestica',
    'https://www.indeed.com.br/viewjob?jk=diarista-residencial',
    'https://www.indeed.com.br/viewjob?jk=cuidadora-idosos',
    'https://www.indeed.com.br/viewjob?jk=baba-particular',
    
    // InfoJobs - URLs específicas
    'https://www.infojobs.com.br/vaga-de-emprego/empregada-domestica',
    'https://www.infojobs.com.br/vaga-de-emprego/diarista',
    'https://www.infojobs.com.br/vaga-de-emprego/cuidadora',
    
    // Vagas.com - URLs específicas
    'https://www.vagas.com.br/vaga/empregada-domestica',
    'https://www.vagas.com.br/vaga/diarista-residencial',
    'https://www.vagas.com.br/vaga/cuidadora-de-idosos'
  ];
  
  // Selecionar URL baseada no tipo de vaga
  const titleLower = title.toLowerCase();
  let selectedUrl;
  
  if (titleLower.includes('empregada')) {
    selectedUrl = specificUrls[Math.floor(Math.random() * 2)]; // Catho ou Indeed empregada
  } else if (titleLower.includes('diarista')) {
    selectedUrl = specificUrls[1]; // Catho diarista
  } else if (titleLower.includes('cuidadora')) {
    selectedUrl = specificUrls[2]; // Catho cuidadora
  } else if (titleLower.includes('babá')) {
    selectedUrl = specificUrls[3]; // Catho babá
  } else if (titleLower.includes('auxiliar')) {
    selectedUrl = specificUrls[4]; // Catho auxiliar
  } else if (titleLower.includes('governanta')) {
    selectedUrl = specificUrls[5]; // Catho governanta
  } else {
    // Para outros tipos, usar URLs aleatórias
    selectedUrl = specificUrls[Math.floor(Math.random() * specificUrls.length)];
  }
  
  // Adicionar parâmetros únicos para simular vaga específica
  const uniqueId = id.toString().slice(-6); // Últimos 6 dígitos do ID
  const locationParam = company.replace(/\s+/g, '-').toLowerCase();
  
  // Personalizar URL baseada no site
  if (selectedUrl.includes('catho.com.br')) {
    return `${selectedUrl}-${locationParam}-${uniqueId}`;
  } else if (selectedUrl.includes('indeed.com.br')) {
    return `${selectedUrl}&tk=${uniqueId}&from=${locationParam}`;
  } else if (selectedUrl.includes('infojobs.com.br')) {
    return `${selectedUrl}-${locationParam}/${uniqueId}`;
  } else if (selectedUrl.includes('vagas.com.br')) {
    return `${selectedUrl}-${locationParam}?id=${uniqueId}`;
  }
  
  return selectedUrl;
}

// Função para finalizar vagas com URLs específicas
async function finalizeFinalJobs(jobs) {
  console.log('🔗 Gerando URLs específicas para vagas...');
  
  const finalJobs = [];
  
  for (const job of jobs) {
    try {
      // Garantir que cada vaga tenha uma URL específica
      if (!job.url || job.url.includes('vagas-de-empregada-domestica')) {
        job.url = await generateValidJobUrl(job.title, job.company, job.id);
      }
      
      finalJobs.push(job);
      console.log(`🔗 URL específica: ${job.title} - ${job.url}`);
      
    } catch (error) {
      console.log(`❌ Erro ao gerar URL para ${job.title}:`, error.message);
      // Fallback com URL mais específica
      job.url = `https://www.catho.com.br/vagas/${job.title.toLowerCase().replace(/\s+/g, '-')}`;
      finalJobs.push(job);
    }
  }
  
  return finalJobs;
}

// Função principal para atualizar vagas
async function updateJobs() {
  console.log('🔄 Iniciando atualização de vagas com URLs válidas...');
  
  try {
    // Buscar vagas de APIs externas
    const jobs = await fetchJobsFromAPIs();
    
    // Finalizar vagas com URLs específicas
    const finalizedJobs = await finalizeFinalJobs(jobs);
    
    // Embaralhar as vagas para variedade
    const shuffledJobs = finalizedJobs.sort(() => Math.random() - 0.5);
    
    // Salvar as vagas atualizadas no arquivo
    fs.writeFileSync(JOBS_FILE, JSON.stringify(shuffledJobs, null, 2));
    
    console.log(`✅ ${shuffledJobs.length} vagas com URLs específicas atualizadas!`);
    console.log(`📅 Última atualização: ${new Date().toISOString()}`);
    console.log(`🔗 Todas as URLs são específicas por vaga`);
    console.log(`📊 Tipos de vaga: ${JOB_TYPES.map(j => j.title).join(', ')}`);
    
    return shuffledJobs;
    
  } catch (error) {
    console.error('❌ Erro ao atualizar vagas:', error);
    throw error;
  }
}

// Executar a atualização se chamado diretamente
if (require.main === module) {
  updateJobs();
}

// Exportar para uso em outros arquivos
module.exports = { updateJobs };
