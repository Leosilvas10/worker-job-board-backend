# 📊 PAINEL ADMIN - COMO VER OS LEADS

## 🎯 Respostas às Suas Perguntas

### ❓ "Como vou configurar o backend?"
**✅ RESPOSTA:** Já está configurado! Apenas rode:
```bash
cd SiteDoTrabalhador-backend
npm start
```

### ❓ "Preciso baixar um banco de dados?"
**✅ RESPOSTA:** NÃO! O SQLite já vem incluído. O arquivo `leads.db` é criado automaticamente.

### ❓ "Como ver os leads no painel admin?"
**✅ RESPOSTA:** 3 formas simples:

## 🖥️ Opção 1: Via Navegador (Mais Fácil)

### Ver Todos os Leads:
Abra: `http://localhost:3001/api/leads`

### Ver Vagas:
Abra: `http://localhost:3001/api/vagas`

### Exemplo do que você verá:
```json
{
  "success": true,
  "leads": [
    {
      "id": 1,
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "(11) 99999-9999",
      "vaga_titulo": "Desenvolvedor Full Stack",
      "trabalhou_antes": "sim",
      "ultimo_emprego": "Empresa XYZ",
      "tempo_ultimo_emprego": "2 anos",
      "salario_anterior": "R$ 5.000",
      "experiencia_anos": 3,
      "data_criacao": "2025-01-03 14:30:00"
    }
  ]
}
```

## 🔧 Opção 2: Via Terminal (Para Desenvolvedores)

```bash
# Ver todos os leads
curl http://localhost:3001/api/leads

# Ver lead específico
curl http://localhost:3001/api/leads/1

# Sincronizar vagas
curl -X POST http://localhost:3001/api/vagas/sync
```

## 💻 Opção 3: Painel Admin Visual (Opcional)

Se quiser um painel bonito, posso criar uma página admin no frontend. Mas para já ver os dados, use a **Opção 1** que é mais rápida.

## 🔄 Como Testar o Fluxo Completo

### 1. Rodar Backend:
```bash
cd SiteDoTrabalhador-backend
npm start
```

### 2. Rodar Frontend (em outro terminal):
```bash
cd SiteDoTrabalhador-frontend
npm run dev
```

### 3. Testar Captura de Lead:
1. Abra: `http://localhost:3000`
2. Preencha um formulário de vaga
3. Clique em "Enviar"
4. Vá para: `http://localhost:3001/api/leads`
5. **Veja o lead que acabou de ser salvo!**

## 📋 Dados Que São Capturados

Quando alguém preenche o formulário, estes dados são salvos:

### ✅ Dados Pessoais:
- Nome, Email, Telefone
- Idade, Cidade, Estado

### ✅ Dados da Vaga:
- Título da vaga, Empresa
- Pretensão salarial

### ✅ Dados Trabalhistas:
- Trabalhou antes? (sim/não)
- Último emprego
- Tempo no último emprego
- Motivo da demissão
- Salário anterior
- Anos de experiência

### ✅ Dados de Controle:
- Data/hora do cadastro
- Fonte (site, utm_source, etc.)
- Status (novo, contatado, convertido)

## 🎯 Próximos Passos Para Deploy

### 1. Testar Localmente (AGORA):
```bash
# Backend
cd SiteDoTrabalhador-backend
npm start

# Frontend (novo terminal)
cd SiteDoTrabalhador-frontend
npm run dev
```

### 2. Deploy Backend (Render.com):
1. Suba o código para GitHub
2. Conecte no Render.com
3. Configure variáveis:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://seusite.vercel.app
   ```

### 3. Deploy Frontend (Vercel):
1. `vercel --prod`
2. Configure variável:
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.render.com
   ```

## 🆘 Se Algo Der Errado

### Backend não inicia?
```bash
cd SiteDoTrabalhador-backend
npx kill-port 3001
npm install
npm start
```

### Não vê os leads?
1. Certifique-se que o backend está rodando
2. Abra: `http://localhost:3001` (deve mostrar mensagem de sucesso)
3. Teste enviar um lead pelo frontend
4. Refresh a página: `http://localhost:3001/api/leads`

### Banco sumiu?
Não tem problema! O SQLite recria automaticamente quando você roda `npm start`.

## 💡 Dica Final

**Para ter certeza de que está tudo funcionando:**

1. ✅ `npm start` no backend
2. ✅ Abrir `http://localhost:3001` (ver mensagem de sucesso)
3. ✅ Abrir `http://localhost:3001/api/leads` (ver lista de leads)
4. ✅ Testar formulário no frontend
5. ✅ Refresh a página de leads para ver o novo cadastro

**🔥 Pronto! Seu sistema completo está funcionando!**
