import React from 'react';
import { Star } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'productName', label: 'Item Name', type: 'text', placeholder: 'Axor Apex Helmet' },
  { key: 'customer', label: 'Reviewer Name', type: 'text', placeholder: 'Rohan Deshmukh' },
  { key: 'rating', label: 'Rating (1-5)', type: 'number', placeholder: '5' },
  { key: 'review', label: 'Review Feedback', type: 'textarea', placeholder: 'Excellent build quality and visor clarity.' },
  { key: 'status', label: 'Status', type: 'select', options: ['published', 'pending', 'hidden'] }
];

const columns = ['productName', 'customer', 'rating', 'review', 'status'];

export default function ReviewsPage() {
  return (
    <ManagementPageLayout
      pageKey="reviews"
      title="All Product Reviews"
      subtitle="Comprehensive moderation log of all feedback and user reviews across the platform."
      icon={Star}
      accent="#ca8a04"
      collectionName={COLLECTIONS.reviews}
      primaryAction="Add Review"
      fields={fields}
      columns={columns}
      columnLabels={{
        productName: 'Item',
        customer: 'Customer',
        rating: 'Rating',
        review: 'Review',
        status: 'Status'
      }}
    />
  );
}
