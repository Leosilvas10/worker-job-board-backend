
// API para testar conexão com o backend
export default async function handler(req, res) {
  const BACKEND_URL = 'https://worker-job-board-backend-leonardosilvas2.replit.app';
  
  try {
    console.log('🔍 Testando conexão com backend...');
    
    // Testar endpoint de leads
    const leadsResponse = await fetch(`${BACKEND_URL}/api/leads`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const leadsData = leadsResponse.ok ? await leadsResponse.json() : null;
    
    // Testar endpoint de stats
    const statsResponse = await fetch(`${BACKEND_URL}/api/jobs-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const statsData = statsResponse.ok ? await statsResponse.json() : null;
    
    return res.status(200).json({
      success: true,
      backend: BACKEND_URL,
      endpoints: {
        leads: {
          status: leadsResponse.status,
          ok: leadsResponse.ok,
          data: leadsData,
          count: leadsData?.data?.length || 0
        },
        stats: {
          status: statsResponse.status,
          ok: statsResponse.ok,
          data: statsData,
          totalJobs: statsData?.totalJobs || 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar backend:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      backend: BACKEND_URL
    });
  }
}
