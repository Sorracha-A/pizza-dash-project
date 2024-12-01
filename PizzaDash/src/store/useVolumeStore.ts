// store/useVolumeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... existing imports ...

type VolumeStore = {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
};

export const useVolumeStore = create<VolumeStore>()(
  persist(
    (set, get) => ({
      musicVolume: 1,
      sfxVolume: 1,
      isMuted: false,
      setMusicVolume: (volume: number) => set({ musicVolume: volume }),
      setSfxVolume: (volume: number) => set({ sfxVolume: volume }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: 'volume-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
