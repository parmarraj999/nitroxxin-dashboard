const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAG-FLs94I1LRNQ0Gwnyey-Dwjia8NVdn0',
  projectId: 'nitroxxin-web',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const VENDOR_ID = 'nitroxx-default-vendor';

async function run() {
  // Check products vendorId values
  console.log('=== Products vendorId distribution ===');
  const snap = await getDocs(collection(db, 'product-collection'));
  const vendorCounts = {};
  snap.forEach(d => {
    const v = d.data().vendorId || '(none)';
    vendorCounts[v] = (vendorCounts[v] || 0) + 1;
  });
  console.log(vendorCounts);

  // Check what analytics would get with the VENDOR_ID filter
  console.log('\n=== Products with vendorId filter ===');
  const filtered = await getDocs(query(collection(db, 'product-collection'), where('vendorId', '==', VENDOR_ID), limit(500)));
  console.log('Count:', filtered.size);

  // Check orders
  console.log('\n=== Orders with vendorId filter ===');
  const orders = await getDocs(query(collection(db, 'orders'), where('vendorId', '==', VENDOR_ID), limit(500)));
  console.log('Count:', orders.size);
  if (orders.size > 0) {
    console.log('Sample order:', JSON.stringify(orders.docs[0].data()).substring(0, 200));
  }

  // Check one product's full data
  if (snap.size > 0) {
    const p = snap.docs[0].data();
    console.log('\n=== First product vendorId ===');
    console.log('vendorId:', p.vendorId);
    console.log('title:', p.title);
    console.log('status:', p.status);
  }
}
run().catch(console.error);
