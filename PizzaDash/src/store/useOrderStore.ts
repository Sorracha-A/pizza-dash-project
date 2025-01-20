import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCurrencyStore } from './useCurrencyStore';

export type OrderItem = {
  name: string;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerAvatar: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  tip: number;
  date: string;
  pizzaMade: boolean;
  isNearCustomer?: boolean;
  customerLocation: { latitude: number; longitude: number };
  status: 'incoming' | 'active' | 'past';
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
};

export const useOrderStore = create(
  persist<OrderStore>(
    (set, get) => ({
      activeOrders: [],
      incomingOrders: [],
      pastOrders: [],
      currentOrder: null,

      addActiveOrder: order =>
        set(state => ({
          activeOrders: [...state.activeOrders, order],
          incomingOrders: state.incomingOrders.filter(o => o.id !== order.id),
        })),

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
            
            // Add currency reward when order is completed
            if (status === 'past') {
              const reward = Math.floor(order.total + order.deliveryFee + order.tip);
              useCurrencyStore.getState().addCurrency(reward);
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

      setCurrentOrder: order =>
        set(() => ({
          currentOrder: order,
        })),

      updateOrderStartLocation: (id, startLocation) =>
        set(state => {
          const index = state.activeOrders.findIndex(o => o.id === id);
          if (index !== -1) {
            const updatedOrder = {
              ...state.activeOrders[index],
              startLocation,
            };
            const newActiveOrders = [...state.activeOrders];
            newActiveOrders[index] = updatedOrder;
            return { activeOrders: newActiveOrders };
          }
          return state;
        }),

      clearStore: () => {
        set(() => ({
          activeOrders: [],
          incomingOrders: [],
          pastOrders: [],
          currentOrder: null,
        }));
      },
    }),
    {
      name: 'order-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
