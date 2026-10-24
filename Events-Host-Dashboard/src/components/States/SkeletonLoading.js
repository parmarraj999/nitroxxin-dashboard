import React from 'react';
import './SkeletonLoading.css';

/**
 * Basic Shimmer Box
 */
export const SkeletonBox = ({ width = '100%', height = '16px', borderRadius = '6px', style = {}, className = '' }) => (
  <div
    className={`skeleton-shimmer ${className}`}
    style={{
      width,
      height,
      borderRadius,
      ...style,
    }}
  />
);

/**
 * Text Line Skeleton
 */
export const SkeletonText = ({ lines = 1, width = '100%', height = '12px', gap = '6px', className = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }} className={className}>
    {Array.from({ length: lines }).map((_, idx) => (
      <SkeletonBox
        key={idx}
        width={typeof width === 'string' ? width : `${width[idx % width.length]}%`}
        height={height}
      />
    ))}
  </div>
);

/**
 * Circular Avatar / Icon Skeleton
 */
export const SkeletonCircle = ({ size = 36, className = '', style = {} }) => (
  <div
    className={`skeleton-shimmer skeleton-circle ${className}`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      ...style,
    }}
  />
);

/**
 * Badge / Pill Skeleton
 */
export const SkeletonPill = ({ width = '70px', height = '22px', className = '', style = {} }) => (
  <div
    className={`skeleton-shimmer skeleton-pill ${className}`}
    style={{
      width,
      height,
      ...style,
    }}
  />
);

/**
 * Participant Table Rows Skeleton (Can be placed directly inside <tbody>)
 */
