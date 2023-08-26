/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: process.env.BASE || '',
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig
