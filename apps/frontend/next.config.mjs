const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  turbopack: {},
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3014',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Konva tries to require 'canvas' on server-side (Node.js), which we don't need
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3014/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/editor',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
