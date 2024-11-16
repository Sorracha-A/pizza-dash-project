// AppNavigator.tsx

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, Header} from '@react-navigation/stack';

import LandingScreen from '../screens/LandingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MapScreen from '../screens/MapScreen';
import OrderScreen from '../screens/OrderScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PizzaMakingGame from '../screens/PizzaMakingGame';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

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
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
    })}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen
      name="Order"
      component={OrderScreen}
      options={{
        headerShown: true,
        headerTitle: 'Order',
        headerTitleAlign: 'center',
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PizzaMakingGame" component={PizzaMakingGame} options={{headerShown: true}}/>
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
