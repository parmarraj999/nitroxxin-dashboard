import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS, PRODUCT_STATUSES, emptyProduct } from '../schemas/firestoreSchema';
import { addTimestamps, cleanObject, docRef, fetchVendorPage, getVendorId, touch, withVendor } from './firebaseUtils';
import { validateProductPayload } from './validationService';

const normalizeProduct = (data, vendorId = getVendorId()) => cleanObject(withVendor({
  ...emptyProduct,
  ...data,
  pricing: { ...emptyProduct.pricing, ...(data.pricing || {}) },
  inventory: { ...emptyProduct.inventory, ...(data.inventory || {}) },
  shipping: { ...emptyProduct.shipping, ...(data.shipping || {}) },
  seo: { ...emptyProduct.seo, ...(data.seo || {}) },
  safety: { ...emptyProduct.safety, ...(data.safety || {}) },
  media: { ...emptyProduct.media, ...(data.media || {}) }
}, vendorId));

export const listProducts = (options = {}) => fetchVendorPage({
  collectionName: COLLECTIONS.products,
  sort: ['updatedAt', 'desc'],
  ...options
});

export const getProduct = async (productId) => {
  const snapshot = await getDoc(docRef(COLLECTIONS.products, productId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const createProduct = async (data, { status = PRODUCT_STATUSES.draft, vendorId = getVendorId() } = {}) => {
  const product = addTimestamps(normalizeProduct({ ...data, status }, vendorId));
  validateProductPayload(product, { publish: status === PRODUCT_STATUSES.published });
  const productRef = await addDoc(collection(db, COLLECTIONS.products), product);
  const inventoryRef = doc(db, COLLECTIONS.inventory, productRef.id);

  await updateDoc(productRef, { productId: productRef.id });
  await runTransaction(db, async (transaction) => {
    transaction.set(inventoryRef, {
      vendorId,
      productId: productRef.id,
      stock: Number(product.inventory?.stockQuantity || 0),
      reservedStock: 0,
      availableStock: Number(product.inventory?.stockQuantity || 0),
      lowStockThreshold: Number(product.inventory?.lowStockThreshold || 5),
      warehouseId: product.shipping?.shippingOrigin || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  return productRef.id;
};

export const updateProduct = async (productId, data) => {
  if (data.status === PRODUCT_STATUSES.published && data.title) {
    validateProductPayload(data, { publish: data.status === PRODUCT_STATUSES.published });
  }
  await updateDoc(docRef(COLLECTIONS.products, productId), touch(cleanObject(data)));
  if (data.inventory) {
    await updateInventoryForProduct(productId, {
      stock: Number(data.inventory.stockQuantity || 0),
      lowStockThreshold: Number(data.inventory.lowStockThreshold || 5)
    });
  }
};

export const deleteProduct = async (productId) => {
  const batch = writeBatch(db);
  batch.delete(docRef(COLLECTIONS.products, productId));
  batch.delete(docRef(COLLECTIONS.inventory, productId));
  await batch.commit();
};

export const publishProduct = async (productId) => {
  const product = await getProduct(productId);
  validateProductPayload(product, { publish: true });
  return updateProduct(productId, { status: PRODUCT_STATUSES.published });
};
export const draftProduct = (productId) => updateProduct(productId, { status: PRODUCT_STATUSES.draft });
export const archiveProduct = (productId) => updateProduct(productId, { status: PRODUCT_STATUSES.archived });

export const updateInventoryForProduct = async (productId, { stock, reservedStock, lowStockThreshold, warehouseId }) => {
  await runTransaction(db, async (transaction) => {
    const ref = docRef(COLLECTIONS.inventory, productId);
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists() ? snapshot.data() : {};
    const nextStock = stock ?? existing.stock ?? 0;
    const nextReserved = reservedStock ?? existing.reservedStock ?? 0;

    transaction.set(ref, {
      ...existing,
      vendorId: existing.vendorId || getVendorId(),
      productId,
      stock: nextStock,
      reservedStock: nextReserved,
      availableStock: Math.max(Number(nextStock) - Number(nextReserved), 0),
      lowStockThreshold: lowStockThreshold ?? existing.lowStockThreshold ?? 5,
      warehouseId: warehouseId ?? existing.warehouseId ?? '',
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
};

export const reserveProductStock = async (productId, quantity) => {
  await runTransaction(db, async (transaction) => {
    const ref = docRef(COLLECTIONS.inventory, productId);
    const snapshot = await transaction.get(ref);
    const inventory = snapshot.data();
    if (!inventory || inventory.availableStock < quantity) {
      throw new Error('Insufficient stock available');
    }
    transaction.update(ref, {
      reservedStock: increment(quantity),
      availableStock: increment(-quantity),
      updatedAt: serverTimestamp()
    });
  });
};
