<<<<<<< HEAD
# SiteDoTrabalhador Frontend (Next.js)

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo `.env.local.example` para `.env.local` e ajuste a URL do backend se necessário.
3. Inicie o servidor:
   ```bash
   npm run dev
   ```

O frontend ficará disponível em `http://localhost:3000`.

## Consumo de API
- Todas as chamadas para `/api/...` devem ser trocadas para `${process.env.NEXT_PUBLIC_API_URL}/api/...`
- Exemplo:
  ```js
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs-stats`)
  ```

## Deploy na Vercel
- Configure a variável de ambiente `NEXT_PUBLIC_API_URL` com a URL do backend na Render.
=======
# 🚀 SiteDoTrabalhador Backend

> **Backend completo com Express + SQLite para captura de leads e gerenciamento de vagas**

## ⚡ Início Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor
npm start
```

**✅ Servidor rodando em:** `http://localhost:3001`

## 🎯 Funcionalidades

- ✅ **Captura de Leads Completa** - Salva todos os dados dos formulários
- ✅ **Banco SQLite** - Configuração automática, sem dependências
- ✅ **Sincronização de Vagas** - Automática a cada 60 minutos
- ✅ **APIs REST** - Para frontend e painel admin
- ✅ **Deploy Pronto** - Render, Vercel, VPS

## 🔧 APIs Disponíveis

### 📝 Leads (Formulários)
- `POST /api/leads` - Salvar novo lead
- `GET /api/leads` - Listar todos os leads
- `GET /api/leads/:id` - Detalhes de um lead

### 💼 Vagas
- `GET /api/vagas` - Listar vagas ativas
- `POST /api/vagas/sync` - Sincronizar vagas

### 📊 Estatísticas
- `GET /api/jobs-stats` - Estatísticas gerais

## 🗄️ Banco de Dados

**SQLite** (arquivo: `leads.db` - criado automaticamente)

### Tabelas:
- **`leads`** - Todos os dados dos formulários
- **`vagas_cache`** - Cache de vagas sincronizadas
- **`estatisticas_diarias`** - Métricas do sistema

## 🧪 Testar Funcionamento

```bash
# Teste automático completo
npm run test-manual

# Teste individual do banco
npm run test-db

# Sincronizar vagas manualmente
npm run sync-vagas
```

### Teste Manual no Navegador:
- **API Raiz**: `http://localhost:3001`
- **Ver Leads**: `http://localhost:3001/api/leads`
- **Ver Vagas**: `http://localhost:3001/api/vagas`

## 📁 Estrutura do Projeto

```
SiteDoTrabalhador-backend/
├── server.js              # Servidor principal
├── database.js            # Configuração SQLite
├── package.json           # Dependências e scripts
├── .env                   # Variáveis de ambiente
├── api/
│   ├── leads.js           # API de leads
│   ├── vagas.js           # API de vagas
│   └── jobs-stats.js      # API de estatísticas
├── scripts/
│   ├── sync-vagas.js      # Script de sincronização
│   └── test-database.js   # Teste do banco
└── leads.db              # Banco SQLite (criado auto)
```

## 🌐 Deploy em Produção

### Render.com (Recomendado)
1. Connect GitHub repository
2. Build command: `npm install`
3. Start command: `npm start`
4. Configurar variáveis de ambiente:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://seudominio.com
   AUTO_SYNC_VAGAS=true
   ```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### VPS/Servidor
```bash
# Instalar Node.js 18+
git clone https://github.com/usuario/repo.git
cd SiteDoTrabalhador-backend
npm install
npm install -g pm2
pm2 start server.js --name "backend"
```

## 🔗 Integração com Frontend

O frontend Next.js já está configurado para enviar dados para:
```
POST http://localhost:3001/api/leads
GET  http://localhost:3001/api/vagas
```

### Exemplo de Lead Enviado pelo Frontend:
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "vaga_titulo": "Desenvolvedor",
  "trabalhou_antes": "sim",
  "ultimo_emprego": "Empresa XYZ",
  "salario_anterior": "R$ 5.000",
  "experiencia_anos": 3
}
```

## 📊 Painel Admin (API)

### Ver Todos os Leads:
```bash
curl http://localhost:3001/api/leads
```

### Criar Lead de Teste:
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com"}'
```

## 🛠️ Scripts Disponíveis

```bash
npm start          # Iniciar servidor
npm run dev        # Mesmo que start
npm run test-db    # Testar banco de dados
npm run sync-vagas # Sincronizar vagas
npm run test-manual # Teste completo das APIs
```

## 🔧 Configurações (.env)

```bash
PORT=3001                          # Porta do servidor
CORS_ORIGIN=http://localhost:3000  # Origem permitida (frontend)
NODE_ENV=development               # Ambiente
AUTO_SYNC_VAGAS=true              # Sincronização automática
SYNC_INTERVAL_MINUTES=60          # Intervalo em minutos
```

## 🆘 Resolução de Problemas

### Erro de Porta em Uso:
```bash
npx kill-port 3001
npm start
```

### Banco Corrompido:
```bash
rm leads.db
npm start  # Recria automaticamente
```

### Ver Status:
```bash
npm run test-manual
```

## 📚 Documentação Adicional

- 📖 [**CONFIGURACAO-COMPLETA.md**](./CONFIGURACAO-COMPLETA.md) - Guia detalhado
- ⚡ [**COMO-RODAR-AGORA.md**](./COMO-RODAR-AGORA.md) - Início rápido

---

**🔥 Backend pronto para produção! Apenas rode `npm start` e teste.**
>>>>>>> dc9c62ddd2287c86efddfb40b3c595cbf24ad228
