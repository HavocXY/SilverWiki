// SilverWiki — Search bar with live results
const SearchBar = ({ onSearch, onSelect, articles, variant = 'hero' }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [query, articles]);

  const showDropdown = focused && query.length > 0;
  const isHero = variant === 'hero';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: isHero ? 680 : '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: isHero ? 'var(--w-bg-glass)' : 'var(--w-bg-input)',
        border: `1px solid ${focused ? WIKI_ACCENT + '88' : 'var(--w-border-strong)'}`,
        borderRadius: isHero ? 16 : 12,
        padding: isHero ? '16px 20px' : '10px 14px',
        backdropFilter: 'blur(16px)',
        boxShadow: focused ? `0 0 24px ${WIKI_ACCENT_GLOW}` : 'none',
        transition: 'all .25s cubic-bezier(.2,0,0,1)',
      }}>
        <Icon name="search" size={isHero ? 24 : 20} color={focused ? WIKI_ACCENT : 'var(--w-text-subtle)'} />
        <input ref={inputRef} value={query}
          onChange={e => { setQuery(e.target.value); onSearch?.(e.target.value); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Suche nach Artikeln, Normen, Anleitungen…"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--w-text)', fontSize: isHero ? 17 : 14,
            fontFamily: 'var(--sp-font-sans-app)',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-text-subtle)', padding: 2, display: 'flex',
          }}>
            <Icon name="close" size={18} />
          </button>
        )}
        <div style={{
          fontFamily: 'var(--sp-font-mono)', fontSize: 10, color: 'var(--w-text-dimmest)',
          background: 'var(--w-bg-subtle)', padding: '4px 8px', borderRadius: 6,
          border: '1px solid var(--w-border-faint)', display: isHero ? 'block' : 'none',
        }}>⌘K</div>
      </div>

      {/* Live results dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
          background: 'var(--w-bg-card-hover)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--w-border-strong)', borderRadius: 14,
          boxShadow: 'var(--w-shadow-dropdown)', zIndex: 50,
          overflow: 'hidden', animation: 'wikiDropIn .2s ease',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--w-text-subtle)', fontSize: 13 }}>
              <Icon name="search_off" size={28} color="var(--w-text-dimmest)" style={{ display: 'block', margin: '0 auto 8px' }} />
              Keine Treffer für „{query}"
            </div>
          ) : (
            results.map((a, i) => (
              <button key={a.id} onClick={() => { onSelect?.(a); setQuery(''); }}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none',
                  padding: '12px 16px', cursor: 'pointer', color: 'var(--w-text)', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  borderTop: i > 0 ? '1px solid var(--w-border-separator)' : 'none',
                  transition: 'background .15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--w-bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Icon name="article" size={18} color={WIKI_ACCENT} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--w-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.excerpt}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {a.tags.slice(0, 3).map(t => (
                      <span key={t} style={{
                        fontFamily: 'var(--sp-font-mono)', fontSize: 9, padding: '2px 6px', borderRadius: 4,
                        background: 'var(--w-chip-bg)', color: 'var(--w-text-muted)',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))
          )}
          {results.length > 0 && (
            <div style={{
              padding: '10px 16px', borderTop: '1px solid var(--w-border-faint)',
              display: 'flex', alignItems: 'center', gap: 6, color: 'var(--w-text-subtle)', fontSize: 11,
            }}>
              <Icon name="keyboard_return" size={14} /> Enter zum Öffnen · <span style={{ fontFamily: 'var(--sp-font-mono)' }}>ESC</span> zum Schließen
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { SearchBar });
