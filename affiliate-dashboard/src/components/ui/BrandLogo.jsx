export function BrandLogo({ size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: '#18181b',
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.16)',
      }}
      aria-label="Nitroxxin logo"
    >
      <svg
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2.5L13.8 8.2L19.1 5.2L15.8 10.2L21.5 12L15.8 13.8L19.1 18.8L13.8 15.8L12 21.5L10.2 15.8L4.9 18.8L8.2 13.8L2.5 12L8.2 10.2L4.9 5.2L10.2 8.2L12 2.5Z"
          fill="currentColor"
        />
        <circle cx="12" cy="12" r="2.2" fill="#18181b" />
      </svg>
    </div>
  );
}
