import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'name', label: 'Event Name', type: 'text', placeholder: 'Monsoon Ride 2026' },
  { key: 'vendorId', label: 'Vendor ID', type: 'text', placeholder: 'vendor-id' },
  { key: 'venue', label: 'Venue', type: 'text', placeholder: 'Lonavala' },
  { key: 'eventDate', label: 'Event Date', type: 'text', placeholder: '2026-08-15' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'cancelled'] }
];

const columns = ['name', 'vendorId', 'venue', 'eventDate', 'status'];

export default function VendorEventsPage() {
  const navigate = useNavigate();

  return (
    <ManagementPageLayout
      pageKey="vendorEvents"
      title="Vendor Events"
      subtitle="View, verify, and moderate riding events hosted by motorcycle clubs and vendor hosts."
      icon={ClipboardCheck}
      accent="#7c3aed"
      collectionName={COLLECTIONS.events}
      primaryAction="Add Vendor Event"
      fields={fields}
      columns={columns}
      onRowClick={(record) => navigate(`/events/${record.id}`)}
      onViewClick={(record) => navigate(`/events/${record.id}`)}
      columnLabels={{
        name: 'Event Name',
        vendorId: 'Host / Vendor ID',
        venue: 'Venue',
        eventDate: 'Date',
        status: 'Status'
      }}
    />
  );
}
