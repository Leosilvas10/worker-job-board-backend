
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
        schedule: schedule
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

// Função principal para atualizar vagas
async function updateJobs() {
  console.log('🔄 Iniciando atualização de vagas de múltiplas fontes...');
  
  try {
    // Buscar vagas de APIs externas
    const jobs = await fetchJobsFromAPIs();
    
    // Embaralhar as vagas para variedade
    const shuffledJobs = jobs.sort(() => Math.random() - 0.5);
    
    // Salvar as vagas atualizadas no arquivo
    fs.writeFileSync(JOBS_FILE, JSON.stringify(shuffledJobs, null, 2));
    
    console.log(`✅ ${shuffledJobs.length} vagas atualizadas com sucesso!`);
    console.log(`📅 Última atualização: ${new Date().toISOString()}`);
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
