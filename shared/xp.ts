export interface LevelInfo {
  level: number;
  xpRequired: number;
  title: string;
}

export const XP_LEVELS: LevelInfo[] = [
  { level: 1, xpRequired: 0, title: "Новичок" },
  { level: 2, xpRequired: 100, title: "Начинающий" },
  { level: 3, xpRequired: 300, title: "Ученик" },
  { level: 4, xpRequired: 600, title: "Практикант" },
  { level: 5, xpRequired: 1000, title: "Дизайнер" },
  { level: 6, xpRequired: 1500, title: "Опытный дизайнер" },
  { level: 7, xpRequired: 2200, title: "Продвинутый" },
  { level: 8, xpRequired: 3000, title: "Мастер" },
  { level: 9, xpRequired: 4000, title: "Эксперт" },
  { level: 10, xpRequired: 5500, title: "Гуру" },
  { level: 11, xpRequired: 7500, title: "Легенда" },
  { level: 12, xpRequired: 10000, title: "Элита" },
];

export const XP_REWARDS = {
  TASK_SOLUTION: { xp: 50, description: "Решение задачи" },
  TASK_ACCEPTED: { xp: 100, description: "Принятое решение" },
  BATTLE_WIN: { xp: 300, description: "Победа в батле" },
  BATTLE_SECOND: { xp: 150, description: "2-е место в батле" },
  BATTLE_THIRD: { xp: 75, description: "3-е место в батле" },
  BATTLE_PARTICIPATION: { xp: 25, description: "Участие в батле" },
  BATTLE_CREATED: { xp: 50, description: "Создание батла" },
  TASK_CREATED: { xp: 75, description: "Создание задачи" },
  DAILY_LOGIN: { xp: 10, description: "Ежедневный вход" },
  PROFILE_COMPLETE: { xp: 100, description: "Заполнение профиля" },
  FIRST_SOLUTION: { xp: 50, description: "Первое решение" },
  STREAK_BONUS: { xp: 25, description: "Бонус за серию дней" },
} as const;

export function getLevelInfo(totalXp: number) {
  let currentLevel: LevelInfo = XP_LEVELS[0];
  let nextLevel: LevelInfo | null = XP_LEVELS[1] || null;
  
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_LEVELS[i].xpRequired) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || null;
      break;
    }
  }
  
  const xpInCurrentLevel = totalXp - currentLevel.xpRequired;
  const xpToNextLevel = nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 0;
  const progressPercent = nextLevel ? Math.min(100, (xpInCurrentLevel / xpToNextLevel) * 100) : 100;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    totalXp,
    xpInCurrentLevel,
    xpToNextLevel,
    progressPercent,
    nextLevel: nextLevel ? {
      level: nextLevel.level,
      title: nextLevel.title,
      xpRequired: nextLevel.xpRequired,
    } : null,
    isMaxLevel: !nextLevel,
  };
}
