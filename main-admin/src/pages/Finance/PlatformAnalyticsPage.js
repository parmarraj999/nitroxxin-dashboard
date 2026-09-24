import React from 'react';
import { BarChart3 } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'period', label: 'Period (YYYY-MM)', type: 'text', placeholder: '2026-08' },
  { key: 'totalRevenue', label: 'Gross Revenue (₹)', type: 'number', placeholder: '2450000' },
  { key: 'totalOrders', label: 'Product Orders', type: 'number', placeholder: '890' },
  { key: 'eventBookings', label: 'Event Bookings', type: 'number', placeholder: '340' },
  { key: 'activeUsers', label: 'Active Users', type: 'number', placeholder: '32000' }
];

const columns = ['period', 'totalRevenue', 'totalOrders', 'eventBookings', 'activeUsers'];

export default function PlatformAnalyticsPage() {
  return (
    <ManagementPageLayout
      pageKey="analytics"
      title="Platform Macro Analytics"
      subtitle="Overview of multi-vertical commerce performance, event participation, and user growth."
      icon={BarChart3}
      accent="#16a34a"
      collectionName={COLLECTIONS.analytics}
      primaryAction="Log Monthly Snapshot"
      fields={fields}
      columns={columns}
      columnLabels={{
        period: 'Period',
        totalRevenue: 'Gross Revenue (₹)',
        totalOrders: 'Orders',
        eventBookings: 'Event Bookings',
        activeUsers: 'Active Users'
      }}
    />
  );
}
