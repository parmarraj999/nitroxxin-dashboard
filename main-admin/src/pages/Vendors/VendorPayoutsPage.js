import React from 'react';
import { BadgeIndianRupee } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'payoutId', label: 'Payout ID', type: 'text', placeholder: 'PAY-2026-001' },
  { key: 'vendorName', label: 'Vendor Name', type: 'text', placeholder: 'Rynox Performance' },
  { key: 'amount', label: 'Payout Amount (₹)', type: 'number', placeholder: '175000' },
  { key: 'period', label: 'Settlement Period', type: 'text', placeholder: 'July 2026' },
  { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'processing', 'paid', 'hold'] }
];

const columns = ['payoutId', 'vendorName', 'amount', 'period', 'status'];

export default function VendorPayoutsPage() {
  return (
    <ManagementPageLayout
      pageKey="vendorPayouts"
      title="Vendor Payouts"
      subtitle="Schedule, verify commissions, and audit automated settlements to partner vendors."
      icon={BadgeIndianRupee}
      accent="#15803d"
      collectionName={COLLECTIONS.vendorPayouts}
      primaryAction="Add Payout"
      fields={fields}
      columns={columns}
      columnLabels={{
        payoutId: 'Payout ID',
        vendorName: 'Vendor',
        amount: 'Amount (₹)',
        period: 'Period',
        status: 'Status'
      }}
    />
  );
}
