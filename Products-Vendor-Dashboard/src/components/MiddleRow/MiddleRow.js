import React from 'react';
import TopPerformingProducts from '../TopPerformingProducts/TopPerformingProducts';
import RecentOrdersTable from '../RecentOrdersTable/RecentOrdersTable';
import LowStockAlertTable from '../LowStockAlertTable/LowStockAlertTable';
import './MiddleRow.css';

const MiddleRow = ({ analytics }) => {
  return (
    <div className="middle-row-tables-stack">
      <TopPerformingProducts analytics={analytics} />
      <RecentOrdersTable analytics={analytics} />
      <LowStockAlertTable analytics={analytics} />
    </div>
  );
};

export default MiddleRow;
