import Sound from 'react-native-sound';
import {useVolumeStore} from '../store/useVolumeStore';
// Preload sounds
const soundFiles: { [key: string]: Sound } = {
  tab_switch: new Sound(require('../assets/sounds/tab_switch.mp3'), error => {
      if (error) {
        console.error('Failed to preload tab_switch sound:', error);
      }
    },
  ),
  // Add other sounds here
};

const playSoundEffect = (soundFileName: keyof typeof soundFiles) => {
  const { sfxVolume, isMuted } = useVolumeStore.getState();
  const soundEffect = soundFiles[soundFileName];
  if (!soundEffect) {
    console.error(`Sound file ${soundFileName} not found`);
    return;
  }

  soundEffect.setVolume(isMuted ? 0 : sfxVolume);
  soundEffect.stop(); // Stop any previously playing instance
  soundEffect.play((success) => {
    if (!success) {
      console.error('Sound did not play');
    }
  });
};

export default playSoundEffect;