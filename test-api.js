// Script de teste para verificar se a API simple-jobs está funcionando
import { promises as fs } from 'fs';
import path from 'path';

async function testSimpleJobsAPI() {
  try {
    console.log('🧪 Testando API de simple-jobs...');
    
    // Importar diretamente a função da API
    const apiPath = './pages/api/simple-jobs.js';
    const { default: handler } = await import(apiPath);
    
    // Simular uma requisição
    const mockReq = {
      method: 'GET',
      headers: {
        'content-type': 'application/json'
      }
    };
    
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      },
      setHeader: function(name, value) {
        this.headers = this.headers || {};
        this.headers[name] = value;
      },
      end: function() {}
    };
    
    // Executar o handler
    await handler(mockReq, mockRes);
    
    // Verificar resultado
    if (mockRes.statusCode === 200 && mockRes.responseData) {
      const data = mockRes.responseData;
      console.log(`✅ API funcionando! ${data.total} vagas encontradas`);
      console.log(`📊 Categorias: ${data.meta.categories.join(', ')}`);
      
      // Verificar algumas vagas
      const jobs = data.jobs || data.data;
      if (jobs && jobs.length > 0) {
        console.log('\n📋 Primeiras 3 vagas:');
        jobs.slice(0, 3).forEach((job, index) => {
          console.log(`${index + 1}. ${job.title} - ${job.company.name} (${job.location})`);
          console.log(`   💰 ${job.salary} - 🏷️ ${job.category}`);
        });
        
        // Verificar se há IDs únicos
        const uniqueIds = new Set(jobs.map(job => job.id));
        console.log(`\n🔍 Verificação de duplicatas:`);
        console.log(`   Total de vagas: ${jobs.length}`);
        console.log(`   IDs únicos: ${uniqueIds.size}`);
        
        if (uniqueIds.size === jobs.length) {
          console.log('   ✅ Sem duplicatas encontradas!');
        } else {
          console.log('   ⚠️ Duplicatas encontradas!');
        }
        
        // Verificar distribuição por categoria
        const categoryCounts = {};
        jobs.forEach(job => {
          categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
        });
        
        console.log('\n📊 Distribuição por categoria:');
        Object.entries(categoryCounts).forEach(([category, count]) => {
          console.log(`   ${category}: ${count} vagas`);
        });
        
        return true;
      }
    } else {
      console.error('❌ API retornou erro:', mockRes.responseData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
    return false;
  }
}

// Executar teste
testSimpleJobsAPI().then(success => {
  if (success) {
    console.log('\n🎉 Teste concluído com sucesso!');
    process.exit(0);
  } else {
    console.log('\n💥 Teste falhou!');
    process.exit(1);
  }
});
