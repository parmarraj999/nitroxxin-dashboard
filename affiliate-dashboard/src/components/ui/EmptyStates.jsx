import { RippleButton } from './RippleButton';

function EmptyWrapper({ title, description, actionLabel, onAction, children }) {
  return (
    <div
      className="card"
      style={{
        padding: '36px 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <div style={{ width: 136, height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
      <div style={{ maxWidth: 320 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <RippleButton className="btn btn-primary btn-sm" onClick={onAction} style={{ marginTop: 4 }}>
          {actionLabel}
        </RippleButton>
      )}
    </div>
  );
}

export function NoOrdersIllustration({ onAction, actionLabel = 'Reset Order Filters' }) {
  return (
    <EmptyWrapper
      title="No Orders Found"
      description="Orders placed through your affiliate links and referral code RAJ10 will appear here in real time."
      actionLabel={actionLabel}
      onAction={onAction}
    >
      <svg width="132" height="106" viewBox="0 0 132 106" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="14" width="96" height="78" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="32" y="30" width="68" height="14" rx="5" fill="#FFFFFF" stroke="#E2E8F0" />
        <circle cx="41" cy="37" r="3" fill="#CBD5E1" />
        <rect x="49" y="35" width="38" height="4" rx="2" fill="#E2E8F0" />
        <rect x="32" y="51" width="68" height="14" rx="5" fill="#FFFFFF" stroke="#E2E8F0" />
        <circle cx="41" cy="58" r="3" fill="#CBD5E1" />
        <rect x="49" y="56" width="28" height="4" rx="2" fill="#E2E8F0" />
        <circle cx="95" cy="75" r="16" fill="#18181B" />
        <path d="M90 75L94 79L101 71" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </EmptyWrapper>
  );
}

export function NoEarningsIllustration({ onAction, actionLabel = 'Generate Tracked Link' }) {
  return (
    <EmptyWrapper
      title="No Earnings Recorded Yet"
      description="Share Nitroxxin events, tours, and gear links to unlock your first approved affiliate payout."
      actionLabel={actionLabel}
      onAction={onAction}
    >
      <svg width="132" height="106" viewBox="0 0 132 106" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="20" width="100" height="68" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M30 68L50 52L68 60L98 34" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
        <circle cx="98" cy="34" r="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
        <rect x="28" y="28" width="34" height="10" rx="5" fill="#ECFDF5" />
        <text x="37" y="36" fill="#15803D" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif">
          ₹0.00
        </text>
      </svg>
    </EmptyWrapper>
  );
}

export function NoNotificationsIllustration({ onAction, actionLabel }) {
  return (
    <EmptyWrapper
      title="You're All Caught Up"
      description="New sales, approved commissions, campaign invites, and withdrawal updates will show up right here."
      actionLabel={actionLabel}
      onAction={onAction}
    >
      <svg width="132" height="106" viewBox="0 0 132 106" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="66" cy="53" r="38" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
        <path
          d="M52 58V49C52 41.268 58.268 35 66 35C73.732 35 80 41.268 80 49V58L84 64H48L52 58Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M62 67C62.8 69.2 64.3 70.5 66 70.5C67.7 70.5 69.2 69.2 70 67" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
        <circle cx="84" cy="36" r="8" fill="#ECFDF5" stroke="#16A34A" strokeWidth="1.5" />
        <path d="M81 36L83.2 38.2L87.5 33.8" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </EmptyWrapper>
  );
}

export function GenerateFirstLinkIllustration({ onAction, actionLabel = 'Generate First Link' }) {
  return (
    <EmptyWrapper
      title="Generate Your First Affiliate Link"
      description="Paste any Nitroxxin event, tour, or accessory URL above to create your tracked CR10294 link."
      actionLabel={actionLabel}
      onAction={onAction}
    >
      <svg width="132" height="106" viewBox="0 0 132 106" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="24" width="92" height="58" rx="14" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="32" y="38" width="68" height="28" rx="8" fill="#FFFFFF" stroke="#D0D5DD" strokeDasharray="3 3" />
        <path
          d="M58 52H53C49.686 52 47 49.314 47 46C47 42.686 49.686 40 53 40H58"
          transform="translate(4,6)"
          stroke="#18181B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M66 40H71C74.314 40 77 42.686 77 46C77 49.314 74.314 52 71 52H66"
          transform="translate(4,6)"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line x1="59" y1="52" x2="73" y2="52" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </EmptyWrapper>
  );
}
