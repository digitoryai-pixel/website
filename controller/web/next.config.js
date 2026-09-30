/** @type {import('next').NextConfig} */
// API_HOSTPORT is the private host:port Render provides for the API service.
const API_URL = process.env.API_URL ?? (process.env.API_HOSTPORT ? `http://${process.env.API_HOSTPORT}` : 'http://localhost:4000');

module.exports = {
  reactStrictMode: true,
  // The browser talks to the same origin; Next forwards /api to the Controller API.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};
