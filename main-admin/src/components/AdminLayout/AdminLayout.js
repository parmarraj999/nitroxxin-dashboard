import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
