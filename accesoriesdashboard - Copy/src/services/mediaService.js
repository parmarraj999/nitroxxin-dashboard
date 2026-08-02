import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { getVendorId } from './firebaseUtils';

const fileName = (file) => `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;

export const uploadVendorAsset = async ({
  file,
  type,
  productId = 'unassigned',
  vendorId = getVendorId(),
  onProgress
}) => {
  const storagePath = `vendors/${vendorId}/${type}/${productId}/${fileName(file)}`;
  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: { vendorId, productId, type }
  });

  await new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        }
      },
      reject,
      resolve
    );
  });

  const downloadUrl = await getDownloadURL(task.snapshot.ref);
  const mediaDoc = await addDoc(collection(db, COLLECTIONS.mediaLibrary), {
    vendorId,
    productId,
    type,
    fileName: file.name,
    contentType: file.type,
    size: file.size,
    storagePath,
    downloadUrl,
    createdAt: serverTimestamp()
  });

  return { id: mediaDoc.id, storagePath, downloadUrl };
};

export const replaceVendorAsset = async ({ mediaId, oldStoragePath, file, type, productId, vendorId }) => {
  const uploaded = await uploadVendorAsset({ file, type, productId, vendorId });
  if (oldStoragePath) {
    await deleteObject(ref(storage, oldStoragePath)).catch(() => null);
  }
  if (mediaId) {
    await updateDoc(doc(db, COLLECTIONS.mediaLibrary, mediaId), {
      ...uploaded,
      updatedAt: serverTimestamp()
    });
  }
  return uploaded;
};

export const deleteVendorAsset = async ({ mediaId, storagePath }) => {
  if (storagePath) {
    await deleteObject(ref(storage, storagePath)).catch(() => null);
  }
  if (mediaId) {
    await deleteDoc(doc(db, COLLECTIONS.mediaLibrary, mediaId));
  }
};
