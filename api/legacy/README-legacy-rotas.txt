Rotas copiadas de /pages/api do projeto Next.js original.

Adapte cada arquivo para o padrão Express, removendo dependências de Next.js (req, res) e ajustando para uso com express.Router().

Exemplo de conversão:

// Next.js API Route
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true })
  }
}

// Express
import express from 'express';
const router = express.Router();
router.get('/', (req, res) => {
  res.json({ ok: true });
});
export default router;
