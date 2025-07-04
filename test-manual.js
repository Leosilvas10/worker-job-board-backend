// Teste simples usando apenas módulos nativos do Node.js
import http from 'http';

const API_BASE = 'localhost';
const API_PORT = 3001;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (err) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testarBackend() {
  console.log('🧪 Testando Backend - Site do Trabalhador\n');
  
  try {
    // 1. Testar API raiz
    console.log('1. Testando API raiz...');
    const root = await makeRequest('/');
    if (root.status === 200) {
      console.log('✅ API funcionando:', root.data.message);
      console.log('   Features:', root.data.features?.join(', ') || 'N/A');
    } else {
      console.log('❌ Erro na API raiz:', root.status);
    }
    
    // 2. Testar criação de lead
    console.log('\n2. Testando criação de lead...');
    const novoLead = {
      nome: 'João Silva Teste',
      email: 'joao.teste@email.com',
      telefone: '(11) 99999-9999',
      vaga_titulo: 'Desenvolvedor Full Stack',
      trabalhou_antes: 'sim',
      ultimo_emprego: 'Empresa XYZ',
      salario_anterior: 'R$ 5.000',
      experiencia_anos: 3
    };
    
    const leadResponse = await makeRequest('/api/leads', 'POST', novoLead);
    if (leadResponse.status === 200) {
      console.log('✅ Lead criado:', leadResponse.data.message);
    } else {
      console.log('❌ Erro ao criar lead:', leadResponse.status, leadResponse.data);
    }
    
    // 3. Listar leads
    console.log('\n3. Listando leads...');
    const leads = await makeRequest('/api/leads');
    if (leads.status === 200) {
      console.log(`✅ Total de leads: ${leads.data.leads?.length || 0}`);
      if (leads.data.leads?.length > 0) {
        console.log('   Último lead:', leads.data.leads[0].nome);
      }
    } else {
      console.log('❌ Erro ao listar leads:', leads.status);
    }
    
    // 4. Testar sincronização de vagas
    console.log('\n4. Testando sincronização de vagas...');
    const sync = await makeRequest('/api/vagas/sync', 'POST');
    if (sync.status === 200) {
      console.log('✅ Sync de vagas:', sync.data.message);
    } else {
      console.log('❌ Erro na sincronização:', sync.status);
    }
    
    // 5. Listar vagas
    console.log('\n5. Listando vagas...');
    const vagas = await makeRequest('/api/vagas');
    if (vagas.status === 200) {
      console.log(`✅ Total de vagas: ${vagas.data.vagas?.length || 0}`);
    } else {
      console.log('❌ Erro ao listar vagas:', vagas.status);
    }
    
    console.log('\n🎉 Todos os testes concluídos!');
    console.log('\n📊 Para acessar o painel admin, abra: http://localhost:3001/api/leads');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    console.log('\n💡 Certifique-se de que o backend está rodando:');
    console.log('   npm start');
    console.log('\n   Aguarde alguns segundos e tente novamente.');
  }
}

testarBackend();
