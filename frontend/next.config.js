/** Proxies /api to FastAPI so the browser never needs CORS. Override with BACKEND_URL. */
module.exports = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() { return [{ source: "/api/:path*", destination: `${process.env.BACKEND_URL || "http://127.0.0.1:8000"}/api/:path*` }]; },
};
