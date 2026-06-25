import React from 'react';
import { Link } from 'react-router-dom';
import '../Auth/Auth.css';

const NotFound = () => (
  <div className="state-page">
    <div className="error-panel">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link className="primary-btn" to="/dashboard">Go to dashboard</Link>
    </div>
  </div>
);

export default NotFound;
