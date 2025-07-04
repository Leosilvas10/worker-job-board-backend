// API simples para vagas internas
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    })
  }

  try {
    // Retornar array vazio por enquanto - vagas internas virão do admin
    return res.status(200).json({
      success: true,
      data: [],
      message: 'Vagas internas carregadas (vazio no momento)'
    })

  } catch (error) {
    console.error('Erro na API jobs:', error)
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}
