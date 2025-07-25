import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Middleware básico
app.use(express.json());

// Configurar CORS simples para teste
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Servidor de teste funcionando!' });
});

// Rota /vagas 
app.get('/vagas', async (req, res) => {
  try {
    console.log('🔍 Buscando vagas ativas...');
    
    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Encontradas ${vagas.length} vagas ativas`);

    res.json({
      success: true,
      data: vagas,
      total: vagas.length,
      message: `${vagas.length} vagas encontradas`
    });
  } catch (error) {
    console.error('❌ Erro ao buscar vagas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Rota /vagas/destaque
app.get('/vagas/destaque', async (req, res) => {
  try {
    console.log('🌟 Buscando vagas em destaque...');
    
    const vagas = await prisma.vaga.findMany({
      where: {
        ativa: true,
        destaque: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 6
    });

    console.log(`⭐ Encontradas ${vagas.length} vagas em destaque`);

    res.json({
      success: true,
      data: vagas,
      total: vagas.length,
      message: `${vagas.length} vagas em destaque encontradas`
    });
  } catch (error) {
    console.error('❌ Erro ao buscar vagas em destaque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📊 Acesse: http://localhost:${PORT}/vagas`);
  console.log(`⭐ Destaque: http://localhost:${PORT}/vagas/destaque`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
