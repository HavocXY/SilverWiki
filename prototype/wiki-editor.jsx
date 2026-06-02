// SilverWiki — New Entry editor with live auto-tagging
const AUTO_TAG_RULES = [
  { pattern: /schwei[ßs]/i, tag: 'Schweißen' },
  { pattern: /EN[\s-]?1090/i, tag: 'EN-1090' },
  { pattern: /DIN[\s-]?\d/i, tag: 'DIN-18800' },
  { pattern: /plasma/i, tag: 'Plasma' },
  { pattern: /S355|S235|S460/i, tag: 'S355' },
  { pattern: /montage|monteur/i, tag: 'Montage' },
  { pattern: /sicherheit|schutz|PSA/i, tag: 'Sicherheit' },
  { pattern: /CNC|schneid/i, tag: 'CNC' },
  { pattern: /qualit|prüf/i, tag: 'Qualität' },
  { pattern: /verzink/i, tag: 'Feuerverzinkung' },
  { pattern: /brand|feuer|R30|R60/i, tag: 'Brandschutz' },
  { pattern: /IPE|HEB|HEA/i, tag: 'IPE' },
  { pattern: /transport|logistik/i, tag: 'Transport' },
  { pattern: /norm|vorschrift|eurocode/i, tag: 'Normen' },
];

