const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Cabeçalhos para enganar bloqueio
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://www.google.com/',
  'Connection': 'keep-alive',
};
const COOKIES = ''; // Se quiser adicionar cookies manualmente, coloque aqui.

const PROFISSOES = [
  { termo: 'diarista', url: {
    olx: 'https://www.olx.com.br/servicos/diarista',
    indeed: 'https://br.indeed.com/jobs?q=diarista&l=Belo+Horizonte%2C+MG',       
    jooble: 'https://br.jooble.org/vagas-de-emprego-diarista/Belo-Horizonte%2C-MG'
  }},
  { termo: 'babá', url: {
    babysits: 'https://www.babysits.com.br/trabalho-de-bab%C3%A1/',
    indeed: 'https://br.indeed.com/jobs?q=babá&l=Belo+Horizonte%2C+MG',
    jooble: 'https://br.jooble.org/vagas-de-emprego-babá/Belo-Horizonte%2C+MG'    
  }},
  { termo: 'porteiro', url: {
    indeed: 'https://br.indeed.com/jobs?q=porteiro&l=Belo+Horizonte%2C+MG',       
    jooble: 'https://br.jooble.org/vagas-de-emprego-porteiro/Belo-Horizonte%2C+MG'
  }},
  { termo: 'auxiliar de serviços', url: {
    indeed: 'https://br.indeed.com/jobs?q=auxiliar+de+serviços+gerais&l=Belo+Horizonte%2C+MG',
    jooble: 'https://br.jooble.org/vagas-de-emprego-auxiliar-de-serviços/Belo-Horizonte%2C+MG'
  }},
  { termo: 'telemarketing', url: {
    indeed: 'https://br.indeed.com/jobs?q=telemarketing&l=Belo+Horizonte%2C+MG',
    jooble: 'https://br.jooble.org/vagas-de-emprego-telemarketing/Belo-Horizonte%2C+MG'
  }},
  { termo: 'recepcionista', url: {
    indeed: 'https://br.indeed.com/jobs?q=recepcionista&l=Belo+Horizonte%2C+MG',
    jooble: 'https://br.jooble.org/vagas-de-emprego-recepcionista/Belo-Horizonte%2C+MG'
  }},
];

function limitar(texto, max = 200) {
  if (!texto) return '';
  return texto.length > max ? texto.slice(0, max) + '...' : texto;
}

// OLX Diarista
async function buscarOLX() {
  const url = 'https://www.olx.com.br/servicos/diarista';
  const vagas = [];
  try {
    const { data: html } = await axios.get(url, {
      headers: { ...HEADERS, Cookie: COOKIES },
      timeout: 20000,
      maxRedirects: 5,
      validateStatus: null,
    });
    const $ = cheerio.load(html);
    $('[data-lurker-detail="list_id"]').each((i, elem) => {
      const titulo = $(elem).find('h2').text().trim();
      const descricao = limitar($(elem).find('p').text().trim(), 240);
      const urlOriginal = 'https://www.olx.com.br' + $(elem).find('a').attr('href');
      if (titulo) {
        vagas.push({
          profissao: 'Diarista',
          titulo,
          descricao,
          urlOriginal,
          fonte: 'OLX',
        });
      }
    });
    console.log(`✅ OLX: ${vagas.length} vagas coletadas`);
  } catch (err) {
    console.log('Erro OLX:', err.message);
  }
  return vagas;
}

// Babysits Babá
async function buscarBabysits() {
  const url = 'https://www.babysits.com.br/trabalho-de-bab%C3%A1/';
  const vagas = [];
  try {
    const { data: html } = await axios.get(url, {
      headers: { ...HEADERS, Cookie: COOKIES },
      timeout: 20000,
      maxRedirects: 5,
      validateStatus: null,
    });
    const $ = cheerio.load(html);
    $('.result').each((i, elem) => {
      const titulo = $(elem).find('.card__title').text().trim();
      const descricao = limitar($(elem).find('.card__text').text().trim(), 240);
      const urlOriginal = 'https://www.babysits.com.br' + $(elem).find('a').attr('href');
      if (titulo) {
        vagas.push({
          profissao: 'Babá',
          titulo,
          descricao,
          urlOriginal,
          fonte: 'Babysits',
        });
      }
    });
    console.log(`✅ Babysits: ${vagas.length} vagas coletadas`);
  } catch (err) {
    console.log('Erro Babysits:', err.message);
  }
  return vagas;
}

