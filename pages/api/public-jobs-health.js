// API para vagas de saúde
export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    jobs: [],
    message: 'Vagas de saúde (vazio no momento)'
  })
}
