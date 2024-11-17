import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, {Marker, Callout, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import haversine from 'haversine';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/RootStackParams';
import {useLocationStore} from '../store/useLocationStore';

const MapScreen: React.FC = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(false);
  const [routeCoords, setRouteCoords] = useState<
    {latitude: number; longitude: number}[]
  >([]);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [navigationActive, setNavigationActive] = useState<boolean>(false);
  const [navigationWatchId, setNavigationWatchId] = useState<number | null>(
    null,
  );
  const [showMakePizza, setShowMakePizza] = useState<boolean>(false);

  const mapRef = useRef<MapView>(null);
  const selectedRestaurantRef = useRef<any>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Use global location store
  const location = useLocationStore(state => state.location);
  const requestLocation = useLocationStore(state => state.requestLocation);
  const setLocation = useLocationStore(state => state.setLocation);

  useEffect(() => {
    requestLocation();

    // Start watching location updates
    const watchId = Geolocation.watchPosition(
      position => {
        setLocation({...position.coords});
      },
      error => {
        console.log(error);
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [requestLocation, setLocation]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoadingRestaurants(true);
      try {
        if (location?.latitude && location?.longitude) {
          const response = await axios.get(
            `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=restaurant](around:3000,${location.latitude},${location.longitude});out;`,
          );
          const elements = response.data.elements;
          setRestaurants(elements);
        }
      } catch (error) {
        console.error('Error fetching restaurants:');
        Alert.alert('Error', 'Could not fetch nearby restaurants.');
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, [location]);

  const getRoute = async (
    currentLocation: {latitude: number; longitude: number},
    destinationLat: number,
    destinationLon: number,
  ) => {
    setLoadingRoute(true);
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${currentLocation.longitude},${currentLocation.latitude};${destinationLon},${destinationLat}?overview=full&geometries=geojson`,
      );
      const route = response.data.routes[0];
      const coordinates = route.geometry.coordinates;
      const routeCoords = coordinates.map((coord: [number, number]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
      setRouteCoords(routeCoords);
      setEstimatedTime(Math.ceil(route.duration / 60)); // Duration in minutes
    } catch (error) {
      console.error('Error fetching route:');
      Alert.alert('Error', 'Could not get route.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleNavigatePress = (restaurant: any) => {
    selectedRestaurantRef.current = restaurant;
    setNavigationActive(true);

    // Clear any existing navigation watcher
    if (navigationWatchId !== null) {
      Geolocation.clearWatch(navigationWatchId);
      setNavigationWatchId(null);
    }

    // Start watching position specifically for navigation
    const id = Geolocation.watchPosition(
      position => {
        const currentCoords = position.coords;
        setLocation(currentCoords);
        getRoute(currentCoords, restaurant.lat, restaurant.lon);

        // Calculate distance to destination
        const distance = haversine(
          {
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
          },
          {latitude: restaurant.lat, longitude: restaurant.lon},
          {unit: 'meter'},
        );

        // Show "Make Pizza" button if within 300 meters
        if (distance <= 300) {
          setShowMakePizza(true);
        } else {
          setShowMakePizza(false);
        }
      },
      error => {
        console.log(error);
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    setNavigationWatchId(id);
  };

  const stopNavigation = () => {
    setNavigationActive(false);
    setRouteCoords([]);
    setEstimatedTime(null);
    setShowMakePizza(false);

    if (navigationWatchId !== null) {
      Geolocation.clearWatch(navigationWatchId);
      setNavigationWatchId(null);
    }
  };

  const centerMapOnLocation = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000,
      );
    }
  };

  const navigateToPizzaGame = () => {
    if (selectedRestaurantRef.current) {
      navigation.navigate('PizzaMakingGame', {
        restaurant: selectedRestaurantRef.current,
      });
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      {estimatedTime !== null && (
        <View style={styles.estimatedTimeContainer}>
          <Text style={styles.estimatedTimeText}>
            Estimated Time: {estimatedTime} mins
          </Text>
          <View style={{flexDirection: 'row', marginTop: 10}}>
            <TouchableOpacity
              onPress={stopNavigation}
              style={styles.stopButton}>
              <Text style={styles.stopButtonText}>Stop Navigation</Text>
            </TouchableOpacity>
            {showMakePizza && (
              <TouchableOpacity
                onPress={navigateToPizzaGame}
                style={styles.makePizzaButton}>
                <Text style={styles.makePizzaButtonText}>Make Pizza</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {(loadingRestaurants || loadingRoute) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#E74C3C" />
          <Text style={{textAlign: 'center', color: '#E74C3C'}}>
            {loadingRestaurants ? 'Loading restaurants...' : 'Loading route...'}
          </Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={{flex: 1}}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        followsUserLocation={navigationActive}>
        {restaurants.map((restaurant, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: restaurant.lat,
              longitude: restaurant.lon,
            }}>
            <Callout>
              <View
                style={{
                  width: 200,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <Text>{restaurant.tags.name || 'Restaurant'}</Text>
                  <Text>{restaurant.tags['addr:street'] || ''}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleNavigatePress(restaurant)}
                  style={{paddingLeft: 10}}>
                  <Icon name="location-arrow" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#E74C3C"
            strokeWidth={4}
          />
        )}
      </MapView>

      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerMapOnLocation}>
        <Icon name="crosshairs" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimatedTimeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
    alignItems: 'center',
  },
  estimatedTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#E74C3C',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  stopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  makePizzaButton: {
    backgroundColor: '#27ae60',
    padding: 8,
    borderRadius: 5,
  },
  makePizzaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
