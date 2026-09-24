import React from 'react';
import { Star } from 'lucide-react';
import { COLLECTIONS } from '../../schemas/firestoreSchema';
import ManagementPageLayout from '../../components/Common/ManagementPageLayout';

const fields = [
  { key: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Monsoon Ride 2026' },
  { key: 'customer', label: 'Participant Name', type: 'text', placeholder: 'Rohit Mehta' },
  { key: 'rating', label: 'Rating (1-5)', type: 'number', placeholder: '5' },
  { key: 'review', label: 'Review Feedback', type: 'textarea', placeholder: 'Great route and coordination.' },
  { key: 'status', label: 'Status', type: 'select', options: ['published', 'pending', 'hidden'] }
];

const columns = ['eventName', 'customer', 'rating', 'review', 'status'];

export default function EventReviewsPage() {
  return (
    <ManagementPageLayout
      pageKey="eventReviews"
      title="Event Reviews"
      subtitle="Moderate community reviews, star ratings, and feedback for events."
      icon={Star}
      accent="#ca8a04"
      collectionName={COLLECTIONS.eventReviews}
      primaryAction="Add Event Review"
      fields={fields}
      columns={columns}
      columnLabels={{
        eventName: 'Event',
        customer: 'Rider',
        rating: 'Rating',
        review: 'Review Content',
        status: 'Status'
      }}
    />
  );
}
