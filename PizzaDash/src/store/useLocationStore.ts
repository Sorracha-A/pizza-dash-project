// useLocationStore.ts
import {create} from 'zustand';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

type LocationStore = {
  location: {latitude: number; longitude: number} | null;
  setLocation: (location: {latitude: number; longitude: number}) => void;
  requestLocation: () => Promise<void>;
};

export const useLocationStore = create<LocationStore>(set => ({
  location: null,
  setLocation: location => set({location: {...location}}),

  requestLocation: async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.',
        );
        return;
      }
    }

    Geolocation.getCurrentPosition(
      position => {
        set({location: {...position.coords}});
      },
      error => {
        console.log(error);
        Alert.alert('Error', 'Could not get your location.');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  },
}));
