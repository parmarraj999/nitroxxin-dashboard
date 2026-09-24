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
import UserManagement from './pages/UserManagement/UserManagement';
import UserDetails from './pages/UserManagement/UserDetails';
import VendorDetails from './pages/VendorDetails/VendorDetails';
import VendorServicePage from './pages/VendorDetails/VendorServicePage';
import Hosts from './pages/Hosts/Hosts';
import HostDetails from './pages/Hosts/HostDetails';
import ForYouLayoutMedia from './pages/LayoutMedia/ForYouLayoutMedia';
import EventsLayoutMedia from './pages/LayoutMedia/EventsLayoutMedia';
import AccessoriesLayoutMedia from './pages/LayoutMedia/AccessoriesLayoutMedia';

// Event Management Dedicated Pages
import EventsManagement from './pages/Events/EventsManagement';
import CreateEventPage from './pages/Events/CreateEventPage';
import EventCategoriesPage from './pages/Events/EventCategoriesPage';
import EventBookingsPage from './pages/Events/EventBookingsPage';
import EventParticipantsPage from './pages/Events/EventParticipantsPage';
import EventCouponsPage from './pages/Events/EventCouponsPage';
import EventReviewsPage from './pages/Events/EventReviewsPage';
import EventAnalyticsPage from './pages/Events/EventAnalyticsPage';

// Vendor Management Dedicated Pages
import VendorListPage from './pages/Vendors/VendorListPage';
import PendingVendorsPage from './pages/Vendors/PendingVendorsPage';
import VendorProductsPage from './pages/Vendors/VendorProductsPage';
import VendorEventsPage from './pages/Vendors/VendorEventsPage';
import VendorPayoutsPage from './pages/Vendors/VendorPayoutsPage';

// Store & Catalog Dedicated Pages
import ProductCategoriesPage from './pages/Catalog/ProductCategoriesPage';
import AccessoryBrandsPage from './pages/Catalog/AccessoryBrandsPage';
import BikeBrandsPage from './pages/Catalog/BikeBrandsPage';
import InventoryManagementPage from './pages/Catalog/InventoryManagementPage';
import ReturnsManagementPage from './pages/Catalog/ReturnsManagementPage';
import ProductCouponsPage from './pages/Catalog/ProductCouponsPage';
import ProductReviewsPage from './pages/Catalog/ProductReviewsPage';
import ProductAnalyticsPage from './pages/Catalog/ProductAnalyticsPage';
import PricingManagementPage from './pages/Catalog/PricingManagementPage';
import ShippingManagementPage from './pages/Catalog/ShippingManagementPage';
import CustomersManagementPage from './pages/Catalog/CustomersManagementPage';
import WarehousesPage from './pages/Catalog/WarehousesPage';
import CompatibilityPage from './pages/Catalog/CompatibilityPage';
import PromotionsPage from './pages/Catalog/PromotionsPage';
import ReviewsPage from './pages/Catalog/ReviewsPage';

// Finance & Analytics Dedicated Pages
import FinanceManagementPage from './pages/Finance/FinanceManagementPage';
import ReportsManagementPage from './pages/Finance/ReportsManagementPage';
import PlatformAnalyticsPage from './pages/Finance/PlatformAnalyticsPage';

// System Dedicated Pages
import NotificationsManagementPage from './pages/System/NotificationsManagementPage';
import RolesPage from './pages/System/RolesPage';
import SupportPage from './pages/System/SupportPage';
import SettingsPage from './pages/System/SettingsPage';

import { useAuthVendor } from './hooks/useAuthVendor';
import { DataProvider } from './context/DataContext';
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

              {/* Event Management Routes */}
              <Route path="events" element={<EventsManagement />} />
              <Route path="events/:eventId" element={<EventDetails />} />
              <Route path="events/create" element={<CreateEventPage />} />
              <Route path="events/hosts" element={<Hosts />} />
              <Route path="events/hosts/:hostId" element={<HostDetails />} />
              <Route path="events/categories" element={<EventCategoriesPage />} />
              <Route path="events/bookings" element={<EventBookingsPage />} />
              <Route path="events/participants" element={<EventParticipantsPage />} />
              <Route path="events/coupons" element={<EventCouponsPage />} />
              <Route path="events/reviews" element={<EventReviewsPage />} />
              <Route path="events/analytics" element={<EventAnalyticsPage />} />

              {/* Vendor Management Routes */}
              <Route path="vendors" element={<VendorListPage />} />
              <Route path="vendors/:vendorId" element={<VendorDetails />} />
              <Route path="vendors/:vendorId/products" element={<VendorServicePage serviceKey="products" />} />
              <Route path="vendors/:vendorId/events" element={<VendorServicePage serviceKey="events" />} />
              <Route path="vendors/:vendorId/orders" element={<VendorServicePage serviceKey="orders" />} />
              <Route path="vendors/:vendorId/payouts" element={<VendorServicePage serviceKey="payouts" />} />
              <Route path="vendors/pending" element={<PendingVendorsPage />} />
              <Route path="vendors/products" element={<VendorProductsPage />} />
              <Route path="vendors/events" element={<VendorEventsPage />} />
              <Route path="vendors/payouts" element={<VendorPayoutsPage />} />

              {/* Store & Catalog Management Routes */}
              <Route path="categories" element={<ProductCategoriesPage />} />
              <Route path="brands" element={<AccessoryBrandsPage />} />
              <Route path="bike-brands" element={<BikeBrandsPage />} />
              <Route path="inventory" element={<InventoryManagementPage />} />
              <Route path="pricing" element={<PricingManagementPage />} />
              <Route path="shipping" element={<ShippingManagementPage />} />
              <Route path="customers" element={<CustomersManagementPage />} />
              <Route path="returns" element={<ReturnsManagementPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="products/reviews" element={<ProductReviewsPage />} />
              <Route path="products/coupons" element={<ProductCouponsPage />} />
              <Route path="products/analytics" element={<ProductAnalyticsPage />} />
              <Route path="promotions" element={<PromotionsPage />} />
              <Route path="warehouses" element={<WarehousesPage />} />
              <Route path="compatibility" element={<CompatibilityPage />} />

              {/* Finance & Analytics Routes */}
              <Route path="analytics" element={<PlatformAnalyticsPage />} />
              <Route path="reports" element={<ReportsManagementPage />} />
              <Route path="finance" element={<FinanceManagementPage />} />

              {/* System Administration Routes */}
              <Route path="notifications" element={<NotificationsManagementPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Web & App Control Layout Routes */}
              <Route path="foryou-layout-media" element={<ForYouLayoutMedia />} />
              <Route path="events-layout-media" element={<EventsLayoutMedia />} />
              <Route path="events/layout" element={<EventsLayoutMedia />} />
              <Route path="accessories-layout-media" element={<AccessoriesLayoutMedia />} />
              <Route path="accessories/layout" element={<AccessoriesLayoutMedia />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </DataProvider>
  );
}

export default App;