export const ParticipantTableSkeleton = ({ rows = 8 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={`p-skel-${idx}`} className="skeleton-table-row">
          {/* Checkbox */}
          <td style={{ width: '40px', padding: '13px 14px' }}>
            <SkeletonBox width="18px" height="18px" borderRadius="4px" />
          </td>

          {/* 1. Name & Avatar */}
          <td>
            <div className="skeleton-user-cell">
              <SkeletonCircle size={36} />
              <div className="skeleton-user-meta">
                <SkeletonBox width={`${110 + (idx % 4) * 20}px`} height="14px" />
                <SkeletonBox width={`${140 + (idx % 3) * 25}px`} height="11px" />
              </div>
            </div>
          </td>

          {/* 2. Ticket & Tier */}
          <td>
            <div className="skeleton-tier-cell">
              <SkeletonPill width="84px" height="20px" />
              <SkeletonBox width="105px" height="12px" />
            </div>
          </td>

          {/* 3. Booking Date */}
          <td>
            <SkeletonBox width="88px" height="13px" />
          </td>

          {/* 4. Ticket Price & Payment */}
          <td>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <SkeletonBox width="64px" height="14px" />
              <SkeletonPill width="56px" height="18px" />
            </div>
          </td>

          {/* 5. Gate Status */}
          <td>
            <SkeletonPill width="90px" height="24px" />
          </td>

          {/* 6. Vehicle & City */}
          <td>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SkeletonBox width="115px" height="13px" />
              <SkeletonBox width="70px" height="10px" />
            </div>
          </td>

          {/* 7. Action Buttons */}
          <td style={{ textAlign: 'right' }}>
            <div className="skeleton-action-cell">
              <SkeletonBox width="72px" height="28px" borderRadius="7px" />
              <SkeletonBox width="60px" height="28px" borderRadius="7px" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

/**
 * Transaction Table Rows Skeleton (Can be placed directly inside <tbody>)
 */
export const TransactionTableSkeleton = ({ rows = 8 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={`tx-skel-${idx}`} className="skeleton-table-row">
          {/* Checkbox */}
          <td style={{ width: '40px', padding: '13px 14px' }}>
            <SkeletonBox width="18px" height="18px" borderRadius="4px" />
          </td>

          {/* Description & Avatar */}
          <td>
            <div className="skeleton-user-cell">
              <SkeletonCircle size={36} />
              <div className="skeleton-user-meta">
                <SkeletonBox width={`${120 + (idx % 4) * 25}px`} height="14px" />
                <SkeletonBox width="130px" height="11px" />
              </div>
            </div>
          </td>

          {/* Category */}
          <td>
            <SkeletonPill width="86px" height="22px" />
          </td>

          {/* Date */}
          <td>
            <SkeletonBox width="85px" height="13px" />
          </td>

          {/* Time */}
          <td>
            <SkeletonBox width="65px" height="13px" />
          </td>

          {/* Status */}
          <td>
            <SkeletonPill width="78px" height="22px" />
          </td>

          {/* Amount */}
          <td>
            <SkeletonBox width="80px" height="15px" />
          </td>

          {/* Action */}
          <td style={{ textAlign: 'right' }}>
            <div className="skeleton-action-cell">
              <SkeletonBox width="30px" height="28px" borderRadius="6px" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

/**
 * Full Event Details Page Skeleton
 */
export const EventDetailsSkeleton = () => {
  return (
    <div className="event-details-skeleton-page">
      {/* 1. Header & Actions Strip */}
      <div className="skeleton-header-row">
        <div className="skeleton-breadcrumbs-group">
          <SkeletonBox width="160px" height="13px" />
          <SkeletonBox width="320px" height="28px" borderRadius="8px" />
        </div>
        <div className="skeleton-actions-group">
          <SkeletonBox width="105px" height="36px" borderRadius="8px" />
          <SkeletonBox width="115px" height="36px" borderRadius="8px" />
          <SkeletonBox width="100px" height="36px" borderRadius="8px" />
        </div>
      </div>

      {/* 2. Banner Hero Skeleton */}
      <div className="skeleton-banner-card">
        <SkeletonBox width="100%" height="100%" borderRadius="18px" />
        <div className="skeleton-banner-overlay-bottom">
          <div className="skeleton-banner-tags">
            <SkeletonPill width="110px" height="28px" />
            <SkeletonPill width="140px" height="28px" />
            <SkeletonPill width="90px" height="28px" />
          </div>
          <SkeletonBox width="130px" height="34px" borderRadius="8px" />
        </div>
      </div>

      {/* 3. Event Meta Metric Cards (5 Cards) */}
      <div className="skeleton-meta-strip">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="skeleton-meta-card">
            <div className="skeleton-meta-header">
              <SkeletonBox width="85px" height="13px" />
              <SkeletonCircle size={28} />
            </div>
            <SkeletonBox width="100px" height="26px" />
            <SkeletonBox width="130px" height="11px" />
          </div>
        ))}
      </div>

      {/* 4. Quick Action Rail Skeleton */}
      <div className="skeleton-action-rail">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SkeletonCircle size={32} />
          <SkeletonBox width="140px" height="16px" />
        </div>
        <div className="skeleton-rail-buttons">
          <SkeletonPill width="140px" height="34px" />
          <SkeletonPill width="135px" height="34px" />
          <SkeletonPill width="125px" height="34px" />
          <SkeletonPill width="120px" height="34px" />
        </div>
      </div>

      {/* 5. Tabs Bar Skeleton */}
      <div className="skeleton-tabs-bar">
        <SkeletonBox width="95px" height="32px" borderRadius="6px" />
        <SkeletonBox width="130px" height="32px" borderRadius="6px" />
        <SkeletonBox width="125px" height="32px" borderRadius="6px" />
        <SkeletonBox width="140px" height="32px" borderRadius="6px" />
        <SkeletonBox width="110px" height="32px" borderRadius="6px" />
      </div>

      {/* 6. Main Table Frame with Skeleton Rows */}
      <div className="skeleton-table-frame">
        <div className="skeleton-table-toolbar">
          <SkeletonBox width="280px" height="38px" borderRadius="8px" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <SkeletonBox width="130px" height="38px" borderRadius="8px" />
            <SkeletonBox width="110px" height="38px" borderRadius="8px" />
            <SkeletonBox width="95px" height="38px" borderRadius="8px" />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <ParticipantTableSkeleton rows={7} />
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Full Participants Page Skeleton
 */
export const ParticipantsPageSkeleton = () => {
  return (
    <div className="event-details-skeleton-page">
      <div className="skeleton-header-row">
        <div className="skeleton-breadcrumbs-group">
          <SkeletonBox width="120px" height="13px" />
          <SkeletonBox width="260px" height="28px" borderRadius="8px" />
        </div>
        <div className="skeleton-actions-group">
          <SkeletonBox width="120px" height="36px" borderRadius="8px" />
          <SkeletonBox width="135px" height="36px" borderRadius="8px" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="skeleton-meta-strip">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="skeleton-meta-card">
            <div className="skeleton-meta-header">
              <SkeletonBox width="80px" height="13px" />
              <SkeletonCircle size={26} />
            </div>
            <SkeletonBox width="90px" height="24px" />
            <SkeletonBox width="110px" height="11px" />
          </div>
        ))}
      </div>

      {/* Table Frame */}
      <div className="skeleton-table-frame">
        <div className="skeleton-table-toolbar">
          <SkeletonBox width="260px" height="38px" borderRadius="8px" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <SkeletonBox width="140px" height="38px" borderRadius="8px" />
            <SkeletonBox width="120px" height="38px" borderRadius="8px" />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <ParticipantTableSkeleton rows={8} />
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Full Transactions Page Skeleton
 */
export const TransactionsPageSkeleton = () => {
  return (
    <div className="event-details-skeleton-page">
      <div className="skeleton-header-row">
        <div className="skeleton-breadcrumbs-group">
          <SkeletonBox width="120px" height="13px" />
          <SkeletonBox width="280px" height="28px" borderRadius="8px" />
        </div>
        <div className="skeleton-actions-group">
          <SkeletonBox width="130px" height="36px" borderRadius="8px" />
          <SkeletonBox width="110px" height="36px" borderRadius="8px" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="skeleton-meta-strip">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="skeleton-meta-card">
            <div className="skeleton-meta-header">
              <SkeletonBox width="85px" height="13px" />
              <SkeletonCircle size={26} />
            </div>
            <SkeletonBox width="110px" height="24px" />
            <SkeletonBox width="100px" height="11px" />
          </div>
        ))}
      </div>

      {/* Table Frame */}
      <div className="skeleton-table-frame">
        <div className="skeleton-table-toolbar">
          <SkeletonBox width="250px" height="38px" borderRadius="8px" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <SkeletonBox width="110px" height="38px" borderRadius="8px" />
            <SkeletonBox width="110px" height="38px" borderRadius="8px" />
            <SkeletonBox width="95px" height="38px" borderRadius="8px" />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <TransactionTableSkeleton rows={8} />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventDetailsSkeleton;
