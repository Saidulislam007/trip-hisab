import type { NextConfig } from 'next';
const serverURL = (process.env.API_SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() { return [{ source: '/api/:path*', destination: `${serverURL}/api/:path*` }]; },
};
export default nextConfig;
