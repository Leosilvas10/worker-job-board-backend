import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./leads.db');

const leadsExemplo = [
  {
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    telefone: '(11) 99999-9999',
    vaga_titulo: 'Empregada Doméstica',
    vaga_id: 'fixo_1',
    trabalhou_antes: 'sim',
    ultimo_emprego: 'Casa de família',
    tempo_ultimo_emprego: '2 anos',
    motivo_demissao: 'Mudança da família',
    salario_anterior: 'R$ 1.200,00',
    experiencia_anos: 5,
    idade: 35,
    cidade: 'São Paulo',
    estado: 'SP',
    disponibilidade: 'Imediata',
    pretensao_salarial: 'R$ 1.400,00',
    observacoes: 'Tenho referências',
    fonte: 'site',
    status: 'novo'
  },
  {
    nome: 'João Santos',
    email: 'joao.santos@email.com',
    telefone: '(11) 88888-8888',
    vaga_titulo: 'Porteiro',
    vaga_id: 'fixo_3',
    trabalhou_antes: 'sim',
    ultimo_emprego: 'Condomínio residencial',
    tempo_ultimo_emprego: '3 anos',
    motivo_demissao: 'Busca melhor oportunidade',
    salario_anterior: 'R$ 1.300,00',
    experiencia_anos: 8,
    idade: 42,
    cidade: 'São Paulo',
    estado: 'SP',
    disponibilidade: 'Em 15 dias',
    pretensao_salarial: 'R$ 1.600,00',
    observacoes: 'Curso de segurança',
    fonte: 'site',
    status: 'novo'
  },
  {
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    telefone: '(21) 77777-7777',
    vaga_titulo: 'Diarista',
    vaga_id: 'fixo_2',
    trabalhou_antes: 'sim',
    ultimo_emprego: 'Casas particulares',
    tempo_ultimo_emprego: '1 ano',
    motivo_demissao: 'Quer carteira assinada',
    salario_anterior: 'R$ 100,00/dia',
    experiencia_anos: 3,
    idade: 28,
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    disponibilidade: 'Imediata',
    pretensao_salarial: 'R$ 120,00/dia',
    observacoes: 'Disponível para viagens',
    fonte: 'site',
    status: 'novo'
  },
  {
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    telefone: '(31) 66666-6666',
    vaga_titulo: 'Cuidador de Idosos',
    vaga_id: 'fixo_4',
    trabalhou_antes: 'sim',
    ultimo_emprego: 'Casa de repouso',
    tempo_ultimo_emprego: '4 anos',
    motivo_demissao: 'Fechamento da empresa',
    salario_anterior: 'R$ 1.500,00',
    experiencia_anos: 6,
    idade: 38,
    cidade: 'Belo Horizonte',
    estado: 'MG',
    disponibilidade: 'Imediata',
    pretensao_salarial: 'R$ 1.700,00',
    observacoes: 'Curso técnico em enfermagem',
    fonte: 'site',
    status: 'novo'
  },
  {
    nome: 'Lucia Ferreira',
    email: 'lucia.ferreira@email.com',
    telefone: '(85) 55555-5555',
    vaga_titulo: 'Auxiliar de Limpeza',
    vaga_id: 'fixo_5',
    trabalhou_antes: 'sim',
    ultimo_emprego: 'Empresa de limpeza',
    tempo_ultimo_emprego: '1 ano e 6 meses',
    motivo_demissao: 'Demissão sem justa causa',
    salario_anterior: 'R$ 1.100,00',
    experiencia_anos: 4,
    idade: 33,
    cidade: 'Fortaleza',
    estado: 'CE',
    disponibilidade: 'Em 1 semana',
    pretensao_salarial: 'R$ 1.300,00',
    observacoes: 'Experiência com produtos químicos',
    fonte: 'site',
    status: 'novo'
  }
];

async function popularLeads() {
  console.log('🗄️ Populando banco com leads de exemplo...');
  
  const stmt = db.prepare(`
    INSERT INTO leads (
      nome, email, telefone, vaga_titulo, vaga_id, trabalhou_antes,
      ultimo_emprego, tempo_ultimo_emprego, motivo_demissao, salario_anterior,
      experiencia_anos, idade, cidade, estado, disponibilidade, pretensao_salarial,
      observacoes, fonte, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let inseridos = 0;
  
  for (const lead of leadsExemplo) {
    try {
      stmt.run([
        lead.nome,
        lead.email,
        lead.telefone,
        lead.vaga_titulo,
        lead.vaga_id,
        lead.trabalhou_antes,
        lead.ultimo_emprego,
        lead.tempo_ultimo_emprego,
        lead.motivo_demissao,
        lead.salario_anterior,
        lead.experiencia_anos,
        lead.idade,
        lead.cidade,
        lead.estado,
        lead.disponibilidade,
        lead.pretensao_salarial,
        lead.observacoes,
        lead.fonte,
        lead.status
      ]);
      inseridos++;
      console.log(`✅ Lead inserido: ${lead.nome}`);
    } catch (error) {
      console.error(`❌ Erro ao inserir lead ${lead.nome}:`, error.message);
    }
  }
  
  stmt.finalize();
  console.log(`✅ ${inseridos} leads de exemplo inseridos!`);
  
  db.close();
}

popularLeads();
