import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'planName', label: 'Pricing Rule Name', type: 'text', placeholder: 'Standard 12% Marketplace Commission' },
  { key: 'scope', label: 'Category / Scope', type: 'text', placeholder: 'Helmets & Riding Gear' },
  { key: 'commissionRate', label: 'Commission Rate %', type: 'number', placeholder: '12' },
  { key: 'fixedFee', label: 'Fixed Fee Per Order (₹)', type: 'number', placeholder: '15' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
];

const columns = ['planName', 'scope', 'commissionRate', 'fixedFee', 'status'];

export default function PricingManagementPage() {
  return (
    <ManagementPageLayout
      pageKey="pricing"
      title="Pricing & Fee Rules"
      subtitle="Configure category commission percentages, payment gateway fees, and seller margins."
      icon={CircleDollarSign}
      accent="#059669"
      collectionName={COLLECTIONS.pricing || 'pricing_rules'}
      primaryAction="Add Pricing Rule"
      fields={fields}
      columns={columns}
      columnLabels={{
        planName: 'Rule Name',
        scope: 'Category Scope',
        commissionRate: 'Commission %',
        fixedFee: 'Fixed Fee (₹)',
        status: 'Status'
      }}
    />
  );
}
