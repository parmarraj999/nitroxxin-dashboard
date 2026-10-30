import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { DashboardProvider, useDashboard } from './DashboardContext';
import { ProductsProvider, useProductsContext } from './ProductsContext';
import { OrdersProvider, useOrdersContext } from './OrdersContext';
import { VendorProfileProvider, useVendorProfile } from './VendorProfileContext';
import { AddProductProvider, useAddProductContext } from './AddProductContext';

export {
  AuthProvider,
  useAuth,
  DashboardProvider,
  useDashboard,
  ProductsProvider,
  useProductsContext,
  OrdersProvider,
  useOrdersContext,
  VendorProfileProvider,
  useVendorProfile,
  AddProductProvider,
  useAddProductContext
};

/**
 * Consolidated AppProviders component that wraps the entire dashboard tree
 * in all necessary caching contexts to eliminate redundant Firestore reads and writes.
 */
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <DashboardProvider>
        <ProductsProvider>
          <OrdersProvider>
            <VendorProfileProvider>
              <AddProductProvider>
                {children}
              </AddProductProvider>
            </VendorProfileProvider>
          </OrdersProvider>
        </ProductsProvider>
      </DashboardProvider>
    </AuthProvider>
  );
};

export default AppProviders;