// Indeed (todas profissões)
async function buscarIndeed(termo, profissao) {
  const url = `https://br.indeed.com/jobs?q=${encodeURIComponent(termo)}&l=Belo+Horizonte%2C+MG`;
  const vagas = [];
  try {
    const { data: html } = await axios.get(url, {
      headers: { ...HEADERS, Cookie: COOKIES },
      timeout: 20000,
      maxRedirects: 5,
      validateStatus: null,
    });
    const $ = cheerio.load(html);
    $('a.tapItem').each((i, elem) => {
      const titulo = $(elem).find('h2.jobTitle').text().trim();
      const descricao = limitar($(elem).find('.job-snippet').text().trim(), 240);
      const urlOriginal = 'https://br.indeed.com' + $(elem).attr('href');
      if (titulo) {
        vagas.push({
          profissao,
          titulo,
          descricao,
          urlOriginal,
          fonte: 'Indeed',
        });
      }
    });
    console.log(`✅ Indeed (${profissao}): ${vagas.length} vagas coletadas`);
  } catch (err) {
    console.log(`Erro Indeed (${profissao}):`, err.message);
  }
  return vagas;
}

// Jooble (todas profissões)
async function buscarJooble(termo, profissao) {
  const url = `https://br.jooble.org/vagas-de-emprego-${encodeURIComponent(termo.replace(/\\s/g, '-'))}/Belo-Horizonte%2C+MG`;
  const vagas = [];
  try {
    const { data: html } = await axios.get(url, {
      headers: { ...HEADERS, Cookie: COOKIES },
      timeout: 20000,
      maxRedirects: 5,
      validateStatus: null,
    });
    const $ = cheerio.load(html);
    $('.result__item').each((i, elem) => {
      const titulo = $(elem).find('.result__title').text().trim();
      const descricao = limitar($(elem).find('.result__snippet').text().trim(), 240);
      const urlOriginal = 'https://br.jooble.org' + $(elem).find('.result__title a').attr('href');
      if (titulo) {
        vagas.push({
          profissao,
          titulo,
          descricao,
          urlOriginal,
          fonte: 'Jooble',
        });
      }
    });
    console.log(`✅ Jooble (${profissao}): ${vagas.length} vagas coletadas`);
  } catch (err) {
    console.log(`Erro Jooble (${profissao}):`, err.message);
  }
  return vagas;
}

// Junta tudo
async function importarTodasVagas() {
  let allVagas = [];
  const olx = await buscarOLX();
  allVagas = allVagas.concat(olx);
  const babysits = await buscarBabysits();
  allVagas = allVagas.concat(babysits);
  for (const { termo, url, } of PROFISSOES) {
    if (url.indeed) {
      const ind = await buscarIndeed(termo, termo.charAt(0).toUpperCase() + termo.slice(1));
      allVagas = allVagas.concat(ind);
    }
    if (url.jooble) {
      const jbl = await buscarJooble(termo, termo.charAt(0).toUpperCase() + termo.slice(1));
      allVagas = allVagas.concat(jbl);
    }
  }
  const unique = [];
  const seen = new Set();
  for (const vaga of allVagas) {
    if (vaga.urlOriginal && !seen.has(vaga.urlOriginal)) {
      unique.push(vaga);
      seen.add(vaga.urlOriginal);
    }
  }
  fs.writeFileSync('./data/jobs-data.json', JSON.stringify(unique, null, 2), 'utf-8');
  console.log(`\n✅ jobs-data.json gerado com ${unique.length} vagas reais de ${PROFISSOES.length} profissões!`);
}

if (require.main === module) {
  importarTodasVagas();
}
