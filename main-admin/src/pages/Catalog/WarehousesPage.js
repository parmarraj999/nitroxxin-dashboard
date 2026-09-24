import React from 'react';
import { Warehouse } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'name', label: 'Warehouse Name', type: 'text', placeholder: 'Bhiwandi Central Fulfillment' },
  { key: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
  { key: 'state', label: 'State', type: 'text', placeholder: 'Maharashtra' },
  { key: 'pincode', label: 'Pincode', type: 'text', placeholder: '421302' },
  { key: 'contactPerson', label: 'Facility Manager', type: 'text', placeholder: 'Suresh Patil' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'maintenance', 'inactive'] }
];

const columns = ['name', 'city', 'state', 'pincode', 'contactPerson', 'status'];

export default function WarehousesPage() {
  return (
    <ManagementPageLayout
      pageKey="warehouses"
      title="Fulfillment Warehouses"
      subtitle="Configure physical fulfillment centers, regional hubs, and dispatch nodes."
      icon={Warehouse}
      accent="#475569"
      collectionName={COLLECTIONS.warehouses}
      primaryAction="Add Warehouse"
      fields={fields}
      columns={columns}
      columnLabels={{
        name: 'Facility Name',
        city: 'City',
        state: 'State',
        pincode: 'Pincode',
        contactPerson: 'Manager',
        status: 'Status'
      }}
    />
  );
}
