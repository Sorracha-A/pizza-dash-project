import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Bar as ProgressBar} from 'react-native-progress';
import {useExperienceStore} from '../store/useExperienceStore';

const LevelDisplay = () => {
  const level = useExperienceStore(state => state.level);
  const progress = useExperienceStore(state => state.getLevelProgress());
  const experience = useExperienceStore(state => state.experience);
  const nextLevelXP = useExperienceStore(state => state.getNextLevelXP());

  return (
    <View style={styles.container}>
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{level}</Text>
      </View>
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={progress}
          width={100}
          color="#4CAF50"
          unfilledColor="#ECEFF1"
          borderWidth={0}
        />
        <Text style={styles.xpText}>
          {experience}/{nextLevelXP} XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
  },
  levelBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 2,
  },
});

export default LevelDisplay;
