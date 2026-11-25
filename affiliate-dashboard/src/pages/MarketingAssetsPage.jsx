import { useMemo, useState } from 'react';
import { MARKETING_ASSETS, MARKETING_SECTIONS } from '../data/affiliateData';
import { RippleButton } from '../components/ui/RippleButton';
import {
  CheckIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
} from '../components/ui/Icons';

const THEME_PALETTES = {
  'dark-alpine': { bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fg: '#ffffff', accent: '#38bdf8' },
  'steel-amber': { bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', fg: '#ffffff', accent: '#f59e0b' },
  'emerald-carbon': { bg: 'linear-gradient(135deg, #064e3b 0%, #111827 100%)', fg: '#ffffff', accent: '#34d399' },
  'monochrome-brand': { bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', fg: '#18181b', accent: '#18181b' },
  'indigo-slate': { bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', fg: '#ffffff', accent: '#a5b4fc' },
  'studio-white': { bg: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)', fg: '#111827', accent: '#2563eb' },
  'crimson-peak': { bg: 'linear-gradient(135deg, #450a0a 0%, #18181b 100%)', fg: '#ffffff', accent: '#f87171' },
  'obsidian-motion': { bg: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)', fg: '#ffffff', accent: '#fbbf24' },
};

function AssetCreativePreview({ asset, height = 156 }) {
  const pal = THEME_PALETTES[asset.theme] || THEME_PALETTES['dark-alpine'];
  return (
    <div
      style={{
        height,
        borderRadius: 12,
        background: pal.bg,
        color: pal.fg,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid rgba(15, 23, 42, 0.08)',
      }}
    >
      {/* Decorative mountain/track geometry */}
      <svg
        viewBox="0 0 300 160"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
        preserveAspectRatio="none"
      >
        <path d="M0 140 L75 75 L140 115 L220 45 L300 120 L300 160 L0 160 Z" fill={pal.accent} />
        <circle cx="250" cy="36" r="24" stroke={pal.accent} strokeWidth="2" fill="none" />
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.16)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {asset.section}
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: pal.accent }}>{asset.badge}</span>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>NITROXXIN • CODE RAJ10</div>
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 2 }}>
          {asset.title}
        </div>
      </div>
    </div>
  );
}

export function MarketingAssetsPage({ copiedId, onCopy, showToast }) {
  const [section, setSection] = useState('All');
  const [previewAsset, setPreviewAsset] = useState(null);

  const visibleAssets = useMemo(() => {
    if (section === 'All') return MARKETING_ASSETS;
    return MARKETING_ASSETS.filter((item) => item.section === section);
  }, [section]);

  const handleDownload = (asset) => {
    const pal = THEME_PALETTES[asset.theme] || THEME_PALETTES['dark-alpine'];
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <rect width="1080" height="1080" fill="#18181b"/>
      <path d="M0 860 L290 480 L540 710 L820 320 L1080 690 L1080 1080 L0 1080 Z" fill="${pal.accent}" opacity="0.25"/>
      <text x="80" y="130" fill="${pal.accent}" font-family="Inter, sans-serif" font-size="34" font-weight="700">NITROXXIN CREATOR KIT • ${asset.section.toUpperCase()}</text>
      <text x="80" y="540" fill="#ffffff" font-family="Inter, sans-serif" font-size="68" font-weight="800">${asset.title}</text>
      <text x="80" y="630" fill="#d4d4d8" font-family="Inter, sans-serif" font-size="36" font-weight="500">Use Referral Code: RAJ10 (10% OFF)</text>
      <text x="80" y="960" fill="#a1a1aa" font-family="monospace" font-size="28">nitroxxin.com?ref=CR10294</text>
    </svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nitroxxin-${asset.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${asset.title}!`);
  };

  return (
    <div className="page-enter">
      <div className="toolbar-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 20 }}>
            Marketing Assets
          </h1>
          <p className="section-subtitle" style={{ margin: '2px 0 0' }}>
            Ready-to-post Nitroxxin creatives, event posters, logos &amp; video packs
          </p>
        </div>
      </div>

      {/* Section Filter Chips */}
      <div
        style={{
          display: 'flex',
          gap: 7,
          overflowX: 'auto',
          paddingBottom: 10,
          marginBottom: 14,
          scrollbarWidth: 'none',
        }}
      >
        {MARKETING_SECTIONS.map((sec) => {
          const active = section === sec;
          return (
            <button
              key={sec}
              type="button"
              onClick={() => setSection(sec)}
              style={{
                flexShrink: 0,
                padding: '7px 13px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 600,
                border: `1px solid ${active ? '#18181b' : 'var(--border-hairline)'}`,
                background: active ? '#18181b' : '#ffffff',
                color: active ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.16s ease',
              }}
            >
              {sec}
            </button>
          );
        })}
      </div>

      {/* Assets Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(275px, 1fr))',
          gap: 14,
        }}
      >
        {visibleAssets.map((asset) => {
          const isCaptionCopied = copiedId === `cap-${asset.id}`;
          return (
            <article
              key={asset.id}
              className="card card-hover"
              style={{
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <AssetCreativePreview asset={asset} />
                <div style={{ marginTop: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>{asset.title}</h3>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>
                    {asset.dimensions}
                  </div>
                  <p
                    style={{
                      margin: '8px 0 0',
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {asset.caption}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 6 }}>
                <RippleButton className="btn btn-secondary btn-sm" onClick={() => setPreviewAsset(asset)}>
                  <EyeIcon size={13} />
                  <span>Preview</span>
                </RippleButton>
                <RippleButton className="btn btn-secondary btn-sm" onClick={() => handleDownload(asset)}>
                  <DownloadIcon size={13} />
                  <span>Download</span>
                </RippleButton>
                <RippleButton
                  className="btn btn-primary btn-sm"
                  onClick={() => onCopy(asset.caption, `cap-${asset.id}`, 'Promo caption copied!')}
                >
                  {isCaptionCopied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                  <span>{isCaptionCopied ? 'Copied' : 'Copy Caption'}</span>
                </RippleButton>
              </div>
            </article>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div className="modal-backdrop" onClick={() => setPreviewAsset(null)} role="dialog" aria-modal="true">
          <div className="modal-panel" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>{previewAsset.title}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                  {previewAsset.section} • {previewAsset.dimensions}
                </p>
              </div>
              <button className="icon-action-btn" onClick={() => setPreviewAsset(null)} aria-label="Close">
                <CloseIcon size={16} />
              </button>
            </div>

            <AssetCreativePreview asset={previewAsset} height={220} />

            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)',
                fontSize: 12.5,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              {previewAsset.caption}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
              <RippleButton className="btn btn-secondary" onClick={() => handleDownload(previewAsset)}>
                <DownloadIcon size={15} />
                <span>Download Asset</span>
              </RippleButton>
              <RippleButton
                className="btn btn-primary"
                onClick={() => onCopy(previewAsset.caption, `cap-${previewAsset.id}`, 'Promo caption copied!')}
              >
                <CopyIcon size={15} />
                <span>Copy Caption</span>
              </RippleButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
