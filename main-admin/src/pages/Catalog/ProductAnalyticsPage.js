import React from 'react';
import { BarChart3 } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'period', label: 'Period (YYYY-MM)', type: 'text', placeholder: '2026-08' },
  { key: 'revenue', label: 'Revenue (₹)', type: 'number', placeholder: '1250000' },
  { key: 'orders', label: 'Total Orders', type: 'number', placeholder: '420' },
  { key: 'visitors', label: 'Unique Visitors', type: 'number', placeholder: '18000' },
  { key: 'conversionRate', label: 'Conversion Rate %', type: 'number', placeholder: '2.8' }
];

const columns = ['period', 'revenue', 'orders', 'visitors', 'conversionRate'];

export default function ProductAnalyticsPage() {
  return (
    <ManagementPageLayout
      pageKey="productAnalytics"
      title="Store Product Analytics"
      subtitle="Measure accessory store performance, GMV, orders volume, and sales conversion rates."
      icon={BarChart3}
      accent="#16a34a"
      collectionName={COLLECTIONS.analytics}
      defaults={{ analyticsScope: 'product' }}
      filters={[['analyticsScope', '==', 'product']]}
      primaryAction="Add Store Snapshot"
      fields={fields}
      columns={columns}
      columnLabels={{
        period: 'Period',
        revenue: 'Revenue (₹)',
        orders: 'Orders',
        visitors: 'Visitors',
        conversionRate: 'Conversion %'
      }}
    />
  );
}
