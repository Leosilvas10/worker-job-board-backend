
const fs = require('fs');
const path = require('path');

// Arquivo para persistir as vagas
const JOBS_FILE = 'jobs-data.json';

// Função para buscar vagas de APIs externas ou gerar vagas atualizadas
async function updateJobs() {
  console.log('🔄 Atualizando vagas...');
  
  // Aqui você pode integrar com APIs de vagas reais
  // Por exemplo: Indeed, Catho, InfoJobs, etc.
  const updatedJobs = [
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
    },
    {
      id: Date.now() + 1,
      title: "Diarista - 3x por semana",
      company: "Residência Particular",
      salary: "R$ 150,00/dia",
      type: "Diarista",
      timeAgo: "Há 2 horas",
      description: "Limpeza residencial. Disponibilidade para segunda, quarta e sexta.",
      tags: ["Diarista", "Flexível"],
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 2,
      title: "Cuidadora de Idosos",
      company: "Família Oliveira",
      salary: "R$ 1.600,00",
      type: "CLT",
      timeAgo: "Há 3 horas",
      description: "Cuidados com idoso. Experiência e paciência necessárias.",
      tags: ["Cuidadora", "Idoso"],
      createdAt: new Date().toISOString()
    }
  ];

  try {
    // Salvar as vagas atualizadas no arquivo
    fs.writeFileSync(JOBS_FILE, JSON.stringify(updatedJobs, null, 2));
    console.log(`✅ ${updatedJobs.length} vagas atualizadas com sucesso!`);
    console.log(`📅 Última atualização: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Erro ao salvar vagas:', error);
  }
}

// Executar a atualização
updateJobs();
