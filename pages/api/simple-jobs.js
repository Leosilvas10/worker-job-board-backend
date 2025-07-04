// API específica para EMPREGOS SIMPLES - Busca do backend
export default async function handler(req, res) {
  try {
    console.log('🎯 Buscando vagas REAIS de empregos simples do backend...');
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Método não permitido'
      });
    }

    // Buscar vagas do backend - HARDCODED PARA GARANTIR FUNCIONAMENTO
    const backendUrl = 'https://worker-job-board-backend.onrender.com';
    console.log('🔗 Conectando ao backend (HARDCODED):', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/simple-jobs`);
    
    if (!response.ok) {
      throw new Error(`Backend retornou status ${response.status}`);
    }
    
    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      data: data.data || data,
      message: `${data.data?.length || 0} vagas encontradas do backend`
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar vagas do backend:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao conectar com o backend',
      error: error.message
    });
  }
}
