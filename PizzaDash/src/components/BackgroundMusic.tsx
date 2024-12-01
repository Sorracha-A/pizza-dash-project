// components/BackgroundMusic.tsx
import React, { useEffect, useRef, useState } from 'react';
import Sound from 'react-native-sound';
import { AppState, AppStateStatus } from 'react-native';
import { useVolumeStore } from '../store/useVolumeStore';

const BackgroundMusic: React.FC = () => {
  const backgroundSoundRef = useRef<Sound | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const musicVolume = useVolumeStore((state) => state.musicVolume);
  const isMuted = useVolumeStore((state) => state.isMuted);
  const [hasHydrated, setHasHydrated] = useState(
    useVolumeStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsub = useVolumeStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      // Wait until the store has been rehydrated
      return;
    }

    // Enable playback in silence mode (iOS)
    Sound.setCategory('Playback', true);

    const backgroundSound = new Sound(
      require('../assets/sounds/Fretless.mp3'),
      (error) => {
        if (!error) {
          backgroundSound.setNumberOfLoops(-1);
          backgroundSound.setVolume(isMuted ? 0 : musicVolume);
          backgroundSound.play();
          backgroundSoundRef.current = backgroundSound;
        } else {
          console.error('Failed to load the sound', error);
        }
      },
    );

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        backgroundSoundRef.current?.play();
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        backgroundSoundRef.current?.pause();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      backgroundSoundRef.current?.release();
      subscription.remove();
    };
  }, [hasHydrated]);

  // Update volume when musicVolume or isMuted changes
  useEffect(() => {
    if (backgroundSoundRef.current) {
      backgroundSoundRef.current.setVolume(isMuted ? 0 : musicVolume);
    }
  }, [musicVolume, isMuted]);

  return null;
};

export default BackgroundMusic;