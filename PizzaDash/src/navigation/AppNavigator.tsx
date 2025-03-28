// AppNavigator.tsx

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, Header} from '@react-navigation/stack';
import {View} from 'react-native';

import LandingScreen from '../screens/LandingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import OrderScreen from '../screens/OrderScreen';
import OptionScreen from '../screens/OptionScreen';
import PizzaMakingGame from '../screens/PizzaMakingGame';
import CustomizationScreen from '../screens/CustomizationScreen';
import {DevMenuScreen} from '../screens/DevMenuScreen';
import CurrencyDisplay from '../components/CurrencyDisplay';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import playSoundEffect from '../helper/playSoundEffect';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({route}) => ({
      headerShown: false,
      tabBarActiveTintColor: '#E74C3C',
      tabBarInactiveTintColor: 'gray',
      tabBarIcon: ({color, size}) => {
        let iconName = '';

        if (route.name === 'Dashboard') {
          iconName = 'dashboard';
        } else if (route.name === 'Map') {
          iconName = 'map';
        } else if (route.name === 'Order') {
          iconName = 'shopping-cart';
        } else if (route.name === 'Customize') {
          iconName = 'paint-brush';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}>
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      listeners={{
        tabPress: () => playSoundEffect('tab_switch'),
      }}
    />
    <Tab.Screen
      name="Map"
      component={MapScreen}
      listeners={{
        tabPress: () => playSoundEffect('tab_switch'),
      }}
    />
    <Tab.Screen
      name="Order"
      component={OrderScreen}
      options={{
        headerShown: true,
        headerTitle: 'Order',
        headerTitleAlign: 'center',
      }}
      listeners={{
        tabPress: () => playSoundEffect('tab_switch'),
      }}
    />
    <Tab.Screen
      name="Customize"
      component={CustomizationScreen}
      listeners={{
        tabPress: () => playSoundEffect('tab_switch'),
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Main" component={TabNavigator} options={{gestureEnabled: false}}/>
        <Stack.Screen name="OptionScreen" component={OptionScreen} />
        <Stack.Screen
          name="PizzaMakingGame"
          component={PizzaMakingGame}
          options={{headerShown: true, gestureEnabled: false}}
        />
        <Stack.Screen 
          name="DevMenu" 
          component={DevMenuScreen}
          options={{
            headerShown: true,
            title: 'Developer Menu',
            headerStyle: {
              backgroundColor: '#1E1E1E',
            },
            headerTintColor: '#E0E0E0',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
