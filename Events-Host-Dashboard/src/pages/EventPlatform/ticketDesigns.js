import React, { useState } from 'react';
import { QrCode as QrIcon } from 'lucide-react';
import './TicketDesigns.css';

/**
 * Ticket Design & Pass View Module
 * Renders official attendee ticket passes strictly using fetched template data from ticket_tamplate.
 */
export const ticketDesigns = [];

export const getTicketDesign = () => null;

/**
 * Format date nicely for ticket (e.g. "08/12")
 */
export const formatTicketDate = (dateVal) => {
  if (!dateVal) return '--/--';
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
  } catch (e) {}
  return String(dateVal);
};

/**
 * Format time for ticket (e.g. "02:00 PM")
 */
export const formatTicketTime = (timeVal) => {
  if (!timeVal) return '--:--';
  if (/^\d{1,2}:\d{2}/.test(timeVal)) {
    const parts = timeVal.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }
  return String(timeVal);
};

/**
 * Official NitroXX Tickets Brand Logo Component
 * Exact match to the user's reference ticket header
 */
export const NitroxxTicketsLogo = ({ className = '', style = {} }) => (
  <div className={`nitroxx-tickets-brand-lockup ${className}`} style={style}>
    <div className="nitroxx-brand-title-row">
      <span className="nitroxx-brand-word">Nitro</span>
      <svg
        className="nitroxx-xx-vector"
        viewBox="0 0 64 28"
        width="56"
        height="24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Left X with gear/circle in center */}
        <path d="M4 3L26 25" stroke="#000000" strokeWidth="4.8" strokeLinecap="round" />
        <path d="M26 3L4 25" stroke="#000000" strokeWidth="4.8" strokeLinecap="round" />
        <circle cx="15" cy="14" r="5" fill="#ffffff" stroke="#000000" strokeWidth="2.4" />
        <circle cx="15" cy="14" r="1.8" fill="#000000" />
        {/* Right X overlapping */}
        <path d="M24 3L46 25" stroke="#000000" strokeWidth="4.8" strokeLinecap="round" />
        <path d="M46 3L24 25" stroke="#000000" strokeWidth="4.8" strokeLinecap="round" />
      </svg>
    </div>
    <span className="nitroxx-tickets-word">Tickets</span>
  </div>
);

/**
 * TicketPassView: Renders the official vertical ticket pass matching the user's uploaded image.
 * Features:
 * - Scalloped cutouts on top edge (7 bites)
 * - Scalloped cutouts on bottom edge (7 bites)
 * - Semicircular notches on left & right sides with black dashed fold line
 * - NitroXX Tickets brand logo
 * - Bold black event title
 * - Event venue / location
 * - 3-column stats grid: Date (DD/MM), Time (02:00 PM), Tickets (x2)
 * - Vertical rotated "SCAN THIS QR WHEN ENTER" label
 * - Scannable QR code overlaying the background image
 * - Dynamic background strictly from the host-chosen template in ticket_tamplate collection
 */
export const TicketPassView = ({
  designId = '',
  templateUrl = '',
  template = null,
  event = {},
  participant = {},
  ticketNumber = '',
  ticketsCount = null,
  tierName = '',
  compact = false,
  surroundBg = '',
  onPrint = null
}) => {
  const [qrLoaded, setQrLoaded] = useState(true);

  // Background resolution strictly from fetched template image
  const activeTemplateUrl =
    templateUrl ||
    template?.image ||
    template?.imageUrl ||
    template?.url ||
    event.ticketTemplateUrl ||
    '';

  const backgroundStyle = activeTemplateUrl
    ? {
        backgroundImage: `url(${activeTemplateUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {
        background: '#181920',
      };

  // Event & attendee data resolution
  const title = event.title || event.name || 'Event Pass';
  const venue = [event.venue, event.city].filter(Boolean).join(', ');
  const dateFormatted = formatTicketDate(event.startDate);
  const timeFormatted = formatTicketTime(event.startTime);
  const qty = ticketsCount || participant.tickets || participant.seats || 1;
  const attendeeName = participant.fullName || participant.name || '';

  // QR Code Data
  const qrData = `NITROXX-TICKET:${ticketNumber}|EVENT:${title}|VENUE:${venue}|DATE:${dateFormatted}|TIME:${timeFormatted}|TICKETS:x${qty}|ATTENDEE:${attendeeName}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData)}&margin=2&format=png`;

  return (
    <div className={`ticket-pass-outer-shell ${compact ? 'is-compact-pass' : ''}`}>
      <div 
        className="vertical-image-ticket-card"
        style={{
          ...backgroundStyle,
          ...(surroundBg ? { '--ticket-surround-bg': surroundBg } : {})
        }}
      >
        {/* TOP SCALLOP BITES (7 SEMICIRCLE CUTOUTS) */}
      

        {/* SIDE NOTCHES AT THE FOLD LINE */}
        <div className="ticket-edge-notch notch-left" aria-hidden="true" />
        <div className="ticket-edge-notch notch-right" aria-hidden="true" />

        {/* TOP SECTION (ABOVE DASHED FOLD LINE): NITROXX TICKETS LOGO */}
        <div className="ticket-top-stub-area">
          <NitroxxTicketsLogo />
        </div>

        {/* HORIZONTAL DASHED FOLD / TEAR LINE */}
        <div className="ticket-dashed-fold-divider" aria-hidden="true" />

        {/* MAIN TICKET BODY */}
        <div className="ticket-main-content-area">
          {/* EVENT TITLE */}
          <h1 className="ticket-bold-event-title">{title}</h1>

          {/* EVENT LOCATION / VENUE */}
          <div className="ticket-venue-location-text">{venue}</div>

          {/* HORIZONTAL SOLID RULE */}
          <div className="ticket-solid-divider" />

          {/* 3-COLUMN METRICS: DATE | TIME | TICKETS */}
          {/* <div className="ticket-metrics-three-cols">
            <div className="ticket-metric-col">
              <span className="metric-label">Date</span>
              <span className="metric-value">{dateFormatted}</span>
            </div>
            <div className="ticket-metric-col">
              <span className="metric-label">Time</span>
              <span className="metric-value">{timeFormatted}</span>
            </div>
            <div className="ticket-metric-col">
              <span className="metric-label">Tickets</span>
              <span className="metric-value">x{qty}</span>
            </div>
          </div> */}

          {/* HORIZONTAL SOLID RULE */}
          <div className="ticket-solid-divider" />

          {/* QR CODE SECTION WITH VERTICAL "SCAN THIS QR WHEN ENTER" */}
          {/* <div className="ticket-qr-action-section">
            <div className="ticket-vertical-scan-text">
              SCAN THIS QR WHEN ENTER
            </div>

            <div className="ticket-qr-frame">
              {qrLoaded ? (
                <img
                  src={qrUrl}
                  alt="Scan ticket pass QR code"
                  className="ticket-rendered-qr-img"
                  onError={() => setQrLoaded(false)}
                />
              ) : (
                <div className="ticket-qr-fallback-box">
                  <QrIcon size={120} strokeWidth={2} color="#000000" />
                  <span className="ticket-pass-id-fallback">{ticketNumber}</span>
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* BOTTOM SCALLOP BITES (7 SEMICIRCLE CUTOUTS) */}
        <div className="ticket-scallops-bar bottom" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="scallop-cutout-bite" />
          ))}
        </div>
      </div>
    </div>
  );
};
