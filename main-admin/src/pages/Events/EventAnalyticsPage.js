import React from 'react';
import { BarChart3 } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'period', label: 'Period (YYYY-MM)', type: 'text', placeholder: '2026-08' },
  { key: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Monsoon Ride 2026' },
  { key: 'bookings', label: 'Total Bookings', type: 'number', placeholder: '120' },
  { key: 'attendance', label: 'Riders Attended', type: 'number', placeholder: '110' },
  { key: 'revenue', label: 'Total Revenue (₹)', type: 'number', placeholder: '119880' }
];

const columns = ['period', 'eventName', 'bookings', 'attendance', 'revenue'];

export default function EventAnalyticsPage() {
  return (
    <ManagementPageLayout
      pageKey="eventAnalytics"
      title="Event Analytics"
      subtitle="Track registrations, ticket sales performance, and event revenue trends."
      icon={BarChart3}
      accent="#16a34a"
      collectionName={COLLECTIONS.eventAnalytics}
      primaryAction="Add Snapshot"
      fields={fields}
      columns={columns}
      columnLabels={{
        period: 'Period',
        eventName: 'Event',
        bookings: 'Bookings',
        attendance: 'Attendance',
        revenue: 'Revenue (₹)'
      }}
    />
  );
}
