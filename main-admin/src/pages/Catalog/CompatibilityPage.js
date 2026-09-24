import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'partSku', label: 'Accessory / Part SKU', type: 'text', placeholder: 'CRASH-KTM-390' },
  { key: 'partName', label: 'Accessory Name', type: 'text', placeholder: 'Hyperrider Crash Guard' },
  { key: 'compatibleBikes', label: 'Compatible Bike Models', type: 'text', placeholder: 'KTM Duke 390 (2020-2024), RC 390' },
  { key: 'fittingType', label: 'Mounting Type', type: 'select', options: ['direct_fit', 'bracket_required', 'universal'] },
  { key: 'status', label: 'Verification Status', type: 'select', options: ['verified', 'unverified', 'discontinued'] }
];

const columns = ['partSku', 'partName', 'compatibleBikes', 'fittingType', 'status'];

export default function CompatibilityPage() {
  return (
    <ManagementPageLayout
      pageKey="compatibility"
      title="Bike Part Compatibility"
      subtitle="Map accessory SKUs and parts directly to compatible motorcycle makes, models, and year ranges."
      icon={ShieldCheck}
      accent="#0d9488"
      collectionName={COLLECTIONS.bikeCompatibility}
      primaryAction="Add Compatibility Rule"
      fields={fields}
      columns={columns}
      columnLabels={{
        partSku: 'Part SKU',
        partName: 'Part Name',
        compatibleBikes: 'Compatible Motorcycles',
        fittingType: 'Fitment',
        status: 'Status'
      }}
    />
  );
}
