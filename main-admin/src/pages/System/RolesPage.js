import React from 'react';
import { Users } from 'lucide-react';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'roleName', label: 'Role Title', type: 'text', placeholder: 'Operations Manager' },
  { key: 'assignedUser', label: 'Staff Member / Email', type: 'text', placeholder: 'rahul.ops@nitroxxin.com' },
  { key: 'permissions', label: 'Access Level', type: 'select', options: ['Super Admin', 'Event Moderator', 'Catalog Manager', 'Finance Auditor', 'Support Agent'] },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'suspended', 'revoked'] }
];

const columns = ['roleName', 'assignedUser', 'permissions', 'status'];

export default function RolesPage() {
  return (
    <ManagementPageLayout
      pageKey="roles"
      title="Staff Roles & Access Permissions"
      subtitle="Define internal team roles, restrict sensitive routes, and audit admin access tokens."
      icon={Users}
      accent="#6366f1"
      collectionName="staff_roles"
      primaryAction="Assign Staff Role"
      fields={fields}
      columns={columns}
      columnLabels={{
        roleName: 'Role Title',
        assignedUser: 'Team Member',
        permissions: 'Access Scope',
        status: 'Status'
      }}
    />
  );
}
