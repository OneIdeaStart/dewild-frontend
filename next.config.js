/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Включаем файловое кэширование
    config.cache = {
      type: 'filesystem', // Тип файлового кэша
      buildDependencies: {
        config: [__filename], // Указываем путь к файлу конфигурации
      },
    };

    return config;
  },
};

module.exports = nextConfig;
