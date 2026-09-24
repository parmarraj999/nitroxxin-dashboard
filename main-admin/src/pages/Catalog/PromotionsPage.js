import React from 'react';
import { Megaphone } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'title', label: 'Campaign Title', type: 'text', placeholder: 'Monsoon Mega Sale' },
  { key: 'discount', label: 'Discount %', type: 'number', placeholder: '20' },
  { key: 'bannerUrl', label: 'Promo Banner URL', type: 'text', placeholder: 'https://...' },
  { key: 'validTill', label: 'Valid Until', type: 'text', placeholder: '2026-09-30' },
  { key: 'status', label: 'Status', type: 'select', options: ['active', 'scheduled', 'expired'] }
];

const columns = ['title', 'discount', 'bannerUrl', 'validTill', 'status'];

export default function PromotionsPage() {
  return (
    <ManagementPageLayout
      pageKey="promotions"
      title="Store Marketing & Promotions"
      subtitle="Launch promotional marketing banners, seasonal discount blitzes, and coupon campaigns."
      icon={Megaphone}
      accent="#f59e0b"
      collectionName={COLLECTIONS.coupons || 'promotions'}
      primaryAction="New Promotion"
      fields={fields}
      columns={columns}
      columnLabels={{
        title: 'Promotion Title',
        discount: 'Discount %',
        bannerUrl: 'Banner',
        validTill: 'Valid Until',
        status: 'Status'
      }}
    />
  );
}
