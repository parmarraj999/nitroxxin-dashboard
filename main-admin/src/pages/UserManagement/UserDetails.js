import React from 'react';
import { ArrowLeft, CalendarDays, Clock3, Mail, MapPin, Package, Phone, ShoppingCart, Star } from 'lucide-react';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase.config';
import { toDate } from '../../services/firebaseUtils';
import './UserManagement.css';

const dateLabel = (value) => toDate(value)?.toLocaleDateString() || '-';

const UserDetails = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = React.useState(null);
  const [activity, setActivity] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userSnapshot = await getDoc(doc(db, 'customers', userId));
        if (!userSnapshot.exists()) return;
        const profile = { id: userSnapshot.id, ...userSnapshot.data() };
        setUser(profile);
        const [orders, bookings, reviews] = await Promise.all([
          getDocs(query(collection(db, 'orders'), where('customerId', '==', userId))),
          getDocs(query(collection(db, 'event_bookings'), where('customerId', '==', userId))),
          getDocs(query(collection(db, 'reviews'), where('customerId', '==', userId)))
        ]);
        const items = [
          ...orders.docs.map((item) => ({ id: item.id, kind: 'Order', icon: ShoppingCart, label: item.data().orderId || `Order ${item.id.slice(0, 8)}`, detail: `Rs. ${Number(item.data().total || item.data().totalAmount || 0).toLocaleString()}`, at: item.data().createdAt })),
          ...bookings.docs.map((item) => ({ id: item.id, kind: 'Event Booking', icon: CalendarDays, label: item.data().eventName || 'Event booking', detail: item.data().status || 'confirmed', at: item.data().createdAt })),
          ...reviews.docs.map((item) => ({ id: item.id, kind: 'Product Review', icon: Star, label: item.data().productName || 'Product review', detail: `${item.data().rating || 0}/5 rating`, at: item.data().createdAt }))
        ].sort((a, b) => (toDate(b.at)?.getTime() || 0) - (toDate(a.at)?.getTime() || 0));
        setActivity(items);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  if (loading) return <div className="user-management-page"><div className="enterprise-state card">Loading user details...</div></div>;
  if (!user) return <div className="user-management-page"><div className="enterprise-state card"><h3>User not found</h3><button className="export-btn" onClick={() => navigate('/users')}>Back to Users</button></div></div>;

  return (
    <div className="user-management-page">
      <div className="page-header"><div><button className="back-btn" onClick={() => navigate('/users')}><ArrowLeft size={16} /> Back to Users</button><h1 className="page-title">{user.name || 'Unnamed User'}</h1><p className="page-subtitle">Customer profile and platform activity.</p></div></div>
      <div className="user-details-grid">
        <section className="user-profile-card card">
          <div className="user-avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
          <div><h2>{user.name || 'Unnamed User'}</h2><span className="module-badge">{user.segment || 'new'}</span></div>
          <div className="user-contact-list"><span><Mail size={16} /> {user.email || '-'}</span><span><Phone size={16} /> {user.phone || '-'}</span><span><MapPin size={16} /> {user.city || '-'}</span><span><Clock3 size={16} /> Joined {dateLabel(user.createdAt)}</span></div>
        </section>
        <section className="user-activity-card card">
          <h3 className="section-title">Activity</h3>
          {activity.length === 0 ? <div className="soft-empty">No linked order, booking, or review activity yet.</div> : <div className="activity-list">{activity.map((item) => { const Icon = item.icon; return <div className="activity-item" key={`${item.kind}-${item.id}`}><div className="activity-icon"><Icon size={17} /></div><div><strong>{item.label}</strong><span>{item.kind} · {item.detail}</span></div><small>{dateLabel(item.at)}</small></div>; })}</div>}
        </section>
      </div>
      <div className="enterprise-metrics">
        <div className="enterprise-metric"><span>Total Orders</span><strong>{Number(user.orders || 0)}</strong></div>
        <div className="enterprise-metric"><span>Lifetime Value</span><strong>Rs. {Number(user.lifetimeValue || 0).toLocaleString()}</strong></div>
        <div className="enterprise-metric"><span>Recorded Activity</span><strong>{activity.length}</strong></div>
        <div className="enterprise-metric"><span>Account Status</span><strong>{user.status || 'Active'}</strong></div>
      </div>
      <section className="card user-notes-card"><h3 className="section-title">Additional Details</h3><div className="policy-grid"><div><h4>Customer ID</h4><p>{user.id}</p></div><div><h4>Address</h4><p>{user.address || user.city || '-'}</p></div><div><h4>Last Activity</h4><p>{activity[0] ? dateLabel(activity[0].at) : '-'}</p></div><div><h4>Notes</h4><p>{user.notes || '-'}</p></div></div></section>
    </div>
  );
};

export default UserDetails;
