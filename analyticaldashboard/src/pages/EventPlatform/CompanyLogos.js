import React from 'react';

// Exact SVG Logos for Company Participants matching the image
export const CompanyLogo = ({ name, size = 22, className = '' }) => {
  const normName = (name || '').toLowerCase().trim();

  switch (normName) {
    case 'airbnb':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo airbnb ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#FF5A5F" />
          <path 
            d="M16 7c-2.3 0-4.2 1.6-4.9 3.8-1 3.1-.2 6.8 1.9 10.3 1.4 2.3 2.5 3.9 3 3.9s1.6-1.6 3-3.9c2.1-3.5 2.9-7.2 1.9-10.3C20.2 8.6 18.3 7 16 7zm0 15.6c-.7-.9-1.9-2.7-2.7-4.5-.6-1.5-.9-3-.7-4.2.3-1.6 1.7-2.9 3.4-2.9s3.1 1.3 3.4 2.9c.2 1.2-.1 2.7-.7 4.2-.8 1.8-2 3.6-2.7 4.5zm0-9.6c-1.1 0-2 .9-2 2 0 1.3 1.2 2.6 2 3.5.8-.9 2-2.2 2-3.5 0-1.1-.9-2-2-2z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'amazon':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo amazon ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#FF9900" />
          <path 
            d="M19.5 17.5c-2.8 2-6.5 2.5-9.5 1.5-.4-.1-.8.2-.5.6 2.3 2.8 7 3.2 10.8 1.4.5-.2.6-.7.2-.9l-1-.6zm1.2 2.2c-.3-.4-1.8-.2-2.7 0-.2 0-.2.3 0 .4.9.6 2.4.5 2.7.1.3-.3.2-.4 0-.5z" 
            fill="#111111" 
          />
          <path 
            d="M14.2 14.6c0 1.2.6 1.9 1.6 1.9.9 0 1.5-.6 1.8-1.3v1.1h1.5v-4.9h-1.5v1c-.4-.7-1-1.1-1.9-1.1-1.5 0-2.3 1.2-2.3 2.7v.6zm1.6-.2c0-.8.4-1.3 1-1.3.6 0 1 .5 1 1.3 0 .7-.4 1.3-1 1.3-.6 0-1-.5-1-1.3z" 
            fill="#111111" 
          />
        </svg>
      );

    case 'apple':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo apple ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#000000" />
          <path 
            d="M19.8 16.5c0-2.5 2-3.8 2.1-3.9-1.1-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.8-3.3-.8-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.8 1.3 10.3.9 1.2 1.9 2.6 3.3 2.5 1.3 0 1.8-.8 3.4-.8 1.5 0 2 .8 3.4.8 1.4 0 2.3-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1-.1-2.9-1.1-3-4.2zM17.7 9.1c.7-.8 1.1-2 1-3.1-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.9-1 3 1.1.1 2.1-.6 2.8-1.4z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'dropbox':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo dropbox ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#0061FF" />
          <path 
            d="M11 11l5 3.3-5 3.4-5-3.4 5-3.3zm10 0l5 3.3-5 3.4-5-3.4 5-3.3zm-10 8.7l5-3.4 5 3.4-5 3.3-5-3.3zm10-1.9l5-3.4-5-3.3-5 3.3 5 3.4zm-5 6.3l-5-3.3 1.7-1.2 3.3 2.2 3.3-2.2 1.7 1.2-5 3.3z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'figma':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo figma ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#18181b" />
          <path d="M12.5 10a2.5 2.5 0 0 1 2.5-2.5H16v5h-1a2.5 2.5 0 0 1-2.5-2.5z" fill="#F24E1E" />
          <path d="M16 7.5h1a2.5 2.5 0 0 1 0 5H16v-5z" fill="#FF7262" />
          <path d="M12.5 15a2.5 2.5 0 0 1 2.5-2.5H16v5h-1a2.5 2.5 0 0 1-2.5-2.5z" fill="#A259FF" />
          <path d="M16 12.5a2.5 2.5 0 1 1 2.5 2.5H16v-2.5z" fill="#1ABCFE" />
          <path d="M12.5 20a2.5 2.5 0 0 1 2.5-2.5H16v2.5a2.5 2.5 0 0 1-2.5 2.5 2.5 2.5 0 0 1-1-2.5z" fill="#0ACF83" />
        </svg>
      );

    case 'github':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo github ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#24292F" />
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M16 7C11 7 7 11 7 16c0 4 2.6 7.4 6.2 8.6.4.1.6-.2.6-.4v-1.6c-2.5.5-3-1.1-3-1.1-.4-1-1-1.3-1-1.3-.8-.5.1-.5.1-.5.9.1 1.4 1 1.4 1 .8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.5 0-1 .4-1.8 1-2.4-.1-.2-.4-1.1.1-2.4 0 0 .8-.2 2.5.9.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.7-1.2 2.5-.9 2.5-.9.5 1.3.2 2.2.1 2.4.6.6 1 1.4 1 2.4 0 3.5-2.1 4.3-4.1 4.5.3.3.6.8.6 1.7v2.5c0 .2.2.5.6.4C22.4 23.4 25 20 25 16c0-5-4-9-9-9z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'gitlab':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo gitlab ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#E24329" />
          <path d="M16 23.5l3.8-11.7H12.2L16 23.5z" fill="#E24329" />
          <path d="M16 23.5l-3.8-11.7h-3.9L16 23.5z" fill="#FC6D26" />
          <path d="M8.3 11.8L7.1 15.5c-.2.5 0 1 .4 1.3L16 23.5 8.3 11.8z" fill="#FCA326" />
          <path d="M8.3 11.8H12.2l-1.9-5.9c-.2-.6-1-.6-1.2 0L8.3 11.8z" fill="#E24329" />
          <path d="M16 23.5l3.8-11.7h3.9L16 23.5z" fill="#FC6D26" />
          <path d="M23.7 11.8l1.2 3.7c.2.5 0 1-.4 1.3L16 23.5l7.7-11.7z" fill="#FCA326" />
          <path d="M23.7 11.8H19.8l1.9-5.9c.2-.6 1-.6 1.2 0l1.8 5.9z" fill="#E24329" />
        </svg>
      );

    case 'google':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo google ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#0081FB" />
          <path 
            d="M16.5 14.5v3.2h4.5c-.4 2-2.1 3.4-4.5 3.4-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.2 0 2.3.4 3.1 1.2l2.3-2.3C20.5 8.8 18.6 8 16.5 8 12.1 8 8.5 11.6 8.5 16s3.6 8 8 8c4.6 0 7.7-3.2 7.7-7.8 0-.6-.1-1.1-.2-1.7h-7.5z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'meta':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo meta ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#0081FB" />
          <path 
            d="M23.6 12.6c-1.3 0-2.4.7-3.3 1.9-.9-1.2-2.1-1.9-3.4-1.9s-2.5.7-3.4 1.9c-.9-1.2-2-1.9-3.3-1.9-2.3 0-4.2 1.9-4.2 4.4 0 2.4 1.9 4.4 4.2 4.4 1.3 0 2.4-.7 3.3-1.9.9 1.2 2.1 1.9 3.4 1.9s2.5-.7 3.4-1.9c.9 1.2 2 1.9 3.3 1.9 2.3 0 4.2-1.9 4.2-4.4 0-2.5-1.9-4.4-4.2-4.4zm-13.4 6.7c-1.3 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3 1.1 0 2.1.8 2.3 2.1-.2 1.3-1.2 2.5-2.3 2.5zm6.7-1.3c-.6-.8-1.5-1.3-2.4-1.3-.2 0-.4 0-.6.1.6 1 1.5 2 2.6 2.4.2-.4.3-.8.4-1.2zm3.8 1.3c-1.1 0-2.1-1.2-2.3-2.5.2-1.3 1.2-2.1 2.3-2.1 1.3 0 2.3 1 2.3 2.3 0 1.3-1 2.3-2.3 2.3z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'microsoft':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo microsoft ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#ffffff" stroke="#e4e4e7" strokeWidth="1" />
          <rect x="9" y="9" width="6.5" height="6.5" rx="1" fill="#F25022" />
          <rect x="16.5" y="9" width="6.5" height="6.5" rx="1" fill="#7FBA00" />
          <rect x="9" y="16.5" width="6.5" height="6.5" rx="1" fill="#00A4EF" />
          <rect x="16.5" y="16.5" width="6.5" height="6.5" rx="1" fill="#FFB900" />
        </svg>
      );

    case 'notion':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo notion ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#18181b" />
          <path 
            d="M10.3 9.4L13.8 9c.4 0 .7.3.8.7l4.3 8.3V10c0-.5.4-.9.9-.9h2.3c.5 0 .9.4.9.9v12.2c0 .5-.4.9-.9.9h-2.1c-.4 0-.7-.2-.9-.6l-4.5-8.5v7.2c0 .5-.4.9-.9.9h-2.3c-.5 0-.9-.4-.9-.9V10.3c0-.5.3-.9.8-.9z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'paypal':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo paypal ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#003087" />
          <path 
            d="M12.5 8h4.8c2.4 0 4.2 1.6 3.9 3.9-.3 2.5-2.2 4.1-4.7 4.1h-1.8l-1.3 8h-2.7l1.8-16z" 
            fill="#0079C1" 
          />
          <path 
            d="M14.5 11h4.6c2.2 0 3.8 1.4 3.5 3.5-.3 2.5-2.2 4-4.5 4h-1.8l-1.3 7.5h-2.4l1.9-15z" 
            fill="#00457C" 
            opacity="0.3" 
          />
          <path 
            d="M14.5 11.5h4.4c2.1 0 3.6 1.4 3.3 3.4-.3 2.3-2.1 3.6-4.3 3.6h-1.6l-1.1 6.5h-2.4l1.7-13.5z" 
            fill="#0079C1" 
          />
        </svg>
      );

    case 'shopify':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo shopify ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#95BF47" />
          <path 
            d="M21.5 11.5c-.1-.3-.3-.4-.5-.4h-1.8c-.1-.9-.7-2.6-2.4-2.6-1.8 0-2.4 1.7-2.5 2.6h-1.8c-.2 0-.4.1-.5.4l-2 11c0 .2.1.4.3.5.1 0 .2.1.2.1h12.5c.2 0 .4-.2.4-.4l-1.9-11.2zm-4.7-1.8c.8 0 1.2.7 1.3 1.5h-2.6c.1-.8.5-1.5 1.3-1.5zm-1.8 7.3c-.6-.3-1-.6-1-1.1 0-.6.5-1.1 1.2-1.1.7 0 1.2.4 1.3 1l1.1-.3c-.3-1-1.1-1.7-2.4-1.7-1.3 0-2.3.9-2.3 2.1 0 .9.6 1.6 1.7 2 .8.3 1.2.7 1.2 1.3 0 .7-.6 1.2-1.4 1.2-.9 0-1.5-.5-1.6-1.2l-1.1.3c.3 1.2 1.3 1.9 2.7 1.9 1.4 0 2.5-.9 2.5-2.2 0-1.1-.7-1.8-1.9-2.2z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'slack':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo slack ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#4A154B" />
          <path d="M12.5 16a1.5 1.5 0 1 1-1.5-1.5h1.5V16zm.8 0a1.5 1.5 0 0 1 3 0v3.8a1.5 1.5 0 1 1-3 0V16z" fill="#E01E5A" />
          <path d="M16 12.5a1.5 1.5 0 1 1 1.5-1.5v1.5H16zm0 .8a1.5 1.5 0 0 1 0 3h-3.8a1.5 1.5 0 1 1 0-3H16z" fill="#36C5F0" />
          <path d="M19.5 16a1.5 1.5 0 1 1 1.5 1.5h-1.5V16zm-.8 0a1.5 1.5 0 0 1-3 0v-3.8a1.5 1.5 0 1 1 3 0V16z" fill="#2EB67D" />
          <path d="M16 19.5a1.5 1.5 0 1 1-1.5 1.5v-1.5H16zm0-.8a1.5 1.5 0 0 1 0-3h3.8a1.5 1.5 0 1 1 0 3H16z" fill="#ECB22E" />
        </svg>
      );

    case 'spotify':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo spotify ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#1ED760" />
          <path 
            d="M21.5 19.8c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4.1-1 7.5-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.6c-.3.4-.8.5-1.2.3-2.9-1.8-7.2-2.3-10.6-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.8-1.2 8.6-.6 12 1.5.4.2.5.6.3.9zm.1-2.8c-3.4-2-9.1-2.2-12.4-1.2-.5.2-1.1-.1-1.2-.6-.2-.5.1-1.1.6-1.2 3.8-1.1 10.1-.9 14 1.4.5.3.6.9.3 1.4-.2.4-.8.5-1.3.2z" 
            fill="#111111" 
          />
        </svg>
      );

    case 'stripe':
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 32 32" 
          fill="none" 
          className={`company-logo stripe ${className}`}
        >
          <rect width="32" height="32" rx="16" fill="#635BFF" />
          <path 
            d="M17.4 13.9c-.9-.4-1.5-.7-1.5-1.1 0-.4.4-.7 1.1-.7 1.1 0 2.2.4 3.1 1l.8-2c-1.1-.6-2.5-.9-3.9-.9-2.6 0-4.4 1.4-4.4 3.7 0 2.9 4 2.5 4 3.7 0 .5-.5.8-1.3.8-1.2 0-2.6-.6-3.7-1.3l-.9 2.1c1.3.8 2.9 1.2 4.5 1.2 2.8 0 4.7-1.4 4.7-3.8-.1-2.9-4-2.6-4-3.7z" 
            fill="#ffffff" 
          />
        </svg>
      );

    case 'netflix':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#141414" />
          <path d="M12 9h2.5v14H12z" fill="#E50914" />
          <path d="M17.5 9h2.5v14h-2.5z" fill="#E50914" />
          <path d="M12 9l8 14h-2.5l-8-14z" fill="#B81D24" />
        </svg>
      );

    case 'uber':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#000000" />
          <circle cx="16" cy="16" r="6" stroke="#ffffff" strokeWidth="2.2" />
          <rect x="15" y="10" width="2" height="6" fill="#ffffff" />
        </svg>
      );

    case 'salesforce':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#00A1E0" />
          <path d="M13.5 12a3.5 3.5 0 0 1 6.3-1.6 4 4 0 0 1 4.2 4.1c0 .2 0 .4-.1.6a3.5 3.5 0 0 1 1.1 6.9H9a4 4 0 0 1-1-7.9 3.5 3.5 0 0 1 5.5-2.1z" fill="#ffffff" />
        </svg>
      );

    case 'adobe':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#FA0F00" />
          <path d="M14.5 9.5l-4.5 13h3.5l1.5-4.5h2l-2.5-8.5zm4 0l4.5 13h-3.5l-1.5-4.5h-2l2.5-8.5z" fill="#ffffff" />
        </svg>
      );

    case 'canva':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#00C4CC" />
          <circle cx="16" cy="16" r="6.5" fill="#ffffff" opacity="0.3" />
          <text x="16" y="20.5" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">C</text>
        </svg>
      );

    case 'zoom':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#2D8CFF" />
          <rect x="9" y="12" width="9" height="8" rx="2" fill="#ffffff" />
          <path d="M19 14.5l4-2.5v8l-4-2.5v-3z" fill="#ffffff" />
        </svg>
      );

    case 'snowflake':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#29B5E8" />
          <path d="M16 8v16m-8-8h16m-11.3-5.7l11.3 11.4m-11.3 0L21.7 10.3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'datadog':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`company-logo ${className}`}>
          <rect width="32" height="32" rx="16" fill="#632CA6" />
          <circle cx="16" cy="15" r="5" fill="#ffffff" />
          <circle cx="14" cy="14" r="1" fill="#632CA6" />
          <circle cx="18" cy="14" r="1" fill="#632CA6" />
          <path d="M15 17h2" stroke="#632CA6" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    default:
      return (
        <div 
          style={{ 
            width: size, 
            height: size, 
            borderRadius: '50%', 
            background: '#e4e4e7', 
            color: '#3f3f46',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size * 0.45}px`,
            fontWeight: 700,
            textTransform: 'uppercase'
          }}
          className={className}
        >
          {name ? name.slice(0, 1) : 'C'}
        </div>
      );
  }
};

export default CompanyLogo;
