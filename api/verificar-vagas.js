import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Função para simular busca de novas vagas de uma API externa
const buscarNovasVagas = async () => {
  // Simulação de vagas vindas de uma API externa
  const vagasSimuladas = [
    {
      titulo: 'Desenvolvedor Frontend React',
      descricao: 'Desenvolvimento de interfaces web modernas com React e TypeScript',
      salario: 5500.00,
      urlOriginal: 'https://www.infojobs.com.br/vaga-desenvolvedor-frontend',
      destaque: true
    },
    {
      titulo: 'Analista de Marketing Digital',
      descricao: 'Gestão de campanhas digitais e análise de métricas',
      salario: 4200.00,
      urlOriginal: 'https://www.catho.com.br/vaga-marketing-digital',
      destaque: false
    },
    {
      titulo: 'Técnico em Eletrônica',
      descricao: 'Manutenção e reparo de equipamentos eletrônicos',
      salario: 2800.00,
      urlOriginal: 'https://www.sine.com.br/vaga-tecnico-eletronica',
      destaque: true
    }
  ]

  return vagasSimuladas
}

// GET /verificar-vagas - Identifica vagas que saíram e busca novas
const verificarVagas = async (req, res) => {
  try {
    console.log('🔍 Iniciando verificação de vagas...')

    // 1. Buscar vagas ativas no banco
    const vagasAtivas = await prisma.vaga.findMany({
      where: { ativa: true }
    })

    console.log(`📊 Vagas ativas encontradas: ${vagasAtivas.length}`)

    // 2. Simular verificação - marcar algumas como inativas (exemplo)
    // Em produção, aqui você faria uma verificação real nas fontes originais
    const vagasParaDesativar = vagasAtivas.slice(0, Math.floor(vagasAtivas.length * 0.1)) // 10% das vagas

    if (vagasParaDesativar.length > 0) {
      await prisma.vaga.updateMany({
        where: {
          id: {
            in: vagasParaDesativar.map(v => v.id)
          }
        },
        data: {
          ativa: false
        }
      })
      console.log(`❌ ${vagasParaDesativar.length} vagas marcadas como inativas`)
    }

    // 3. Buscar novas vagas (simulação)
    const novasVagas = await buscarNovasVagas()
    
    // 4. Adicionar novas vagas ao banco
    let vagasAdicionadas = 0
    for (const novaVaga of novasVagas) {
      // Verificar se a vaga já existe (por título e URL)
      const vagaExistente = await prisma.vaga.findFirst({
        where: {
          titulo: novaVaga.titulo,
          urlOriginal: novaVaga.urlOriginal
        }
      })

      if (!vagaExistente) {
        await prisma.vaga.create({
          data: novaVaga
        })
        vagasAdicionadas++
      }
    }

    console.log(`✅ ${vagasAdicionadas} novas vagas adicionadas`)

    // 5. Retornar estatísticas
    const totalAtivas = await prisma.vaga.count({
      where: { ativa: true }
    })

    res.json({
      success: true,
      message: 'Verificação de vagas concluída',
      data: {
        vagasDesativadas: vagasParaDesativar.length,
        vagasAdicionadas,
        totalVagasAtivas: totalAtivas
      }
    })
  } catch (error) {
    console.error('Erro ao verificar vagas:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}

export { verificarVagas }
