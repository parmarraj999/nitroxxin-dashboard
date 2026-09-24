import React from 'react';
import { Package } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'title', label: 'Product Name', type: 'text', placeholder: 'Axor Apex Helmet' },
  { key: 'vendorId', label: 'Vendor ID', type: 'text', placeholder: 'vendor-id' },
  { key: 'sku', label: 'SKU', type: 'text', placeholder: 'AXR-APX-001' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] }
];

const columns = ['title', 'vendorId', 'sku', 'status'];

export default function VendorProductsPage() {
  return (
    <ManagementPageLayout
      pageKey="vendorProducts"
      title="Vendor Products"
      subtitle="View, audit, and regulate product listings submitted by third-party marketplace vendors."
      icon={Package}
      accent="#7c3aed"
      collectionName={COLLECTIONS.products}
      primaryAction="Add Vendor Product"
      fields={fields}
      columns={columns}
      columnLabels={{
        title: 'Product Title',
        vendorId: 'Vendor ID',
        sku: 'SKU',
        status: 'Status'
      }}
    />
  );
}
