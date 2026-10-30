import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS, PRODUCT_STATUSES, emptyProduct } from '../schemas/firestoreSchema';
import { addTimestamps, cleanObject, docRef, fetchVendorPage, fromSnapshot, getVendorId, toDate, touch, withVendor } from './firebaseUtils';
import { validateProductPayload } from './validationService';

const normalizeProduct = (data, vendorId) => {
  const resolvedVendorId = data?.vendorId || vendorId || getVendorId();
  return cleanObject(withVendor({
    ...emptyProduct,
    ...data,
    vendorId: resolvedVendorId,
    pricing: { ...emptyProduct.pricing, ...(data.pricing || {}) },
    inventory: { ...emptyProduct.inventory, ...(data.inventory || {}) },
    shipping: { ...emptyProduct.shipping, ...(data.shipping || {}) },
    seo: { ...emptyProduct.seo, ...(data.seo || {}) },
    safety: { ...emptyProduct.safety, ...(data.safety || {}) },
    media: { ...emptyProduct.media, ...(data.media || {}) }
  }, resolvedVendorId));
};

export const listProducts = async (options = {}) => {
  const resolvedVendorId = options.vendorId || getVendorId();
  try {
    const q = query(
      collection(db, COLLECTIONS.products),
      where('vendorId', '==', resolvedVendorId)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(fromSnapshot);
    data.sort((a, b) => {
      const aTime = toDate(a.updatedAt || a.createdAt)?.getTime() || 0;
      const bTime = toDate(b.updatedAt || b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    });
    return {
      data,
      cursor: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: false
    };
  } catch (err) {
    console.error('[productService] Error querying products by vendorId:', resolvedVendorId, err);
    throw err;
  }
};


export const getProduct = async (productId) => {
  const snapshot = await getDoc(docRef(COLLECTIONS.products, productId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const createProduct = async (data, { status = PRODUCT_STATUSES.draft, vendorId } = {}) => {
  const resolvedVendorId = data?.vendorId || vendorId || getVendorId();
  const product = addTimestamps(normalizeProduct({ ...data, status, vendorId: resolvedVendorId }, resolvedVendorId));
  validateProductPayload(product, { publish: status === PRODUCT_STATUSES.published });
  const productRef = await addDoc(collection(db, COLLECTIONS.products), product);
  const inventoryRef = doc(db, COLLECTIONS.inventory, productRef.id);

  await updateDoc(productRef, { productId: productRef.id });
  await runTransaction(db, async (transaction) => {
    transaction.set(inventoryRef, {
      vendorId: resolvedVendorId,
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
      lowStockThreshold: Number(data.inventory.lowStockThreshold || 5),
      vendorId: data.vendorId
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

export const updateInventoryForProduct = async (productId, { stock, reservedStock, lowStockThreshold, warehouseId, vendorId }) => {
  await runTransaction(db, async (transaction) => {
    const ref = docRef(COLLECTIONS.inventory, productId);
    const snapshot = await transaction.get(ref);
    const existing = snapshot.exists() ? snapshot.data() : {};
    const nextStock = stock ?? existing.stock ?? 0;
    const nextReserved = reservedStock ?? existing.reservedStock ?? 0;

    transaction.set(ref, {
      ...existing,
      vendorId: vendorId || existing.vendorId || getVendorId(),
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
