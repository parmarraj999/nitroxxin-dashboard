import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AccessoriesLayout from './components/AccessoriesLayout/AccessoriesLayout';
import AccessoriesDashboard from './pages/AccessoriesDashboard/AccessoriesDashboard';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import AddProduct from './pages/AddProduct/AddProduct';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import OrderDetails from './pages/OrderDetails/OrderDetails';
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
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/details" element={<ProductDetails />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/details" element={<OrderDetails />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
