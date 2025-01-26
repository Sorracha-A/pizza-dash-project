import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import {useOrderStore, Order} from '../store/useOrderStore';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {TabParamList} from '../navigation/TabParamList';
import {StackNavigationProp} from '@react-navigation/stack';
import {useLocationStore} from '../store/useLocationStore';
import {useCustomizationStore} from '../store/useCustomizationStore';
import {useGameSettingsStore} from '../store/useGameSettingsStore';
import playSoundEffect from '../helper/playSoundEffect';

const {width} = Dimensions.get('window');

const OrderScreen: React.FC = () => {
  const [index, setIndex] = useState(0);

  const location = useLocationStore(state => state.location);
  const requestLocation = useLocationStore(state => state.requestLocation);

  useEffect(() => {
    if (!location) {
      requestLocation();
    }
  }, [location, requestLocation]);

  const [routes] = useState([
    {key: 'incoming', title: 'Incoming Orders'},
    {key: 'active', title: 'Active Orders'},
    {key: 'past', title: 'Past Orders'},
  ]);
  const navigation = useNavigation<StackNavigationProp<TabParamList>>();

  const {
    incomingOrders,
    activeOrders,
    pastOrders,
    addActiveOrder,
    canAcceptMoreOrders,
    calculateOrderDistance,
    isWithinDeliveryRange,
    getActiveOrdersCount,
    removeIncomingOrder,
    setOrderStatus,
  } = useOrderStore();

  const selectedVehicle = useCustomizationStore(state =>
    state.vehicles.find(v => v.id === state.selectedVehicle),
  );
  const getVehicleStats = useCustomizationStore(state => state.getItemStats);
  const vehicleStats = selectedVehicle ? getVehicleStats(selectedVehicle.id) : null;

  const maxCustomerDistance = useGameSettingsStore(
    state => state.maxCustomerDistance,
  );

  const handleAcceptOrder = (order: Order) => {
    if (!location) {
      Alert.alert('Error', 'Cannot accept order: Location not available');
      return;
    }

    const distance = calculateOrderDistance(order, location);

    if (!isWithinDeliveryRange(distance)) {
      Alert.alert(
        'Out of Range',
        'This delivery location is too far for your current vehicle.',
      );
      return;
    }

    if (!canAcceptMoreOrders()) {
      Alert.alert(
        'Maximum Orders Reached',
        `Your ${selectedVehicle?.name} can only carry ${vehicleStats?.orderCapacity} order(s) at a time.`,
      );
      return;
    }

    addActiveOrder(order);
  };

  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const updateStartLocation = (
    orderId: string,
    location: {latitude: number; longitude: number},
  ) => {
    useOrderStore.getState().updateOrderStartLocation(orderId, location);
  };

  const generateRandomPoint = (
    center: {latitude: number; longitude: number},
    radiusInMeters: number,
  ): {latitude: number; longitude: number} => {
    const radiusInDegrees = radiusInMeters / 111320;
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    const newLatitude = center.latitude + y;
    const newLongitude =
      center.longitude + x / Math.cos((center.latitude * Math.PI) / 180);

    return {
      latitude: newLatitude,
      longitude: newLongitude,
    };
  };

  const getDistance = (
    loc1: {latitude: number; longitude: number},
    loc2: {latitude: number; longitude: number},
  ) => {
    const lat1 = (loc1.latitude * Math.PI) / 180;
    const lon1 = (loc1.longitude * Math.PI) / 180;
    const lat2 = (loc2.latitude * Math.PI) / 180;
    const lon2 = (loc2.longitude * Math.PI) / 180;

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const R = 6371; // Radius of the Earth in kilometers
    const d = R * c * 1000; // Distance in meters

    return d;
  };

  const generateCustomerName = () => {
    const names = [
      'John',
      'Jane',
      'Bob',
      'Alice',
      'Mike',
      'Emma',
      'Tom',
      'Olivia',
    ];
    const surnames = [
      'Doe',
      'Smith',
      'Johnson',
      'Williams',
      'Jones',
      'Brown',
      'Davis',
      'Miller',
    ];

    return `${names[Math.floor(Math.random() * names.length)]} ${
      surnames[Math.floor(Math.random() * surnames.length)]
    }`;
  };

  const generateCustomerAvatar = () => {
    return `https://i.pravatar.cc/150?img=${Math.floor(
      Math.random() * 70 + 1,
    )}`;
  };

  useEffect(() => {
    const generateRandomOrder = () => {
      if (
        !isAcceptingOrders ||
        incomingOrders.length >= 5 ||
        activeOrders.length >= 3 ||
        !location
      )
        return;

      const customerLocation = generateRandomPoint(
        location,
        maxCustomerDistance,
      );
      const distance = getDistance(
        {latitude: location.latitude, longitude: location.longitude},
        {
          latitude: customerLocation.latitude,
          longitude: customerLocation.longitude,
        },
      );

      // Base delivery fee is $2, plus $1 per 100m
      const deliveryFee = 2 + Math.floor(distance / 100);
      const tip = Math.floor(Math.random() * 5) + 1; // Random tip $1-$5
      const total = deliveryFee + tip;
      const timestamp = new Date().getTime();

      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        customerName: generateCustomerName(),
        customerAvatar: generateCustomerAvatar(),
        items: [
          {name: 'Margherita Pizza', quantity: 1},
          {name: 'Pepperoni Pizza', quantity: 2},
        ],
        customerLocation: {
          latitude: customerLocation.latitude,
          longitude: customerLocation.longitude,
        },
        total,
        deliveryFee,
        tip,
        date: moment().format('MMMM Do YYYY, h:mm:ss a'),
        status: 'incoming',
        pizzaMade: false,
        timestamp,
        distance,
        isNearCustomer: false,
        startLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };

      useOrderStore.setState(state => ({
        incomingOrders: [...state.incomingOrders, newOrder],
      }));

      setTimeout(() => {
        useOrderStore.getState().removeIncomingOrder(newOrder.id);
      }, 3 * 60 * 1000);
    };

    const interval = setInterval(
      generateRandomOrder,
      Math.floor(Math.random() * 5000 + 1000),
    );
    return () => clearInterval(interval);
  }, [isAcceptingOrders, incomingOrders.length, activeOrders.length, location]);

  const toggleOrderAcceptance = () => {
    setIsAcceptingOrders(prev => !prev);
  };

  const declineOrder = (orderId: string) => {
    playSoundEffect('tab_switch');
    removeIncomingOrder(orderId);
  };

  const completeOrder = (orderId: string) => {
    playSoundEffect('tab_switch');
    setOrderStatus(orderId, 'past');
  };

  const renderOrderItem = (order: Order, isActiveOrder = false) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Image
          source={{uri: order.customerAvatar}}
          style={styles.customerAvatar}
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
          {location && (
            <Text style={styles.distanceText}>
              {(calculateOrderDistance(order, location) / 1000).toFixed(1)}km
              away
            </Text>
          )}
        </View>
        <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
      </View>
      <View style={styles.orderDetails}>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.orderItem}>
            {item.quantity} x {item.name}
          </Text>
        ))}
      </View>
      <View style={styles.orderFooter}>
        <View style={styles.feeContainer}>
          <Text style={styles.orderFee}>
            Delivery Fee: ${order.deliveryFee.toFixed(2)}
          </Text>
          <Text style={styles.orderTip}>Tip: ${order.tip.toFixed(2)}</Text>
        </View>
      </View>
      {!isActiveOrder && order.status === 'incoming' && !order.pizzaMade && (
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptOrder(order)}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => declineOrder(order.id)}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      {isActiveOrder && (
        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#2980b9', marginTop: 10}]}
          onPress={() => {
            if (order.isNearCustomer) {
              completeOrder(order.id);
            } else if (order.pizzaMade && order.customerLocation) {
              if (location) {
                updateStartLocation(order.id, location);
                console.log('cus', order.startLocation);
              }
              navigation.navigate('Map', {
                customerLocation: order.customerLocation,
                orderId: order.id,
              });
            }
          }}>
          <Text style={styles.buttonText}>
            {order.isNearCustomer
              ? 'Complete Order'
              : order.pizzaMade
              ? 'Navigate to Customer'
              : 'Make Pizza'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderScene = SceneMap({
    incoming: () => (
      <FlatList
        data={incomingOrders}
        keyExtractor={item => item.id}
        renderItem={({item}) => renderOrderItem(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No incoming orders.</Text>
        }
      />
    ),
    active: () => (
      <FlatList
        data={activeOrders}
        keyExtractor={item => item.id}
        renderItem={({item}) => renderOrderItem(item, true)}
        extraData={activeOrders} // Ensure FlatList re-renders when activeOrders change
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No active orders.</Text>
        }
      />
    ),
    past: () => (
      <FlatList
        data={pastOrders}
        keyExtractor={item => item.id}
        renderItem={({item}) => renderOrderItem(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No past orders.</Text>
        }
      />
    ),
  });

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={styles.header}>
        <Text
          style={{
            fontSize: 16,
            color: isAcceptingOrders ? '#27ae60' : '#c0392b',
          }}>
          {isAcceptingOrders ? 'Accepting Orders' : 'Not Accepting Orders'}
        </Text>
        <TouchableOpacity
          onPress={toggleOrderAcceptance}
          style={styles.iconButton}>
          <Icon
            name={isAcceptingOrders ? 'pause' : 'play'}
            size={24}
            color={isAcceptingOrders ? '#E74C3C' : '#27ae60'}
          />
        </TouchableOpacity>
      </View>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{backgroundColor: '#E74C3C'}}
            style={{backgroundColor: 'white'}}
            activeColor="#E74C3C"
            inactiveColor="gray"
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    paddingLeft: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: 'gray',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  orderDetails: {
    marginTop: 10,
  },
  orderItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  orderFooter: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderFee: {
    fontSize: 14,
    color: '#666',
  },
  orderTip: {
    fontSize: 14,
    color: '#666',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'right',
  },
  orderActions: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#27ae60',
  },
  declineButton: {
    backgroundColor: '#c0392b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'gray',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default OrderScreen;
