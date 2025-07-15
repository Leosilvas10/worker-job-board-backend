import { PrismaClient } from '@prisma/client'
import { sanitizeString, validateWhatsApp, validateName, validateEmail } from '../middleware/validation.js'

const prisma = new PrismaClient()

// POST /lead - Grava dados do questionário e vincula ao ID da vaga
const createLead = async (req, res) => {
  try {
    const {
      nome,
      whatsapp,
      ultimaEmpresa,
      tipoContrato,
      recebeuVerbas,
      situacoesVividas,
      desejaConsulta,
      vagaId
    } = req.body

    // Validações adicionais (middleware já validou parte)
    if (!validateName(nome)) {
      return res.status(400).json({
        success: false,
        message: 'Nome deve ter entre 2 e 100 caracteres'
      })
    }

    if (!validateWhatsApp(whatsapp)) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp deve ter formato válido'
      })
    }

    // Verificar se a vaga existe (se informada)
    if (vagaId) {
      const vagaIdInt = parseInt(vagaId)
      if (isNaN(vagaIdInt) || vagaIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID da vaga deve ser um número positivo'
        })
      }

      const vaga = await prisma.vaga.findUnique({
        where: { id: vagaIdInt }
      })

      if (!vaga) {
        return res.status(404).json({
          success: false,
          message: 'Vaga não encontrada'
        })
      }
    }

    // Limpar e sanitizar WhatsApp
    const cleanWhatsApp = whatsapp.replace(/\D/g, '')

    // Criar o lead com dados sanitizados
    const lead = await prisma.lead.create({
      data: {
        nome: sanitizeString(nome),
        whatsapp: cleanWhatsApp,
        ultimaEmpresa: ultimaEmpresa ? sanitizeString(ultimaEmpresa) : '',
        tipoContrato: tipoContrato ? sanitizeString(tipoContrato) : '',
        recebeuVerbas: recebeuVerbas ? sanitizeString(recebeuVerbas) : '',
        situacoesVividas: situacoesVividas ? sanitizeString(situacoesVividas) : '',
        desejaConsulta: desejaConsulta ? sanitizeString(desejaConsulta) : '',
        vagaId: vagaId ? parseInt(vagaId) : null
      },
      include: {
        vaga: true
      }
    })

    // Log para auditoria
    console.log(`✅ Novo lead criado: ${lead.nome} (ID: ${lead.id})`)

    res.status(201).json({
      success: true,
      message: 'Lead criado com sucesso',
      data: {
        id: lead.id,
        nome: lead.nome,
        whatsapp: lead.whatsapp,
        createdAt: lead.createdAt,
        vaga: lead.vaga ? {
          id: lead.vaga.id,
          titulo: lead.vaga.titulo,
          urlOriginal: lead.vaga.urlOriginal
        } : null
      }
    })
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    
    // Não expor detalhes do erro em produção
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor'
      : error.message

    res.status(500).json({
      success: false,
      message: errorMessage
    })
  }
}

// GET /leads-prisma - Lista todos os leads (protegido)
const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum
    
    // Construir filtros de busca
    const where = search ? {
      OR: [
        { nome: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { ultimaEmpresa: { contains: search, mode: 'insensitive' } }
      ]
    } : {}
    
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          vaga: {
            select: {
              id: true,
              titulo: true,
              empresa: true,
              salario: true,
              urlOriginal: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limitNum
      }),
      prisma.lead.count({ where })
    ])

    // Log para auditoria
    console.log(`📊 Leads consultados pelo admin: ${leads.length}/${total}`)

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor'
      : error.message

    res.status(500).json({
      success: false,
      message: errorMessage
    })
  }
}

export { createLead, getLeads }
