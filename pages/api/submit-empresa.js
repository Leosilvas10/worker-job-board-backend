// API específica para solicitações de empresas
const fs = require('fs')
const path = require('path')

const leadsFilePath = path.join(process.cwd(), 'data', 'leads.json')

// Garantir que o diretório existe
const ensureDirectoryExists = () => {
  const dir = path.dirname(leadsFilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    ensureDirectoryExists()
    
    const empresaData = req.body
    
    // Validar dados obrigatórios
    if (!empresaData.nomeEmpresa || !empresaData.email || !empresaData.telefone || !empresaData.cargo) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios faltando: nome da empresa, email, telefone e cargo são necessários'
      })
    }

    // Preparar dados da empresa no formato de lead
    const timestamp = new Date().toLocaleString('pt-BR')
    const leadId = `empresa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const leadData = {
      id: leadId,
      leadId: leadId,
      
      // Dados principais
      nome: `Empresa: ${empresaData.nomeEmpresa}`,
      email: empresaData.email,
      telefone: empresaData.telefone,
      whatsapp: empresaData.telefone,
      
      // Dados específicos da empresa
      nomeEmpresa: empresaData.nomeEmpresa,
      cnpj: empresaData.cnpj,
      segmento: empresaData.segmento,
      cidade: empresaData.cidade,
      descricaoEmpresa: empresaData.descricaoEmpresa,
      
      // Dados da vaga
      cargo: empresaData.cargo,
      area: empresaData.area,
      tipoContrato: empresaData.tipoContrato,
      salario: empresaData.salario,
      descricaoVaga: empresaData.descricaoVaga,
      requisitos: empresaData.requisitos,
      beneficios: empresaData.beneficios,
      localTrabalho: empresaData.localTrabalho,
      
      // Metadados
      type: 'empresa',
      source: 'Formulário de Empresas',
      fonte: 'Formulário de Empresas',
      status: 'pendente',
      lgpdConsent: true,
      
      // Timestamps
      timestamp: timestamp,
      timestampISO: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataChegada: timestamp,
      
      // Dados técnicos
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Não disponível',
      userAgent: req.headers['user-agent'] || 'Não disponível',
      
      // Campos para compatibilidade com o painel admin
      jobTitle: empresaData.cargo,
      company: empresaData.nomeEmpresa,
      experiencia: `EMPRESA - CNPJ: ${empresaData.cnpj || 'Não informado'} | Segmento: ${empresaData.segmento || 'Não informado'} | Cidade: ${empresaData.cidade || 'Não informada'} | Descrição: ${empresaData.descricaoEmpresa || 'Não informada'}`,
      originalLocation: empresaData.localTrabalho || empresaData.cidade || 'Brasil'
    }

    // Ler leads existentes
    let existingLeads = []
    if (fs.existsSync(leadsFilePath)) {
      try {
        const data = fs.readFileSync(leadsFilePath, 'utf8')
        existingLeads = JSON.parse(data)
      } catch (error) {
        console.error('Erro ao ler leads existentes:', error)
        existingLeads = []
      }
    }

    // Adicionar novo lead da empresa
    existingLeads.push(leadData)

    // Manter apenas os últimos 1000 leads
    if (existingLeads.length > 1000) {
      existingLeads.splice(0, existingLeads.length - 1000)
    }

    // Salvar no arquivo
    fs.writeFileSync(leadsFilePath, JSON.stringify(existingLeads, null, 2))

    console.log('✅ Solicitação de empresa salva com sucesso:', {
      id: leadData.id,
      empresa: empresaData.nomeEmpresa,
      cargo: empresaData.cargo,
      email: empresaData.email,
      timestamp: timestamp
    })

    res.status(200).json({ 
      success: true, 
      message: 'Solicitação de empresa recebida com sucesso! Nossa equipe entrará em contato em até 24 horas úteis.',
      id: leadData.id
    })
    
  } catch (error) {
    console.error('❌ Erro ao processar solicitação de empresa:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor ao processar sua solicitação',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor' 
    })
  }
}
