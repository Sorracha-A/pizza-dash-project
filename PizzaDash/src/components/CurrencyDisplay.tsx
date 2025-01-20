import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useCurrencyStore} from '../store/useCurrencyStore';

const CurrencyDisplay = () => {
  const balance = useCurrencyStore(state => state.balance);

  return (
    <View style={styles.container}>
      <Icon name="dollar" size={16} color="#FFD700" />
      <Text style={styles.text}>{balance}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginRight: 10,
  },
  text: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
});

export default CurrencyDisplay;
