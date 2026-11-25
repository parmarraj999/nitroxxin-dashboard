import { useMemo, useRef, useState } from 'react';
import { RippleButton } from '../components/ui/RippleButton';
import { GenerateFirstLinkIllustration } from '../components/ui/EmptyStates';
import { QrCodeModal } from '../components/ui/QrCodeModal';
import {
  CheckIcon,
  CopyIcon,
  LinkIcon,
  PlusIcon,
  QrCodeIcon,
  SearchIcon,
  ShareIcon,
  SparklesIcon,
} from '../components/ui/Icons';

const PRESET_URLS = [
  { label: 'Leh Expedition', url: 'https://nitroxxin.com/events/leh-expedition' },
  { label: 'Touring Combo', url: 'https://nitroxxin.com/products/touring-combo' },
  { label: 'Spiti Rally', url: 'https://nitroxxin.com/events/spiti-valley-rally' },
];

export function LinksPage({
  links,
  creatorId,
  copiedId,
  onCopy,
  onAddLink,
  onClearLinks,
  onRestoreLinks,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [rawInput, setRawInput] = useState('https://nitroxxin.com/events/leh-expedition');
  const [generatedPreview, setGeneratedPreview] = useState(
    `https://nitroxxin.com/events/leh-expedition?ref=${creatorId}`
  );
  const [qrLink, setQrLink] = useState(null);
  const inputRef = useRef(null);

  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.originalUrl.toLowerCase().includes(q) ||
        item.affiliateUrl.toLowerCase().includes(q)
    );
  }, [links, search]);

  const buildAffiliateUrl = (input) => {
    const trimmed = (input || '').trim();
    if (!trimmed) return '';
    const normalized = trimmed.startsWith('http') ? trimmed : `https://nitroxxin.com/${trimmed.replace(/^\/+/, '')}`;
    const separator = normalized.includes('?') ? '&' : '?';
    if (normalized.includes(`ref=${creatorId}`)) return normalized;
    return `${normalized}${separator}ref=${creatorId}`;
  };

  const deriveTitle = (url) => {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length === 0) return 'Nitroxxin Custom Link';
      const last = segments[segments.length - 1];
      return last
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    } catch {
      return 'Nitroxxin Tracked Link';
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const clean = rawInput.trim();
    if (!clean) {
      showToast('Paste a Nitroxxin URL first');
      return;
    }
    const normalizedOrig = clean.startsWith('http')
      ? clean
      : `https://nitroxxin.com/${clean.replace(/^\/+/, '')}`;
    const affUrl = buildAffiliateUrl(normalizedOrig);
    setGeneratedPreview(affUrl);

    const newLink = {
      id: `lnk-${Date.now()}`,
      title: deriveTitle(normalizedOrig),
      category: normalizedOrig.includes('/events/')
        ? 'Event & Tour'
        : normalizedOrig.includes('/marketplace')
          ? 'Marketplace'
          : 'Product / Page',
      originalUrl: normalizedOrig,
      affiliateUrl: affUrl,
      clicks: 0,
      orders: 0,
      conversion: 'New',
    };

    onAddLink(newLink);
    showToast('Tracked affiliate link generated!');
  };

  const handleShare = async (link) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nitroxxin • ${link.title}`,
          text: `Check out ${link.title} on Nitroxxin:`,
          url: link.affiliateUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    onCopy(link.affiliateUrl, `share-${link.id}`, 'Share link copied to clipboard!');
  };

  const scrollToGenerator = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page-enter">
      {/* Toolbar */}
      <div className="toolbar-row">
        <div>
          <h1 className="section-title" style={{ fontSize: 20 }}>
            Affiliate Links
          </h1>
          <p className="section-subtitle" style={{ margin: '2px 0 0' }}>
            Create, track &amp; share links tagged with ref={creatorId}
          </p>
        </div>

        <div className="toolbar-controls">
          <div className="search-field-wrap">
            <SearchIcon size={15} className="search-field-icon" />
            <input
              type="search"
              className="search-field-input"
              placeholder="Search links or URLs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <RippleButton className="btn btn-primary" onClick={scrollToGenerator}>
            <PlusIcon size={16} />
            <span>Generate New Link</span>
          </RippleButton>
        </div>
      </div>

      {/* Generator Section */}
      <section className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'var(--bg-subtle)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SparklesIcon size={16} />
            </span>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Paste any Nitroxxin URL</h2>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Automatically appends <code className="mono">?ref={creatorId}</code>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRESET_URLS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="btn btn-soft btn-sm"
                onClick={() => {
                  setRawInput(preset.url);
                  setGeneratedPreview(buildAffiliateUrl(preset.url));
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleGenerate} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            className="search-field-input"
            style={{ flex: '1 1 260px', paddingLeft: 12 }}
            placeholder="https://nitroxxin.com/events/leh-expedition"
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              setGeneratedPreview(buildAffiliateUrl(e.target.value));
            }}
            aria-label="Paste any Nitroxxin URL"
          />
          <RippleButton type="submit" className="btn btn-primary">
            <LinkIcon size={15} />
            <span>Generate Affiliate Link</span>
          </RippleButton>
        </form>

        {/* Live Output Example Box */}
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--bg-canvas)',
            border: '1px dashed var(--border-strong)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Tracked Output
            </div>
            <div className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {generatedPreview || `https://nitroxxin.com/events/leh-expedition?ref=${creatorId}`}
            </div>
          </div>
          <RippleButton
            className="btn btn-secondary btn-sm"
            onClick={() =>
              onCopy(
                generatedPreview || `https://nitroxxin.com/events/leh-expedition?ref=${creatorId}`,
                'gen-output',
                'Generated affiliate link copied!'
              )
            }
          >
            {copiedId === 'gen-output' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            <span>{copiedId === 'gen-output' ? 'Copied' : 'Copy Output'}</span>
          </RippleButton>
        </div>
      </section>

      {/* Saved Link Cards Header */}
      <div className="section-header-row">
        <h2 className="section-title">Your Affiliate Links ({filteredLinks.length})</h2>
        {links.length > 0 ? (
          <button
            type="button"
            onClick={onClearLinks}
            style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}
          >
            Preview Empty State
          </button>
        ) : (
          <button
            type="button"
            onClick={onRestoreLinks}
            style={{ fontSize: 12, color: 'var(--accent-blue)', fontWeight: 600 }}
          >
            Restore Links
          </button>
        )}
      </div>

      {filteredLinks.length === 0 ? (
        <GenerateFirstLinkIllustration
          actionLabel={links.length === 0 ? 'Restore Sample Links' : 'Clear Search'}
          onAction={() => {
            if (links.length === 0) onRestoreLinks();
            else setSearch('');
          }}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 12,
          }}
        >
          {filteredLinks.map((link) => {
            const isCopied = copiedId === link.id;
            return (
              <article
                key={link.id}
                className="card card-hover"
                style={{
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700 }}>{link.title}</h3>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {link.category}
                    </span>
                  </div>

                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Original URL</div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 11.5,
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {link.originalUrl}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: 9,
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-hairline)',
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Affiliate URL</div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {link.affiliateUrl}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginBottom: 12,
                    }}
                  >
                    <span>
                      <strong style={{ color: 'var(--text-primary)' }}>{link.clicks.toLocaleString('en-IN')}</strong> clicks
                    </span>
                    <span>
                      <strong style={{ color: 'var(--text-primary)' }}>{link.orders}</strong> orders
                    </span>
                    <span>
                      CVR <strong style={{ color: 'var(--accent-green)' }}>{link.conversion}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                    <RippleButton
                      className="btn btn-primary btn-sm"
                      onClick={() => onCopy(link.affiliateUrl, link.id, `Copied ${link.title} link!`)}
                    >
                      {isCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </RippleButton>
                    <RippleButton className="btn btn-secondary btn-sm" onClick={() => handleShare(link)}>
                      <ShareIcon size={14} />
                      <span>Share</span>
                    </RippleButton>
                    <RippleButton className="btn btn-secondary btn-sm" onClick={() => setQrLink(link)}>
                      <QrCodeIcon size={14} />
                      <span>QR Code</span>
                    </RippleButton>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <QrCodeModal
        link={qrLink}
        onClose={() => setQrLink(null)}
        onCopy={onCopy}
        onShare={handleShare}
        copiedId={copiedId}
      />
    </div>
  );
}
