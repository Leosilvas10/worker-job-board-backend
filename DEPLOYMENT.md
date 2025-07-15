# Deployment Guide - Site do Trabalhador

## 📋 Checklist para Deploy no Render

### 🔧 Backend (API)
1. ✅ Fazer deploy do backend primeiro
2. ✅ Configurar variáveis de ambiente no Render:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `CORS_ORIGIN=https://seu-frontend-url.onrender.com`

### 🎨 Frontend (Next.js)
1. ✅ Fazer deploy do frontend depois do backend
2. ✅ Configurar variáveis de ambiente no Render:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_API_URL=https://seu-backend-url.onrender.com`

## 🚀 Passos para Deploy

### 1. Deploy do Backend
1. No Render, clique em "New" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `sitedotrabalhador-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `SiteDoTrabalhador-backend`

### 2. Deploy do Frontend
1. No Render, clique em "New" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `sitedotrabalhador-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `SiteDoTrabalhador-frontend`

### 3. Atualizar URLs
Após os deploys, atualize:
- No backend: variável `CORS_ORIGIN` com a URL do frontend
- No frontend: variável `NEXT_PUBLIC_API_URL` com a URL do backend

## 🔒 Variáveis de Ambiente

### Backend
```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://sitedotrabalhador-frontend.onrender.com
```

### Frontend
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://sitedotrabalhador-backend.onrender.com
```

## 📁 Estrutura de Arquivos Criados

```
SiteDoTrabalhador-frontend/
├── next.config.js          # Configuração do Next.js
├── .env.production         # Variáveis de ambiente para produção
├── render.yaml            # Configuração do Render
└── src/components/Logo/
    └── UnifiedLogo.jsx    # Componente de logo criado

SiteDoTrabalhador-backend/
├── .env                   # Variáveis de ambiente
└── render.yaml           # Configuração do Render
```

## ⚠️ Importantes

1. **Ordem de Deploy**: Sempre faça o deploy do backend primeiro
2. **URLs**: Anote as URLs geradas pelo Render para configurar as variáveis
3. **CORS**: Configure corretamente o CORS no backend
4. **Monitoramento**: Verifique os logs no Render para debug
