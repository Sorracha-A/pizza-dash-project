import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCurrencyStore } from './useCurrencyStore';
import { useExperienceStore } from './useExperienceStore';
import { useCustomizationStore } from './useCustomizationStore';
import { getDistance } from 'geolib';

export type OrderItem = {
  name: string;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerAvatar: string;
  items: OrderItem[];
  customerLocation: {
    latitude: number;
    longitude: number;
  };
  total: number;
  deliveryFee: number;
  tip: number;
  date: string;
  status: 'incoming' | 'active' | 'past';
  pizzaMade: boolean;
  timestamp: number;
  distance: number; // in meters
  isNearCustomer?: boolean;
  startLocation?: { latitude: number; longitude: number };
};

type OrderStore = {
  activeOrders: Order[];
  incomingOrders: Order[];
  pastOrders: Order[];
  currentOrder: Order | null;
  addActiveOrder: (order: Order) => void;
  removeIncomingOrder: (id: string) => void;
  setOrderStatus: (id: string, status: 'incoming' | 'active' | 'past') => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStartLocation: (
    id: string,
    startLocation: { latitude: number; longitude: number },
  ) => void;
  setCurrentOrder: (order: Order | null) => void;
  clearStore: () => void;
  canAcceptMoreOrders: () => boolean;
  getActiveOrdersCount: () => number;
  calculateOrderDistance: (order: Order, currentLocation: { latitude: number; longitude: number }) => number;
  isWithinDeliveryRange: (distance: number) => boolean;
  getEarningsMultiplier: () => number;
};

export const useOrderStore = create(
  persist<OrderStore>(
    (set, get) => ({
      activeOrders: [],
      incomingOrders: [],
      pastOrders: [],
      currentOrder: null,

      getActiveOrdersCount: () => {
        return get().activeOrders.length;
      },

      canAcceptMoreOrders: () => {
        const customization = useCustomizationStore.getState();
        const selectedVehicle = customization.vehicles.find(
          v => v.id === customization.selectedVehicle,
        );
        const maxCapacity = selectedVehicle?.stats?.orderCapacity || 1;
        return get().activeOrders.length < maxCapacity;
      },

      calculateOrderDistance: (order: Order, currentLocation: { latitude: number; longitude: number }) => {
        return getDistance(
          currentLocation,
          order.customerLocation,
        );
      },

      isWithinDeliveryRange: (distance: number) => {
        const customization = useCustomizationStore.getState();
        const selectedVehicle = customization.vehicles.find(
          v => v.id === customization.selectedVehicle,
        );
        const maxRange = selectedVehicle?.stats?.deliveryRange || 1000;
        return distance <= maxRange;
      },

      getEarningsMultiplier: () => {
        const customization = useCustomizationStore.getState();
        const selectedVehicle = customization.vehicles.find(
          v => v.id === customization.selectedVehicle,
        );
        const selectedCharacter = customization.characters.find(
          c => c.id === customization.selectedCharacter,
        );
        
        const vehicleBonus = selectedVehicle?.stats?.earnings || 0;
        const characterBonus = selectedCharacter?.stats?.earnings || 0;
        
        return 1 + (vehicleBonus + characterBonus) / 100;
      },

      addActiveOrder: order =>
        set(state => {
          if (!get().canAcceptMoreOrders()) {
            return state;
          }
          return {
            activeOrders: [...state.activeOrders, order],
            incomingOrders: state.incomingOrders.filter(o => o.id !== order.id),
          };
        }),

      removeIncomingOrder: id =>
        set(state => ({
          incomingOrders: state.incomingOrders.filter(order => order.id !== id),
        })),

      setOrderStatus: (id, status) =>
        set(state => {
          const allOrders = [
            ...state.incomingOrders,
            ...state.activeOrders,
            ...state.pastOrders,
          ];
          const order = allOrders.find(o => o.id === id);

          if (order) {
            const updatedOrder = { ...order, status };
            
            // Add rewards when order is completed
            if (status === 'past') {
              const earningsMultiplier = get().getEarningsMultiplier();
              const baseReward = Math.floor(order.total);
              const totalReward = Math.floor(baseReward * earningsMultiplier);
              
              // Add currency with bonus
              useCurrencyStore.getState().addCurrency(totalReward);
              
              // Add experience points (base XP + bonus for order value and distance)
              const baseXP = 50;
              const valueBonus = Math.floor(order.total / 10);
              const distanceBonus = order.distance ? Math.floor(order.distance / 100) : 0;
              const totalXP = baseXP + valueBonus + distanceBonus;
              useExperienceStore.getState().addExperience(totalXP);
            }

            return {
              incomingOrders:
                status === 'incoming'
                  ? [...state.incomingOrders.filter(o => o.id !== id), updatedOrder]
                  : state.incomingOrders.filter(o => o.id !== id),
              activeOrders:
                status === 'active'
                  ? [...state.activeOrders.filter(o => o.id !== id), updatedOrder]
                  : state.activeOrders.filter(o => o.id !== id),
              pastOrders:
                status === 'past'
                  ? [...state.pastOrders.filter(o => o.id !== id), updatedOrder]
                  : state.pastOrders.filter(o => o.id !== id),
            };
          }
          return state;
        }),

      updateOrder: (id, updates) =>
        set(state => {
          const index = state.activeOrders.findIndex(o => o.id === id);
          if (index !== -1) {
            const updatedOrder = { ...state.activeOrders[index], ...updates };
            const newActiveOrders = [...state.activeOrders];
            newActiveOrders[index] = updatedOrder;
            return { activeOrders: newActiveOrders };
          }
          return state;
        }),

      updateOrderStartLocation: (id, startLocation) =>
        set(state => {
          const index = state.activeOrders.findIndex(o => o.id === id);
          if (index !== -1) {
            const updatedOrder = {
              ...state.activeOrders[index],
              startLocation,
              distance: getDistance(
                startLocation,
                state.activeOrders[index].customerLocation,
              ),
            };
            const newActiveOrders = [...state.activeOrders];
            newActiveOrders[index] = updatedOrder;
            return { activeOrders: newActiveOrders };
          }
          return state;
        }),

      setCurrentOrder: (order: Order | null) => set({ currentOrder: order }),

      clearStore: () =>
        set({
          activeOrders: [],
          incomingOrders: [],
          pastOrders: [],
          currentOrder: null,
        }),
    }),
    {
      name: 'order-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
