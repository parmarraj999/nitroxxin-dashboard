import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AccessoriesLayout from './components/AccessoriesLayout/AccessoriesLayout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Login from './pages/Login/Login';
import AccessoriesDashboard from './pages/AccessoriesDashboard/AccessoriesDashboard';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import AddProduct from './pages/AddProduct/AddProduct';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import OrderDetails from './pages/OrderDetails/OrderDetails';
import VendorProfile from './pages/VendorProfile/VendorProfile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — all wrapped in PrivateRoute */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AccessoriesLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AccessoriesDashboard />} />

            {/* Vendor product & order routes */}
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:productId" element={<AddProduct />} />
            <Route path="products/details/:productId" element={<ProductDetails />} />
            <Route path="products/details" element={<ProductDetails />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/details/:orderId" element={<OrderDetails />} />
            <Route path="orders/details" element={<OrderDetails />} />

            {/* Profile page */}
            <Route path="profile" element={<VendorProfile />} />

            {/* Sidebar links not yet built — redirect to dashboard */}
            <Route path="inventory" element={<Navigate to="/dashboard" replace />} />
            <Route path="pricing" element={<Navigate to="/dashboard" replace />} />
            <Route path="shipping" element={<Navigate to="/dashboard" replace />} />
            <Route path="analytics" element={<Navigate to="/dashboard" replace />} />
            <Route path="settings" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
