import { get, set, generateId } from '../core/store.js';
import { getCart, getCartTotal, clearCart } from './cart.js';
import { getCurrentUser, addLoyaltyPoints } from '../core/auth.js';

const ORDERS_KEY = 'orders';
const LAST_ORDER_KEY = 'lastOrderId';
export const DELIVERY_FEE = 1500;
const POINTS_PER_NAIRA = 0.01;

const getOrders = () => get(ORDERS_KEY, []);
const saveOrders = orders => set(ORDERS_KEY, orders);

export const createOrder = ({ fulfilment, address = null, notes = '' }) => {
  const cart = getCart();
  const items = Object.values(cart).map(({ item, qty }) => ({
    itemId: item.id,
    name: item.name,
    image: item.image,
    qty,
    price: item.price
  }));

  const subtotal = getCartTotal();
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const user = getCurrentUser();

  const order = {
    id: generateId('ord'),
    userId: user?.id ?? null,
    items,
    subtotal,
    deliveryFee,
    total,
    fulfilment,
    address,
    notes,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
  set(LAST_ORDER_KEY, order.id);

  if (user) addLoyaltyPoints(Math.round(total * POINTS_PER_NAIRA));

  clearCart();

  return order;
};

export const getOrderById = id => getOrders().find(o => o.id === id) ?? null;

export const getLastOrder = () => {
  const id = get(LAST_ORDER_KEY);
  return id ? getOrderById(id) : null;
};

export const getUserOrders = userId => getOrders()
  .filter(o => o.userId === userId)
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const getPointsEarned = total => Math.round(total * POINTS_PER_NAIRA);
