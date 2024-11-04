import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const PizzaMakingGame: React.FC = ({ route, navigation }: any) => {
  const { restaurant } = route.params;

  const handleMakePizza = () => {
    Alert.alert('Pizza Made!', 'You have successfully made the pizza.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make Pizza for {restaurant.tags.name}</Text>
      <TouchableOpacity style={styles.button} onPress={handleMakePizza}>
        <Text style={styles.buttonText}>Make Pizza</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PizzaMakingGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    marginBottom: 30
  },
  button: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 18
  }
});
