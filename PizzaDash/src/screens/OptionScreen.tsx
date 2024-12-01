import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useVolumeStore } from '../store/useVolumeStore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const OptionScreen: React.FC = () => {
  const {
    musicVolume,
    sfxVolume,
    setMusicVolume,
    setSfxVolume,
  } = useVolumeStore();
  const navigation = useNavigation();

  const [localMusicVolume, setLocalMusicVolume] = useState(musicVolume);
  const [localSfxVolume, setLocalSfxVolume] = useState(sfxVolume);

  useEffect(() => {
    setLocalMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    setLocalSfxVolume(sfxVolume);
  }, [sfxVolume]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <Icon
            name="arrow-left"
            size={24}
            color="#E74C3C"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Options</Text>
        </View>

        {/* Music Volume Slider */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionLabel}>Music Volume</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={localMusicVolume}
            onValueChange={(value) => setLocalMusicVolume(value)}
            onSlidingComplete={(value) => setMusicVolume(value)}
            minimumTrackTintColor="#E74C3C"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#E74C3C"
          />
        </View>

        {/* SFX Volume Slider */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionLabel}>SFX Volume</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={localSfxVolume}
            onValueChange={(value) => setLocalSfxVolume(value)}
            onSlidingComplete={(value) => setSfxVolume(value)}
            minimumTrackTintColor="#E74C3C"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#E74C3C"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E74C3C',
    textAlign: 'center',
    marginRight: 24, // To center the title with the back button
  },
  optionContainer: {
    marginBottom: 40,
  },
  optionLabel: {
    fontSize: 20,
    color: '#000',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
