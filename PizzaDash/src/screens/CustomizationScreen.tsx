import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useCustomizationStore} from '../store/useCustomizationStore';
import {useCurrencyStore} from '../store/useCurrencyStore';
import {useExperienceStore} from '../store/useExperienceStore';
import {Bar as ProgressBar} from 'react-native-progress';

const CustomizationScreen = () => {
  const [activeTab, setActiveTab] = useState<'vehicle' | 'character'>('vehicle');
  const {
    vehicles,
    characters,
    ownedItems,
    selectedVehicle,
    selectedCharacter,
    purchaseItem,
    selectItem,
  } = useCustomizationStore();
  const balance = useCurrencyStore(state => state.balance);
  const level = useExperienceStore(state => state.level);

  const renderStats = (stats?: {
    orderCapacity?: number;
    earnings?: number;
    deliveryRange?: number;
  }) => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        {stats.orderCapacity && (
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Icon name="shopping-bag" size={14} color="#757575" />
              <Text style={styles.statLabel}>Order Capacity</Text>
            </View>
            <Text style={styles.statValue}>{stats.orderCapacity} orders</Text>
          </View>
        )}
        {stats.earnings !== undefined && (
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Icon name="dollar" size={14} color="#757575" />
              <Text style={styles.statLabel}>Earnings Bonus</Text>
            </View>
            <Text style={styles.statValue}>+{stats.earnings}%</Text>
          </View>
        )}
        {stats.deliveryRange && (
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Icon name="map-marker" size={14} color="#757575" />
              <Text style={styles.statLabel}>Delivery Range</Text>
            </View>
            <Text style={styles.statValue}>{stats.deliveryRange}m</Text>
          </View>
        )}
      </View>
    );
  };

  const renderItem = (item: any) => {
    const isOwned = ownedItems.includes(item.id);
    const isSelected =
      (activeTab === 'vehicle' && selectedVehicle === item.id) ||
      (activeTab === 'character' && selectedCharacter === item.id);
    const canPurchase = balance >= item.price && level >= (item.unlockLevel || 1);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.itemCard,
          isSelected && styles.selectedCard,
          !canPurchase && !isOwned && styles.lockedCard,
        ]}
        onPress={() => {
          if (isOwned) {
            selectItem(item.id, item.type);
          } else if (canPurchase) {
            Alert.alert(
              'Purchase Item',
              `Do you want to purchase ${item.name} for $${item.price}?`,
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Buy',
                  onPress: () => {
                    if (purchaseItem(item.id)) {
                      selectItem(item.id, item.type);
                      Alert.alert('Success', 'Item purchased successfully!');
                    }
                  },
                },
              ],
            );
          }
        }}>
        <View style={styles.itemHeader}>
          <Icon name={item.image} size={24} color={isSelected ? '#4CAF50' : '#2C3E50'} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        </View>
        {renderStats(item.stats)}
        <View style={styles.itemFooter}>
          {!isOwned && (
            <>
              <Text style={styles.priceText}>${item.price}</Text>
              {item.unlockLevel && (
                <Text style={styles.levelText}>Level {item.unlockLevel}</Text>
              )}
            </>
          )}
          {isOwned && (
            <Text style={styles.ownedText}>
              {isSelected ? 'SELECTED' : 'OWNED'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customize</Text>
        <View style={styles.balanceContainer}>
          <Icon name="dollar" size={16} color="#FFD700" />
          <Text style={styles.balanceText}>{balance}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vehicle' && styles.activeTab]}
          onPress={() => setActiveTab('vehicle')}>
          <Icon
            name="car"
            size={20}
            color={activeTab === 'vehicle' ? '#4CAF50' : '#757575'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'vehicle' && styles.activeTabText,
            ]}>
            Vehicles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'character' && styles.activeTab]}
          onPress={() => setActiveTab('character')}>
          <Icon
            name="user"
            size={20}
            color={activeTab === 'character' ? '#4CAF50' : '#757575'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'character' && styles.activeTabText,
            ]}>
            Characters
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.itemList}>
        {activeTab === 'vehicle'
          ? vehicles.map(renderItem)
          : characters.map(renderItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  balanceText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#757575',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  itemList: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  lockedCard: {
    opacity: 0.5,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    marginLeft: 15,
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  statsContainer: {
    marginTop: 15,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  statItem: {
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  levelText: {
    fontSize: 14,
    color: '#757575',
  },
  ownedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default CustomizationScreen;
