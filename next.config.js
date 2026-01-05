/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production, rewrite /api/* to the main outsearched API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://outsearched.vercel.app'

    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/api/:path*'
          : `${apiUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
