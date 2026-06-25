import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import '../AppLayout/AppLayout.css';

const AppLayout = ({ children, searchPlaceholder, showQuickCreate = true }) => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Header searchPlaceholder={searchPlaceholder} showQuickCreate={showQuickCreate} />
      {children}
    </div>
  </div>
);

export default AppLayout;
