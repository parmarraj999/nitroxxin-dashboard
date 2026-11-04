import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { getVendorId, toDate, cleanObject, withVendor } from './firebaseUtils';

// Reference matching mock transactions (exact ₹84,660.00 volume, 12 records)
export const initialSampleTransactions = [
  {
    id: 'TXN-9021-01',
    customerName: 'Alvina Yau',
    description: 'Wire from Wells Fargo *3872',
    category: 'Send Money',
    date: 'Sep 25, 2026',
    time: '8:20 PM',
    rawTimestamp: new Date('2026-09-25T20:20:00'),
    email: 'hellosajibur@gmail.com',
    status: 'success',
    amount: 10000.0,
    paymentMethod: 'Wire Transfer (Wells Fargo *3872)',
    reference: 'REF-WF-98214'
  },
  {
    id: 'TXN-9021-02',
    customerName: 'Alvina Yau',
    description: 'Wire from Wells Fargo *3872',
    category: 'Send Money',
    date: 'Sep 25, 2026',
    time: '8:20 PM',
    rawTimestamp: new Date('2026-09-25T20:20:00'),
    email: 'hellosajibur@gmail.com',
    status: 'success',
    amount: 10000.0,
    paymentMethod: 'Wire Transfer (Wells Fargo *3872)',
    reference: 'REF-WF-98215'
  },
  {
    id: 'TXN-9021-03',
    customerName: 'Brian Choi',
    description: 'ACH to Chase *4521',
    category: 'Request Money',
    date: 'Oct 1, 2026',
    time: '10:45 AM',
    rawTimestamp: new Date('2026-10-01T10:45:00'),
    email: 'bchoi@example.com',
    status: 'in_progress',
    amount: 3250.0,
    paymentMethod: 'ACH Transfer (Chase *4521)',
    reference: 'REF-CH-11029'
  },
  {
    id: 'TXN-9021-04',
    customerName: 'Camila Ortiz',
    description: 'Wire from Bank of America *9907',
    category: 'Send Money',
    date: 'Oct 3, 2026',
    time: '2:30 PM',
    rawTimestamp: new Date('2026-10-03T14:30:00'),
    email: 'camila.ortiz@mail.com',
    status: 'failed',
    amount: 5500.0,
    paymentMethod: 'Wire Transfer (Bank of America *9907)',
    reference: 'REF-BOA-87211'
  },
  {
    id: 'TXN-9021-05',
    customerName: 'Giovanni Russo',
    description: 'Wire from HSBC *5566',
    category: 'Send Money',
    date: 'Oct 11, 2026',
    time: '3:05 PM',
    rawTimestamp: new Date('2026-10-11T15:05:00'),
    email: 'giovanni.r@hsbc.com',
    status: 'in_progress',
    amount: 15000.0,
    paymentMethod: 'Wire Transfer (HSBC *5566)',
    reference: 'REF-HSBC-44910'
  },
  {
    id: 'TXN-9021-06',
    customerName: 'Hanna Schmidt',
    description: 'ACH to TD Bank *1122',
    category: 'Request Money',
    date: 'Oct 13, 2026',
    time: '6:40 PM',
    rawTimestamp: new Date('2026-10-13T18:40:00'),
    email: 'hanna.schmidt@mail.de',
    status: 'pending',
    amount: 2700.0,
    paymentMethod: 'ACH Transfer (TD Bank *1122)',
    reference: 'REF-TDB-39812'
  },
  {
    id: 'TXN-9021-07',
    customerName: 'Kevin O\'Leary',
    description: 'Wire from TD Bank *5599',
    category: 'Send Money',
    date: 'Oct 19, 2026',
    time: '1:50 PM',
    rawTimestamp: new Date('2026-10-19T13:50:00'),
    email: 'kevin.oleary@domain.net',
    status: 'in_progress',
    amount: 12450.0,
    paymentMethod: 'Wire Transfer (TD Bank *5599)',
    reference: 'REF-TDB-77610'
  },
  {
    id: 'TXN-9021-08',
    customerName: 'Lina Garcia',
    description: 'ACH to Citibank *2211',
    category: 'Send Money',
    date: 'Oct 21, 2026',
    time: '10:00 AM',
    rawTimestamp: new Date('2026-10-21T10:00:00'),
    email: 'lina.garcia@mail.com',
    status: 'success',
    amount: 8000.0,
    paymentMethod: 'ACH Transfer (Citibank *2211)',
    reference: 'REF-CITI-98442'
  },
  {
    id: 'TXN-9021-09',
    customerName: 'Marcus Lee',
    description: 'Wire from Chase *6688',
    category: 'Request Money',
    date: 'Oct 23, 2026',
    time: '5:35 PM',
    rawTimestamp: new Date('2026-10-23T17:35:00'),
    email: 'marcus.lee@chase.com',
    status: 'failed',
    amount: 3900.0,
    paymentMethod: 'Wire Transfer (Chase *6688)',
    reference: 'REF-CH-66120'
  },
  {
    id: 'TXN-9021-10',
    customerName: 'Rohan Sharma',
    description: 'Razorpay UPI *9128',
    category: 'Ticket Booking',
    date: 'Oct 25, 2026',
    time: '11:15 AM',
    rawTimestamp: new Date('2026-10-25T11:15:00'),
    email: 'rohan.sharma@gmail.com',
    status: 'success',
    amount: 6460.0,
    paymentMethod: 'UPI / NetBanking',
    reference: 'REF-RZP-55912'
  },
  {
    id: 'TXN-9021-11',
    customerName: 'Priya Patel',
    description: 'Net Banking / HDFC *3301',
    category: 'Product Order',
    date: 'Oct 28, 2026',
    time: '4:10 PM',
    rawTimestamp: new Date('2026-10-28T16:10:00'),
    email: 'priya.patel@outlook.com',
    status: 'success',
    amount: 4500.0,
    paymentMethod: 'HDFC Net Banking',
    reference: 'REF-HDFC-99321'
  },
  {
    id: 'TXN-9021-12',
    customerName: 'Vikram Malhotra',
    description: 'Axis Card Payment *7712',
    category: 'Ticket Booking',
    date: 'Oct 30, 2026',
    time: '7:45 PM',
    rawTimestamp: new Date('2026-10-30T19:45:00'),
    email: 'vikram.m@domain.in',
    status: 'pending',
    amount: 2900.0,
    paymentMethod: 'Debit Card (Axis *7712)',
    reference: 'REF-AXIS-88120'
  }
];

