import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// PATCH /vagas/:id/destaque - Altera status de destaque da vaga
const toggleVagaDestaque = async (req, res) => {
  try {
    const { id } = req.params
    const { destaque } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da vaga é obrigatório'
      })
    }

    // Buscar vaga atual
    const vagaAtual = await prisma.vaga.findUnique({
      where: { id: parseInt(id) }
    })

    if (!vagaAtual) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      })
    }

    // Atualizar status de destaque
    const vagaAtualizada = await prisma.vaga.update({
      where: { id: parseInt(id) },
      data: {
        destaque: destaque !== undefined ? Boolean(destaque) : !vagaAtual.destaque
      }
    })

    res.json({
      success: true,
      message: `Vaga ${vagaAtualizada.destaque ? 'marcada como' : 'removida do'} destaque`,
      data: vagaAtualizada
    })
  } catch (error) {
    console.error('Erro ao alterar destaque da vaga:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}

// PATCH /vagas/:id/ativa - Altera status ativo da vaga
const toggleVagaAtiva = async (req, res) => {
  try {
    const { id } = req.params
    const { ativa } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da vaga é obrigatório'
      })
    }

    // Buscar vaga atual
    const vagaAtual = await prisma.vaga.findUnique({
      where: { id: parseInt(id) }
    })

    if (!vagaAtual) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      })
    }

    // Atualizar status ativo
    const vagaAtualizada = await prisma.vaga.update({
      where: { id: parseInt(id) },
      data: {
        ativa: ativa !== undefined ? Boolean(ativa) : !vagaAtual.ativa
      }
    })

    res.json({
      success: true,
      message: `Vaga ${vagaAtualizada.ativa ? 'ativada' : 'desativada'}`,
      data: vagaAtualizada
    })
  } catch (error) {
    console.error('Erro ao alterar status da vaga:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}

export { toggleVagaDestaque, toggleVagaAtiva }
