import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS, emptyVendorProfile } from '../schemas/firestoreSchema';
import { cleanObject, getVendorId } from './firebaseUtils';

export const getVendorProfile = async (vendorId = getVendorId()) => {
  const snapshot = await getDoc(doc(db, COLLECTIONS.vendors, vendorId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const saveVendorProfile = async (profile, vendorId = getVendorId()) => {
  await setDoc(doc(db, COLLECTIONS.vendors, vendorId), cleanObject({
    ...emptyVendorProfile,
    ...profile,
    ownerId: vendorId,
    updatedAt: serverTimestamp()
  }), { merge: true });
};
