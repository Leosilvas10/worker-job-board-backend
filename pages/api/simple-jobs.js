// API específica para EMPREGOS SIMPLES - Busca do backend com fallback
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

    // Vagas de fallback - SEMPRE DISPONÍVEIS
    const vagasFallback = [
      {
        id: 'real_1',
        title: 'Doméstica',
        company: 'Família em São Paulo',
        location: 'São Paulo, SP',
        salary: 'R$ 1.320,00',
        description: 'Limpeza geral da casa, organização, preparo de refeições simples. Experiência mínima de 1 ano. Carteira assinada.',
        type: 'CLT',
        category: 'Doméstica',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['doméstica', 'limpeza', 'organização', 'clt'],
        created_at: new Date().toISOString()
      },
      {
        id: 'real_2',
        title: 'Diarista',
        company: 'Residencial Particular',
        location: 'Rio de Janeiro, RJ',
        salary: 'R$ 120,00/dia',
        description: 'Limpeza completa de apartamento 2 quartos, 2x por semana. Experiência comprovada.',
        type: 'Diarista',
        category: 'Doméstica',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['diarista', 'limpeza', 'apartamento', 'meio-período'],
        created_at: new Date().toISOString()
      },
      {
        id: 'real_3',
        title: 'Porteiro Diurno',
        company: 'Edifício Comercial Central',
        location: 'São Paulo, SP',
        salary: 'R$ 1.500,00',
        description: 'Controle de acesso, recebimento de correspondências, atendimento ao público. Experiência em portaria.',
        type: 'CLT',
        category: 'Portaria',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['porteiro', 'diurno', 'atendimento', 'clt'],
        created_at: new Date().toISOString()
      },
      {
        id: 'real_4',
        title: 'Cuidador de Idosos',
        company: 'Cuidados Senior',
        location: 'Rio de Janeiro, RJ',
        salary: 'R$ 1.800,00',
        description: 'Acompanhamento de idosos, auxílio em atividades diárias, administração de medicamentos. Curso de cuidador.',
        type: 'CLT',
        category: 'Cuidados',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['cuidador', 'idosos', 'saúde', 'clt'],
        created_at: new Date().toISOString()
      },
      {
        id: 'real_5',
        title: 'Auxiliar de Limpeza',
        company: 'Empresa Clean Service',
        location: 'Belo Horizonte, MG',
        salary: 'R$ 1.400,00',
        description: 'Limpeza de escritórios, banheiros, organização de materiais. Experiência em limpeza empresarial.',
        type: 'CLT',
        category: 'Limpeza',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['limpeza', 'escritório', 'organização', 'clt'],
        created_at: new Date().toISOString()
      },
      {
        id: 'real_6',
        title: 'Babá',
        company: 'Família Particular',
        location: 'São Paulo, SP',
        salary: 'R$ 1.600,00',
        description: 'Cuidado com crianças de 2 a 8 anos, acompanhamento escolar, atividades recreativas.',
        type: 'CLT',
        category: 'Cuidados',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['babá', 'crianças', 'cuidados', 'clt'],
        created_at: new Date().toISOString()
      },
      {
        id: 'real_7',
        title: 'Jardineiro',
        company: 'Condomínio Verde',
        location: 'Curitiba, PR',
        salary: 'R$ 1.350,00',
        description: 'Manutenção de jardins, poda, irrigação, paisagismo básico. Experiência em jardinagem.',
        type: 'CLT',
        category: 'Jardinagem',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['jardineiro', 'plantas', 'manutenção', 'clt'],
        created_at: new Date().toISOString()
      },
      {
        id: 'real_8',
        title: 'Segurança',
        company: 'Empresa de Segurança',
        location: 'Salvador, BA',
        salary: 'R$ 1.700,00',
        description: 'Vigilância patrimonial, controle de acesso, rondas. Curso de vigilante obrigatório.',
        type: 'CLT',
        category: 'Segurança',
        source: 'Site do Trabalhador',
        external_url: '',
        tags: ['segurança', 'vigilância', 'controle', 'clt'],
        created_at: new Date().toISOString()
      }
    ];

    // Tentar buscar do backend primeiro
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://acceptable-warmth-production.up.railway.app';
      console.log('🔗 Tentando conectar ao backend:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/simple-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000 // 5 segundos timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          console.log('✅ Vagas carregadas do backend:', data.data.length);
          return res.status(200).json({
            success: true,
            data: data.data,
            message: `${data.data.length} vagas encontradas do backend`,
            source: 'backend'
          });
        }
      }
    } catch (backendError) {
      console.log('⚠️ Backend não disponível:', backendError.message);
    }
    
    // Se chegou aqui, usar fallback
    console.log('🔄 Usando vagas de fallback:', vagasFallback.length);
    
    return res.status(200).json({
      success: true,
      data: vagasFallback,
      message: `${vagasFallback.length} vagas encontradas (fallback)`,
      source: 'fallback'
    });
    
  } catch (error) {
    console.error('❌ Erro geral na API:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}
