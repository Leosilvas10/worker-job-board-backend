/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://worker-job-board-backend-leonardosilvas2.replit.app';
    
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
