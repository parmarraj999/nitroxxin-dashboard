import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Karan Mehra' },
  { key: 'email', label: 'Email Address', type: 'text', placeholder: 'karan@example.com' },
  { key: 'phone', label: 'Mobile Number', type: 'text', placeholder: '+91 98765 43210' },
  { key: 'city', label: 'City', type: 'text', placeholder: 'Bangalore' },
  { key: 'segment', label: 'Customer Segment', type: 'select', options: ['regular', 'vip', 'wholesale', 'new'] },
  { key: 'status', label: 'Account Status', type: 'select', options: ['active', 'inactive', 'suspended'] }
];

const columns = ['name', 'email', 'phone', 'city', 'segment', 'status'];

export default function CustomersManagementPage() {
  const navigate = useNavigate();

  return (
    <ManagementPageLayout
      pageKey="customers"
      title="Customer Accounts"
      subtitle="View, segment, manage rider profiles, order counts, and loyalty history."
      icon={Users}
      accent="#6366f1"
      collectionName="customers"
      primaryAction="Add Customer"
      fields={fields}
      columns={columns}
      onRowClick={(record) => navigate(`/users/${record.id}`)}
      onViewClick={(record) => navigate(`/users/${record.id}`)}
      columnLabels={{
        name: 'Customer Name',
        email: 'Email',
        phone: 'Phone',
        city: 'City',
        segment: 'Segment',
        status: 'Status'
      }}
    />
  );
}
