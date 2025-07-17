
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Configuração para produção
  trailingSlash: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.sitedotrabalhador.com.br';
    
    // Garantir que a URL sempre comece com https://
    const validApiUrl = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
    
    console.log('🔗 API URL configurada para rewrites:', validApiUrl);
    
    return [
      {
        source: '/api/:path*',
        destination: `${validApiUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
