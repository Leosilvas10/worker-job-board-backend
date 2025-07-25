// Módulo para buscar vagas de múltiplas fontes
const axios = require('axios');

// Funções mock para cada fonte (substitua por scraping real ou API)
async function fetchCathoJobs() {
  // Exemplo: Catho não tem API pública, então simulação
  return [
    {
      id: 'catho_1',
      title: 'Doméstica - Catho',
      company: 'Catho LTDA',
      location: 'São Paulo, SP',
      salary: 'R$ 1.400,00',
      description: 'Limpeza e organização residencial.',
      type: 'CLT',
      category: 'Doméstica',
      source: 'Catho',
      external_url: 'https://www.catho.com.br/vagas/domestica',
      tags: ['doméstica', 'limpeza'],
      created_at: new Date().toISOString()
    }
  ];
}

const cheerio = require('cheerio');
async function fetchInfoJobs() {
  try {
    const url = 'https://www.infojobs.com.br/vagas-de-domestica.aspx';
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const jobs = [];
    $('.js-job-item').each((i, el) => {
      if (i >= 20) return false; // Limita para performance
      const title = $(el).find('.js-title-job').text().trim();
      const company = $(el).find('.js-company-name').text().trim();
      const location = $(el).find('.js-location').text().trim();
      const salary = $(el).find('.js-salary').text().trim() || 'Não informado';
      const description = $(el).find('.js-description-job').text().trim();
      const external_url = 'https://www.infojobs.com.br' + ($(el).find('.js-title-job').attr('href') || '');
      jobs.push({
        id: `infojobs_${i}`,
        title,
        company,
        location,
        salary,
        description,
        type: title.toLowerCase().includes('diarista') ? 'Diarista' : 'CLT',
        category: 'Doméstica',
        source: 'InfoJobs',
        external_url,
        tags: ['doméstica', 'limpeza'],
        created_at: new Date().toISOString()
      });
    });
    console.log(`[InfoJobs] Vagas coletadas: ${jobs.length}`);
    if (jobs.length === 0) {
      console.warn('[InfoJobs] Nenhuma vaga real encontrada, usando fallback mock.');
      return [
        {
          id: 'infojobs_mock_1',
          title: 'Diarista - InfoJobs (Mock)',
          company: 'InfoJobs Serviços',
          location: 'Rio de Janeiro, RJ',
          salary: 'R$ 120,00/dia',
          description: 'Limpeza de apartamento.',
          type: 'Diarista',
          category: 'Doméstica',
          source: 'InfoJobs',
          external_url: 'https://www.infojobs.com.br/vagas-diarista.aspx',
          tags: ['diarista', 'limpeza'],
          created_at: new Date().toISOString()
        }
      ];
    }
    return jobs;
  } catch (error) {
    console.error('Erro ao coletar vagas do InfoJobs:', error.message);
    return [
      {
        id: 'infojobs_mock_1',
        title: 'Diarista - InfoJobs (Mock)',
        company: 'InfoJobs Serviços',
        location: 'Rio de Janeiro, RJ',
        salary: 'R$ 120,00/dia',
        description: 'Limpeza de apartamento.',
        type: 'Diarista',
        category: 'Doméstica',
        source: 'InfoJobs',
        external_url: 'https://www.infojobs.com.br/vagas-diarista.aspx',
        tags: ['diarista', 'limpeza'],
        created_at: new Date().toISOString()
      }
    ];
  }
}

async function fetchIndeedJobs() {
  // Exemplo: Indeed não tem API pública, então simulação
  return [
    {
      id: 'indeed_1',
      title: 'Auxiliar de Limpeza - Indeed',
      company: 'Indeed Ltda',
      location: 'Belo Horizonte, MG',
      salary: 'R$ 1.350,00',
      description: 'Limpeza comercial.',
      type: 'CLT',
      category: 'Limpeza',
      source: 'Indeed',
      external_url: 'https://br.indeed.com/q-limpeza-vagas.html',
      tags: ['limpeza', 'comercial'],
      created_at: new Date().toISOString()
    }
  ];
}

async function fetchLinkedinJobs() {
  // Exemplo: LinkedIn não tem API pública, então simulação
  return [
    {
      id: 'linkedin_1',
      title: 'Porteiro - LinkedIn',
      company: 'LinkedIn RH',
      location: 'Curitiba, PR',
      salary: 'R$ 1.500,00',
      description: 'Controle de acesso.',
      type: 'CLT',
      category: 'Portaria',
      source: 'LinkedIn',
      external_url: 'https://www.linkedin.com/jobs/porteiro',
      tags: ['porteiro', 'acesso'],
      created_at: new Date().toISOString()
    }
  ];
}

async function fetchJoobleJobs() {
  // Exemplo: Jooble não tem API pública, então simulação
  return [
    {
      id: 'jooble_1',
      title: 'Doméstica - Jooble',
      company: 'Jooble RH',
      location: 'Porto Alegre, RS',
      salary: 'R$ 1.320,00',
      description: 'Limpeza geral.',
      type: 'CLT',
      category: 'Doméstica',
      source: 'Jooble',
      external_url: 'https://br.jooble.org/vagas-de-emprego-domestica',
      tags: ['doméstica', 'limpeza'],
      created_at: new Date().toISOString()
    }
  ];
}

// Função principal para buscar e combinar vagas
async function fetchAllJobs() {
  const results = await Promise.all([
    fetchCathoJobs(),
    fetchInfoJobs(),
    fetchIndeedJobs(),
    fetchLinkedinJobs(),
    fetchJoobleJobs()
  ]);
  // Achata e embaralha
  let jobs = results.flat();
  // Simula 100 vagas (repete mocks)
  while (jobs.length < 100) {
    jobs = jobs.concat(jobs.slice(0, 100 - jobs.length));
  }
  jobs = jobs.slice(0, 100);
  return jobs;
}

// Seleciona 6 vagas em destaque
function getFeaturedJobs(jobs) {
  return jobs.slice(0, 6);
}

module.exports = {
  fetchAllJobs,
  getFeaturedJobs
};
