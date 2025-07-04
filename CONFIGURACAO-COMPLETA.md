# 🚀 Configuração e Deploy - Backend Site do Trabalhador

## ✅ Configuração Rápida (Desenvolvimento)

### 1. Instalar Dependências
```bash
cd SiteDoTrabalhador-backend
npm install
```

### 2. Configurar Variáveis de Ambiente
O arquivo `.env` já está configurado com:
```
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
AUTO_SYNC_VAGAS=true
SYNC_INTERVAL_MINUTES=60
```

### 3. Iniciar o Servidor
```bash
npm start
# ou
node server.js
```

O servidor vai rodar em: `http://localhost:3001`

## 🎯 Funcionalidades Principais

### ✅ Banco de Dados SQLite
- **Arquivo**: `leads.db` (criado automaticamente)
- **Não precisa instalar nada**: SQLite já vem incluído
- **Tabelas criadas automaticamente**:
  - `leads`: Armazena todos os dados dos formulários
  - `vagas_cache`: Cache de vagas atualizadas automaticamente
  - `estatisticas_diarias`: Métricas do sistema

### ✅ APIs Disponíveis

#### 📝 Leads (Formulários)
- `POST /api/leads` - Salvar novo lead do formulário
- `GET /api/leads` - Listar todos os leads
- `GET /api/leads/:id` - Ver detalhes de um lead
- `PUT /api/leads/:id` - Atualizar status do lead

#### 💼 Vagas
- `GET /api/vagas` - Listar vagas ativas
- `POST /api/vagas/sync` - Sincronizar vagas manualmente
- Sincronização automática a cada 60 minutos

#### 📊 Estatísticas
- `GET /api/jobs-stats` - Estatísticas gerais

### ✅ Sincronização Automática de Vagas
- Configurada para rodar **automaticamente** a cada 60 minutos
- Primeira sincronização acontece 5 segundos após iniciar o servidor
- Para sincronizar manualmente: `npm run sync-vagas`

## 🔧 Scripts Disponíveis

```bash
# Iniciar servidor
npm start

# Sincronizar vagas manualmente
npm run sync-vagas

# Testar conexão com banco
npm run test-db
```

## 🌐 Deploy em Produção

### Opção 1: Render.com (Recomendado)
1. Faça push do código para GitHub
2. Conecte o repositório no Render
3. Configure as variáveis de ambiente:
   ```
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://seudominio.com
   AUTO_SYNC_VAGAS=true
   SYNC_INTERVAL_MINUTES=60
   ```
4. O Render vai executar automaticamente: `npm install && npm start`

### Opção 2: Servidor VPS
```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar repositório
git clone https://github.com/seu-usuario/worker-job-board.git
cd worker-job-board/SiteDoTrabalhador-backend

# Instalar dependências
npm install

# Configurar PM2 para manter o processo rodando
npm install -g pm2
pm2 start server.js --name "site-trabalhador-backend"
pm2 startup
pm2 save
```

## 📊 Estrutura do Banco de Dados

### Tabela `leads`
Armazena **TODOS** os dados dos formulários:
- Dados pessoais (nome, email, telefone)
- Dados da vaga (título, empresa)
- Pesquisa trabalhista (último emprego, salário, etc.)
- Rastreamento (fonte, UTM)
- Status e controle

### Tabela `vagas_cache`
Cache de vagas sincronizadas:
- Dados da vaga (título, empresa, salário)
- Fonte e URL original
- Status ativo/inativo

## 🔗 Integração Frontend → Backend

### Formulário de Candidatura
O frontend já está configurado para enviar dados para:
```
POST http://localhost:3001/api/leads
```

Campos enviados:
- nome, email, telefone
- vaga_titulo, vaga_id
- trabalhou_antes, ultimo_emprego
- tempo_ultimo_emprego, motivo_demissao
- salario_anterior, experiencia_anos
- E muitos outros...

### Listagem de Vagas
O frontend pode buscar vagas em:
```
GET http://localhost:3001/api/vagas
```

## 🛡️ Painel Admin (Simples)

### Ver Leads Cadastrados
```bash
curl http://localhost:3001/api/leads
```

### Ver Estatísticas
```bash
curl http://localhost:3001/api/jobs-stats
```

### Sincronizar Vagas Manualmente
```bash
curl -X POST http://localhost:3001/api/vagas/sync
```

## 🚨 Resolução de Problemas

### Erro de Porta em Uso
```bash
# Matar processo na porta 3001
npx kill-port 3001
# ou
lsof -ti:3001 | xargs kill -9
```

### Banco de Dados Corrompido
```bash
# Deletar e recriar banco
rm leads.db
npm start  # Banco será recriado automaticamente
```

### Testar se Backend está Funcionando
```bash
# Testar API raiz
curl http://localhost:3001/

# Testar banco de dados
npm run test-db

# Ver logs em tempo real
tail -f logs.txt  # se usando PM2
```

## 📈 Próximos Passos

1. ✅ Backend configurado e funcionando
2. ✅ Banco SQLite configurado
3. ✅ Sincronização automática de vagas
4. ✅ API de leads completa
5. 🔄 **Próximo**: Testar integração frontend ↔ backend
6. 🔄 **Próximo**: Deploy em produção
7. 🔄 **Opcional**: Painel admin visual

## 💡 Dicas Importantes

- **SQLite é perfeito** para este projeto: simples, não precisa configurar nada
- **Arquivo do banco** (`leads.db`) será criado automaticamente
- **Backup do banco**: Apenas copie o arquivo `leads.db`
- **Logs**: O servidor mostra todas as operações no console
- **CORS**: Já configurado para funcionar com o frontend Next.js
