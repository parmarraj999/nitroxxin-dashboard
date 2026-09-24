import React from 'react';
import { Users } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'name', label: 'Participant Name', type: 'text', placeholder: 'Aarav Sharma' },
  { key: 'eventName', label: 'Event', type: 'text', placeholder: 'Monsoon Ride 2026' },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 98765 43210' },
  { key: 'checkInStatus', label: 'Check-in Status', type: 'select', options: ['registered', 'checked_in', 'no_show'] }
];

const columns = ['name', 'eventName', 'phone', 'checkInStatus'];

export default function EventParticipantsPage() {
  return (
    <ManagementPageLayout
      pageKey="eventParticipants"
      title="Event Participants"
      subtitle="Manage check-in, attendance verification, and participant emergency contacts."
      icon={Users}
      accent="#0891b2"
      collectionName={COLLECTIONS.eventParticipants}
      primaryAction="Add Participant"
      fields={fields}
      columns={columns}
      columnLabels={{
        name: 'Participant Name',
        eventName: 'Event',
        phone: 'Phone',
        checkInStatus: 'Check-in Status'
      }}
    />
  );
}
