/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.cache = false;
    return config;
  },
  
  // Отключаем оптимизацию CSS полностью
  optimizeFonts: false,
  optimizeImages: false,
  swcMinify: false,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
              "img-src 'self' data: https://* blob:",
              "connect-src 'self' wss: https://* http://* https://www.google-analytics.com https://www.googletagmanager.com",
              "frame-src 'self' https://*",
            ].join('; ')
          }
        ]
      }
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

module.exports = nextConfig;