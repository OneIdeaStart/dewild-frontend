/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    config.externals = config.externals || [];
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    // Добавляем определение режима для Lit
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@lit/reactive-element': '@lit/reactive-element/development.js',
        'lit': 'lit/development.js',
        'lit-element': 'lit-element/development.js',
        'lit-html': 'lit-html/development.js',
      };
    }

    return config;
  },

  // Обновляем настройки безопасности
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // Разрешаем только конкретные источники
              "default-src 'self'",
              // Явно разрешаем eval и указываем все необходимые домены для скриптов
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://*.walletconnect.com https://*.walletconnect.org",
              // Стили
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Шрифты
              "font-src 'self' data: https://fonts.gstatic.com",
              // Изображения
              "img-src 'self' data: blob: https:",
              // Подключения
              "connect-src 'self' https: wss: data: https://*.walletconnect.com https://*.walletconnect.org",
              // Web3 фреймы
              "frame-src 'self' https: https://*.walletconnect.com https://*.walletconnect.org",
              // Манифесты
              "manifest-src 'self'",
              // Воркеры
              "worker-src 'self' blob:",
              // Фреймы родительские
              "frame-ancestors 'self'",
              // Base URI
              "base-uri 'self'",
              // Формы
              "form-action 'self'",
              // Медиа
              "media-src 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;