import React from 'react';
import { Inbox } from 'lucide-react';
import './States.css';

const EmptyState = ({ title = 'Nothing here yet', message, action }) => (
  <div className="empty-state">
    <Inbox size={32} />
    <h3>{title}</h3>
    {message && <p>{message}</p>}
    {action}
  </div>
);

export default EmptyState;
