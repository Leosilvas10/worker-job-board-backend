import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/stats - Estatísticas gerais do sistema
router.get('/', async (req, res) => {
  try {
    // Contar leads totais
    const totalLeads = await prisma.lead.count();
    
    // Contar vagas totais
    const totalVagas = await prisma.vaga.count();
    
    // Leads de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const leadsHoje = await prisma.lead.count({
      where: {
        createdAt: {
          gte: hoje,
          lt: amanha
        }
      }
    });

    // Leads desta semana
    const semanaAtras = new Date();
    semanaAtras.setDate(semanaAtras.getDate() - 7);
    
    const leadsEstaSemana = await prisma.lead.count({
      where: {
        createdAt: {
          gte: semanaAtras
        }
      }
    });

    // Análise de situações vividas
    const leadsComSituacoes = await prisma.lead.findMany({
      where: {
        situacoesVividas: {
          not: null
        }
      },
      select: {
        situacoesVividas: true
      }
    });

    const situacoesCount = {};
    leadsComSituacoes.forEach(lead => {
      if (lead.situacoesVividas) {
        try {
          const situacoes = JSON.parse(lead.situacoesVividas);
          if (Array.isArray(situacoes)) {
            situacoes.forEach(situacao => {
              situacoesCount[situacao] = (situacoesCount[situacao] || 0) + 1;
            });
          }
        } catch (e) {
          // Se não for JSON válido, trata como string
          const situacao = lead.situacoesVividas;
          situacoesCount[situacao] = (situacoesCount[situacao] || 0) + 1;
        }
      }
    });

    const topSituacoes = Object.entries(situacoesCount)
      .map(([situacao, count]) => ({ situacao, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Análise de tipos de contrato
    const tiposContrato = await prisma.lead.groupBy({
      by: ['tipoContrato'],
      _count: {
        tipoContrato: true
      },
      where: {
        tipoContrato: {
          not: null
        }
      }
    });

    // Análise de interesse em consulta
    const interesseConsulta = await prisma.lead.groupBy({
      by: ['desejaConsulta'],
      _count: {
        desejaConsulta: true
      },
      where: {
        desejaConsulta: {
          not: null
        }
      }
    });

    const desejaConsulta = {
      sim: interesseConsulta.find(item => item.desejaConsulta === 'sim')?._count?.desejaConsulta || 0,
      nao: interesseConsulta.find(item => item.desejaConsulta === 'nao')?._count?.desejaConsulta || 0
    };

    // Leads por período (últimos 7 dias)
    const leadsPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date();
      dia.setDate(dia.getDate() - i);
      dia.setHours(0, 0, 0, 0);
      
      const proximoDia = new Date(dia);
      proximoDia.setDate(proximoDia.getDate() + 1);
      
      const count = await prisma.lead.count({
        where: {
          createdAt: {
            gte: dia,
            lt: proximoDia
          }
        }
      });
      
      leadsPorDia.push({
        data: dia.toISOString().split('T')[0],
        leads: count
      });
    }

    // Estatísticas de vagas ativas
    const vagasAtivas = await prisma.vaga.count({
      where: {
        ativo: true
      }
    });

    // Top empresas por número de vagas
    const topEmpresas = await prisma.vaga.groupBy({
      by: ['empresa'],
      _count: {
        empresa: true
      },
      where: {
        empresa: {
          not: null
        }
      },
      orderBy: {
        _count: {
          empresa: 'desc'
        }
      },
      take: 5
    });

    // Taxa de conversão
    const taxaConversao = totalLeads > 0 
      ? Math.round((desejaConsulta.sim / totalLeads) * 100) 
      : 0;

    const stats = {
      totalLeads,
      totalVagas,
      vagasAtivas,
      leadsHoje,
      leadsEstaSemana,
      taxaConversao,
      desejaConsulta,
      topSituacoes,
      tiposContrato: tiposContrato.map(item => ({
        tipo: item.tipoContrato,
        count: item._count.tipoContrato
      })),
      leadsPorDia,
      topEmpresas: topEmpresas.map(item => ({
        empresa: item.empresa,
        vagas: item._count.empresa
      }))
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/stats/leads-recentes - Leads mais recentes
router.get('/leads-recentes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const leadsRecentes = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        nome: true,
        whatsapp: true,
        ultimaEmpresa: true,
        desejaConsulta: true,
        createdAt: true,
        vaga: {
          select: {
            titulo: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: leadsRecentes.map(lead => ({
        id: lead.id,
        nome: lead.nome,
        telefone: lead.whatsapp,
        empresa: lead.ultimaEmpresa || 'Não informado',
        vaga_titulo: lead.vaga?.titulo || 'Consulta Trabalhista',
        desejaConsulta: lead.desejaConsulta,
        created_at: lead.createdAt
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar leads recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/stats/dashboard - Dados completos para dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Executar todas as consultas em paralelo
    const [
      totalLeads,
      totalVagas,
      vagasAtivas,
      leadsHoje,
      leadsEstaSemana,
      leadsRecentes,
      situacoesData,
      tiposContrato,
      interesseConsulta
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.vaga.count(),
      prisma.vaga.count({ where: { ativo: true } }),
      
      // Leads de hoje
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Leads desta semana
      prisma.lead.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Leads recentes
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          nome: true,
          whatsapp: true,
          ultimaEmpresa: true,
          createdAt: true,
          vaga: { select: { titulo: true } }
        }
      }),
      
      // Situações vividas
      prisma.lead.findMany({
        where: { situacoesVividas: { not: null } },
        select: { situacoesVividas: true }
      }),
      
      // Tipos de contrato
      prisma.lead.groupBy({
        by: ['tipoContrato'],
        _count: { tipoContrato: true },
        where: { tipoContrato: { not: null } }
      }),
      
      // Interesse em consulta
      prisma.lead.groupBy({
        by: ['desejaConsulta'],
        _count: { desejaConsulta: true },
        where: { desejaConsulta: { not: null } }
      })
    ]);

    // Processar situações vividas
    const situacoesCount = {};
    situacoesData.forEach(lead => {
      if (lead.situacoesVividas) {
        try {
          const situacoes = JSON.parse(lead.situacoesVividas);
          if (Array.isArray(situacoes)) {
            situacoes.forEach(situacao => {
              situacoesCount[situacao] = (situacoesCount[situacao] || 0) + 1;
            });
          }
        } catch (e) {
          situacoesCount[lead.situacoesVividas] = (situacoesCount[lead.situacoesVividas] || 0) + 1;
        }
      }
    });

    const topSituacoes = Object.entries(situacoesCount)
      .map(([situacao, count]) => ({ situacao, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Processar interesse em consulta
    const desejaConsulta = {
      sim: interesseConsulta.find(item => item.desejaConsulta === 'sim')?._count?.desejaConsulta || 0,
      nao: interesseConsulta.find(item => item.desejaConsulta === 'nao')?._count?.desejaConsulta || 0
    };

    const taxaConversao = totalLeads > 0 ? Math.round((desejaConsulta.sim / totalLeads) * 100) : 0;

    const dashboardData = {
      stats: {
        totalLeads,
        totalVagas,
        vagasAtivas,
        leadsHoje,
        leadsEstaSemana,
        taxaConversao
      },
      recentLeads: leadsRecentes.map(lead => ({
        id: lead.id,
        nome: lead.nome,
        telefone: lead.whatsapp,
        empresa: lead.ultimaEmpresa || 'Não informado',
        vaga_titulo: lead.vaga?.titulo || 'Consulta Trabalhista',
        created_at: lead.createdAt
      })),
      situacoesVividas: topSituacoes,
      tiposContrato: tiposContrato.map(item => ({
        tipo: item.tipoContrato,
        count: item._count.tipoContrato
      })),
      desejaConsulta
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
