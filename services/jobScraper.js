import axios from 'axios';
import * as cheerio from 'cheerio';

class JobScraper {
  constructor() {
    this.apis = [
      {
        name: 'sine',
        url: 'https://www.sine.com.br/oportunidades/vagas',
        type: 'scraping',
        active: true,
        categories: ['domestica', 'porteiro', 'limpeza', 'cuidador', 'motorista', 'vendedor']
      },
      {
        name: 'catho',
        url: 'https://www.catho.com.br/vagas',
        type: 'scraping', 
        active: true,
        categories: ['auxiliar-limpeza', 'porteiro', 'domestica', 'cuidador', 'motorista']
      },
      {
        name: 'infojobs',
        url: 'https://www.infojobs.com.br/vagas-de-emprego',
        type: 'scraping',
        active: true,
        categories: ['limpeza', 'portaria', 'domestica', 'cuidados', 'transporte']
      },
      {
        name: 'indeed',
        url: 'https://br.indeed.com/jobs',
        type: 'scraping',
        active: true,
        categories: ['domestica', 'porteiro', 'limpeza', 'cuidador', 'motorista', 'vendedor']
      },
      {
        name: 'vagas_com',
        url: 'https://www.vagas.com.br/vagas-de',
        type: 'scraping',
        active: true,
        categories: ['auxiliar-limpeza', 'porteiro', 'domestica', 'cuidador-idosos', 'motorista']
      }
    ];
  }

  // Buscar vagas REAIS do SINE (Sistema Nacional de Emprego)
  async fetchFromSINE() {
    const jobs = [];
    const categories = ['auxiliar-domestica', 'porteiro', 'auxiliar-limpeza', 'cuidador-idosos', 'motorista'];
    
    try {
      console.log('🏛️ Buscando vagas REAIS do SINE...');
      
      for (const category of categories) {
        const searchUrl = `https://www.sine.com.br/oportunidades/vagas/${category}`;
        
        const response = await axios.get(searchUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          }
        });

        const $ = cheerio.load(response.data);
        
        // Buscar vagas na estrutura do SINE
        $('.vaga-item, .job-item, .opportunity-item').each((i, element) => {
          try {
            const title = $(element).find('.vaga-titulo, .job-title, h3, h4').text().trim();
            const company = $(element).find('.empresa, .company, .employer').text().trim();
            const location = $(element).find('.localizacao, .location, .local').text().trim();
            const salary = $(element).find('.salario, .salary, .wage').text().trim();
            const description = $(element).find('.descricao, .description, .summary').text().trim();
            const link = $(element).find('a').attr('href');

            if (title && company) {
              jobs.push({
                external_id: `sine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                titulo: this.cleanText(title),
                empresa: this.cleanText(company),
                localizacao: this.removeCity(location || 'São Paulo, SP'),
                salario: this.formatSalary(salary || 'A combinar'),
                descricao: this.cleanText(description || 'Descrição disponível no site oficial.'),
                tipo: 'CLT',
                categoria: this.categorizeJob(title),
                fonte: 'SINE',
                external_url: link ? (link.startsWith('http') ? link : `https://www.sine.com.br${link}`) : '',
                tags: JSON.stringify(this.extractTags(title)),
                ativa: 1,
                featured: false
              });
            }
          } catch (err) {
            console.error('Erro ao processar vaga do SINE:', err);
          }
        });

        // Aguardar entre requisições para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('❌ Erro ao buscar do SINE:', error.message);
    }

