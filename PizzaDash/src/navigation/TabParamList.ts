export type TabParamList = {
  Dashboard: undefined;
  Map: {
    customerLocation?: { latitude: number; longitude: number };
    orderId?: string;
  };
  Order: undefined;
};
