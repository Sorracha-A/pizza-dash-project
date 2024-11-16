import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import {useOrderStore, Order, OrderItem} from '../store/useOrderStore';

type Ingredient = 'sauce' | 'cheese' | 'toppings';

const PizzaMakingGame: React.FC = ({route, navigation}: any) => {
  const {restaurant} = route.params;
  const {activeOrders} = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [flattenedPizzas, setFlattenedPizzas] = useState<OrderItem[]>([]);
  const [currentPizzaIndex, setCurrentPizzaIndex] = useState(0);
  const [ingredientsAdded, setIngredientsAdded] = useState<Ingredient[]>([]);
  const [isMinigameActive, setIsMinigameActive] = useState(false);
  const [isPizzaMade, setIsPizzaMade] = useState(false);

  useEffect(() => {
    if (selectedOrder) {
      // Flatten the items array based on quantity
      const pizzas = selectedOrder.items.flatMap(item =>
        Array(item.quantity).fill({name: item.name}),
      );
      setFlattenedPizzas(pizzas);
      setCurrentPizzaIndex(0);
    }
  }, [selectedOrder]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsMinigameActive(false); // Reset the minigame state
  };

  const startMinigame = () => {
    if (!selectedOrder) {
      Alert.alert('No Order Selected', 'Please select an order to make pizza.');
      return;
    }
    setIsMinigameActive(true);
    setIngredientsAdded([]);
  };

  const addIngredient = (ingredient: Ingredient) => {
    if (!ingredientsAdded.includes(ingredient)) {
      setIngredientsAdded(prev => [...prev, ingredient]);
    }
  };

  const handleCompletePizza = () => {
    if (ingredientsAdded.length === 3) {
      setIngredientsAdded([]);
      if (currentPizzaIndex + 1 < flattenedPizzas.length) {
        setCurrentPizzaIndex(prev => prev + 1); // Move to the next pizza
      } else {
        Alert.alert(
          'Success!',
          `All pizzas for ${selectedOrder!.customerName} are ready!`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ],
        );
      }
    } else {
      Alert.alert(
        'Incomplete Pizza',
        'Please add all ingredients to make the pizza.',
      );
    }
  };

  return (
    <View style={styles.container}>
      {!isMinigameActive ? (
        <>
          <Text style={styles.restaurantName}>
            {restaurant.tags.name || 'Restaurant'}
          </Text>
          <Text style={styles.title}>Select an Active Order to Make Pizza</Text>

          <FlatList
            data={activeOrders}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.orderCard,
                  selectedOrder?.id === item.id && styles.selectedOrderCard,
                ]}
                onPress={() => handleSelectOrder(item)}>
                <View style={styles.orderHeader}>
                  <Image
                    source={{uri: item.customerAvatar}}
                    style={styles.customerAvatar}
                  />
                  <View style={styles.orderInfo}>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <Text style={styles.orderTotal}>
                      Total: ${item.total.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  {item.items.map((pizza, index) => (
                    <Text key={index} style={styles.pizzaDetail}>
                      {pizza.quantity} x {pizza.name}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No active orders available.</Text>
            }
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity
            style={[
              styles.makePizzaButton,
              !selectedOrder && styles.disabledButton,
            ]}
            onPress={startMinigame}
            disabled={!selectedOrder}>
            <Text style={styles.makePizzaButtonText}>Make Pizza</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>
            Pizza {currentPizzaIndex + 1} of {flattenedPizzas.length} -{' '}
            {flattenedPizzas[currentPizzaIndex].name}
          </Text>
          <View style={styles.ingredientContainer}>
            <Text style={styles.instructions}>Tap to add ingredients:</Text>
            <TouchableOpacity
              style={[
                styles.ingredientButton,
                ingredientsAdded.includes('sauce') && styles.ingredientAdded,
              ]}
              onPress={() => addIngredient('sauce')}>
              <Text style={styles.ingredientText}>Add Sauce</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ingredientButton,
                ingredientsAdded.includes('cheese') && styles.ingredientAdded,
              ]}
              onPress={() => addIngredient('cheese')}>
              <Text style={styles.ingredientText}>Add Cheese</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ingredientButton,
                ingredientsAdded.includes('toppings') && styles.ingredientAdded,
              ]}
              onPress={() => addIngredient('toppings')}>
              <Text style={styles.ingredientText}>Add Toppings</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.completePizzaButton}
            onPress={handleCompletePizza}>
            <Text style={styles.completePizzaButtonText}>Complete Pizza</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default PizzaMakingGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#E74C3C',
  },
  listContent: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  selectedOrderCard: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTotal: {
    fontSize: 16,
    color: '#666',
  },
  orderDetails: {
    marginTop: 10,
  },
  pizzaDetail: {
    fontSize: 16,
    color: '#555',
  },
  ingredientContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  instructions: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  ingredientButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  ingredientAdded: {
    backgroundColor: '#27ae60',
  },
  ingredientText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  makePizzaButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  makePizzaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  completePizzaButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  completePizzaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
  },
});
