import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// GET /vagas/destaque - Retorna 6 vagas em destaque com maiores salários
const getVagasDestaque = async (req, res) => {
  try {
    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true,
        destaque: true
      },
      orderBy: {
        salario: 'desc'
      },
      take: 6,
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
    console.error('Erro ao buscar vagas em destaque:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}

export { getVagasDestaque }
