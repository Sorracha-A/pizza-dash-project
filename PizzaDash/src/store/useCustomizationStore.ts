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
    orderCapacity?: number; // How many orders can be carried at once
    earnings?: number; // Bonus earnings percentage
    deliveryRange?: number; // Maximum delivery distance bonus
  };
  unlockLevel?: number;
}

interface CustomizationStore {
  vehicles: CustomizationItem[];
  characters: CustomizationItem[];
  ownedItems: string[];
  selectedVehicle: string | null;
  selectedCharacter: string | null;
  purchaseItem: (itemId: string) => boolean;
  selectItem: (itemId: string, type: 'vehicle' | 'character') => void;
  initializeStore: () => void;
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
      deliveryRange: 1000, // meters
    },
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
      earnings: 5, // 5% bonus
      deliveryRange: 1500,
    },
    unlockLevel: 2,
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
      earnings: 15, // 15% bonus
      deliveryRange: 2000,
    },
    unlockLevel: 5,
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
  },
  {
    id: 'char_2',
    name: 'Expert Driver',
    type: 'character',
    description: 'Earns bonus tips',
    price: 2000,
    image: 'rocket',
    stats: {
      earnings: 10, // 10% bonus
    },
    unlockLevel: 3,
  },
  {
    id: 'char_3',
    name: 'Pizza Master',
    type: 'character',
    description: 'Maximum earnings potential',
    price: 4000,
    image: 'star',
    stats: {
      earnings: 25, // 25% bonus
    },
    unlockLevel: 6,
  },
];

export const useCustomizationStore = create(
  persist<CustomizationStore>(
    (set, get) => ({
      vehicles: defaultVehicles,
      characters: defaultCharacters,
      ownedItems: ['bike_1', 'char_1'], // Start with basic items
      selectedVehicle: 'bike_1',
      selectedCharacter: 'char_1',

      purchaseItem: (itemId: string) => {
        const store = get();
        const item = [...store.vehicles, ...store.characters].find(
          item => item.id === itemId,
        );

        if (
          item &&
          !store.ownedItems.includes(itemId) &&
          useCurrencyStore.getState().balance >= item.price
        ) {
          useCurrencyStore.getState().addCurrency(-item.price);
          set(state => ({
            ownedItems: [...state.ownedItems, itemId],
          }));
          return true;
        }
        return false;
      },

      selectItem: (itemId: string, type: 'vehicle' | 'character') => {
        const store = get();
        if (store.ownedItems.includes(itemId)) {
          if (type === 'vehicle') {
            set({selectedVehicle: itemId});
          } else {
            set({selectedCharacter: itemId});
          }
        }
      },

      initializeStore: () => {
        const store = get();
        if (!store.selectedVehicle) {
          set({selectedVehicle: 'bike_1'});
        }
        if (!store.selectedCharacter) {
          set({selectedCharacter: 'char_1'});
        }
      },
    }),
    {
      name: 'customization-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
