// SilverWiki — Shared atoms, brand, helpers
const { useState, useRef, useEffect, useCallback, useMemo } = React;

// ── Brand ────────────────────────────────────────────────────────────────
const WIKI_ACCENT = '#f97316';
const WIKI_ACCENT_HOVER = '#ea580c';
const WIKI_ACCENT_MUTED = 'rgba(249,115,22,.15)';
const WIKI_ACCENT_GLOW = 'rgba(249,115,22,.30)';

const WikiBrand = ({ size = 18 }) => (
  <div style={{ fontFamily: "var(--sp-font-sans-app)", fontWeight: 700, fontSize: size, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 2, userSelect: 'none' }}>
    <span style={{ background: 'var(--w-brand-silver)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontWeight: 800 }}>Silver</span>
    <span style={{ color: WIKI_ACCENT, fontWeight: 800 }}>Wiki</span>
  </div>
);

// ── Icon helper ──────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color, weight = 400, fill = 0, style = {} }) => (
  <span className="material-symbols-outlined"
    style={{ fontSize: size, color, fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`, lineHeight: 1, userSelect: 'none', ...style }}>
    {name}
  </span>
);

// ── Tag chip ─────────────────────────────────────────────────────────────
const Tag = ({ children, active = false, onClick, removable = false, onRemove }) => (
  <span onClick={onClick} style={{
    fontFamily: "var(--sp-font-mono)", fontSize: 11, fontWeight: 600,
    padding: '4px 10px', borderRadius: 6, cursor: onClick ? 'pointer' : 'default',
    background: active ? WIKI_ACCENT_MUTED : 'var(--w-chip-bg)',
    border: `1px solid ${active ? WIKI_ACCENT + '55' : 'var(--w-chip-border)'}`,
    color: active ? WIKI_ACCENT : 'var(--w-chip-text)',
    transition: 'all .2s ease', display: 'inline-flex', alignItems: 'center', gap: 5,
    whiteSpace: 'nowrap',
  }}>
    {children}
    {removable && <span onClick={e => { e.stopPropagation(); onRemove?.(); }} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 13, lineHeight: 1 }}>✕</span>}
  </span>
);

// ── Glass card ───────────────────────────────────────────────────────────
const GlassCard = ({ children, style = {}, onClick, hover = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding: 20, borderRadius: 16,
        background: hovered && hover ? 'var(--w-bg-card-hover)' : 'var(--w-bg-card)',
        border: `1px solid ${hovered && hover ? 'var(--w-border-strong)' : 'var(--w-border)'}`,
        backdropFilter: 'blur(16px)',
        transform: hovered && hover ? 'translateY(-1px)' : 'none',
        transition: 'all .25s cubic-bezier(.2,0,0,1)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}>
      {children}
    </div>
  );
};

// ── Avatar ───────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 32, color }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const bg = color || `oklch(0.65 0.15 ${hue})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, color: '#fff', flexShrink: 0,
      letterSpacing: '-0.02em', boxShadow: 'var(--w-avatar-ring)',
    }}>{initials}</div>
  );
};

// ── Timestamp helper ─────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const map = { 'heute': 'heute', '1h': 'vor 1 Std.', '2h': 'vor 2 Std.', '3d': 'vor 3 Tagen', '1w': 'vor 1 Woche', '2w': 'vor 2 Wochen' };
  return map[dateStr] || dateStr;
};

Object.assign(window, { WIKI_ACCENT, WIKI_ACCENT_HOVER, WIKI_ACCENT_MUTED, WIKI_ACCENT_GLOW, WikiBrand, Icon, Tag, GlassCard, Avatar, timeAgo });
