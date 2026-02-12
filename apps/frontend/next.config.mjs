const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Konva tries to require 'canvas' on server-side (Node.js), which we don't need
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
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