const NewEntryView = ({ onBack, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [autoTags, setAutoTags] = useState([]);
  const [manualTags, setManualTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const text = title + ' ' + content;
    const found = [];
    for (const rule of AUTO_TAG_RULES) {
      if (rule.pattern.test(text) && !found.includes(rule.tag)) {
        found.push(rule.tag);
      }
    }
    setAutoTags(found);
  }, [title, content]);

  const allTags = [...new Set([...autoTags, ...manualTags])];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave?.({ title, content, category, tags: allTags });
    }, 1200);
  };

  const addManualTag = () => {
    if (tagInput.trim() && !allTags.includes(tagInput.trim())) {
      setManualTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: 'var(--w-bg-subtle)', border: '1px solid var(--w-border)',
          color: 'var(--w-text-muted)', padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--w-bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--w-bg-subtle)'}
        >
          <Icon name="arrow_back" size={16} /> Zurück
        </button>
        <span style={{ color: 'var(--w-text-dimmest)', fontSize: 12 }}>·</span>
        <span style={{ color: 'var(--w-text-subtle)', fontSize: 12 }}>Neuer Eintrag</span>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24, color: 'var(--w-text)' }}>Neuen Eintrag erstellen</h1>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--w-text-muted)', marginBottom: 6, letterSpacing: '.02em' }}>Titel</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="z.B. Schweißnahtprüfung nach EN 1090-2"
          style={{
            width: '100%', padding: '12px 16px', background: 'var(--w-bg-input)',
            border: '1px solid var(--w-border-strong)', borderRadius: 12, color: 'var(--w-text)',
            fontSize: 16, fontWeight: 600, fontFamily: 'var(--sp-font-sans-app)',
            outline: 'none', transition: 'border .2s ease', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = WIKI_ACCENT + '88'}
          onBlur={e => e.target.style.borderColor = 'var(--w-border-strong)'}
        />
      </div>

      {/* Category */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--w-text-muted)', marginBottom: 6 }}>Kategorie</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WIKI_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
              padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: category === cat.id ? WIKI_ACCENT_MUTED : 'var(--w-bg-subtle)',
              color: category === cat.id ? WIKI_ACCENT : 'var(--w-text-muted)',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
              outline: category === cat.id ? `1px solid ${WIKI_ACCENT}55` : '1px solid var(--w-border-faint)',
              transition: 'all .2s ease',
            }}>
              <Icon name={cat.icon} size={15} color={category === cat.id ? WIKI_ACCENT : 'var(--w-text-subtle)'} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor toolbar */}
      <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--w-text-muted)' }}>Inhalt <span style={{ fontWeight: 400, color: 'var(--w-text-dimmest)' }}>(Markdown)</span></label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { label: 'Schreiben', active: !showPreview, onClick: () => setShowPreview(false) },
            { label: 'Vorschau', active: showPreview, onClick: () => setShowPreview(true) },
          ].map(b => (
            <button key={b.label} onClick={b.onClick} style={{
              padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: b.active ? 'var(--w-bg-hover)' : 'transparent',
              color: b.active ? 'var(--w-text)' : 'var(--w-text-subtle)', fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
            }}>{b.label}</button>
          ))}
        </div>
      </div>

      {/* Markdown toolbar */}
      {!showPreview && (
        <div style={{
          display: 'flex', gap: 2, padding: '6px 8px', marginBottom: -1,
          background: 'var(--w-bg-subtle)', borderRadius: '12px 12px 0 0',
          border: '1px solid var(--w-border)', borderBottom: 'none',
        }}>
          {[
            { icon: 'format_bold', md: '**' }, { icon: 'format_italic', md: '*' },
            { icon: 'format_list_bulleted', md: '- ' }, { icon: 'code', md: '`' },
            { icon: 'link', md: '[](url)' }, { icon: 'table_chart', md: '| | |' },
          ].map(b => (
            <button key={b.icon} style={{
              background: 'none', border: 'none', color: 'var(--w-text-subtle)', cursor: 'pointer',
              padding: '5px 8px', borderRadius: 6, display: 'flex',
              transition: 'color .15s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--w-text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--w-text-subtle)'}
            >
              <Icon name={b.icon} size={18} />
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      {!showPreview ? (
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder={"Schreibe hier deinen Artikel in Markdown…\n\n## Überschrift\n**Fetter Text** und normaler Text\n\n- Aufzählung\n- Noch ein Punkt"}
          style={{
            width: '100%', minHeight: 280, padding: '16px', background: 'var(--w-bg-input)',
            border: '1px solid var(--w-border)', borderRadius: '0 0 12px 12px',
            color: 'var(--w-text-secondary)', fontSize: 14, fontFamily: 'var(--sp-font-mono)',
            lineHeight: 1.7, resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = WIKI_ACCENT + '55'}
          onBlur={e => e.target.style.borderColor = 'var(--w-border)'}
        />
      ) : (
        <div style={{
          minHeight: 280, padding: 20, background: 'var(--w-bg-input)',
          border: '1px solid var(--w-border)', borderRadius: 12, color: 'var(--w-text-secondary)',
          fontSize: 14, lineHeight: 1.7,
        }}>
          {content ? <div dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^## (.+)/gm, '<h2 style="font-size:20px;font-weight:700;margin:16px 0 8px">$1</h2>').replace(/^# (.+)/gm, '<h1 style="font-size:24px;font-weight:700;margin:20px 0 8px">$1</h1>').replace(/^- (.+)/gm, '<div style="padding:2px 0 2px 12px">● $1</div>').replace(/\n/g, '<br/>') }} />
            : <span style={{ color: 'var(--w-text-dimmest)' }}>Vorschau erscheint hier…</span>}
        </div>
      )}

      {/* Auto-tags */}
      <div style={{
        marginTop: 16, padding: 14, background: 'var(--w-bg-tag-auto)',
        border: `1px solid ${autoTags.length > 0 ? WIKI_ACCENT + '33' : 'var(--w-border-faint)'}`,
        borderRadius: 12, transition: 'all .3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: autoTags.length > 0 ? 10 : 0 }}>
          <Icon name="auto_awesome" size={16} color={WIKI_ACCENT} />
          <span style={{ fontSize: 12, fontWeight: 600, color: autoTags.length > 0 ? WIKI_ACCENT : 'var(--w-text-subtle)' }}>
            {autoTags.length > 0 ? `${autoTags.length} Tags automatisch erkannt` : 'Auto-Tags erscheinen beim Tippen…'}
          </span>
        </div>
        {autoTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {autoTags.map((t, i) => (
              <span key={t} style={{
                fontFamily: 'var(--sp-font-mono)', fontSize: 11, fontWeight: 600,
                padding: '4px 10px', borderRadius: 6,
                background: WIKI_ACCENT_MUTED, border: `1px solid ${WIKI_ACCENT}44`,
                color: WIKI_ACCENT, animation: `wikiTagPop .3s ease ${i * 0.05}s both`,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <Icon name="auto_awesome" size={12} color={WIKI_ACCENT} />{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Manual tags */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addManualTag()}
            placeholder="Eigenen Tag hinzufügen…"
            style={{
              flex: 1, padding: '8px 12px', background: 'var(--w-bg-subtle)',
              border: '1px solid var(--w-border)', borderRadius: 10, color: 'var(--w-text-secondary)',
              fontSize: 12, fontFamily: 'var(--sp-font-sans-app)', outline: 'none',
            }}
          />
          <button onClick={addManualTag} style={{
            background: 'var(--w-bg-subtle)', border: '1px solid var(--w-border)',
            color: 'var(--w-text-muted)', padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
            fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Icon name="add" size={15} /> Tag
          </button>
        </div>
        {manualTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {manualTags.map(t => <Tag key={t} removable onRemove={() => setManualTags(prev => prev.filter(x => x !== t))}>{t}</Tag>)}
          </div>
        )}
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingBottom: 40 }}>
        <button onClick={handleSave} disabled={!title.trim()} style={{
          background: !title.trim() ? 'var(--w-text-dimmest)' : WIKI_ACCENT,
          color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 12,
          fontSize: 14, fontWeight: 600, cursor: !title.trim() ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
          transition: 'all .25s ease', opacity: saving ? 0.7 : 1,
        }}
          onMouseEnter={e => { if (title.trim()) { e.currentTarget.style.background = WIKI_ACCENT_HOVER; e.currentTarget.style.boxShadow = `0 0 20px ${WIKI_ACCENT_GLOW}`; }}}
          onMouseLeave={e => { if (title.trim()) { e.currentTarget.style.background = WIKI_ACCENT; e.currentTarget.style.boxShadow = 'none'; }}}
        >
          {saving ? <><Icon name="sync" size={17} style={{ animation: 'spin 1s linear infinite' }} /> Speichert…</> : <><Icon name="save" size={17} /> Veröffentlichen</>}
        </button>
        <button style={{
          background: 'var(--w-bg-subtle)', border: '1px solid var(--w-border)',
          color: 'var(--w-text-muted)', padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
          fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="draft" size={17} /> Als Entwurf
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { NewEntryView });
