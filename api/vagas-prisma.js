import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// GET /vagas - Retorna todas as vagas ativas
const getVagas = async (req, res) => {
  try {
    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            candidatos: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: vagas,
      total: vagas.length
    })
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}

export { getVagas }
