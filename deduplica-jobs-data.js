// deduplica-jobs-data.js
// Use este script localmente na raiz do seu projeto backend (onde fica o jobs-data.json)
// Como rodar: node deduplica-jobs-data.js

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'jobs-data.json');

if (!fs.existsSync(filePath)) {
  console.error('Arquivo jobs-data.json não encontrado nesta pasta:', filePath);
  process.exit(1);
}

const vagas = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Remove duplicadas por id
const vagasUnicas = [];
const ids = new Set();
for (const vaga of vagas) {
  if (!ids.has(vaga.id)) {
    vagasUnicas.push(vaga);
    ids.add(vaga.id);
  }
}

// Se quiser garantir pelo menos 6 vagas, adicione manualmente aqui:
while (vagasUnicas.length < 6) {
  vagasUnicas.push({
    id: `vaga_extra_${vagasUnicas.length}`,
    title: `Vaga Extra ${vagasUnicas.length + 1}`,
    company: 'Empresa Extra',
    location: 'Brasil',
    salary: 'A combinar',
    description: 'Descrição de exemplo de vaga extra.',
    type: 'CLT',
    category: 'Geral',
    source: 'Manual',
    external_url: '',
    tags: ['extra'],
    created_at: new Date().toISOString()
  });
}

fs.writeFileSync(filePath, JSON.stringify(vagasUnicas.slice(0, 100), null, 2));
console.log(`✅ jobs-data.json ajustado! Total de vagas únicas: ${vagasUnicas.length}`);
