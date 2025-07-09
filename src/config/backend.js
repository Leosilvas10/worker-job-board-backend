
// Configuração do backend
export const BACKEND_CONFIG = {
  // URL do backend em produção
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app',
  
  // Endpoints disponíveis
  ENDPOINTS: {
    LEADS: '/api/leads',
    JOBS_STATS: '/api/jobs-stats',
    SUBMIT_LEAD: '/api/submit-lead',
    HEALTH: '/api/health'
  },
  
  // Configurações de requisição
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'SiteDoTrabalhador-Frontend'
    },
    timeout: 10000 // 10 segundos
  }
};

// Função helper para construir URLs
export const buildBackendUrl = (endpoint) => {
  return `${BACKEND_CONFIG.BASE_URL}${endpoint}`;
};

// Função para fazer requisições para o backend
export const fetchFromBackend = async (endpoint, options = {}) => {
  const url = buildBackendUrl(endpoint);
  const config = {
    ...BACKEND_CONFIG.REQUEST_CONFIG,
    ...options
  };
  
  try {
    console.log(`🔗 Fazendo requisição para: ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Resposta recebida de ${endpoint}:`, data);
    
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Erro ao acessar ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};
