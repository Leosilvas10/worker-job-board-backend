import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { promisify } from 'util'

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte_aqui_min_32_chars_123456'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

// Middleware de autenticação JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error('Erro de autenticação:', error)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }
    
    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação'
    })
  }
}

// Middleware para verificar role de admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissão de administrador requerida.'
    })
  }
  next()
}

// Rota de login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username e password são obrigatórios'
      })
    }

    // Verificar credenciais (em produção, deve vir do banco de dados)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      })
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        username: adminUsername,
        role: 'admin',
        id: 1
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Dados do usuário (sem senha)
    const userData = {
      id: 1,
      username: adminUsername,
      role: 'admin',
      name: 'Administrador',
      email: 'admin@sitedotrabalhador.com.br'
    }

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      user: userData
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}

// Rota para verificar token
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    
    const userData = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      name: 'Administrador',
      email: 'admin@sitedotrabalhador.com.br'
    }

    res.json({
      success: true,
      valid: true,
      user: userData
    })
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    res.status(401).json({
      success: false,
      valid: false,
      message: 'Token inválido ou expirado'
    })
  }
}

// Rota de logout (opcional, para blacklist de tokens)
export const logout = async (req, res) => {
  try {
    // Em um sistema real, você adicionaria o token à blacklist
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
  } catch (error) {
    console.error('Erro no logout:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    })
  }
}

// Utilitário para hash de senha (para uso futuro)
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Utilitário para verificar senha
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}
