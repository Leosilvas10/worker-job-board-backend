// API para vagas de tecnologia
export default async function handler(req, res) {
  return res.status(200).json({
    success: true,
    jobs: [],
    message: 'Vagas de tecnologia (vazio no momento)'
  })
}
