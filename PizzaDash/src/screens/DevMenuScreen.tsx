import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {useCurrencyStore} from '../store/useCurrencyStore';
import {useExperienceStore} from '../store/useExperienceStore';

export const DevMenuScreen = () => {
  const [moneyAmount, setMoneyAmount] = useState('1000');
  const [experienceAmount, setExperienceAmount] = useState('100');
  const addCurrency = useCurrencyStore(state => state.addCurrency);
  const addExperience = useExperienceStore(state => state.addExperience);
  const currentMoney = useCurrencyStore(state => state.balance);
  const currentLevel = useExperienceStore(state => state.level);
  const currentExp = useExperienceStore(state => state.experience);

  const handleAddMoney = () => {
    const amount = parseInt(moneyAmount);
    if (!isNaN(amount)) {
      addCurrency(amount);
      Alert.alert('Success', `Added $${amount} to balance`);
    }
  };

  const handleAddExperience = () => {
    const amount = parseInt(experienceAmount);
    if (!isNaN(amount)) {
      addExperience(amount);
      Alert.alert('Success', `Added ${amount} experience points`);
    }
  };

  const handleSetMoney = () => {
    const amount = parseInt(moneyAmount);
    if (!isNaN(amount)) {
      const difference = amount - currentMoney;
      addCurrency(difference);
      Alert.alert('Success', `Set balance to $${amount}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Developer Menu</Text>
        <Text style={styles.warningText}>⚠️ For Testing Only</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Current Balance: ${currentMoney}</Text>
        <Text style={styles.statsText}>Current Level: {currentLevel}</Text>
        <Text style={styles.statsText}>Current EXP: {currentExp}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency Controls</Text>
        <TextInput
          style={styles.input}
          value={moneyAmount}
          onChangeText={setMoneyAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddMoney}>
            <Text style={styles.buttonText}>Add Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.setButton]}
            onPress={handleSetMoney}>
            <Text style={styles.buttonText}>Set Money</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience Controls</Text>
        <TextInput
          style={styles.input}
          value={experienceAmount}
          onChangeText={setExperienceAmount}
          keyboardType="numeric"
          placeholder="Enter amount"
        />
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={handleAddExperience}>
          <Text style={styles.buttonText}>Add Experience</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.dangerButton]}
        onPress={() => {
          Alert.alert(
            'Reset Progress',
            'Are you sure you want to reset all progress?',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Reset',
                style: 'destructive',
                onPress: () => {
                  addCurrency(-currentMoney);
                  // Reset experience (assuming level 1 and 0 exp)
                  const resetExp = -(currentExp + (currentLevel - 1) * 100);
                  addExperience(resetExp);
                  Alert.alert('Success', 'Progress has been reset');
                },
              },
            ],
          );
        }}>
        <Text style={styles.buttonText}>Reset Progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
    color: '#FFD700',
  },
  statsContainer: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#E0E0E0',
    marginVertical: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  setButton: {
    backgroundColor: '#2196F3',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
