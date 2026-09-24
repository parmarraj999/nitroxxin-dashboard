import React from 'react';
import { Star } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'productName', label: 'Product Name', type: 'text', placeholder: 'LS2 FF800 Storm' },
  { key: 'customer', label: 'Customer Name', type: 'text', placeholder: 'Rohit Mehta' },
  { key: 'rating', label: 'Rating (1-5)', type: 'number', placeholder: '5' },
  { key: 'review', label: 'Customer Review', type: 'textarea', placeholder: 'Excellent fit and ventilation.' },
  { key: 'status', label: 'Status', type: 'select', options: ['published', 'pending', 'hidden'] }
];

const columns = ['productName', 'customer', 'rating', 'review', 'status'];

export default function ProductReviewsPage() {
  return (
    <ManagementPageLayout
      pageKey="productReviews"
      title="Product Reviews"
      subtitle="Moderate gear reviews, verified buyer comments, and product feedback ratings."
      icon={Star}
      accent="#ca8a04"
      collectionName={COLLECTIONS.reviews}
      defaults={{ reviewScope: 'product' }}
      filters={[['reviewScope', '==', 'product']]}
      primaryAction="Add Product Review"
      fields={fields}
      columns={columns}
      columnLabels={{
        productName: 'Product',
        customer: 'Customer',
        rating: 'Rating',
        review: 'Review Content',
        status: 'Status'
      }}
    />
  );
}
