import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { addTimestamps, cleanObject, fetchVendorPage, getVendorId, withVendor } from './firebaseUtils';
import { validateCouponPayload, validateSupportTicketPayload } from './validationService';

export const createCoupon = (data, vendorId = getVendorId()) => {
  validateCouponPayload(data);
  return addDoc(collection(db, COLLECTIONS.coupons), addTimestamps(cleanObject(withVendor(data, vendorId))));
};
export const updateCoupon = (couponId, data) => {
  validateCouponPayload(data);
  return updateDoc(doc(db, COLLECTIONS.coupons, couponId), {
    ...cleanObject(data),
    updatedAt: serverTimestamp()
  });
};
export const deleteCoupon = (couponId) => deleteDoc(doc(db, COLLECTIONS.coupons, couponId));
export const listCoupons = (options = {}) => fetchVendorPage({ collectionName: COLLECTIONS.coupons, ...options });

export const createReview = (data, vendorId = getVendorId()) => addDoc(
  collection(db, COLLECTIONS.reviews),
  addTimestamps(cleanObject(withVendor({ reply: '', ...data }, vendorId)))
);
export const replyToReview = (reviewId, reply) => updateDoc(doc(db, COLLECTIONS.reviews, reviewId), {
  reply,
  repliedAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});
export const listReviews = (options = {}) => fetchVendorPage({ collectionName: COLLECTIONS.reviews, ...options });

export const calculateAverageRating = async (productId) => {
  const snapshot = await getDocs(query(
    collection(db, COLLECTIONS.reviews),
    where('productId', '==', productId),
    limit(500)
  ));
  const ratings = snapshot.docs.map((item) => Number(item.data().rating || 0));
  const averageRating = ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
  return { averageRating, reviewCount: ratings.length };
};

export const createSupportTicket = (data, vendorId = getVendorId()) => {
  validateSupportTicketPayload(data);
  return addDoc(
    collection(db, COLLECTIONS.supportTickets),
    addTimestamps(cleanObject(withVendor({ status: 'open', replies: [], ...data }, vendorId)))
  );
};
export const updateSupportTicket = (ticketId, data) => updateDoc(doc(db, COLLECTIONS.supportTickets, ticketId), {
  ...cleanObject(data),
  updatedAt: serverTimestamp()
});
export const closeSupportTicket = (ticketId) => updateSupportTicket(ticketId, { status: 'closed', closedAt: serverTimestamp() });

export const createWithdrawal = (data, vendorId = getVendorId()) => addDoc(
  collection(db, COLLECTIONS.withdrawals),
  addTimestamps(cleanObject(withVendor({ status: 'requested', ...data }, vendorId)))
);
export const listSettlements = (options = {}) => fetchVendorPage({ collectionName: COLLECTIONS.settlements, ...options });
export const listWithdrawals = (options = {}) => fetchVendorPage({ collectionName: COLLECTIONS.withdrawals, ...options });

export const listNotifications = (options = {}) => fetchVendorPage({ collectionName: COLLECTIONS.notifications, ...options });
export const markNotificationRead = (notificationId) => updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
  read: true,
  readAt: serverTimestamp()
});

export const getTopProducts = async (vendorId = getVendorId()) => {
  const snapshot = await getDocs(query(
    collection(db, COLLECTIONS.analytics),
    where('vendorId', '==', vendorId),
    orderBy('period', 'desc'),
    limit(1)
  ));
  return snapshot.docs[0]?.data()?.topProducts || [];
};
