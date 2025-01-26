import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCurrencyStore} from './useCurrencyStore';

export interface CustomizationItem {
  id: string;
  name: string;
  type: 'vehicle' | 'character';
  description: string;
  price: number;
  image: string;
  stats?: {
    orderCapacity?: number;
    earnings?: number;
    deliveryRange?: number;
  };
  unlockLevel?: number;
  upgradeLevel: number;
  maxUpgradeLevel: number;
  upgradeCosts: number[];
}

interface CustomizationStore {
  vehicles: CustomizationItem[];
  characters: CustomizationItem[];
  ownedItems: string[];
  itemUpgrades: Record<string, number>;  // Stores upgrade levels for each item
  selectedVehicle: string | null;
  selectedCharacter: string | null;
  purchaseItem: (itemId: string) => boolean;
  upgradeItem: (itemId: string) => boolean;
  selectItem: (itemId: string, type: 'vehicle' | 'character') => void;
  initializeStore: () => void;
  getItemStats: (itemId: string) => CustomizationItem['stats'] | undefined;
}

// Default items
const defaultVehicles: CustomizationItem[] = [
  {
    id: 'bike_1',
    name: 'Basic Bike',
    type: 'vehicle',
    description: 'A reliable starter bike',
    price: 0,
    image: 'bicycle',
    stats: {
      orderCapacity: 1,
      earnings: 0,
      deliveryRange: 1000,
    },
    upgradeLevel: 0,
    maxUpgradeLevel: 3,
    upgradeCosts: [500, 1000, 2000],
  },
  {
    id: 'scooter_1',
    name: 'Delivery Scooter',
    type: 'vehicle',
    description: 'Carry more orders at once',
    price: 1000,
    image: 'motorcycle',
    stats: {
      orderCapacity: 2,
      earnings: 5,
      deliveryRange: 1500,
    },
    unlockLevel: 2,
    upgradeLevel: 0,
    maxUpgradeLevel: 3,
    upgradeCosts: [1000, 2000, 4000],
  },
  {
    id: 'car_1',
    name: 'Pizza Mobile',
    type: 'vehicle',
    description: 'Maximum delivery efficiency',
    price: 5000,
    image: 'car',
    stats: {
      orderCapacity: 3,
      earnings: 15,
      deliveryRange: 2000,
    },
    unlockLevel: 5,
    upgradeLevel: 0,
    maxUpgradeLevel: 3,
    upgradeCosts: [2000, 4000, 8000],
  },
];

const defaultCharacters: CustomizationItem[] = [
  {
    id: 'char_1',
    name: 'Rookie Driver',
    type: 'character',
    description: 'Fresh and ready to deliver',
    price: 0,
    image: 'user',
    stats: {
      earnings: 0,
    },
    upgradeLevel: 0,
    maxUpgradeLevel: 3,
    upgradeCosts: [500, 1000, 2000],
  },
  {
    id: 'char_2',
    name: 'Expert Driver',
    type: 'character',
    description: 'Earns bonus tips',
    price: 2000,
    image: 'rocket',
    stats: {
      earnings: 10,
    },
    unlockLevel: 3,
    upgradeLevel: 0,
    maxUpgradeLevel: 3,
    upgradeCosts: [1000, 2000, 4000],
  },
  {
    id: 'char_3',
    name: 'Pizza Master',
    type: 'character',
    description: 'Maximum earnings potential',
    price: 4000,
    image: 'star',
    stats: {
      earnings: 25,
    },
    unlockLevel: 6,
    upgradeLevel: 0,
    maxUpgradeLevel: 3,
    upgradeCosts: [2000, 4000, 8000],
  },
];

export const useCustomizationStore = create(
  persist<CustomizationStore>(
    (set, get) => ({
      vehicles: defaultVehicles,
      characters: defaultCharacters,
      ownedItems: ['bike_1', 'char_1'],
      itemUpgrades: { 'bike_1': 0, 'char_1': 0 },
      selectedVehicle: 'bike_1',
      selectedCharacter: 'char_1',

      purchaseItem: (itemId: string) => {
        const item = [...get().vehicles, ...get().characters].find(
          item => item.id === itemId,
        );
        if (!item) return false;

        const currentBalance = useCurrencyStore.getState().balance;
        if (currentBalance >= item.price) {
          useCurrencyStore.getState().addCurrency(-item.price);
          set(state => ({
            ownedItems: [...state.ownedItems, itemId],
            itemUpgrades: { ...state.itemUpgrades, [itemId]: 0 },
          }));
          return true;
        }
        return false;
      },

      upgradeItem: (itemId: string) => {
        const item = [...get().vehicles, ...get().characters].find(
          item => item.id === itemId,
        );
        if (!item) return false;

        const currentUpgradeLevel = get().itemUpgrades[itemId] || 0;
        if (currentUpgradeLevel >= item.maxUpgradeLevel) return false;

        const upgradeCost = item.upgradeCosts[currentUpgradeLevel];
        const currentBalance = useCurrencyStore.getState().balance;

        if (currentBalance >= upgradeCost) {
          useCurrencyStore.getState().addCurrency(-upgradeCost);
          set(state => ({
            itemUpgrades: {
              ...state.itemUpgrades,
              [itemId]: currentUpgradeLevel + 1,
            },
          }));
          return true;
        }
        return false;
      },

      selectItem: (itemId: string, type: 'vehicle' | 'character') => {
        if (get().ownedItems.includes(itemId)) {
          if (type === 'vehicle') {
            set({ selectedVehicle: itemId });
          } else {
            set({ selectedCharacter: itemId });
          }
        }
      },

      getItemStats: (itemId: string) => {
        const item = [...get().vehicles, ...get().characters].find(
          item => item.id === itemId,
        );
        if (!item?.stats) return undefined;

        const upgradeLevel = get().itemUpgrades[itemId] || 0;
        const baseBonus = upgradeLevel * 5; // Each level adds 5% base bonus
        const upgradeMultiplier = 1 + (upgradeLevel * 0.25); // Each upgrade level still gives 25% boost

        return {
          orderCapacity: item.stats.orderCapacity !== undefined
            ? Math.floor(Math.max(1, item.stats.orderCapacity) * upgradeMultiplier)
            : undefined,
          earnings: item.stats.earnings !== undefined
            ? Math.floor((item.stats.earnings + baseBonus) * upgradeMultiplier)
            : undefined,
          deliveryRange: item.stats.deliveryRange !== undefined
            ? Math.floor(Math.max(1000, item.stats.deliveryRange) * upgradeMultiplier)
            : undefined,
        };
      },

      initializeStore: () => {
        set({
          vehicles: defaultVehicles,
          characters: defaultCharacters,
          ownedItems: ['bike_1', 'char_1'],
          itemUpgrades: { 'bike_1': 0, 'char_1': 0 },
          selectedVehicle: 'bike_1',
          selectedCharacter: 'char_1',
        });
      },
    }),
    {
      name: 'customization-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
