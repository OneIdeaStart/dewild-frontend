import { useMintStageContext } from '@/context/MintStageContext';
import { STAGE_CONFIGS } from '@/config/mint-stages';
import { MintStage } from '@/types/mint-stages';

// Для тестирования стадий
const DEV_MODE = true; // Легко переключить режим разработки
const FORCED_STAGE = MintStage.WHITELIST_REGISTRATION; // Стадия для тестирования

export const useMintStage = () => {
  // Извлекаем данные и функции из контекста
  const { isWhitelisted, isLoading, checkWhitelistStatus, currentStage: contextStage } = useMintStageContext();

  // Если включен DEV_MODE, используем FORCED_STAGE, иначе берем текущую стадию из контекста
  const currentStage = DEV_MODE ? FORCED_STAGE : contextStage;

  // TODO: Добавить получение реальной стадии из контракта
  if (!DEV_MODE) {
    // Здесь будет логика получения реальной стадии из контракта
    // setCurrentStage(realStageFromContract)
  }

  // Логика проверки возможности взаимодействия
  const canInteract = () => {
    if (isLoading) return false;

    const config = STAGE_CONFIGS[currentStage];
    if (config.isWhitelistOnly && !isWhitelisted) return false;

    return true;
  };

  return {
    currentStage, // Текущая стадия (с учетом DEV_MODE)
    stageConfig: STAGE_CONFIGS[currentStage], // Конфигурация текущей стадии
    canInteract: canInteract(), // Можно ли взаимодействовать
    isWhitelisted, // Статус вайтлиста (из контекста)
    isLoading, // Статус загрузки
    checkWhitelistStatus, // Функция проверки статуса
  };
};
