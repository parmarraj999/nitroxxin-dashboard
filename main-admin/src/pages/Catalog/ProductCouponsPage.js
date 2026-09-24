import React from 'react';
import { Megaphone } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'code', label: 'Coupon Code', type: 'text', placeholder: 'RIDEFAST15' },
  { key: 'discount', label: 'Discount Value', type: 'number', placeholder: '15' },
  { key: 'discountType', label: 'Discount Type', type: 'select', options: ['percent', 'fixed'] },
  { key: 'expiresAt', label: 'Expires Date', type: 'text', placeholder: '2026-08-31' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'scheduled', 'expired'] }
];

const columns = ['code', 'discount', 'discountType', 'expiresAt', 'status'];

export default function ProductCouponsPage() {
  return (
    <ManagementPageLayout
      pageKey="productCoupons"
      title="Store Coupons & Promos"
      subtitle="Create promo codes and percentage discounts applicable exclusively to store products."
      icon={Megaphone}
      accent="#ea580c"
      collectionName={COLLECTIONS.coupons}
      defaults={{ couponScope: 'product' }}
      filters={[['couponScope', '==', 'product']]}
      primaryAction="Add Store Coupon"
      fields={fields}
      columns={columns}
      columnLabels={{
        code: 'Coupon Code',
        discount: 'Discount',
        discountType: 'Type',
        expiresAt: 'Expires',
        status: 'Status'
      }}
    />
  );
}
