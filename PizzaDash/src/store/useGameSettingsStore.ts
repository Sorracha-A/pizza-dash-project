import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameSettingsStore {
  maxCustomerDistance: number;
  setMaxCustomerDistance: (distance: number) => void;
}

export const useGameSettingsStore = create(
  persist<GameSettingsStore>(
    set => ({
      maxCustomerDistance: 500, // Default 500m
      setMaxCustomerDistance: (distance: number) => set({maxCustomerDistance: distance}),
    }),
    {
      name: 'game-settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
