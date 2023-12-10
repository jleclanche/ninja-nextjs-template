/** @type {import('next').NextConfig} */

const API_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST || "http://127.0.0.1:8000";

const nextConfig = {
    reactStrictMode: true,

    // https://nextjs.org/docs/api-reference/next.config.js/rewrites
    // Rewrite /api to transparently proxy the backend API host
    // (Avoids CORS issues when running the frontend and backend servers separately)
    rewrites: () => [{ source: "/api/:path*", destination: `${API_HOST}/api/:path*` }],
};

module.exports = nextConfig;
