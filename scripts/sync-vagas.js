import axios from 'axios';
import db from '../database.js';

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

async function syncVagas() {
  try {
    console.log('🔄 Iniciando sincronização de vagas...');
    
    const response = await axios.post(`${API_BASE}/api/vagas/sync`);
    
    if (response.data.success) {
      console.log(`✅ Sincronização concluída: ${response.data.novos} novas vagas, ${response.data.atualizados} atualizadas`);
    } else {
      console.log('❌ Erro na sincronização:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar vagas:', error.message);
  }
}

// Se executado diretamente
if (process.argv[1] === new URL(import.meta.url).pathname) {
  syncVagas().then(() => process.exit(0));
}

export default syncVagas;
