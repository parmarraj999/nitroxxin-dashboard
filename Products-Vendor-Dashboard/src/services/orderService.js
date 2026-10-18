import { addDoc, collection, getDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS, ORDER_STATUSES } from '../schemas/firestoreSchema';
import { addTimestamps, cleanObject, docRef, fetchVendorPage, getVendorId, withVendor } from './firebaseUtils';
import { reserveProductStock } from './productService';

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
    timeline: {
      [status]: {
        note,
        at: serverTimestamp()
      }
    },
    updatedAt: serverTimestamp()
  });
};

export const createNotification = (data, vendorId = getVendorId()) => addDoc(
  collection(db, COLLECTIONS.notifications),
  addTimestamps(cleanObject(withVendor({ read: false, ...data }, vendorId)))
);
