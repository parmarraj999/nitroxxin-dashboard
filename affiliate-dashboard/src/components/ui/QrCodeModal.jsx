import { useMemo } from 'react';
import { CheckIcon, CloseIcon, CopyIcon, DownloadIcon, ShareIcon } from './Icons';
import { RippleButton } from './RippleButton';

/**
 * Generates a deterministic 25x25 QR-style matrix with standard finder patterns
 * seeded from the target affiliate URL so each link has a distinct visual QR.
 */
function buildQrMatrix(text) {
  const size = 25;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (r0, c0) => {
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const isEdge = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = isEdge || isCenter;
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i += 1) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Deterministic hash stream from URL
  let seed = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    seed ^= text.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  const nextBit = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) % 100 > 46;
  };

  const isReserved = (r, c) => {
    const topLeft = r < 8 && c < 8;
    const topRight = r < 8 && c >= size - 8;
    const bottomLeft = r >= size - 8 && c < 8;
    const timing = r === 6 || c === 6;
    const centerLogo = r >= 10 && r <= 14 && c >= 10 && c <= 14;
    return topLeft || topRight || bottomLeft || timing || centerLogo;
  };

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!isReserved(r, c)) {
        grid[r][c] = nextBit();
      }
    }
  }

  return grid;
}

export function QrCodeModal({ link, onClose, onCopy, onShare, copiedId }) {
  const matrix = useMemo(() => (link ? buildQrMatrix(link.affiliateUrl) : []), [link]);
  if (!link) return null;

  const isCopied = copiedId === `qr-${link.id}`;

  const handleDownloadSvg = () => {
    const cell = 10;
    const pad = 20;
    const dim = matrix.length * cell + pad * 2;
    const rects = [];
    matrix.forEach((row, r) => {
      row.forEach((filled, c) => {
        if (filled) {
          rects.push(
            `<rect x="${pad + c * cell}" y="${pad + r * cell}" width="${cell}" height="${cell}" rx="2" fill="#18181b"/>`
          );
        }
      });
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}">
      <rect width="${dim}" height="${dim}" rx="16" fill="#ffffff"/>
      ${rects.join('')}
      <rect x="${dim / 2 - 22}" y="${dim / 2 - 22}" width="44" height="44" rx="10" fill="#18181b"/>
      <text x="${dim / 2}" y="${dim / 2 + 5}" text-anchor="middle" fill="#ffffff" font-family="Inter, sans-serif" font-size="14" font-weight="800">N</text>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nitroxxin-qr-${link.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Affiliate Link QR Code">
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{link.title}</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
              Scan to open tracked Nitroxxin affiliate link
            </p>
          </div>
          <button className="icon-action-btn" onClick={onClose} aria-label="Close QR modal">
            <CloseIcon size={17} />
          </button>
        </div>

        <div
          style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 16,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              padding: 14,
              borderRadius: 14,
              border: '1px solid var(--border-hairline)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg width="196" height="196" viewBox="0 0 250 250" role="img" aria-label={`QR Code for ${link.affiliateUrl}`}>
              <rect width="250" height="250" fill="#ffffff" />
              {matrix.map((row, r) =>
                row.map((on, c) =>
                  on ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c * 10 + 1}
                      y={r * 10 + 1}
                      width="8.4"
                      height="8.4"
                      rx="1.8"
                      fill="#18181b"
                    />
                  ) : null
                )
              )}
              <rect x="101" y="101" width="48" height="48" rx="10" fill="#18181b" />
              <text
                x="125"
                y="131"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="20"
                fontWeight="800"
                fontFamily="Inter, sans-serif"
              >
                N
              </text>
            </svg>
          </div>

          <div
            className="mono"
            style={{
              fontSize: 11.5,
              color: 'var(--text-secondary)',
              background: '#ffffff',
              border: '1px solid var(--border-hairline)',
              borderRadius: 8,
              padding: '6px 10px',
              wordBreak: 'break-all',
              textAlign: 'center',
            }}
          >
            {link.affiliateUrl}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <RippleButton
            className="btn btn-secondary"
            onClick={() => onCopy(link.affiliateUrl, `qr-${link.id}`, 'Affiliate URL copied!')}
          >
            {isCopied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
            {isCopied ? 'Copied' : 'Copy'}
          </RippleButton>
          <RippleButton className="btn btn-secondary" onClick={() => onShare(link)}>
            <ShareIcon size={15} />
            Share
          </RippleButton>
          <RippleButton className="btn btn-primary" onClick={handleDownloadSvg}>
            <DownloadIcon size={15} />
            Save QR
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
