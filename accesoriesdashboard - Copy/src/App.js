import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AccessoriesLayout from './components/AccessoriesLayout/AccessoriesLayout';
import AccessoriesDashboard from './pages/AccessoriesDashboard/AccessoriesDashboard';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import AddProduct from './pages/AddProduct/AddProduct';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import OrderDetails from './pages/OrderDetails/OrderDetails';
import EnterpriseModule from './pages/EnterpriseModule/EnterpriseModule';
import { useAuthVendor } from './hooks/useAuthVendor';
import './App.css';

function App() {
  const { ensureSession } = useAuthVendor();

  React.useEffect(() => {
    ensureSession().catch(() => null);
  }, [ensureSession]);

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<AccessoriesLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AccessoriesDashboard />} />

            <Route path="products" element={<ProductManagement />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:productId" element={<AddProduct />} />
            <Route path="products/details/:productId" element={<ProductDetails />} />
            <Route path="products/details" element={<ProductDetails />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="orders/details/:orderId" element={<OrderDetails />} />
            <Route path="orders/details" element={<OrderDetails />} />
            <Route path="vendors" element={<EnterpriseModule moduleKey="vendors" />} />
            <Route path="categories" element={<EnterpriseModule moduleKey="categories" />} />
            <Route path="brands" element={<EnterpriseModule moduleKey="brands" />} />
            <Route path="inventory" element={<EnterpriseModule moduleKey="inventory" />} />
            <Route path="pricing" element={<EnterpriseModule moduleKey="pricing" />} />
            <Route path="shipping" element={<EnterpriseModule moduleKey="shipping" />} />
            <Route path="customers" element={<EnterpriseModule moduleKey="customers" />} />
            <Route path="returns" element={<EnterpriseModule moduleKey="returns" />} />
            <Route path="reviews" element={<EnterpriseModule moduleKey="reviews" />} />
            <Route path="promotions" element={<EnterpriseModule moduleKey="promotions" />} />
            <Route path="analytics" element={<EnterpriseModule moduleKey="analytics" />} />
            <Route path="reports" element={<EnterpriseModule moduleKey="reports" />} />
            <Route path="finance" element={<EnterpriseModule moduleKey="finance" />} />
            <Route path="notifications" element={<EnterpriseModule moduleKey="notifications" />} />
            <Route path="roles" element={<EnterpriseModule moduleKey="roles" />} />
            <Route path="support" element={<EnterpriseModule moduleKey="support" />} />
            <Route path="warehouses" element={<EnterpriseModule moduleKey="warehouses" />} />
            <Route path="compatibility" element={<EnterpriseModule moduleKey="compatibility" />} />
            <Route path="settings" element={<EnterpriseModule moduleKey="settings" />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
