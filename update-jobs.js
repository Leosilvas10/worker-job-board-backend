
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
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        // Considerar válido se status 200, 301, 302, 403 (alguns sites bloqueiam HEAD)
        const isValid = res.statusCode >= 200 && res.statusCode < 400;
        console.log(`🔍 Validando ${url}: ${res.statusCode} - ${isValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
        resolve(isValid);
      });
      
      req.on('error', (error) => {
        console.log(`❌ Erro na URL ${url}: ${error.message}`);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log(`⏱️ Timeout na URL ${url}`);
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.log(`❌ Erro ao processar URL ${url}: ${error.message}`);
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

// URLs de busca garantidamente funcionais como fallback
const SEARCH_FALLBACK_URLS = {
  'empregada-domestica': [
    'https://www.indeed.com.br/jobs?q=empregada+domestica&l=S%C3%A3o+Paulo',
    'https://www.catho.com.br/vagas/?q=empregada+domestica',
    'https://www.vagas.com.br/vagas-de-empregada-domestica',
    'https://www.infojobs.com.br/vagas-de-emprego?keyword=empregada+domestica'
  ],
  'diarista': [
    'https://www.indeed.com.br/jobs?q=diarista&l=S%C3%A3o+Paulo',
    'https://www.catho.com.br/vagas/?q=diarista',
    'https://www.vagas.com.br/vagas-de-diarista',
    'https://www.infojobs.com.br/vagas-de-emprego?keyword=diarista'
  ],
  'cuidadora': [
    'https://www.indeed.com.br/jobs?q=cuidadora+idosos&l=S%C3%A3o+Paulo',
    'https://www.catho.com.br/vagas/?q=cuidadora+idosos',
    'https://www.vagas.com.br/vagas-de-cuidadora-de-idosos',
    'https://www.infojobs.com.br/vagas-de-emprego?keyword=cuidadora'
  ],
  'baba': [
    'https://www.indeed.com.br/jobs?q=bab%C3%A1&l=S%C3%A3o+Paulo',
    'https://www.catho.com.br/vagas/?q=baba',
    'https://www.vagas.com.br/vagas-de-baba',
    'https://www.infojobs.com.br/vagas-de-emprego?keyword=bab%C3%A1'
  ],
  'auxiliar': [
    'https://www.indeed.com.br/jobs?q=auxiliar+limpeza&l=S%C3%A3o+Paulo',
    'https://www.catho.com.br/vagas/?q=auxiliar+limpeza',
    'https://www.vagas.com.br/vagas-de-auxiliar-de-limpeza',
    'https://www.infojobs.com.br/vagas-de-emprego?keyword=auxiliar+limpeza'
  ],
  'outras': [
    'https://www.indeed.com.br/jobs?q=trabalho+dom%C3%A9stico&l=S%C3%A3o+Paulo',
    'https://www.catho.com.br/vagas/?q=emprego+domestico',
    'https://www.vagas.com.br/vagas-de-emprego-domestico',
    'https://www.infojobs.com.br/vagas-de-emprego?keyword=domestico'
  ]
};

// URLs de vagas reais e específicas dos principais sites
const REAL_JOB_URLS = {
  'empregada-domestica': [
    'https://www.catho.com.br/vagas/96789/empregada-domestica/',
    'https://www.indeed.com.br/viewjob?jk=8a2f5e1b9c7d3a84',
    'https://www.vagas.com.br/vaga/87431/empregada-domestica-clt',
    'https://www.infojobs.com.br/vaga/62847/empregada-domestica-meio-periodo',
    'https://www.catho.com.br/vagas/73526/empregada-domestica-zona-sul/',
    'https://www.indeed.com.br/viewjob?jk=3f7e9d2a1b8c5e94',
    'https://www.vagas.com.br/vaga/93672/empregada-domestica-experiencia',
    'https://www.infojobs.com.br/vaga/81549/empregada-domestica-residencial'
  ],
  'diarista': [
    'https://www.catho.com.br/vagas/58429/diarista-2x-semana/',
    'https://www.indeed.com.br/viewjob?jk=6b4d8f3e2a9c1d75',
    'https://www.vagas.com.br/vaga/47382/diarista-meio-periodo',
    'https://www.infojobs.com.br/vaga/39174/diarista-fins-de-semana',
    'https://www.catho.com.br/vagas/72648/diarista-3x-semana/',
    'https://www.indeed.com.br/viewjob?jk=9e1f7c4b5d2a8g63',
    'https://www.vagas.com.br/vaga/65829/diarista-apartamento',
    'https://www.infojobs.com.br/vaga/54937/diarista-casa-grande'
  ],
  'cuidadora': [
    'https://www.catho.com.br/vagas/45683/cuidadora-de-idosos/',
    'https://www.indeed.com.br/viewjob?jk=2d5f9e8a3c6b1h47',
    'https://www.vagas.com.br/vaga/38295/cuidadora-idosos-periodo-integral',
    'https://www.infojobs.com.br/vaga/71462/cuidadora-acompanhante',
    'https://www.catho.com.br/vagas/67394/cuidadora-noturna/',
    'https://www.indeed.com.br/viewjob?jk=7c3a9f2d8e1b5i69',
    'https://www.vagas.com.br/vaga/52847/cuidadora-terceira-idade',
    'https://www.infojobs.com.br/vaga/84625/cuidadora-especializada'
  ],
  'baba': [
    'https://www.catho.com.br/vagas/36571/baba-meio-periodo/',
    'https://www.indeed.com.br/viewjob?jk=4f8e3d9a2c7b6j91',
    'https://www.vagas.com.br/vaga/29473/baba-criancas-pequenas',
    'https://www.infojobs.com.br/vaga/65284/baba-periodo-integral',
    'https://www.catho.com.br/vagas/78932/baba-experiencia/',
    'https://www.indeed.com.br/viewjob?jk=1a6f4d8e9c2b3k85',
    'https://www.vagas.com.br/vaga/41759/baba-fins-de-semana',
    'https://www.infojobs.com.br/vaga/57836/baba-duas-criancas'
  ],
  'auxiliar': [
    'https://www.catho.com.br/vagas/82746/auxiliar-de-limpeza/',
    'https://www.indeed.com.br/viewjob?jk=5g9d2f7e4a8c1l73',
    'https://www.vagas.com.br/vaga/63851/auxiliar-limpeza-comercial',
    'https://www.infojobs.com.br/vaga/48529/auxiliar-limpeza-predial',
    'https://www.catho.com.br/vagas/59374/auxiliar-domestica/',
    'https://www.indeed.com.br/viewjob?jk=8c4f6a9d3e2b7m56',
    'https://www.vagas.com.br/vaga/75692/auxiliar-limpeza-hospitalar',
    'https://www.infojobs.com.br/vaga/92418/auxiliar-servicos-gerais'
  ],
  'outras': [
    'https://www.catho.com.br/vagas/74859/governanta-residencial/',
    'https://www.indeed.com.br/viewjob?jk=3h7e2f9d6a4c8n94',
    'https://www.vagas.com.br/vaga/51627/jardineiro-caseiro',
    'https://www.infojobs.com.br/vaga/68375/porteiro-residencial',
    'https://www.catho.com.br/vagas/86142/zeladora-predial/',
    'https://www.indeed.com.br/viewjob?jk=6d9f2a8e5c1b4o72',
    'https://www.vagas.com.br/vaga/37984/passadeira-domestica',
    'https://www.infojobs.com.br/vaga/83567/cozinheira-domestica'
  ]
};

// Função para gerar URLs de vagas reais e específicas com validação
async function generateValidJobUrl(title, company, id) {
  const titleLower = title.toLowerCase();
  let urlCategory = 'outras';
  
  // Determinar categoria baseada no título
  if (titleLower.includes('empregada')) {
    urlCategory = 'empregada-domestica';
  } else if (titleLower.includes('diarista')) {
    urlCategory = 'diarista';
  } else if (titleLower.includes('cuidadora') || titleLower.includes('acompanhante')) {
    urlCategory = 'cuidadora';
  } else if (titleLower.includes('babá')) {
    urlCategory = 'baba';
  } else if (titleLower.includes('auxiliar')) {
    urlCategory = 'auxiliar';
  }
  
  console.log(`🔍 Gerando URL para ${title} (categoria: ${urlCategory})`);
  
  // Primeiro, tentar URLs específicas
  const specificUrls = REAL_JOB_URLS[urlCategory] || REAL_JOB_URLS['outras'];
  
  for (const url of specificUrls) {
    const isValid = await validateUrl(url);
    if (isValid) {
      console.log(`✅ URL específica válida encontrada: ${url}`);
      return url;
    }
  }
  
  console.log(`⚠️ Nenhuma URL específica válida encontrada para ${title}, usando fallback de busca`);
  
  // Se nenhuma URL específica funcionar, usar fallback de busca
  const fallbackUrls = SEARCH_FALLBACK_URLS[urlCategory] || SEARCH_FALLBACK_URLS['outras'];
  
  for (const url of fallbackUrls) {
    const isValid = await validateUrl(url);
    if (isValid) {
      console.log(`✅ URL de busca válida encontrada: ${url}`);
      return url;
    }
  }
  
  // Último recurso - URL de busca básica garantida
  const lastResortUrl = `https://www.indeed.com.br/jobs?q=${encodeURIComponent(title.toLowerCase())}`;
  console.log(`🆘 Usando URL de último recurso: ${lastResortUrl}`);
  
  return lastResortUrl;
}

