import validator from 'validator'

// Sanitizar entrada de texto
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return ''
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < e > para prevenir XSS básico
    .replace(/\\/g, '') // Remove barras invertidas
    .substring(0, 1000) // Limita tamanho
}

// Validar WhatsApp
export const validateWhatsApp = (whatsapp) => {
  if (!whatsapp) return false
  
  // Remove tudo que não é número
  const cleaned = whatsapp.replace(/\D/g, '')
  
  // Verifica se tem pelo menos 10 dígitos (DDD + número)
  return cleaned.length >= 10 && cleaned.length <= 15
}

// Validar email
export const validateEmail = (email) => {
  if (!email) return true // Email é opcional
  return validator.isEmail(email)
}

// Validar nome
export const validateName = (name) => {
  if (!name) return false
  
  const cleaned = name.trim()
  return cleaned.length >= 2 && cleaned.length <= 100
}

// Middleware de validação para criação de lead
export const validateLeadData = (req, res, next) => {
  const { nome, whatsapp, email, ultimaEmpresa, tipoContrato, recebeuVerbas, situacoesVividas } = req.body
  
  const errors = []
  
  // Validar nome
  if (!validateName(nome)) {
    errors.push('Nome deve ter entre 2 e 100 caracteres')
  }
  
  // Validar WhatsApp
  if (!validateWhatsApp(whatsapp)) {
    errors.push('WhatsApp deve ter formato válido (10-15 dígitos)')
  }
  
  // Validar email se fornecido
  if (email && !validateEmail(email)) {
    errors.push('Email deve ter formato válido')
  }
  
  // Sanitizar strings
  req.body.nome = sanitizeString(nome)
  req.body.ultimaEmpresa = sanitizeString(ultimaEmpresa)
  req.body.tipoContrato = sanitizeString(tipoContrato)
  req.body.recebeuVerbas = sanitizeString(recebeuVerbas)
  req.body.situacoesVividas = sanitizeString(situacoesVividas)
  
  // Validar tamanhos
  if (req.body.ultimaEmpresa && req.body.ultimaEmpresa.length > 200) {
    errors.push('Última empresa deve ter no máximo 200 caracteres')
  }
  
  if (req.body.tipoContrato && req.body.tipoContrato.length > 100) {
    errors.push('Tipo de contrato deve ter no máximo 100 caracteres')
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    })
  }
  
  next()
}

// Middleware de validação para parâmetros de ID
export const validateIdParam = (req, res, next) => {
  const { id } = req.params
  
  if (!id || !validator.isInt(id, { min: 1 })) {
    return res.status(400).json({
      success: false,
      message: 'ID deve ser um número inteiro positivo'
    })
  }
  
  req.params.id = parseInt(id, 10)
  next()
}

// Middleware de validação para dados de vaga (se necessário no futuro)
export const validateVagaData = (req, res, next) => {
  const { titulo, descricao, salario, empresa } = req.body
  
  const errors = []
  
  if (!titulo || titulo.trim().length < 3) {
    errors.push('Título deve ter pelo menos 3 caracteres')
  }
  
  if (!descricao || descricao.trim().length < 10) {
    errors.push('Descrição deve ter pelo menos 10 caracteres')
  }
  
  if (salario !== undefined && !validator.isFloat(salario.toString(), { min: 0 })) {
    errors.push('Salário deve ser um número positivo')
  }
  
  if (!empresa || empresa.trim().length < 2) {
    errors.push('Empresa deve ter pelo menos 2 caracteres')
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados de vaga inválidos',
      errors
    })
  }
  
  // Sanitizar
  req.body.titulo = sanitizeString(titulo)
  req.body.descricao = sanitizeString(descricao)
  req.body.empresa = sanitizeString(empresa)
  
  next()
}

// Middleware de rate limiting por IP
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map()
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress
    const now = Date.now()
    
    // Limpar entradas antigas
    for (const [key, data] of requests.entries()) {
      if (now - data.resetTime > windowMs) {
        requests.delete(key)
      }
    }
    
    // Verificar limite para este IP
    const userRequests = requests.get(ip) || { count: 0, resetTime: now }
    
    if (userRequests.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns minutos.'
      })
    }
    
    // Incrementar contador
    userRequests.count++
    requests.set(ip, userRequests)
    
    next()
  }
}

// Headers de segurança
export const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Remove server header
  res.removeHeader('X-Powered-By')
  
  next()
}
