// MapScreen.tsx
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import MapView, {Marker, Callout, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import haversine from 'haversine';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/RootStackParams';
import {useLocationStore} from '../store/useLocationStore';
import {TabParamList} from '../navigation/TabParamList';
import {useOrderStore} from '../store/useOrderStore';
import {Order} from '../store/useOrderStore'; // Ensure you have the Order type imported

type MapScreenRouteProp = RouteProp<TabParamList, 'Map'>;

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
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isNavigatingToCustomer, setIsNavigatingToCustomer] =
    useState<boolean>(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [deliveryCompleted, setDeliveryCompleted] = useState<boolean>(false);

  // Create refs to hold the latest values
  const isNavigatingToCustomerRef = useRef(isNavigatingToCustomer);
  const currentOrderIdRef = useRef(currentOrderId);
  const currentPastOrder = useOrderStore(state =>
    state.pastOrders.find(order => order.id === currentOrderId),
  );
  const setCurrentOrder = useOrderStore(state => state.setCurrentOrder);

  useEffect(() => {
    if (currentPastOrder && currentPastOrder.status === 'past') {
      setDeliveryCompleted(true);
      stopNavigation();
    }
  }, [currentPastOrder]);

  // Update refs whenever state changes
  useEffect(() => {
    isNavigatingToCustomerRef.current = isNavigatingToCustomer;
  }, [isNavigatingToCustomer]);

  useEffect(() => {
    currentOrderIdRef.current = currentOrderId;
  }, [currentOrderId]);

  const mapRef = useRef<MapView>(null);
  const selectedRestaurantRef = useRef<any>(null);
  const navigationList =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigationTab = useNavigation<StackNavigationProp<TabParamList>>();
  const route = useRoute<MapScreenRouteProp>();

  // Use global location store
  const location = useLocationStore(state => state.location);
  const requestLocation = useLocationStore(state => state.requestLocation);
  const setLocation = useLocationStore(state => state.setLocation);

  // Use order store
  const updateOrder = useOrderStore(state => state.updateOrder);

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
    if (location?.latitude && location?.longitude) {
      const fetchRestaurants = async () => {
        setLoadingRestaurants(true);
        try {
          const response = await axios.get(
            `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=restaurant](around:3000,${location.latitude},${location.longitude});out;`,
          );
          const elements = response.data.elements;
          setRestaurants(elements);
        } catch (error) {
          console.error('Error fetching restaurants:', error);
          Alert.alert('Error', 'Could not fetch nearby restaurants.');
        } finally {
          setLoadingRestaurants(false);
        }
      };

      fetchRestaurants();
    }
  }, [location]);

  useEffect(() => {
    if (route.params?.customerLocation) {
      const customerLocation = route.params.customerLocation;
      const orderId = route.params.orderId ?? null;
      setIsNavigatingToCustomer(true);
      setCurrentOrderId(orderId);
      handleNavigateToLocation(customerLocation);
      navigationTab.setParams({
        customerLocation: undefined,
        orderId: undefined,
      });
    }
  }, [route.params, navigationTab]);

  const handleNavigateToLocation = (destinationCoords: {
    latitude: number;
    longitude: number;
  }) => {
    setNavigationActive(true);
    setDestination(destinationCoords);

    // Clear any existing navigation watcher
    if (navigationWatchId !== null) {
      Geolocation.clearWatch(navigationWatchId);
      setNavigationWatchId(null);
    }

    // Start watching position specifically for navigation
    const id = Geolocation.watchPosition(
      position => {
        const currentCoords = position.coords;
        setLocation({...currentCoords});
        getRoute(
          currentCoords,
          destinationCoords.latitude,
          destinationCoords.longitude,
        );

        // Calculate distance to destination
        const distance = haversine(
          {
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
          },
          destinationCoords,
          {unit: 'meter'},
        );

        if (isNavigatingToCustomerRef.current && currentOrderIdRef.current) {
          const currentOrder = useOrderStore
            .getState()
            .activeOrders.find(order => order.id === currentOrderIdRef.current);
          setCurrentOrder(currentOrder ?? null);
          if (distance <= 300000) {
            updateOrder(currentOrderIdRef.current, {
              isNearCustomer: true,
            });
          } else {
            updateOrder(currentOrderIdRef.current, {
              isNearCustomer: false,
            });
          }
        } else {
          // Show "Make Pizza" button when near restaurant
          setShowMakePizza(distance <= 30000);
        }
      },
      error => {
        console.log(error);
      },
      {enableHighAccuracy: true, distanceFilter: 10},
    );

    setNavigationWatchId(id);
  };

  const handleNavigatePress = (restaurant: any) => {
    selectedRestaurantRef.current = restaurant;
    setIsNavigatingToCustomer(false);
    setCurrentOrderId(null);
    handleNavigateToLocation({
      latitude: restaurant.lat,
      longitude: restaurant.lon,
    });
  };

  const stopNavigation = () => {
    setNavigationActive(false);
    setCurrentOrder(null);
    setRouteCoords([]);
    setEstimatedTime(null);
    setShowMakePizza(false);
    setDestination(null);
    if (currentOrderIdRef.current && isNavigatingToCustomerRef.current) {
      updateOrder(currentOrderIdRef.current, {
        isNearCustomer: false,
      });
    }
    setCurrentOrderId(null);
    setIsNavigatingToCustomer(false);

    if (navigationWatchId !== null) {
      Geolocation.clearWatch(navigationWatchId);
      setNavigationWatchId(null);
    }
    selectedRestaurantRef.current = null;
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
      navigationList.navigate('PizzaMakingGame', {
        restaurant: selectedRestaurantRef.current,
      });
    }
  };

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
      console.error('Error fetching route:', error);
      Alert.alert('Error', 'Could not get route.');
    } finally {
      setLoadingRoute(false);
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
            {!isNavigatingToCustomer && showMakePizza && (
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

        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor="blue"
          />
        )}

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={deliveryCompleted}
        onRequestClose={() => {
          setDeliveryCompleted(false);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Use an icon from FontAwesome instead of a custom image */}
            <Icon name="check-circle" size={80} color="#27ae60" />
            <Text style={styles.modalTitle}>Delivery Completed!</Text>
            <Text style={styles.modalMessage}>
              Your pizza has been delivered successfully. Thank you!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setDeliveryCompleted(false)}>
              <Text style={styles.modalButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#27ae60',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#34495e',
  },
  modalButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
