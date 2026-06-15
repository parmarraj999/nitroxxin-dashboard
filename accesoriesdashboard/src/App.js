import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AccessoriesLayout from './components/AccessoriesLayout/AccessoriesLayout';
import AccessoriesDashboard from './pages/AccessoriesDashboard/AccessoriesDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<AccessoriesLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AccessoriesDashboard />} />
            
            {/* Placeholder routes for the new pages */}
            <Route path="products" element={<div style={{padding: '32px'}}>Product Management (WIP)</div>} />
            <Route path="products/add" element={<div style={{padding: '32px'}}>Add Product (WIP)</div>} />
            <Route path="products/details" element={<div style={{padding: '32px'}}>Product Details (WIP)</div>} />
            <Route path="orders" element={<div style={{padding: '32px'}}>Order Management (WIP)</div>} />
            <Route path="orders/details" element={<div style={{padding: '32px'}}>Order Details (WIP)</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
