import React from 'react';
import { ArrowLeft, CalendarDays, CircleDollarSign, Package, ShoppingCart } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.config';
import './VendorDetails.css';

const services = {
  products: { title: 'Products', collectionName: 'product-collection', icon: Package, columns: [['title', 'Product'], ['sku', 'SKU'], ['category', 'Category'], ['status', 'Status']], detailPath: (id) => `/products/details/${id}` },
  events: { title: 'Events', collectionName: 'events', icon: CalendarDays, columns: [['name', 'Event'], ['venue', 'Venue'], ['eventDate', 'Date'], ['status', 'Status']] },
  orders: { title: 'Orders', collectionName: 'orders', icon: ShoppingCart, columns: [['orderId', 'Order'], ['customerName', 'Customer'], ['totalAmount', 'Total'], ['status', 'Status']], detailPath: (id) => `/orders/details/${id}` },
  payouts: { title: 'Payouts', collectionName: 'vendor_payouts', icon: CircleDollarSign, columns: [['payoutId', 'Payout'], ['period', 'Period'], ['amount', 'Amount'], ['status', 'Status']] }
};

const formatValue = (key, value) => {
  if (value === undefined || value === null || value === '') return '-';
  if (key === 'amount' || key === 'totalAmount') return `Rs. ${Number(value).toLocaleString()}`;
  return String(value);
};

const VendorServicePage = ({ serviceKey }) => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const service = services[serviceKey];
  const Icon = service.icon;
  const [vendorName, setVendorName] = React.useState('Vendor');
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [vendorSnapshot, recordsSnapshot] = await Promise.all([
          getDoc(doc(db, 'vendors', vendorId)),
          getDocs(query(collection(db, service.collectionName), where('vendorId', '==', vendorId)))
        ]);
        if (vendorSnapshot.exists()) {
          const vendor = vendorSnapshot.data();
          setVendorName(vendor.displayName || vendor.businessDetails?.businessName || 'Vendor');
        }
        setRecords(recordsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [service.collectionName, vendorId]);

  return (
    <div className="vendor-details-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate(`/vendors/${vendorId}`)}><ArrowLeft size={16} /> Back to Vendor</button>
          <h1 className="page-title">{vendorName} — {service.title}</h1>
          <p className="page-subtitle">All {service.title.toLowerCase()} created or managed by this vendor.</p>
        </div>
      </div>
      <div className="vendor-service-summary card"><Icon size={24} /><div><span>Total {service.title}</span><strong>{loading ? '...' : records.length}</strong></div></div>
      <section className="vendor-data-card card">
        {loading ? <div className="enterprise-state">Loading {service.title.toLowerCase()}...</div> : records.length === 0 ? <div className="enterprise-state"><Icon size={28} /><h3>No {service.title.toLowerCase()} yet</h3><p>This vendor has not added any {service.title.toLowerCase()}.</p></div> : (
          <div className="enterprise-table-wrap"><table className="enterprise-table"><thead><tr>{service.columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{records.map((record) => <tr key={record.id} className={service.detailPath ? 'vendor-service-row' : ''} onClick={() => service.detailPath && navigate(service.detailPath(record.id))}>{service.columns.map(([key]) => <td key={key}>{formatValue(key, record[key])}</td>)}</tr>)}</tbody></table></div>
        )}
      </section>
    </div>
  );
};

export default VendorServicePage;
