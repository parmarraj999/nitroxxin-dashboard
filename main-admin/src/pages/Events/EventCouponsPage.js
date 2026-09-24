import React from 'react';
import { Megaphone } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'code', label: 'Coupon Code', type: 'text', placeholder: 'RIDE2026' },
  { key: 'discount', label: 'Discount Amount', type: 'number', placeholder: '15' },
  { key: 'discountType', label: 'Discount Type', type: 'select', options: ['percent', 'fixed'] },
  { key: 'expiresAt', label: 'Expiry Date', type: 'text', placeholder: '2026-08-15' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'scheduled', 'expired'] }
];

const columns = ['code', 'discount', 'discountType', 'expiresAt', 'status'];

export default function EventCouponsPage() {
  return (
    <ManagementPageLayout
      pageKey="eventCoupons"
      title="Event Coupons"
      subtitle="Create and distribute promo discount codes exclusively for event registrations."
      icon={Megaphone}
      accent="#ea580c"
      collectionName={COLLECTIONS.eventCoupons}
      primaryAction="Add Event Coupon"
      defaults={{ couponScope: 'event' }}
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
