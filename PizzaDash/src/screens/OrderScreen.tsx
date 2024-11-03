import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>This is the Order Screen</Text>
    </View>
  );
};

export default OrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
