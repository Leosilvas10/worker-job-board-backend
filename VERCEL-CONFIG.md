# Configuração de Variáveis de Ambiente na Vercel

## ⚠️ PROBLEMA IDENTIFICADO

O site está funcionando mas mostra "0 Vagas Ativas" porque:

1. **Frontend está OK** - O site carrega normalmente
2. **Backend não conecta** - As APIs não conseguem buscar dados do backend
3. **Variável de ambiente faltando** - `NEXT_PUBLIC_API_URL` não está configurada na Vercel

## 🔧 SOLUÇÃO

### 1. Na Vercel Dashboard:
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto "worker-job-board-frontend"
3. Vá em "Settings" → "Environment Variables"
4. Adicione:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://worker-job-board-backend.onrender.com`
   - **Environment:** Production

### 2. Fazer novo deploy:
Após adicionar a variável, faça um novo deploy ou trigger um redeploy.

## 📊 APIS AFETADAS

Estas APIs estão tentando se conectar com o backend:
- `/api/all-jobs-combined` → busca vagas
- `/api/submit-candidatura` → salva leads
- `/api/get-leads` → busca leads do admin

## 🎯 TESTE RÁPIDO

Depois de configurar, teste:
1. Refresh da homepage → deve mostrar vagas
2. Clicar em "Ver Todas as Vagas" → deve carregar vagas
3. Se candidatar a uma vaga → deve funcionar

## 🔄 BACKEND STATUS

Certifique-se que o backend está rodando:
- URL: https://worker-job-board-backend.onrender.com
- Status: Deve responder com dados JSON
