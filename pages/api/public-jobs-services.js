// API para vagas de serviços gerais
export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    jobs: [],
    message: 'Vagas de serviços gerais (vazio no momento)'
  })
}
