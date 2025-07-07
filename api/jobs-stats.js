import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/jobs-stats
router.get('/', async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas reais do banco Prisma...');
    
    // Usar exatamente a mesma lógica da API /vagas para garantir consistência
    const allVagas = await prisma.vaga.findMany({
      where: {
        ativa: true  // Mesma condição da API /vagas
      }
    });

    const totalJobs = allVagas.length;

    // Contar vagas recentes (últimos 7 dias)
    const recentJobs = await prisma.vaga.count({
      where: {
        ativa: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Buscar estatísticas por categoria
    const categoriesData = await prisma.vaga.groupBy({
      by: ['categoria'],
      where: {
        ativa: true
      },
      _count: {
        id: true
      }
    });

    const categories = {};
    categoriesData.forEach(item => {
      categories[item.categoria || 'Geral'] = item._count.id;
    });

    console.log(`✅ Estatísticas: ${totalJobs} total (${allVagas.length} vagas ativas), ${recentJobs} recentes`);

    res.json({
      success: true,
      data: {
        totalJobs,
        recentJobs,
        categories,
        topCities: [], // TODO: implementar quando houver dados de localização
        salaryRanges: {}, // TODO: implementar quando houver dados de salário estruturados
        contractTypes: {} // TODO: implementar quando houver dados de tipo de contrato
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
});

export default router;
