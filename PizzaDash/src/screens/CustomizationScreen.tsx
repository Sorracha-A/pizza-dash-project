import React, {useState, useRef, useCallback, useEffect} from 'react';
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

const CustomizationScreen = ({navigation}: any) => {
  const [activeTab, setActiveTab] = useState<'vehicle' | 'character'>('vehicle');
  const [devMenuTaps, setDevMenuTaps] = useState(0);
  const devMenuTapTimeout = useRef<NodeJS.Timeout>();
  const {
    vehicles,
    characters,
    ownedItems,
    itemUpgrades,
    selectedVehicle,
    selectedCharacter,
    purchaseItem,
    upgradeItem,
    selectItem,
    getItemStats,
  } = useCustomizationStore();
  const balance = useCurrencyStore(state => state.balance);
  const level = useExperienceStore(state => state.level);

  useEffect(() => {
    if (devMenuTaps === 5) {
      // Reset taps immediately to prevent multiple navigations
      setDevMenuTaps(0);
      // Navigate in the next tick to avoid state updates during render
      setTimeout(() => {
        navigation.navigate('DevMenu');
      }, 0);
    }
  }, [devMenuTaps, navigation]);

  const handleDevMenuTap = useCallback(() => {
    setDevMenuTaps(prev => {
      const newCount = prev + 1;
      
      // Reset the count after 2 seconds of no taps
      if (devMenuTapTimeout.current) {
        clearTimeout(devMenuTapTimeout.current);
      }
      devMenuTapTimeout.current = setTimeout(() => {
        setDevMenuTaps(0);
      }, 2000);

      return newCount;
    });
  }, []);

  const renderStats = (item: any) => {
    if (!item?.stats) return null;
    const stats = getItemStats(item.id);
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        {stats.orderCapacity !== undefined && (
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
        {stats.deliveryRange !== undefined && (
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

  const renderUpgradeButton = (item: any) => {
    if (!item?.id || !ownedItems.includes(item.id)) return null;

    const currentUpgrade = (itemUpgrades?.[item.id] || 0);
    if (currentUpgrade >= (item.maxUpgradeLevel || 0)) {
      return (
        <View style={styles.upgradeContainer}>
          <Text style={styles.maxUpgradeText}>MAX LEVEL</Text>
        </View>
      );
    }

    const upgradeCost = item.upgradeCosts?.[currentUpgrade];
    if (upgradeCost === undefined) return null;
    
    const canUpgrade = balance >= upgradeCost;

    return (
      <View style={styles.upgradeContainer}>
        <Text style={styles.upgradeLevel}>
          Level {currentUpgrade + 1}/{item.maxUpgradeLevel}
        </Text>
        <TouchableOpacity
          style={[styles.upgradeButton, !canUpgrade && styles.disabledUpgradeButton]}
          onPress={() => {
            if (canUpgrade) {
              Alert.alert(
                'Upgrade Item',
                `Do you want to upgrade ${item.name} for $${upgradeCost}?`,
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Upgrade',
                    onPress: () => {
                      if (upgradeItem(item.id)) {
                        Alert.alert('Success', 'Item upgraded successfully!');
                      }
                    },
                  },
                ],
              );
            }
          }}>
          <Icon name="arrow-up" size={12} color={canUpgrade ? '#FFFFFF' : '#757575'} />
          <Text style={[styles.upgradeButtonText, !canUpgrade && styles.disabledUpgradeText]}>
            ${upgradeCost}
          </Text>
        </TouchableOpacity>
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
        {renderStats(item)}
        <View style={styles.itemFooter}>
          {!isOwned ? (
            <>
              <Text style={styles.priceText}>${item.price}</Text>
              {item.unlockLevel && (
                <Text style={styles.levelText}>Level {item.unlockLevel}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.ownedText}>
                {isSelected ? 'SELECTED' : 'OWNED'}
              </Text>
              {renderUpgradeButton(item)}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customize</Text>
        <TouchableOpacity
          style={styles.balanceContainer}
          onPress={handleDevMenuTap}>
          <Icon name="dollar" size={16} color="#FFD700" />
          <Text style={styles.balanceText}>{balance}</Text>
        </TouchableOpacity>
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
    color: '#2C3E50',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  balanceText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
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
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
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
    fontWeight: '600',
  },
  itemList: {
    paddingHorizontal: 20,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  lockedCard: {
    opacity: 0.6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#757575',
  },
  statsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
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
    marginLeft: 6,
    fontSize: 12,
    color: '#757575',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
  },
  levelText: {
    fontSize: 14,
    color: '#757575',
  },
  ownedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  upgradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeLevel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  disabledUpgradeButton: {
    backgroundColor: '#E0E0E0',
  },
  upgradeButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledUpgradeText: {
    color: '#757575',
  },
  maxUpgradeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default CustomizationScreen;
