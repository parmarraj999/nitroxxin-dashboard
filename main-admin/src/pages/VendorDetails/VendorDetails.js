import React from 'react';
import { ArrowLeft, CalendarDays, CircleDollarSign, Mail, MapPin, Package, Phone, ShoppingCart, Store, UserRound } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.config';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import { toDate } from '../../services/firebaseUtils';
import './VendorDetails.css';

const label = (key) => key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
const value = (item) => {
  if (item === undefined || item === null || item === '') return '-';
  if (Array.isArray(item)) return item.join(', ') || '-';
  if (typeof item === 'object') return Object.values(item).filter(Boolean).join(', ') || '-';
  return String(item);
};
const activityDate = (item) => toDate(item)?.getTime() || 0;

const VendorDetails = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [vendor, setVendor] = React.useState(null);
  const [vendorData, setVendorData] = React.useState({ products: [], events: [], orders: [], payouts: [] });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadVendor = async () => {
      try {
        const profileSnapshot = await getDoc(doc(db, 'vendors', vendorId));
        if (!profileSnapshot.exists()) return;
        setVendor({ id: profileSnapshot.id, ...profileSnapshot.data() });
        const [products, events, orders, payouts] = await Promise.all([
          getDocs(query(collection(db, COLLECTIONS.products), where('vendorId', '==', vendorId))),
          getDocs(query(collection(db, COLLECTIONS.events), where('vendorId', '==', vendorId))),
          getDocs(query(collection(db, COLLECTIONS.orders), where('vendorId', '==', vendorId))),
          getDocs(query(collection(db, COLLECTIONS.vendorPayouts), where('vendorId', '==', vendorId)))
        ]);
        setVendorData({
          products: products.docs.map((item) => ({ id: item.id, ...item.data() })),
          events: events.docs.map((item) => ({ id: item.id, ...item.data() })),
          orders: orders.docs.map((item) => ({ id: item.id, ...item.data() })),
          payouts: payouts.docs.map((item) => ({ id: item.id, ...item.data() }))
        });
      } finally {
        setLoading(false);
      }
    };
    loadVendor();
  }, [vendorId]);

  if (loading) return <div className="vendor-details-page"><div className="enterprise-state card">Loading vendor details...</div></div>;
  if (!vendor) return <div className="vendor-details-page"><div className="enterprise-state card"><h3>Vendor not found</h3><button className="export-btn" onClick={() => navigate('/vendors')}>Back to Vendor List</button></div></div>;

  const vendorName = vendor.displayName || vendor.businessDetails?.businessName || 'Unnamed Vendor';
  const contactEmail = vendor.businessDetails?.supportEmail || vendor.email || '-';
  const contactPhone = vendor.businessDetails?.supportPhone || vendor.phone || '-';
  const location = vendor.warehouseAddress?.city || vendor.pickupAddress?.city || vendor.city || '-';
  const revenue = vendorData.orders.reduce((total, order) => total + Number(order.totalAmount || order.total || 0), 0);
  const payouts = vendorData.payouts.reduce((total, payout) => total + Number(payout.amount || payout.netPayable || 0), 0);
  const activity = [
    ...vendorData.products.map((item) => ({ id: item.id, type: 'Product added', title: item.title || 'Untitled Product', date: item.createdAt, icon: Package })),
    ...vendorData.events.map((item) => ({ id: item.id, type: 'Event created', title: item.name || 'Untitled Event', date: item.createdAt, icon: CalendarDays })),
    ...vendorData.orders.map((item) => ({ id: item.id, type: 'Order received', title: item.orderId || `Order ${item.id.slice(0, 8)}`, date: item.createdAt, icon: ShoppingCart })),
    ...vendorData.payouts.map((item) => ({ id: item.id, type: 'Payout', title: `Rs. ${Number(item.amount || item.netPayable || 0).toLocaleString()}`, date: item.createdAt, icon: CircleDollarSign }))
  ].sort((a, b) => activityDate(b.date) - activityDate(a.date));
  const profileSections = [
    ['Platform Details', { ownerId: vendor.ownerId, verificationStatus: vendor.verificationStatus, commission: vendor.commission, settlementStatus: vendor.settlementStatus, warehouse: vendor.warehouse }],
    ['Business Details', vendor.businessDetails],
    ['GST Details', vendor.gstDetails],
    ['Brand Information', vendor.brandInformation],
    ['Warehouse Address', vendor.warehouseAddress],
    ['Pickup Address', vendor.pickupAddress],
    ['Return Address', vendor.returnAddress]
  ].filter(([, details]) => details && Object.keys(details).length);

  return (
    <div className="vendor-details-page">
      <div className="page-header">
        <div>
          <button className="back-btn" onClick={() => navigate('/vendors')}><ArrowLeft size={16} /> Back to Vendor List</button>
          <h1 className="page-title">{vendorName}</h1>
          <p className="page-subtitle">Vendor profile and management shortcuts for each service.</p>
        </div>
        <span className={`module-badge ${String(vendor.verificationStatus || 'pending').toLowerCase()}`}>{vendor.verificationStatus || 'pending'}</span>
      </div>

      <div className="vendor-details-grid">
        <section className="vendor-profile-card card">
          <div className="vendor-avatar"><Store size={26} /></div>
          <div><h2>{vendorName}</h2><p>{vendor.gstDetails?.legalName || vendor.businessDetails?.businessType || 'Marketplace vendor'}</p></div>
          <div className="vendor-contact-list">
            <span><Mail size={16} /> {contactEmail}</span><span><Phone size={16} /> {contactPhone}</span><span><MapPin size={16} /> {location}</span><span><UserRound size={16} /> PAN: {vendor.businessDetails?.pan || vendor.pan || '-'}</span>
          </div>
          <div className="vendor-contact-list"><span>GST: {vendor.gstDetails?.gstNumber || vendor.gstNumber || '-'}</span><span>Commission: {vendor.commission || 0}%</span><span>Settlement: {vendor.settlementStatus || '-'}</span></div>
        </section>
        <section className="vendor-management-card card">
          <h3 className="section-title">Manage Vendor Data</h3>
          <p>Open the existing management views to manage records this vendor has added.</p>
          <div className="vendor-actions">
            <button className="export-btn" onClick={() => navigate(`/vendors/${vendorId}/products`)}><Package size={16} /> Products</button>
            <button className="export-btn" onClick={() => navigate(`/vendors/${vendorId}/events`)}><CalendarDays size={16} /> Events</button>
            <button className="export-btn" onClick={() => navigate(`/vendors/${vendorId}/orders`)}><ShoppingCart size={16} /> Orders</button>
            <button className="quick-add-btn" onClick={() => navigate(`/vendors/${vendorId}/payouts`)}><CircleDollarSign size={16} /> Payouts</button>
          </div>
        </section>
      </div>

      <div className="enterprise-metrics">
        <div className="enterprise-metric"><span>Products Listed</span><strong>{vendorData.products.length}</strong></div>
        <div className="enterprise-metric"><span>Events Created</span><strong>{vendorData.events.length}</strong></div>
        <div className="enterprise-metric"><span>Order Revenue</span><strong>Rs. {revenue.toLocaleString()}</strong></div>
        <div className="enterprise-metric"><span>Total Payouts</span><strong>Rs. {payouts.toLocaleString()}</strong></div>
      </div>

      <section className="vendor-data-card card">
        <div className="vendor-section-header"><div><h3>Product Listing</h3><p>All products added by this vendor.</p></div><button className="export-btn" onClick={() => navigate(`/vendors/${vendorId}/products`)}>View All Products</button></div>
        {vendorData.products.length === 0 ? <div className="enterprise-state"><Package size={26} /><p>No products have been added by this vendor.</p></div> : <div className="enterprise-table-wrap"><table className="enterprise-table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead><tbody>{vendorData.products.map((product) => <tr className="vendor-service-row" key={product.id} onClick={() => navigate(`/products/details/${product.id}`)}><td><strong>{product.title || 'Untitled Product'}</strong></td><td>{product.sku || '-'}</td><td>{product.category || '-'}</td><td>Rs. {Number(product.pricing?.sellingPrice || 0).toLocaleString()}</td><td>{Number(product.inventory?.stockQuantity || 0)}</td><td><span className={`module-badge ${String(product.status || 'draft').toLowerCase()}`}>{product.status || 'draft'}</span></td></tr>)}</tbody></table></div>}
      </section>

      <div className="vendor-overview-grid">
        <section className="vendor-full-data-card card"><h3 className="section-title">Vendor Details</h3>{profileSections.length ? <div className="vendor-detail-sections">{profileSections.map(([title, details]) => <div className="vendor-detail-section" key={title}><h4>{title}</h4>{Object.entries(details).map(([key, item]) => <div className="vendor-detail-row" key={key}><span>{label(key)}</span><strong>{value(item)}</strong></div>)}</div>)}</div> : <div className="soft-empty">No additional profile details have been added.</div>}</section>
        <section className="vendor-activity-card card"><h3 className="section-title">Vendor Activity</h3>{activity.length === 0 ? <div className="soft-empty">No vendor activity yet.</div> : <div className="activity-list">{activity.slice(0, 15).map((item) => { const Icon = item.icon; return <div className="activity-item" key={`${item.type}-${item.id}`}><div className="activity-icon"><Icon size={17} /></div><div><strong>{item.title}</strong><span>{item.type}</span></div><small>{toDate(item.date)?.toLocaleDateString() || '-'}</small></div>; })}</div>}</section>
      </div>

    </div>
  );
};

export default VendorDetails;
