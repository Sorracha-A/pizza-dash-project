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
  customerLocation: {latitude: number; longitude: number};
  status: 'incoming' | 'active' | 'past';
};

type OrderStore = {
  activeOrders: Order[];
  incomingOrders: Order[];
  pastOrders: Order[];
  addActiveOrder: (order: Order) => void;
  removeIncomingOrder: (id: string) => void;
  setOrderStatus: (id: string, status: 'incoming' | 'active' | 'past') => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
};

export const useOrderStore = create<OrderStore>(set => ({
  activeOrders: [],
  incomingOrders: [],
  pastOrders: [],

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
        return {activeOrders: newActiveOrders};
      }
      return state;
    }),
}));
