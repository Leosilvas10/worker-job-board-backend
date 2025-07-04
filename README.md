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
