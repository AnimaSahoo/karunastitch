export interface OrderData {
  id: string;
  orderDate: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  blouseBackLength: string;
  fullShoulder: string;
  shoulderStrap: string;
  backNeckDepth: string;
  frontNeckDepth: string;
  shoulderToApex: string;
  frontLength: string;
  chest: string;
  waist: string;
  sleeveLength: string;
  armRound: string;
  sleeveRound: string;
  armHole: string;
  blouseType: string;
  hookPosition: string;
  deliveryDate: string;
  extraClothsLaces: string;
  selectedDesign: string;
  designDescription: string;
  specialRequests: string;
  wantMeasurementHelp: boolean;
}

const ORDERS_KEY = "blouseOrders";
const CURRENT_ORDER_KEY = "currentOrder";

// Get all orders from localStorage
export const getAllOrders = (): OrderData[] => {
  const storedOrders = localStorage.getItem(ORDERS_KEY);
  return storedOrders ? JSON.parse(storedOrders) : [];
};

// Get a single order by ID
export const getOrderById = (orderId: string): OrderData | null => {
  const orders = getAllOrders();
  return orders.find((order) => order.id === orderId) || null;
};

// Get orders by customer phone
export const getOrdersByPhone = (phone: string): OrderData[] => {
  const orders = getAllOrders();
  return orders.filter((order) => order.phone === phone);
};

// Get orders by customer email
export const getOrdersByEmail = (email: string): OrderData[] => {
  const orders = getAllOrders();
  return orders.filter((order) => order.email.toLowerCase() === email.toLowerCase());
};

// Get orders by customer name (partial match)
export const getOrdersByName = (name: string): OrderData[] => {
  const orders = getAllOrders();
  return orders.filter((order) =>
    order.fullName.toLowerCase().includes(name.toLowerCase())
  );
};

// Get current order from sessionStorage
export const getCurrentOrder = (): OrderData | null => {
  const orderData = sessionStorage.getItem(CURRENT_ORDER_KEY);
  return orderData ? JSON.parse(orderData) : null;
};

// Save current order to sessionStorage
export const setCurrentOrder = (order: OrderData): void => {
  sessionStorage.setItem(CURRENT_ORDER_KEY, JSON.stringify(order));
};

// Clear current order from sessionStorage
export const clearCurrentOrder = (): void => {
  sessionStorage.removeItem(CURRENT_ORDER_KEY);
};

// Save order to localStorage (add to orders list)
export const saveOrder = (order: OrderData): void => {
  const orders = getAllOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

// Delete order by ID
export const deleteOrderById = (orderId: string): boolean => {
  const orders = getAllOrders();
  const filteredOrders = orders.filter((order) => order.id !== orderId);
  if (filteredOrders.length !== orders.length) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(filteredOrders));
    return true;
  }
  return false;
};

// Get total order count
export const getOrderCount = (): number => {
  return getAllOrders().length;
};
