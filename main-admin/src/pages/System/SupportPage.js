import React from 'react';
import { Headphones } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'ticketId', label: 'Ticket ID', type: 'text', placeholder: 'SUP-8821' },
  { key: 'subject', label: 'Inquiry Subject', type: 'text', placeholder: 'Order return pickup delayed' },
  { key: 'customer', label: 'Customer / Rider', type: 'text', placeholder: 'Vikram Joshi' },
  { key: 'priority', label: 'Priority', type: 'select', options: ['urgent', 'high', 'normal', 'low'] },
  { key: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'resolved', 'closed'] }
];

const columns = ['ticketId', 'subject', 'customer', 'priority', 'status'];

export default function SupportPage() {
  return (
    <ManagementPageLayout
      pageKey="support"
      title="Customer & Rider Support"
      subtitle="Handle rider inquiries, resolve dispatch disputes, and track SLA resolution metrics."
      icon={Headphones}
      accent="#0ea5e9"
      collectionName={COLLECTIONS.supportTickets}
      primaryAction="Open Support Ticket"
      fields={fields}
      columns={columns}
      columnLabels={{
        ticketId: 'Ticket ID',
        subject: 'Subject',
        customer: 'Customer',
        priority: 'Priority',
        status: 'Status'
      }}
    />
  );
}
