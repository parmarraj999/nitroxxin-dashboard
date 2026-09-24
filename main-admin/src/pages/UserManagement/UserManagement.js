import React, { useState, useEffect } from 'react';
import { Eye, Search, Users } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase.config';
import Pagination from '../../components/Common/Pagination';
import './UserManagement.css';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'customers')), (snapshot) => {
      setUsers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsubscribe;
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const visibleUsers = users.filter((user) => 
    `${user.name || ''} ${user.email || ''} ${user.phone || ''} ${user.city || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedUsers = visibleUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">View customer profiles, account activity, order history, and event participation.</p>
        </div>
      </div>

      <div className="enterprise-metrics">
        <div className="enterprise-metric"><span>Total Users</span><strong>{loading ? '...' : users.length}</strong></div>
        <div className="enterprise-metric"><span>Repeat Users</span><strong>{users.filter((user) => Number(user.orders || 0) > 1).length}</strong></div>
        <div className="enterprise-metric"><span>VIP Users</span><strong>{users.filter((user) => user.segment === 'vip').length}</strong></div>
        <div className="enterprise-metric"><span>Locations</span><strong>{new Set(users.map((user) => user.city).filter(Boolean)).size}</strong></div>
      </div>

      <div className="user-table-card card">
        <div className="user-table-toolbar">
          <div className="search-wrapper enterprise-search">
            <Search size={16} className="search-icon-small" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, or city..." />
          </div>
        </div>
        {loading ? <div className="enterprise-state">Loading users...</div> : visibleUsers.length === 0 ? (
          <div className="enterprise-state"><Users size={28} /><h3>No users found</h3><p>Customer profiles will appear here as they are added to the platform.</p></div>
        ) : (
          <>
            <div className="enterprise-table-wrap">
              <table className="enterprise-table user-table">
                <thead><tr><th>User</th><th>Contact</th><th>Location</th><th>Orders</th><th>Lifetime Value</th><th>Segment</th><th className="actions-col">Actions</th></tr></thead>
                <tbody>{paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name || 'Unnamed User'}</strong></td>
                    <td><div>{user.email || '-'}</div><small>{user.phone || '-'}</small></td>
                    <td>{user.city || '-'}</td>
                    <td>{Number(user.orders || 0)}</td>
                    <td>Rs. {Number(user.lifetimeValue || 0).toLocaleString()}</td>
                    <td><span className="module-badge">{user.segment || 'new'}</span></td>
                    <td className="actions-col"><button className="icon-btn" title="View user details" onClick={() => navigate(`/users/${user.id}`)}><Eye size={16} /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalItems={visibleUsers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
