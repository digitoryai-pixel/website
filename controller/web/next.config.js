/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

module.exports = {
  reactStrictMode: true,
  // The browser talks to the same origin; Next forwards /api to the Controller API.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};
