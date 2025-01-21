import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useVolumeStore } from '../store/useVolumeStore';
import { useGameSettingsStore } from '../store/useGameSettingsStore';
import { useNavigation } from '@react-navigation/native';

const OptionScreen: React.FC = () => {
  const {
    musicVolume,
    sfxVolume,
    setMusicVolume,
    setSfxVolume,
  } = useVolumeStore();
  const { maxCustomerDistance, setMaxCustomerDistance } = useGameSettingsStore();
  const navigation = useNavigation();

  const [localMusicVolume, setLocalMusicVolume] = useState(musicVolume);
  const [localSfxVolume, setLocalSfxVolume] = useState(sfxVolume);
  const [distanceInput, setDistanceInput] = useState(maxCustomerDistance.toString());

  useEffect(() => {
    setLocalMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    setLocalSfxVolume(sfxVolume);
  }, [sfxVolume]);

  const handleDistanceChange = (text: string) => {
    setDistanceInput(text);
    const distance = parseInt(text);
    if (!isNaN(distance) && distance >= 100 && distance <= 10000) {
      setMaxCustomerDistance(distance);
    }
  };

  const validateDistance = () => {
    const distance = parseInt(distanceInput);
    if (isNaN(distance) || distance < 100 || distance > 10000) {
      Alert.alert(
        'Invalid Distance',
        'Please enter a distance between 100m and 10000m',
      );
      setDistanceInput(maxCustomerDistance.toString());
    }
  };

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

        {/* Max Customer Distance */}
        <View style={styles.optionContainer}>
          <Text style={styles.optionLabel}>Max Customer Distance (m)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={distanceInput}
              onChangeText={handleDistanceChange}
              onBlur={validateDistance}
              keyboardType="numeric"
              placeholder="100-10000"
            />
            <Text style={styles.unitText}>m</Text>
          </View>
          <Text style={styles.helpText}>
            Set the maximum distance for customer orders (100m - 10km)
          </Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 8,
    width: 100,
    marginRight: 5,
    textAlign: 'right',
  },
  unitText: {
    fontSize: 16,
    color: '#666',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