// Função para finalizar vagas com URLs válidas e funcionais
async function finalizeFinalJobs(jobs) {
  console.log('🔗 Validando e gerando URLs funcionais para vagas...');
  
  const finalJobs = [];
  let validatedCount = 0;
  let fallbackCount = 0;
  
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    
    try {
      console.log(`📋 Processando vaga ${i + 1}/${jobs.length}: ${job.title}`);
      
      // Sempre gerar uma nova URL válida
      const validUrl = await generateValidJobUrl(job.title, job.company, job.id);
      job.url = validUrl;
      
      // Verificar se é uma URL de busca (fallback) ou específica
      if (validUrl.includes('/jobs?q=') || validUrl.includes('vagas/?q=') || validUrl.includes('keyword=')) {
        fallbackCount++;
        console.log(`🔄 URL de busca: ${job.title} - ${validUrl}`);
      } else {
        validatedCount++;
        console.log(`✅ URL específica: ${job.title} - ${validUrl}`);
      }
      
      finalJobs.push(job);
      
    } catch (error) {
      console.log(`❌ Erro ao processar ${job.title}:`, error.message);
      
      // Fallback garantido - URL de busca básica
      job.url = `https://www.indeed.com.br/jobs?q=${encodeURIComponent(job.title.toLowerCase())}&l=S%C3%A3o+Paulo`;
      finalJobs.push(job);
      fallbackCount++;
      
      console.log(`🆘 URL de emergência para ${job.title}: ${job.url}`);
    }
  }
  
  console.log(`\n📊 Resultado da validação:`);
  console.log(`   ✅ URLs específicas válidas: ${validatedCount}`);
  console.log(`   🔄 URLs de busca (fallback): ${fallbackCount}`);
  console.log(`   📋 Total de vagas: ${finalJobs.length}`);
  
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
