// Configuração hardcoded do backend para garantir funcionamento em produção
export const BACKEND_CONFIG = {
  API_URL: 'https://worker-job-board-backend-leonardosilvas2.replit.app',
  ENDPOINTS: {
    SIMPLE_JOBS: '/api/simple-jobs',
    ALL_JOBS: '/api/all-jobs-combined',
    SUBMIT_LEAD: '/api/submit-lead'
  }
}

// Função para obter a URL da API com fallback garantido
export function getBackendUrl() {
  // SEMPRE retorna a URL hardcoded para garantir funcionamento
  return BACKEND_CONFIG.API_URL;
}

export default BACKEND_CONFIG;
