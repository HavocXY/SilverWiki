// SilverWiki — Main app shell
const App = ({ tweaks, setTweak }) => {
  const [view, setView] = useState('home');
  const [activeArticle, setActiveArticle] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const isLight = tweaks.theme === 'light';

  // Set data-theme on html for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme || 'dark');
  }, [tweaks.theme]);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth <= 900) setSidebarOpen(false);
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const openArticle = (article) => {
    setActiveArticle(article);
    setView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {setView('home');setActiveArticle(null);};

  const handleSave = (entry) => {
    setToast('Eintrag „' + entry.title + '" wurde veröffentlicht.');
    setTimeout(() => setToast(null), 3000);
    goHome();
  };

  const filteredArticles = useMemo(() => {
    let arts = WIKI_ARTICLES;
    if (activeCategory) arts = arts.filter((a) => a.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      arts = arts.filter((a) =>
      a.title.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return arts;
  }, [activeCategory, searchQuery]);

  const popularTags = useMemo(() => {
    const counts = {};
    WIKI_ARTICLES.forEach((a) => a.tags.forEach((t) => {counts[t] = (counts[t] || 0) + 1;}));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map((e) => e[0]);
  }, []);

  const dense = tweaks.density === 'dense';

  return (
    <div style={{
      minHeight: '100vh',
      background: tweaks.bgStyle === 'gradient' ?
      `radial-gradient(ellipse 1400px 900px at 30% 5%, var(--w-grad-from), transparent), var(--w-bg)` :
      'var(--w-bg)',
      color: 'var(--w-text)', fontFamily: 'var(--sp-font-sans-app)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--w-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--w-grid-line) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse at top, #000 30%, transparent 70%)',
        opacity: tweaks.bgStyle === 'gradient' ? 1 : 0
      }} />
      {tweaks.bgStyle === 'gradient' &&
      <div style={{
        position: 'absolute', width: 500, height: 500, top: -120, right: '15%',
        background: `radial-gradient(circle, rgba(249,115,22,var(--w-glow-alpha)), transparent 70%)`,
        filter: 'blur(70px)', pointerEvents: 'none'
      }} />
      }

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20, height: 56,
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 0 12px',
        background: 'var(--w-bg-header)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--w-border-faint)', backgroundColor: "rgb(19, 37, 80)"

      }}>
        <button onClick={() => setSidebarOpen((p) => !p)} style={{
          background: 'none', border: 'none', color: 'var(--w-text-muted)', cursor: 'pointer',
          padding: 6, borderRadius: 8, display: 'flex'
        }}>
          <Icon name={sidebarOpen ? 'menu_open' : 'menu'} size={22} />
        </button>
        <WikiBrand size={17} />

        <div style={{ flex: 1, maxWidth: 420, margin: '0 auto' }} className="topbar-search">
          <SearchBar articles={WIKI_ARTICLES} onSelect={openArticle} variant="compact"
          onSearch={(q) => {if (view !== 'home') goHome();setSearchQuery(q);}} />
          
        </div>

        {/* Theme toggle */}
        <button onClick={() => setTweak('theme', isLight ? 'dark' : 'light')} style={{
          background: 'var(--w-bg-subtle)', border: '1px solid var(--w-border)',
          color: 'var(--w-text-muted)', cursor: 'pointer',
          width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .25s ease', flexShrink: 0
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--w-bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--w-bg-subtle)'}
        title={isLight ? 'Dunkler Modus' : 'Heller Modus'}>
          
          <Icon name={isLight ? 'dark_mode' : 'light_mode'} size={18} />
        </button>

        <button onClick={() => setView('newEntry')} style={{
          background: WIKI_ACCENT, color: '#fff', border: 'none',
          padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', transition: 'all .2s ease', whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {e.currentTarget.style.background = WIKI_ACCENT_HOVER;e.currentTarget.style.transform = 'translateY(-1px)';}}
        onMouseLeave={(e) => {e.currentTarget.style.background = WIKI_ACCENT;e.currentTarget.style.transform = 'none';}}>
          
          <Icon name="add" size={18} /> <span className="btn-label">Neuer Eintrag</span>
        </button>
        <div style={{
          width: 34, height: 34, borderRadius: 999,
          background: `linear-gradient(135deg, ${WIKI_ACCENT}, #ea580c)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0
        }}>SD</div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        <Sidebar
          categories={WIKI_CATEGORIES}
          activeCategory={activeCategory}
          onSelect={(cat) => {setActiveCategory(cat);if (view !== 'home') goHome();}}
          collapsed={!sidebarOpen}
          onToggle={() => setSidebarOpen((p) => !p)} />
        

        <main style={{ flex: 1, padding: view === 'home' ? '0' : '32px 0 40px', minWidth: 0 }}>
          {/* ── HOME VIEW ─────────────────────────────────────────────── */}
          {view === 'home' &&
          <div>
              {/* Hero search */}
              <div style={{
              padding: dense ? '36px 24px 28px' : '52px 24px 40px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center'
            }}>
                <div style={{
                fontSize: dense ? 28 : 36, fontWeight: 700, letterSpacing: '-0.025em',
                lineHeight: 1.15, marginBottom: 8, maxWidth: 600
              }}>
                  <span style={{ color: 'var(--w-text-heading)' }}>Alles Wissen.</span>{' '}
                  <span style={{ color: WIKI_ACCENT }}>Eine Suche.</span>
                </div>
                <p style={{ color: 'var(--w-text-muted)', fontSize: 14, marginBottom: dense ? 20 : 28, maxWidth: 480 }}>
                  Finde Arbeitsanweisungen, Normen und Materialdaten in Sekunden.
                </p>
                <SearchBar articles={WIKI_ARTICLES} onSelect={openArticle} variant="hero"
              onSearch={(q) => setSearchQuery(q)} />
              
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
                  <span style={{ fontSize: 11, color: 'var(--w-text-dimmest)', lineHeight: '24px' }}>Beliebt:</span>
                  {popularTags.map((t) =>
                <Tag key={t} onClick={() => setSearchQuery(t)} active={searchQuery === t}>{t}</Tag>
                )}
                </div>
              </div>

              {/* Articles grid */}
              <div style={{ padding: '0 20px 40px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16, padding: '0 4px'
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                    fontFamily: 'var(--sp-font-mono)', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--w-text-muted)'
                  }}>
                      {activeCategory ? WIKI_CATEGORIES.find((c) => c.id === activeCategory)?.name : searchQuery ? `Ergebnisse für „${searchQuery}"` : 'Kürzlich aktualisiert'}
                    </span>
                    <span style={{
                    fontFamily: 'var(--sp-font-mono)', fontSize: 10, color: 'var(--w-text-dimmest)',
                    background: 'var(--w-bg-subtle)', padding: '2px 7px', borderRadius: 4
                  }}>{filteredArticles.length}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[
                  { icon: 'grid_view', val: 'grid' },
                  { icon: 'view_list', val: 'list' }].
                  map((v) =>
                  <button key={v.val} style={{
                    background: tweaks.layout === v.val ? 'var(--w-bg-hover)' : 'none',
                    border: 'none', color: tweaks.layout === v.val ? 'var(--w-text-secondary)' : 'var(--w-text-dimmest)',
                    cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex'
                  }}
                  onClick={() => setTweak('layout', v.val)}>
                    
                        <Icon name={v.icon} size={18} />
                      </button>
                  )}
                  </div>
                </div>

                {filteredArticles.length === 0 ?
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--w-text-dimmest)' }}>
                    <Icon name="search_off" size={48} color="var(--w-text-dim)" style={{ display: 'block', margin: '0 auto 12px' }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--w-text-subtle)' }}>Keine Einträge gefunden</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Versuche einen anderen Suchbegriff oder erstelle einen neuen Eintrag.</div>
                  </div> :

              <div style={{
                display: 'grid',
                gridTemplateColumns: tweaks.layout === 'grid' ? 'repeat(auto-fill, minmax(340px, 1fr))' : '1fr',
                gap: dense ? 10 : 14
              }}>
                    {filteredArticles.map((a) =>
                <ArticleCard key={a.id} article={a} onClick={openArticle} compact={tweaks.layout === 'list'} />
                )}
                  </div>
              }

                {/* Stats footer */}
                <div style={{
                marginTop: 32, padding: '16px 0', borderTop: '1px solid var(--w-border-separator)',
                display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap'
              }}>
                  {[
                { icon: 'article', label: 'Einträge', value: '101' },
                { icon: 'sell', label: 'Tags', value: WIKI_TAGS.length.toString() },
                { icon: 'group', label: 'Autoren', value: '8' },
                { icon: 'update', label: 'Letzte Änderung', value: 'vor 12 Min.' }].
                map((s) =>
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--w-text-subtle)' }}>
                      <Icon name={s.icon} size={15} color="var(--w-text-dimmest)" />
                      <span style={{ color: 'var(--w-text-muted)', fontWeight: 600 }}>{s.value}</span> {s.label}
                    </div>
                )}
                </div>
              </div>
            </div>
          }

          {view === 'article' && activeArticle &&
          <ArticleView article={activeArticle} onBack={goHome} />
          }

          {view === 'newEntry' &&
          <NewEntryView onBack={goHome} onSave={handleSave} />
          }
        </main>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast &&
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: 'var(--w-bg-card-hover)', backdropFilter: 'blur(16px)',
        border: `1px solid ${WIKI_ACCENT}44`, borderRadius: 14, padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 10, zIndex: 70,
        boxShadow: `var(--w-shadow-toast), 0 0 20px ${WIKI_ACCENT_GLOW}`,
        animation: 'wikiSlideUp .3s ease'
      }}>
          <Icon name="check_circle" size={20} color="#10b981" />
          <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{toast}</span>
        </div>
      }
    </div>);

};

Object.assign(window, { App });