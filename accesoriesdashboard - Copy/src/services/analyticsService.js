import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase.config';
import { COLLECTIONS } from '../schemas/firestoreSchema';
import { getVendorId } from './firebaseUtils';

export const getDashboardAnalytics = async (vendorId = getVendorId()) => {
  const ordersSnapshot = await getDocs(query(
    collection(db, COLLECTIONS.orders),
    where('vendorId', '==', vendorId),
    limit(500)
  ));
  const productsSnapshot = await getDocs(query(
    collection(db, COLLECTIONS.products),
    where('vendorId', '==', vendorId),
    limit(500)
  ));
  const inventorySnapshot = await getDocs(query(
    collection(db, COLLECTIONS.inventory),
    where('vendorId', '==', vendorId),
    limit(500)
  ));
  const reviewsSnapshot = await getDocs(query(
    collection(db, COLLECTIONS.reviews),
    where('vendorId', '==', vendorId),
    limit(100)
  ));

  // Sort orders client-side to prevent missing index errors
  const orders = ordersSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const products = productsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const inventory = inventorySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const reviews = reviewsSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || order.totalAmount || 0), 0);
  const productsSold = orders.reduce((sum, order) => sum + Number(order.itemCount || 0), 0);

  const productsMap = products.reduce((acc, product) => {
    acc[product.id] = product.title || product.name;
    return acc;
  }, {});

  const lowStock = inventory
    .filter((item) => Number(item.availableStock || 0) <= Number(item.lowStockThreshold || 5))
    .map((item) => ({
      ...item,
      productName: productsMap[item.productId] || `Product ${item.productId}`
    }));

  const statusCounts = orders.reduce((acc, order) => {
    const status = String(order.status).toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const categorySales = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    acc[category] = acc[category] || { category, sales: 0, revenue: 0 };
    return acc;
  }, {});

  // Group orders by month for dynamic chart rendering
  const monthlyRevenue = orders.reduce((acc, order) => {
    const date = order.createdAt?.toDate ? order.createdAt.toDate() : (order.createdAt ? new Date(order.createdAt) : null);
    if (!date) return acc;
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    acc[month] = (acc[month] || 0) + Number(order.total || order.totalAmount || 0);
    return acc;
  }, {});

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentMonthIdx = new Date().getMonth();
  const revenueChartData = months.slice(0, currentMonthIdx + 1).map((month) => ({
    name: month,
    value: Math.round(monthlyRevenue[month] || 0)
  }));

  return {
    revenue,
    totalOrders: orders.length,
    pendingOrders: statusCounts.pending || 0,
    deliveredOrders: statusCounts.delivered || 0,
    returnRequests: statusCounts.returned || 0,
    productsSold,
    products,
    orders,
    lowStock,
    reviews,
    revenueChartData,
    topProducts: products
      .map((product) => ({
        id: product.id,
        name: product.title,
        sales: Number(product.salesCount || 0),
        revenue: Number(product.revenue || 0),
        category: product.category
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    categorySales: Object.values(categorySales)
  };
};
