import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExperienceStore {
  level: number;
  experience: number;
  addExperience: (amount: number) => void;
  getNextLevelXP: () => number;
  getLevelProgress: () => number;
}

// Experience required for each level (increases by 100 each level)
const getRequiredXP = (level: number) => level * 100;

export const useExperienceStore = create(
  persist<ExperienceStore>(
    (set, get) => ({
      level: 1,
      experience: 0,
      addExperience: (amount: number) =>
        set(state => {
          let newExperience = state.experience + amount;
          let newLevel = state.level;
          
          // Check if player should level up
          while (newExperience >= getRequiredXP(newLevel)) {
            newExperience -= getRequiredXP(newLevel);
            newLevel++;
          }
          
          return {
            experience: newExperience,
            level: newLevel,
          };
        }),
      getNextLevelXP: () => getRequiredXP(get().level),
      getLevelProgress: () => {
        const currentXP = get().experience;
        const requiredXP = getRequiredXP(get().level);
        return currentXP / requiredXP;
      },
    }),
    {
      name: 'experience-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
