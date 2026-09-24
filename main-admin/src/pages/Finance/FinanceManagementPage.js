import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'transactionId', label: 'Transaction ID', type: 'text', placeholder: 'TXN-2026-9901' },
  { key: 'entityName', label: 'Entity / Vendor / Customer', type: 'text', placeholder: 'Rynox Performance' },
  { key: 'type', label: 'Transaction Type', type: 'select', options: ['payout', 'order_revenue', 'refund', 'commission'] },
  { key: 'amount', label: 'Amount (₹)', type: 'number', placeholder: '45000' },
  { key: 'paymentGateway', label: 'Gateway', type: 'select', options: ['Razorpay', 'Cashfree', 'Bank Transfer', 'UPI'] },
  { key: 'status', label: 'Status', type: 'select', options: ['settled', 'processing', 'failed', 'hold'] }
];

const columns = ['transactionId', 'entityName', 'type', 'amount', 'paymentGateway', 'status'];

export default function FinanceManagementPage() {
  return (
    <ManagementPageLayout
      pageKey="finance"
      title="Finance & Settlements"
      subtitle="Monitor incoming customer payments, merchant commission margins, and vendor bank transfers."
      icon={CircleDollarSign}
      accent="#15803d"
      collectionName={COLLECTIONS.transactions || 'transactions'}
      primaryAction="Log Transaction"
      fields={fields}
      columns={columns}
      columnLabels={{
        transactionId: 'TXN ID',
        entityName: 'Account / Party',
        type: 'Type',
        amount: 'Amount (₹)',
        paymentGateway: 'Gateway',
        status: 'Status'
      }}
    />
  );
}
