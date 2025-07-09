
// API para testar conexão com o backend
export default async function handler(req, res) {
  const BACKEND_URL = 'https://worker-job-board-backend-leonardosilvas2.replit.app';
  
  try {
    console.log('🔍 Testando conexão com backend...');
    
    const results = {};
    
    // Testar endpoint de leads
    try {
      const leadsResponse = await fetch(`${BACKEND_URL}/api/leads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const leadsData = leadsResponse.ok ? await leadsResponse.json() : null;
      
      results.leads = {
        status: leadsResponse.status,
        ok: leadsResponse.ok,
        data: leadsData,
        count: leadsData?.leads?.length || leadsData?.data?.length || 0
      };
    } catch (error) {
      results.leads = { error: error.message };
    }
    
    // Testar endpoint de stats
    try {
      const statsResponse = await fetch(`${BACKEND_URL}/api/jobs-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const statsData = statsResponse.ok ? await statsResponse.json() : null;
      
      results.stats = {
        status: statsResponse.status,
        ok: statsResponse.ok,
        data: statsData,
        totalJobs: statsData?.totalJobs || 0
      };
    } catch (error) {
      results.stats = { error: error.message };
    }
    
    // Testar endpoint all-jobs-combined
    try {
      const allJobsResponse = await fetch(`${BACKEND_URL}/api/all-jobs-combined`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const allJobsData = allJobsResponse.ok ? await allJobsResponse.json() : null;
      
      results.allJobs = {
        status: allJobsResponse.status,
        ok: allJobsResponse.ok,
        data: allJobsData,
        count: allJobsData?.data?.length || allJobsData?.jobs?.length || 0
      };
    } catch (error) {
      results.allJobs = { error: error.message };
    }
    
    return res.status(200).json({
      success: true,
      backend: BACKEND_URL,
      timestamp: new Date().toISOString(),
      endpoints: results
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
