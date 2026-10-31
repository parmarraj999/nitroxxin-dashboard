import { doc, getDoc, serverTimestamp, setDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase.config';
import { COLLECTIONS, emptyVendorProfile } from '../schemas/firestoreSchema';
import { cleanObject, getVendorId } from './firebaseUtils';

/**
 * Generates custom vendor ID in the format:
 * name - 5 last number of phone number - and some random alphanumeric of length 8
 * e.g., "rajparmar-43210-9k2x4m1a"
 */
export const generateVendorId = (name = '', phone = '') => {
  const cleanName = (name || 'vendor')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '') || 'vendor';

  const digits = String(phone || '').replace(/\D/g, '');
  const lastFivePhone = digits.length >= 5 ? digits.slice(-5) : digits.padStart(5, '0');

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomAlpha = '';
  for (let i = 0; i < 8; i++) {
    randomAlpha += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${cleanName}-${lastFivePhone}-${randomAlpha}`;
};

export const getVendorProfile = async (vendorId = getVendorId()) => {
  if (!vendorId) return null;
  // 1. Direct doc lookup by vendorId
  const snapshot = await getDoc(doc(db, COLLECTIONS.vendors, vendorId));
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  // 2. Query by ownerId if vendorId was an auth user.uid
  try {
    const qOwner = query(collection(db, COLLECTIONS.vendors), where('ownerId', '==', vendorId), limit(1));
    const snapOwner = await getDocs(qOwner);
    if (!snapOwner.empty) {
      return { id: snapOwner.docs[0].id, ...snapOwner.docs[0].data() };
    }
    const qUid = query(collection(db, COLLECTIONS.vendors), where('uid', '==', vendorId), limit(1));
    const snapUid = await getDocs(qUid);
    if (!snapUid.empty) {
      return { id: snapUid.docs[0].id, ...snapUid.docs[0].data() };
    }
  } catch (e) {
    console.warn('[vendorService] Error querying vendor profile:', e);
  }
  return null;
};

export const saveVendorProfile = async (profile, vendorId = getVendorId()) => {
  const targetDocId = profile?.vendorId || profile?.customVendorId || vendorId;
  const authUid = profile?.ownerId || profile?.uid || auth.currentUser?.uid;

  await setDoc(doc(db, COLLECTIONS.vendors, targetDocId), cleanObject({
    ...emptyVendorProfile,
    ...profile,
    vendorId: targetDocId,
    customVendorId: targetDocId,
    ownerId: authUid || targetDocId,
    uid: authUid || targetDocId,
    updatedAt: serverTimestamp()
  }), { merge: true });
};

