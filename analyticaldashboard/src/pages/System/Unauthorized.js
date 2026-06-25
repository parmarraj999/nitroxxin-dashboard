import React from 'react';
import { Link } from 'react-router-dom';
import '../Auth/Auth.css';

const Unauthorized = () => (
  <div className="state-page">
    <div className="error-panel">
      <h1>Unauthorized</h1>
      <p>Your current role does not have access to this page.</p>
      <Link className="primary-btn" to="/dashboard">Go to dashboard</Link>
    </div>
  </div>
);

export default Unauthorized;
