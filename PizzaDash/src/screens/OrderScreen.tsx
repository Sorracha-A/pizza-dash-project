import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';

const { width } = Dimensions.get('window');

type Order = {
  id: string;
  customerName: string;
  customerAvatar: string;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  deliveryFee: number;
  tip: number;
  date: string;
  status: 'incoming' | 'active' | 'past';
};

const OrderScreen: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'incoming', title: 'Incoming Orders' },
    { key: 'active', title: 'Active Orders' },
    { key: 'past', title: 'Past Orders' },
  ]);

  const [incomingOrders, setIncomingOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const incomingOrdersRef = useRef<Order[]>(incomingOrders);
  incomingOrdersRef.current = incomingOrders;

  const activeOrdersRef = useRef<Order[]>(activeOrders);
  activeOrdersRef.current = activeOrders;

  useEffect(() => {
    const generateRandomOrder = () => {
      if (incomingOrdersRef.current.length >= 5 ) return;
      if (activeOrdersRef.current.length >= 3) return;

      const newOrder: Order = {
        id: Math.random().toString(36).substr(2, 9),
        customerName: `Customer ${Math.floor(Math.random() * 100)}`,
        customerAvatar:
          'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70 + 1),
        items: [
          { name: 'Margherita Pizza', quantity: 1 },
          { name: 'Pepperoni Pizza', quantity: 2 },
        ],
        total: parseFloat((Math.random() * 50 + 10).toFixed(2)),
        deliveryFee: 5.0,
        tip: parseFloat((Math.random() * 10).toFixed(2)),
        date: moment().format('MMMM Do YYYY, h:mm:ss a'),
        status: 'incoming',
      };

      setIncomingOrders((prevOrders) => [...prevOrders, newOrder]);

      // Automatically remove the order if not accepted or declined within 3 minutes
      setTimeout(() => {
        setIncomingOrders((orders) =>
          orders.filter((order) => order.id !== newOrder.id),
        );
      }, 3 * 60 * 1000); // 3 minutes
    };

    
    

    // Generate a random order at random intervals between 1 to 5 minutes
    const interval = setInterval(() => {
      generateRandomOrder();
    }, Math.floor(Math.random() * 5 + 1) * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const acceptOrder = (order: Order) => {
    if (activeOrdersRef.current.length >= 3) {
      Alert.alert('Limit Reached', 'You cannot accept more than 3 active orders.');
      return;
    }
    setIncomingOrders((orders) => orders.filter((o) => o.id !== order.id));
    setActiveOrders((orders) => [...orders, { ...order, status: 'active' }]);
  };

  const declineOrder = (order: Order) => {
    setIncomingOrders((orders) => orders.filter((o) => o.id !== order.id));
  };

  const completeOrder = (order: Order) => {
    setActiveOrders((orders) => orders.filter((o) => o.id !== order.id));
    setPastOrders((orders) => [...orders, { ...order, status: 'past' }]);
  };

  const renderOrderItem = (order: Order, isActiveOrder = false) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Image source={{ uri: order.customerAvatar }} style={styles.customerAvatar} />
        <View style={{ flex: 1, marginLeft: 10 }}>
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
            style={[styles.button, { backgroundColor: '#27ae60' }]}
            onPress={() => acceptOrder(order)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#c0392b' }]}
            onPress={() => declineOrder(order)}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      {isActiveOrder && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2980b9', marginTop: 10 }]}
          onPress={() => completeOrder(order)}
        >
          <Text style={styles.buttonText}>Complete Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderScene = SceneMap({
    incoming: () => (
      <FlatList
        data={incomingOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderOrderItem(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No incoming orders.</Text>}
      />
    ),
    active: () => (
      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderOrderItem(item, true)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No active orders.</Text>}
      />
    ),
    past: () => (
      <FlatList
        data={pastOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderOrderItem(item)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No past orders.</Text>}
      />
    ),
  });

  return (
    <SafeAreaView style={{ flex: 1 , backgroundColor: 'white'}}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#E74C3C' }}
            style={{ backgroundColor: 'white' }}
            activeColor="#E74C3C"
            inactiveColor="gray"
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
