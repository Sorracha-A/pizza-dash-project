import {create} from 'zustand';

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
  customerLocation: {latitude: number; longitude: number};
  status: 'incoming' | 'active' | 'past';
  startLocation?: {latitude: number; longitude: number};
};

type OrderStore = {
  activeOrders: Order[];
  incomingOrders: Order[];
  pastOrders: Order[];
  currentOrder: Order | null; // Track the current order being delivered
  addActiveOrder: (order: Order) => void;
  removeIncomingOrder: (id: string) => void;
  setOrderStatus: (id: string, status: 'incoming' | 'active' | 'past') => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStartLocation: (
    id: string,
    startLocation: {latitude: number; longitude: number},
  ) => void; // New method
  setCurrentOrder: (order: Order | null) => void;
};

export const useOrderStore = create<OrderStore>(set => ({
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
        order.status = status;
        return {
          incomingOrders: state.incomingOrders.filter(o => o.id !== id),
          activeOrders:
            status === 'active'
              ? [...state.activeOrders, order]
              : state.activeOrders.filter(o => o.id !== id),
          pastOrders:
            status === 'past'
              ? [...state.pastOrders, order]
              : state.pastOrders.filter(o => o.id !== id),
        };
      }
      return state;
    }),

  updateOrder: (id, updates) =>
    set(state => {
      const index = state.activeOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        const updatedOrder = {...state.activeOrders[index], ...updates};
        const newActiveOrders = [...state.activeOrders];
        newActiveOrders[index] = updatedOrder;
        console.log('newActiveOrders', newActiveOrders);
        return {activeOrders: newActiveOrders};
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
        return {activeOrders: newActiveOrders};
      }
      return state;
    }),
}));
