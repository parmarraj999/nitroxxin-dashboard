import React from 'react';
import { Truck } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'name', label: 'Template Name', type: 'text', placeholder: 'Express Air (All India)' },
  { key: 'carrier', label: 'Logistics Partner', type: 'text', placeholder: 'BlueDart / Delhivery' },
  { key: 'baseRate', label: 'Base Rate (₹)', type: 'number', placeholder: '99' },
  { key: 'freeShippingThreshold', label: 'Free Shipping Above (₹)', type: 'number', placeholder: '1999' },
  { key: 'estimatedDays', label: 'Estimated Transit (Days)', type: 'text', placeholder: '2-3 Business Days' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] }
];

const columns = ['name', 'carrier', 'baseRate', 'freeShippingThreshold', 'estimatedDays', 'status'];

export default function ShippingManagementPage() {
  return (
    <ManagementPageLayout
      pageKey="shipping"
      title="Shipping & Logistics Templates"
      subtitle="Define delivery partners, courier rate slabs, zones, and free shipping thresholds."
      icon={Truck}
      accent="#3b82f6"
      collectionName={COLLECTIONS.shippingTemplates}
      primaryAction="Add Shipping Template"
      fields={fields}
      columns={columns}
      columnLabels={{
        name: 'Template Name',
        carrier: 'Courier',
        baseRate: 'Base Rate (₹)',
        freeShippingThreshold: 'Free Above (₹)',
        estimatedDays: 'Transit Time',
        status: 'Status'
      }}
    />
  );
}
