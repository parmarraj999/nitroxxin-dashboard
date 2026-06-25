import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase.config';

export const DEFAULT_VENDOR_ID = 'nitroxx-default-vendor';

export const getVendorId = () => auth.currentUser?.uid || DEFAULT_VENDOR_ID;

export const withVendor = (data, vendorId = getVendorId()) => ({
  ...data,
  vendorId
});

export const cleanObject = (value) => {
  if (Array.isArray(value)) {
    return value.map(cleanObject).filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object' && !(value instanceof File) && !(value instanceof Date)) {
    return Object.entries(value).reduce((acc, [key, item]) => {
      const cleaned = cleanObject(item);
      if (cleaned !== undefined && cleaned !== '') {
        acc[key] = cleaned;
      }
      return acc;
    }, {});
  }

  return value === undefined ? undefined : value;
};

export const addTimestamps = (data) => ({
  ...data,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

export const touch = (data) => ({
  ...data,
  updatedAt: serverTimestamp()
});

export const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
};

export const fromSnapshot = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data()
});

export const buildVendorQuery = ({
  collectionName,
  vendorId = getVendorId(),
  constraints = [],
  sort = ['createdAt', 'desc'],
  pageSize = 25,
  cursor
}) => {
  const parts = [where('vendorId', '==', vendorId), ...constraints];
  if (sort) parts.push(orderBy(sort[0], sort[1]));
  if (cursor) parts.push(startAfter(cursor));
  if (pageSize) parts.push(limit(pageSize));
  return query(collection(db, collectionName), ...parts);
};

export const fetchVendorPage = async (options) => {
  console.log('[fetchVendorPage] fetching options:', options);
  try {
    const q = buildVendorQuery(options);
    console.log('[fetchVendorPage] built query constraints for collection:', options.collectionName);
    const snapshot = await getDocs(q);
    console.log(`[fetchVendorPage] collection "${options.collectionName}" count:`, snapshot.docs.length);
    const data = snapshot.docs.map(fromSnapshot);
    console.log(`[fetchVendorPage] collection "${options.collectionName}" data:`, data);
    return {
      data,
      cursor: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === (options.pageSize || 25)
    };
  } catch (err) {
    console.error(`[fetchVendorPage] error querying ${options.collectionName}:`, err);
    throw err;
  }
};

export const docRef = (collectionName, id) => doc(db, collectionName, id);
