import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CurrencyStore {
  balance: number;
  addCurrency: (amount: number) => void;
}

export const useCurrencyStore = create(
  persist<CurrencyStore>(
    (set) => ({
      balance: 0,
      addCurrency: (amount: number) =>
        set(state => ({balance: state.balance + amount})),
    }),
    {
      name: 'currency-store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
