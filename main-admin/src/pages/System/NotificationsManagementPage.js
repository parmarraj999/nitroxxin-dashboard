import React from 'react';
import { Bell } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'title', label: 'Notification Title', type: 'text', placeholder: 'Weekend Ride Alert: Lonavala Route Open' },
  { key: 'targetAudience', label: 'Audience Segment', type: 'select', options: ['all_users', 'riders_only', 'vendors_only', 'hosts_only'] },
  { key: 'channel', label: 'Delivery Channel', type: 'select', options: ['push_notification', 'in_app', 'sms', 'email'] },
  { key: 'message', label: 'Message Body', type: 'textarea', placeholder: 'Registration for the Monsoon Ride 2026 is now open.' },
  { key: 'status', label: 'Dispatch Status', type: 'select', options: ['sent', 'scheduled', 'draft'] }
];

const columns = ['title', 'targetAudience', 'channel', 'status'];

export default function NotificationsManagementPage() {
  return (
    <ManagementPageLayout
      pageKey="notifications"
      title="Broadcast Notifications"
      subtitle="Send push announcements, targeted SMS alerts, and marketing broadcasts to app users."
      icon={Bell}
      accent="#f59e0b"
      collectionName={COLLECTIONS.notifications}
      primaryAction="Send Broadcast"
      fields={fields}
      columns={columns}
      columnLabels={{
        title: 'Title',
        targetAudience: 'Target Audience',
        channel: 'Channel',
        status: 'Status'
      }}
    />
  );
}
