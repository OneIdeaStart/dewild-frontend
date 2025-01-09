/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Включаем файловое кэширование
    config.cache = false;

    return config;
  },
  
  // Добавляем настройки безопасности
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
              "img-src 'self' data: https://* blob:",
              "connect-src 'self' wss: https://* http://*",
              "frame-src 'self' https://*",
            ].join('; ')
          }
        ]
      }
    ];
  },

  // Настройки компилятора для продакшена
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

module.exports = nextConfig;