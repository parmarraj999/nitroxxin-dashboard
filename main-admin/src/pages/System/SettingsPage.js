import React from 'react';
import { Settings } from 'lucide-react';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'key', label: 'Configuration Parameter', type: 'text', placeholder: 'MARKETPLACE_COMMISSION_DEFAULT' },
  { key: 'value', label: 'Value', type: 'text', placeholder: '12' },
  { key: 'category', label: 'Category', type: 'select', options: ['general', 'payment', 'notifications', 'logistics', 'security'] },
  { key: 'description', label: 'Explanation', type: 'textarea', placeholder: 'Default platform commission on standard accessory categories.' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'disabled'] }
];

const columns = ['key', 'value', 'category', 'description', 'status'];

export default function SettingsPage() {
  return (
    <ManagementPageLayout
      pageKey="settings"
      title="Platform System Settings"
      subtitle="Global platform toggles, payment gateway webhooks, SMS APIs, and maintenance modes."
      icon={Settings}
      accent="#475569"
      collectionName="system_settings"
      primaryAction="Add Setting Variable"
      fields={fields}
      columns={columns}
      columnLabels={{
        key: 'Config Key',
        value: 'Value',
        category: 'Category',
        description: 'Description',
        status: 'Status'
      }}
    />
  );
}
