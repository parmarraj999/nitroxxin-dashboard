import React from 'react';
import { RotateCcw } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'returnId', label: 'Return ID', type: 'text', placeholder: 'RET-2026-001' },
  { key: 'orderId', label: 'Order ID', type: 'text', placeholder: 'ORD-9021' },
  { key: 'customer', label: 'Customer Name', type: 'text', placeholder: 'Pooja Verma' },
  { key: 'reason', label: 'Reason for Return', type: 'text', placeholder: 'Size M too tight, exchanged for L' },
  { key: 'refundAmount', label: 'Refund Amount (₹)', type: 'number', placeholder: '4299' },
  { key: 'status', label: 'Return Status', type: 'select', options: ['requested', 'inspected', 'refunded', 'rejected'] }
];

const columns = ['returnId', 'orderId', 'customer', 'reason', 'refundAmount', 'status'];

export default function ReturnsManagementPage() {
  return (
    <ManagementPageLayout
      pageKey="returns"
      title="Returns & Replacements"
      subtitle="Process customer return requests, warehouse inspection outcomes, and reverse logistics."
      icon={RotateCcw}
      accent="#dc2626"
      collectionName={COLLECTIONS.returnPolicies || 'returns'}
      primaryAction="Log Return"
      fields={fields}
      columns={columns}
      columnLabels={{
        returnId: 'Return ID',
        orderId: 'Order ID',
        customer: 'Customer',
        reason: 'Reason',
        refundAmount: 'Refund (₹)',
        status: 'Status'
      }}
    />
  );
}
