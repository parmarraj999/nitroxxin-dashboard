import { addDoc, collection, getDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS, ORDER_STATUSES } from '../schemas/firestoreSchema';
import { addTimestamps, cleanObject, docRef, fetchVendorPage, getVendorId, withVendor } from './firebaseUtils';
import { reserveProductStock, deductStockForOrderItems } from './productService';

export const listOrders = (options = {}) => fetchVendorPage({
  collectionName: COLLECTIONS.orders,
  sort: ['createdAt', 'desc'],
  ...options
});

export const getOrder = async (orderId) => {
  const snapshot = await getDoc(docRef(COLLECTIONS.orders, orderId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const createOrder = async ({ order, items }, vendorId = getVendorId()) => {
  const batch = writeBatch(db);
  const orderRef = docRef(COLLECTIONS.orders, order.id || crypto.randomUUID());

  batch.set(orderRef, addTimestamps(cleanObject(withVendor({
    ...order,
    status: order.status || ORDER_STATUSES[0],
    itemCount: items.length
  }, vendorId))));

  items.forEach((item) => {
    const itemRef = docRef(COLLECTIONS.orderItems, crypto.randomUUID());
    batch.set(itemRef, addTimestamps(cleanObject(withVendor({
      ...item,
      orderId: orderRef.id
    }, vendorId))));
  });

  await batch.commit();
  await Promise.all(items.map((item) => reserveProductStock(item.productId, Number(item.quantity || 1))));
  return orderRef.id;
};

export const updateOrderStatus = async (orderId, status, note = '') => {
  if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid order status');
  await updateDoc(docRef(COLLECTIONS.orders, orderId), {
    status,
    [`timeline.${status}`]: {
      note,
      at: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
};

/**
 * Accept a pending order: confirms order status, updates timeline, and reduces product inventory stock
 */
export const acceptOrder = async (orderId, items = [], note = 'Order accepted by admin') => {
  const orderRef = docRef(COLLECTIONS.orders, orderId);

  // 1. Update order status and append confirmed event to timeline
  await updateDoc(orderRef, {
    status: 'confirmed',
    [`timeline.confirmed`]: {
      note,
      at: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });

  // 2. Reduce stock for each item in the order
  const { updatedProducts } = await deductStockForOrderItems(items);

  // 3. Log notification for the vendor
  try {
    const shortId = orderId.length > 8 ? orderId.slice(0, 8).toUpperCase() : orderId;
    await createNotification({
      type: 'order_confirmed',
      title: 'Order Confirmed',
      message: `Order #${shortId} was accepted. Stock reduced for ${updatedProducts.length} product(s).`,
      orderId,
      read: false
    });
  } catch (notifErr) {
    console.warn('[orderService] Notification logging note:', notifErr);
  }

  return {
    status: 'confirmed',
    updatedProducts
  };
};

export const createNotification = (data, vendorId = getVendorId()) => addDoc(
  collection(db, COLLECTIONS.notifications),
  addTimestamps(cleanObject(withVendor({ read: false, ...data }, vendorId)))
);
