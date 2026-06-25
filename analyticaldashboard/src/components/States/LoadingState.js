import React from 'react';
import './States.css';

const LoadingState = ({ label = 'Loading', fullPage = false }) => (
  <div className={fullPage ? 'state-page' : 'state-inline'} role="status" aria-live="polite">
    <div className="spinner" />
    <span>{label}</span>
  </div>
);

export default LoadingState;
