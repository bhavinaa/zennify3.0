// Calculate level based on XP
export const calculateLevel = (xp: number): number => {
  // Simple leveling algorithm:
  // Level 1: 0-99 XP
  // Level 2: 100-299 XP
  // Level 3: 300-599 XP
  // Each level requires more XP than the previous one
  
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  if (xp < 3600) return 8;
  if (xp < 4500) return 9;
  return 10 + Math.floor((xp - 4500) / 1000);
};

// Calculate XP needed for next level
export const xpForNextLevel = (level: number): number => {
  switch (level) {
    case 1: return 100;
    case 2: return 300;
    case 3: return 600;
    case 4: return 1000;
    case 5: return 1500;
    case 6: return 2100;
    case 7: return 2800;
    case 8: return 3600;
    case 9: return 4500;
    default: return (level - 10) * 1000 + 5500;
  }
};

// Generate the XP bar percentage
export const calculateXpPercentage = (xp: number, level: number): number => {
  if (level === 1) {
    return (xp / 100) * 100;
  }
  
  const currentLevelMinXp = xpForNextLevel(level - 1);
  const nextLevelXp = xpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelMinXp;
  const xpNeededForLevel = nextLevelXp - currentLevelMinXp;
  
  return (xpInCurrentLevel / xpNeededForLevel) * 100;
};