import React, {useEffect, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {TabParamList} from '../navigation/TabParamList';
import {StackNavigationProp} from '@react-navigation/stack';
import {useLocationStore} from '../store/useLocationStore';

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
    removeIncomingOrder,
    setOrderStatus,
  } = useOrderStore();

  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

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

  useEffect(() => {
    const generateRandomOrder = () => {
      if (
        !isAcceptingOrders ||
        incomingOrders.length >= 5 ||
        activeOrders.length >= 3 ||
        !location
      )
        return;

      const customerLocation = generateRandomPoint(location, 1000);

      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        customerName: `Customer ${Math.floor(Math.random() * 100)}`,
        customerAvatar:
          'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70 + 1),
        items: [
          {name: 'Margherita Pizza', quantity: 1},
          {name: 'Pepperoni Pizza', quantity: 2},
        ],
        total: parseFloat((Math.random() * 50 + 10).toFixed(2)),
        deliveryFee: 5.0,
        tip: parseFloat((Math.random() * 10).toFixed(2)),
        date: moment().format('MMMM Do YYYY, h:mm:ss a'),
        status: 'incoming',
        pizzaMade: false,
        customerLocation,
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

  const acceptOrder = (order: Order) => {
    if (activeOrders.length >= 3) {
      Alert.alert(
        'Limit Reached',
        'You cannot accept more than 3 active orders.',
      );
      return;
    }
    addActiveOrder({...order, status: 'active'});
  };

  const declineOrder = (orderId: string) => {
    removeIncomingOrder(orderId);
  };

  const completeOrder = (orderId: string) => {
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
        <Text style={styles.orderFee}>
          Delivery Fee: ${order.deliveryFee.toFixed(2)}
        </Text>
        <Text style={styles.orderTip}>Tip: ${order.tip.toFixed(2)}</Text>
      </View>
      {order.status === 'incoming' && (
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#27ae60'}]}
            onPress={() => acceptOrder(order)}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#c0392b'}]}
            onPress={() => declineOrder(order.id)}>
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      {isActiveOrder && (
        <TouchableOpacity
          style={[styles.button, {backgroundColor: '#2980b9', marginTop: 10}]}
          onPress={() => {
            if (order.pizzaMade) {
              navigation.navigate('Map', {
                customerLocation: order.customerLocation,
              });
            }
          }}>
          <Text style={styles.buttonText}>
            {order.pizzaMade ? 'Navigate to Customer' : 'Make Pizza'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  orderFee: {
    fontSize: 16,
  },
  orderTip: {
    fontSize: 16,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: 'gray',
  },
});

export default OrderScreen;
