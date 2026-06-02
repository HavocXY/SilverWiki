// SilverWiki — Sidebar component
const Sidebar = ({ categories, activeCategory, onSelect, collapsed, onToggle }) => {
  const sidebarWidth = collapsed ? 0 : 260;

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div onClick={onToggle} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 29,
          display: 'none',
        }} className="sidebar-overlay" />
      )}
      <aside style={{
        width: sidebarWidth, minWidth: sidebarWidth, height: '100%',
        background: 'var(--w-bg-sidebar)', backdropFilter: 'blur(16px)',
        borderRight: collapsed ? 'none' : '1px solid var(--w-border)',
        transition: 'all .3s cubic-bezier(.2,0,0,1)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 30, flexShrink: 0,
      }} className="wiki-sidebar">
        <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "var(--sp-font-mono)", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--w-text-muted)' }}>
            Kategorien
          </span>
          <button onClick={onToggle} style={{
            background: 'none', border: 'none', color: 'var(--w-text-subtle)', cursor: 'pointer',
            padding: 4, borderRadius: 6, display: 'flex',
          }}>
            <Icon name="chevron_left" size={18} />
          </button>
        </div>

        <div style={{ padding: '0 8px', flex: 1, overflowY: 'auto' }}>
          {/* All articles */}
          <button onClick={() => onSelect(null)} style={{
            width: '100%', textAlign: 'left', background: !activeCategory ? WIKI_ACCENT_MUTED : 'transparent',
            border: 'none', color: !activeCategory ? WIKI_ACCENT : 'var(--w-text-secondary)',
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit',
            transition: 'background .2s ease', marginBottom: 2,
          }}>
            <Icon name="auto_stories" size={18} color={!activeCategory ? WIKI_ACCENT : 'var(--w-text-muted)'} />
            Alle Einträge
          </button>

          {categories.map(cat => (
            <button key={cat.id} onClick={() => onSelect(cat.id)} style={{
              width: '100%', textAlign: 'left',
              background: activeCategory === cat.id ? WIKI_ACCENT_MUTED : 'transparent',
              border: 'none',
              color: activeCategory === cat.id ? WIKI_ACCENT : 'var(--w-text-secondary)',
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
              fontWeight: activeCategory === cat.id ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit',
              transition: 'background .2s ease', marginBottom: 2,
            }}>
              <Icon name={cat.icon} size={18} color={activeCategory === cat.id ? WIKI_ACCENT : 'var(--w-text-muted)'} />
              <span style={{ flex: 1 }}>{cat.name}</span>
              <span style={{
                fontFamily: "var(--sp-font-mono)", fontSize: 10, color: 'var(--w-text-subtle)',
                background: 'var(--w-bg-subtle)', padding: '2px 6px', borderRadius: 4,
              }}>{cat.count}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: 12, borderTop: '1px solid var(--w-border-faint)' }}>
          <button style={{
            width: '100%', background: 'var(--w-bg-subtle)', border: '1px solid var(--w-border)',
            color: 'var(--w-text-muted)', padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
            fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
          }}>
            <Icon name="settings" size={16} color="var(--w-text-subtle)" /> Einstellungen
          </button>
        </div>
      </aside>
    </>
  );
};

Object.assign(window, { Sidebar });
