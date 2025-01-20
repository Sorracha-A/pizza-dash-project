import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomizationItem {
  id: string;
  name: string;
  type: 'vehicle' | 'character';
  description: string;
  price: number;
  image: string;
  stats?: {
    speed?: number;
    handling?: number;
    acceleration?: number;
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
      speed: 50,
      handling: 70,
      acceleration: 60,
    },
  },
  {
    id: 'scooter_1',
    name: 'Speedy Scooter',
    type: 'vehicle',
    description: 'Perfect for quick deliveries',
    price: 1000,
    image: 'motorcycle',
    stats: {
      speed: 75,
      handling: 65,
      acceleration: 80,
    },
    unlockLevel: 2,
  },
  {
    id: 'car_1',
    name: 'Pizza Mobile',
    type: 'vehicle',
    description: 'Deliver in style',
    price: 5000,
    image: 'car',
    stats: {
      speed: 90,
      handling: 85,
      acceleration: 75,
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
  },
  {
    id: 'char_2',
    name: 'Speed Demon',
    type: 'character',
    description: 'Known for quick deliveries',
    price: 2000,
    image: 'rocket',
    unlockLevel: 3,
  },
  {
    id: 'char_3',
    name: 'Pizza Master',
    type: 'character',
    description: 'The legendary delivery expert',
    price: 4000,
    image: 'star',
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
