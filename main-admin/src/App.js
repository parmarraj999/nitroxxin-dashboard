import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ProductManagement from './pages/ProductManagement/ProductManagement';
import AddProduct from './pages/AddProduct/AddProduct';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import EventDetails from './pages/EventDetails/EventDetails';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import OrderDetails from './pages/OrderDetails/OrderDetails';
import EnterpriseModule from './pages/EnterpriseModule/EnterpriseModule';
import UserManagement from './pages/UserManagement/UserManagement';
import UserDetails from './pages/UserManagement/UserDetails';
import VendorDetails from './pages/VendorDetails/VendorDetails';
import VendorServicePage from './pages/VendorDetails/VendorServicePage';
import { useAuthVendor } from './hooks/useAuthVendor';
import { DataProvider } from './context/DataContext';
import Hosts from './pages/Hosts/Hosts';
import HostDetails from './pages/Hosts/HostDetails';
import ForYouLayoutMedia from './pages/LayoutMedia/ForYouLayoutMedia';
import './App.css';

function App() {
  const { ensureSession } = useAuthVendor();

  React.useEffect(() => {
    ensureSession().catch(() => null);
  }, [ensureSession]);

  return (
    <DataProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:userId" element={<UserDetails />} />

              <Route path="products" element={<ProductManagement />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:productId" element={<AddProduct />} />
              <Route path="products/details/:productId" element={<ProductDetails />} />
              <Route path="products/details" element={<ProductDetails />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="orders/details/:orderId" element={<OrderDetails />} />
              <Route path="orders/details" element={<OrderDetails />} />
              <Route path="events" element={<EnterpriseModule moduleKey="events" />} />
              <Route path="events/:eventId" element={<EventDetails />} />
              <Route path="events/create" element={<EnterpriseModule moduleKey="events" createMode />} />
              <Route path="events/hosts" element={<Hosts />} />
              <Route path="events/hosts/:hostId" element={<HostDetails />} />
              <Route path="events/categories" element={<EnterpriseModule moduleKey="eventCategories" />} />
              <Route path="events/bookings" element={<EnterpriseModule moduleKey="eventBookings" />} />
              <Route path="events/participants" element={<EnterpriseModule moduleKey="eventParticipants" />} />
              <Route path="events/coupons" element={<EnterpriseModule moduleKey="eventCoupons" />} />
              <Route path="events/reviews" element={<EnterpriseModule moduleKey="eventReviews" />} />
              <Route path="events/analytics" element={<EnterpriseModule moduleKey="eventAnalytics" />} />
              <Route path="vendors" element={<EnterpriseModule moduleKey="vendors" />} />
              <Route path="vendors/:vendorId" element={<VendorDetails />} />
              <Route path="vendors/:vendorId/products" element={<VendorServicePage serviceKey="products" />} />
              <Route path="vendors/:vendorId/events" element={<VendorServicePage serviceKey="events" />} />
              <Route path="vendors/:vendorId/orders" element={<VendorServicePage serviceKey="orders" />} />
              <Route path="vendors/:vendorId/payouts" element={<VendorServicePage serviceKey="payouts" />} />
              <Route path="vendors/pending" element={<EnterpriseModule moduleKey="pendingVendors" />} />
              <Route path="vendors/products" element={<EnterpriseModule moduleKey="vendorProducts" />} />
              <Route path="vendors/events" element={<EnterpriseModule moduleKey="vendorEvents" />} />
              <Route path="vendors/payouts" element={<EnterpriseModule moduleKey="vendorPayouts" />} />
              <Route path="categories" element={<EnterpriseModule moduleKey="categories" />} />
              <Route path="brands" element={<EnterpriseModule moduleKey="brands" />} />
              <Route path="bike-brands" element={<EnterpriseModule moduleKey="bikeBrands" />} />
              <Route path="inventory" element={<EnterpriseModule moduleKey="inventory" />} />
              <Route path="pricing" element={<EnterpriseModule moduleKey="pricing" />} />
              <Route path="shipping" element={<EnterpriseModule moduleKey="shipping" />} />
              <Route path="customers" element={<EnterpriseModule moduleKey="customers" />} />
              <Route path="returns" element={<EnterpriseModule moduleKey="returns" />} />
              <Route path="reviews" element={<EnterpriseModule moduleKey="reviews" />} />
              <Route path="products/reviews" element={<EnterpriseModule moduleKey="productReviews" />} />
              <Route path="products/coupons" element={<EnterpriseModule moduleKey="productCoupons" />} />
              <Route path="products/analytics" element={<EnterpriseModule moduleKey="productAnalytics" />} />
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
              <Route path="foryou-layout-media" element={<ForYouLayoutMedia />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