/**
 * Fetch payments from Firestore 'payments' collection filtered by vendorId
 */
export const fetchPaymentsByVendor = async (vendorId = getVendorId()) => {
  const resolvedVendorId = vendorId || getVendorId();
  try {
    const q = query(
      collection(db, 'payments'),
      where('vendorId', '==', resolvedVendorId)
    );
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const rawDt = toDate(data.createdAt || data.date || data.timestamp);
      return {
        id: docSnap.id,
        ...data,
        customerName: data.customerName || data.customer?.name || data.name || 'Anonymous Customer',
        description: data.description || data.paymentMethod || data.method || 'Standard Online Payment',
        category: data.category || 'Product Order',
        date: rawDt ? rawDt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 25, 2026',
        time: rawDt ? rawDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM',
        rawTimestamp: rawDt || new Date(),
        email: data.customerEmail || data.email || data.customer?.email || 'customer@example.com',
        status: (data.status || 'success').toLowerCase(),
        amount: Number(data.amount || data.total || data.totalAmount || 0),
        paymentMethod: data.paymentMethod || data.method || 'Online Payment',
        reference: data.reference || data.orderId || docSnap.id
      };
    });

    return payments;
  } catch (err) {
    console.warn('[paymentService] Error querying payments from Firestore:', err);
    return [];
  }
};

/**
 * Record a payment in Firestore 'payments' collection
 */
export const createPaymentRecord = async (data, vendorId = getVendorId()) => {
  const resolvedVendorId = data?.vendorId || vendorId || getVendorId();
  const payload = cleanObject(withVendor({
    ...data,
    status: data.status || 'success',
    amount: Number(data.amount || 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, resolvedVendorId));

  const docRef = await addDoc(collection(db, 'payments'), payload);
  return docRef.id;
};

/**
 * Export transactions to a clean downloadable CSV file
 */
export const exportTransactionsToCSV = (transactions = [], filename = 'transactions_payouts_export.csv') => {
  if (!transactions.length) return;

  const headers = ['Transaction ID', 'Customer Name', 'Description', 'Category', 'Date', 'Time', 'Email', 'Status', 'Amount (INR)'];
  const rows = transactions.map((t) => [
    `"${t.id || ''}"`,
    `"${(t.customerName || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${t.date || ''}"`,
    `"${t.time || ''}"`,
    `"${(t.email || '').replace(/"/g, '""')}"`,
    `"${(t.status || '').toUpperCase()}"`,
    t.amount !== undefined ? t.amount : 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

