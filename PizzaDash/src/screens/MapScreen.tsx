import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>This is the Map Screen</Text>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