    console.log(`📊 SINE: ${jobs.length} vagas encontradas`);
    return jobs.slice(0, 20); // Limitar a 20 vagas do SINE
  }

  // Buscar vagas REAIS do Catho
  async fetchFromCatho() {
    const jobs = [];
    const categories = ['auxiliar-limpeza', 'porteiro', 'domestica', 'cuidador', 'motorista'];
    
    try {
      console.log('💼 Buscando vagas REAIS do Catho...');
      
      for (const category of categories) {
        const searchUrl = `https://www.catho.com.br/vagas/${category}`;
        
        const response = await axios.get(searchUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
          }
        });

        const $ = cheerio.load(response.data);
        
        // Buscar vagas na estrutura do Catho
        $('.job-card, .vaga-card, .opportunity').each((i, element) => {
          try {
            const title = $(element).find('.job-title, .vaga-titulo, h3, h4').text().trim();
            const company = $(element).find('.company-name, .empresa, .company').text().trim();
            const location = $(element).find('.job-location, .localizacao, .location').text().trim();
            const salary = $(element).find('.salary, .salario, .wage').text().trim();
            const link = $(element).find('a').attr('href');

            if (title && company) {
              jobs.push({
                external_id: `catho_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                titulo: this.cleanText(title),
                empresa: this.cleanText(company),
                localizacao: this.removeCity(location || 'São Paulo, SP'),
                salario: this.formatSalary(salary || 'A combinar'),
                descricao: 'Vaga disponível no Catho. Clique para ver detalhes completos.',
                tipo: 'CLT',
                categoria: this.categorizeJob(title),
                fonte: 'Catho',
                external_url: link ? (link.startsWith('http') ? link : `https://www.catho.com.br${link}`) : '',
                tags: JSON.stringify(this.extractTags(title)),
                ativa: 1,
                featured: false
              });
            }
          } catch (err) {
            console.error('Erro ao processar vaga do Catho:', err);
          }
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('❌ Erro ao buscar do Catho:', error.message);
    }

    console.log(`📊 Catho: ${jobs.length} vagas encontradas`);
    return jobs.slice(0, 20);
  }

  // Buscar vagas REAIS do InfoJobs
  async fetchFromInfoJobs() {
    const jobs = [];
    const categories = ['limpeza', 'portaria', 'domestica', 'cuidados', 'transporte'];
    
    try {
      console.log('🔍 Buscando vagas REAIS do InfoJobs...');
      
      for (const category of categories) {
        const searchUrl = `https://www.infojobs.com.br/vagas-de-emprego-${category}.aspx`;
        
        const response = await axios.get(searchUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });

        const $ = cheerio.load(response.data);
        
        $('.js-offer-list-item, .offer-item, .job-item').each((i, element) => {
          try {
            const title = $(element).find('.js-offer-title, .offer-title, h3').text().trim();
            const company = $(element).find('.js-offer-company, .company-name, .company').text().trim();
            const location = $(element).find('.offer-location, .location').text().trim();
            const salary = $(element).find('.offer-salary, .salary').text().trim();
            const link = $(element).find('a.js-offer-title, a').attr('href');

            if (title && title.length > 3) {
              jobs.push({
                external_id: `infojobs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                titulo: this.cleanText(title),
                empresa: this.cleanText(company || 'Empresa Confidencial'),
                localizacao: this.removeCity(location || 'São Paulo, SP'),
                salario: this.formatSalary(salary || 'A combinar'),
                descricao: 'Vaga disponível no InfoJobs. Clique para ver mais detalhes.',
                tipo: 'CLT',
                categoria: this.categorizeJob(title),
                fonte: 'InfoJobs',
                external_url: link ? (link.startsWith('http') ? link : `https://www.infojobs.com.br${link}`) : '',
                tags: JSON.stringify(this.extractTags(title)),
                ativa: 1,
                featured: false
              });
            }
          } catch (err) {
            console.error('Erro ao processar vaga do InfoJobs:', err);
          }
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('❌ Erro ao buscar do InfoJobs:', error.message);
    }

    console.log(`📊 InfoJobs: ${jobs.length} vagas encontradas`);
    return jobs.slice(0, 20);
  }

  // Buscar vagas REAIS do Indeed
  async fetchFromIndeed() {
    const jobs = [];
    const queries = ['auxiliar+domestica', 'porteiro', 'auxiliar+limpeza', 'cuidador+idosos', 'motorista+entregador'];
    
    try {
      console.log('🌐 Buscando vagas REAIS do Indeed...');
      
      for (const query of queries) {
        const searchUrl = `https://br.indeed.com/jobs?q=${query}&l=Brasil`;
        
        const response = await axios.get(searchUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });

        const $ = cheerio.load(response.data);
        
        $('[data-result-id], .job_seen_beacon, .result').each((i, element) => {
          try {
            const title = $(element).find('h2 a span, .jobTitle a span, h2 span').text().trim();
            const company = $(element).find('.companyName span, .companyName a', ).text().trim();
            const location = $(element).find('.companyLocation', ).text().trim();
            const salary = $(element).find('.salary-snippet span, .estimated-salary span').text().trim();
            const summary = $(element).find('.summary ul li, .job-summary').text().trim();
            const link = $(element).find('h2 a, .jobTitle a').attr('href');

            if (title && title.length > 3) {
              jobs.push({
                external_id: `indeed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                titulo: this.cleanText(title),
                empresa: this.cleanText(company || 'Empresa Confidencial'),
                localizacao: this.removeCity(location || 'São Paulo, SP'),
                salario: this.formatSalary(salary || 'A combinar'),
                descricao: this.cleanText(summary || 'Vaga disponível no Indeed. Clique para ver detalhes.'),
                tipo: 'CLT',
                categoria: this.categorizeJob(title),
                fonte: 'Indeed',
                external_url: link ? (link.startsWith('http') ? link : `https://br.indeed.com${link}`) : '',
                tags: JSON.stringify(this.extractTags(title)),
                ativa: 1,
                featured: false
              });
            }
          } catch (err) {
            console.error('Erro ao processar vaga do Indeed:', err);
          }
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error('❌ Erro ao buscar do Indeed:', error.message);
    }

    console.log(`📊 Indeed: ${jobs.length} vagas encontradas`);
    return jobs.slice(0, 25);
  }

  // Buscar vagas REAIS do Vagas.com
  async fetchFromVagasCom() {
    const jobs = [];
    const categories = ['auxiliar-limpeza', 'porteiro', 'domestica', 'cuidador-idosos', 'motorista'];
    
    try {
      console.log('💻 Buscando vagas REAIS do Vagas.com...');
      
      for (const category of categories) {
        const searchUrl = `https://www.vagas.com.br/vagas-de-${category}`;
        
        const response = await axios.get(searchUrl, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });

        const $ = cheerio.load(response.data);
        
        $('.vaga, .job-card, .opportunity').each((i, element) => {
          try {
            const title = $(element).find('.vaga-titulo, .job-title, h3, h4').text().trim();
            const company = $(element).find('.empresa, .company-name').text().trim();
            const location = $(element).find('.localizacao, .location').text().trim();
            const salary = $(element).find('.salario, .salary').text().trim();
            const link = $(element).find('a').attr('href');

            if (title && title.length > 3) {
              jobs.push({
                external_id: `vagas_com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                titulo: this.cleanText(title),
                empresa: this.cleanText(company || 'Empresa Confidencial'),
                localizacao: this.removeCity(location || 'São Paulo, SP'),
                salario: this.formatSalary(salary || 'A combinar'),
                descricao: 'Vaga disponível no Vagas.com. Clique para ver mais informações.',
                tipo: 'CLT',
                categoria: this.categorizeJob(title),
                fonte: 'Vagas.com',
                external_url: link ? (link.startsWith('http') ? link : `https://www.vagas.com.br${link}`) : '',
                tags: JSON.stringify(this.extractTags(title)),
                ativa: 1,
                featured: false
              });
            }
          } catch (err) {
            console.error('Erro ao processar vaga do Vagas.com:', err);
          }
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error('❌ Erro ao buscar do Vagas.com:', error.message);
    }

    console.log(`📊 Vagas.com: ${jobs.length} vagas encontradas`);
    return jobs.slice(0, 20);
  }

  // Limpar texto extraído
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\n\r\t]/g, ' ')
      .trim()
      .substring(0, 200); // Limitar tamanho
  }
  // Buscar vagas de APIs reais
  async fetchFromAPIs() {
    console.log('🚀 Iniciando busca de vagas REAIS de todas as fontes...');
    const allJobs = [];

    try {
      // Buscar de todas as fontes em paralelo
      const [sineJobs, cathoJobs, infoJobsJobs, indeedJobs, vagasComJobs] = await Promise.allSettled([
        this.fetchFromSINE(),
        this.fetchFromCatho(), 
        this.fetchFromInfoJobs(),
        this.fetchFromIndeed(),
        this.fetchFromVagasCom()
      ]);

      // Processar resultados
      if (sineJobs.status === 'fulfilled') allJobs.push(...sineJobs.value);
      if (cathoJobs.status === 'fulfilled') allJobs.push(...cathoJobs.value);
      if (infoJobsJobs.status === 'fulfilled') allJobs.push(...infoJobsJobs.value);
      if (indeedJobs.status === 'fulfilled') allJobs.push(...indeedJobs.value);
      if (vagasComJobs.status === 'fulfilled') allJobs.push(...vagasComJobs.value);

      // Remover duplicatas baseado no título e empresa
      const uniqueJobs = this.removeDuplicates(allJobs);
      
      // Embaralhar para misturar fontes
      this.shuffleArray(uniqueJobs);

      // Selecionar as 6 melhores para featured (maiores salários)
      const sortedBySalary = [...uniqueJobs].sort((a, b) => {
        const salaryA = this.extractSalaryNumber(a.salario);
        const salaryB = this.extractSalaryNumber(b.salario);
        return salaryB - salaryA;
      });

      // Marcar as 6 primeiras como featured
      sortedBySalary.slice(0, 6).forEach(job => {
        job.featured = true;
      });

      console.log(`✅ Total de vagas REAIS coletadas: ${uniqueJobs.length}`);
      console.log(`🔥 Vagas em destaque: ${sortedBySalary.slice(0, 6).length}`);
      
      return uniqueJobs;

    } catch (error) {
      console.error('❌ Erro geral na busca de vagas:', error);
      return [];
    }
  }

  // Remover duplicatas
  removeDuplicates(jobs) {
    const seen = new Set();
    return jobs.filter(job => {
      const key = `${job.titulo.toLowerCase()}_${job.empresa.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Embaralhar array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Extrair número do salário para ordenação
  extractSalaryNumber(salary) {
    if (!salary || salary === 'A combinar') return 1000;
    const numbers = salary.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers.join(''));
    }
    return 1000;
  }

  // Remover cidade da localização (conforme solicitado)
  removeCity(location) {
    // Manter apenas estado ou região genérica
    if (location.includes(',')) {
      const parts = location.split(',');
      return parts[parts.length - 1].trim(); // Retorna apenas o estado
    }
    return 'Brasil'; // Genérico se não tiver vírgula
  }

  // Formatar salário
  formatSalary(salary) {
    if (!salary) return 'A combinar';
    
    if (typeof salary === 'number') {
      return `R$ ${salary.toLocaleString('pt-BR')},00`;
    }
    
    if (typeof salary === 'string') {
      // Tentar extrair números do salário
      const numbers = salary.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const value = parseInt(numbers[0]);
        if (value > 100) {
          return `R$ ${value.toLocaleString('pt-BR')},00`;
        }
      }
    }
    
    return 'A combinar';
  }

  // Categorizar vaga baseada no título
  categorizeJob(title) {
    const categories = {
      'doméstica': 'Doméstica',
      'limpeza': 'Limpeza', 
      'porteiro': 'Portaria',
      'segurança': 'Segurança',
      'cuidador': 'Cuidados',
      'motorista': 'Transporte',
      'vendedor': 'Vendas',
      'atendente': 'Atendimento',
      'auxiliar': 'Auxiliar'
    };

    const titleLower = title.toLowerCase();
    for (const [keyword, category] of Object.entries(categories)) {
      if (titleLower.includes(keyword)) {
        return category;
      }
    }
    
    return 'Outros';
  }

  // Extrair tags do título da vaga
  extractTags(title) {
    const commonTags = {
      'doméstica': ['doméstica', 'limpeza', 'casa'],
      'porteiro': ['porteiro', 'portaria', 'recepção'],
      'limpeza': ['limpeza', 'faxina', 'organização'],
      'cuidador': ['cuidador', 'idosos', 'acompanhante'],
      'motorista': ['motorista', 'entrega', 'transporte'],
      'vendedor': ['vendas', 'atendimento', 'cliente']
    };

    const titleLower = title.toLowerCase();
    for (const [keyword, tags] of Object.entries(commonTags)) {
      if (titleLower.includes(keyword)) {
        return tags;
      }
    }
    
    return ['emprego', 'trabalho'];
  }

  // Buscar todas as vagas REAIS (método principal)
  async fetchAllJobs() {
    console.log('🔄 Iniciando busca de vagas REAIS de todas as fontes...');
    
    try {
      // Buscar vagas reais de todas as APIs
      const realJobs = await this.fetchFromAPIs();
      
      if (realJobs.length === 0) {
        console.warn('⚠️ NENHUMA vaga real encontrada nas APIs!');
        return [];
      }
      
      console.log(`✅ Total de vagas REAIS coletadas: ${realJobs.length}`);
      console.log(`🔥 Vagas em destaque: ${realJobs.filter(job => job.featured).length}`);
      
      return realJobs;

    } catch (error) {
      console.error('❌ Erro na busca de vagas:', error);
      return [];
    }
  }
}

export default JobScraper;
