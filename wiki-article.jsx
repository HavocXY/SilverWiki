// SilverWiki — Article view + Article cards
// ── Article Card (for lists) ────────────────────────────────────────────
const ArticleCard = ({ article, onClick, compact = false }) => {
  const cat = WIKI_CATEGORIES.find(c => c.id === article.category);
  return (
    <GlassCard hover onClick={() => onClick?.(article)} style={{ padding: compact ? 14 : 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: WIKI_ACCENT_MUTED,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={cat?.icon || 'article'} size={20} color={WIKI_ACCENT} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: compact ? 14 : 15, fontWeight: 600, marginBottom: 4, lineHeight: 1.35, color: 'var(--w-text)' }}>{article.title}</div>
          {!compact && <div style={{ fontSize: 13, color: 'var(--w-text-muted)', lineHeight: 1.5, marginBottom: 10 }}>{article.excerpt}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {article.tags.slice(0, compact ? 2 : 4).map(t => <Tag key={t}>{t}</Tag>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: compact ? 8 : 10, fontSize: 11, color: 'var(--w-text-subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Avatar name={article.author} size={18} /> {article.author}
            </span>
            <span>·</span>
            <span>{timeAgo(article.updated)}</span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icon name="visibility" size={13} color="var(--w-text-subtle)" /> {article.views}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// ── Full Article View ────────────────────────────────────────────────────
const ArticleView = ({ article, onBack }) => {
  const cat = WIKI_CATEGORIES.find(c => c.id === article.category);

  const renderMarkdown = (md) => {
    const lines = md.split('\n');
    const html = [];
    let inTable = false, tableRows = [];

    const flushTable = () => {
      if (tableRows.length === 0) return;
      const header = tableRows[0];
      const body = tableRows.slice(2);
      html.push(`<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px"><thead><tr>${header.split('|').filter(c=>c.trim()).map(c=>`<th style="text-align:left;padding:10px 14px;border-bottom:2px solid var(--w-border-strong);color:var(--w-text-muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.08em">${c.trim()}</th>`).join('')}</tr></thead><tbody>${body.map((r,i)=>`<tr style="border-bottom:1px solid var(--w-border-separator)"><td style="padding:10px 14px;color:var(--w-text-secondary)">${r.split('|').filter(c=>c.trim()).map(c=>`</td><td style="padding:10px 14px;color:var(--w-text-secondary)">${c.trim()}`).join('').slice(53)}</td></tr>`).join('')}</tbody></table>`);
      tableRows = [];
      inTable = false;
    };

    for (const line of lines) {
      if (line.startsWith('|')) { inTable = true; tableRows.push(line); continue; }
      if (inTable) flushTable();
      if (line.startsWith('# ')) html.push(`<h1 style="font-size:28px;font-weight:700;margin:32px 0 12px;letter-spacing:-0.02em;color:var(--w-text)">${line.slice(2)}</h1>`);
      else if (line.startsWith('## ')) html.push(`<h2 style="font-size:20px;font-weight:700;margin:28px 0 10px;letter-spacing:-0.01em;color:var(--w-text)">${line.slice(3)}</h2>`);
      else if (line.startsWith('> ')) html.push(`<blockquote style="border-left:3px solid ${WIKI_ACCENT};padding:12px 16px;margin:16px 0;background:var(--w-bg-tag-auto);border-radius:0 8px 8px 0;color:var(--w-text-secondary);font-size:13px;line-height:1.7">${line.slice(2).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}</blockquote>`);
      else if (line.startsWith('- ')) html.push(`<div style="display:flex;gap:8px;padding:3px 0 3px 8px;font-size:14px;color:var(--w-text-secondary);line-height:1.6"><span style="color:${WIKI_ACCENT}">●</span><span>${line.slice(2).replace(/\*\*(.+?)\*\*/g,'<strong style="color:var(--w-text)">$1</strong>')}</span></div>`);
      else if (line.startsWith('---')) html.push(`<hr style="border:none;border-top:1px solid var(--w-border);margin:24px 0"/>`);
      else if (line.startsWith('*') && line.endsWith('*')) html.push(`<p style="font-size:12px;color:var(--w-text-subtle);font-style:italic;margin:8px 0">${line.replace(/\*/g,'')}</p>`);
      else if (line.trim()) html.push(`<p style="font-size:14px;color:var(--w-text-secondary);line-height:1.7;margin:6px 0">${line.replace(/\*\*(.+?)\*\*/g,'<strong style="color:var(--w-text)">$1</strong>')}</p>`);
    }
    if (inTable) flushTable();
    return html.join('');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
      {/* Back + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: 'var(--w-bg-subtle)', border: '1px solid var(--w-border)',
          color: 'var(--w-text-muted)', padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
          fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
          transition: 'all .2s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--w-bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--w-bg-subtle)'}
        >
          <Icon name="arrow_back" size={16} /> Zurück
        </button>
        <span style={{ color: 'var(--w-text-dimmest)', fontSize: 12 }}>·</span>
        <span style={{ color: 'var(--w-text-subtle)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name={cat?.icon || 'article'} size={14} color="var(--w-text-subtle)" /> {cat?.name}
        </span>
      </div>

      {/* Article header */}
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 16, color: 'var(--w-text)' }}>{article.title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={article.author} size={28} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--w-text)' }}>{article.author}</div>
            <div style={{ fontSize: 11, color: 'var(--w-text-subtle)' }}>Aktualisiert {timeAgo(article.updated)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--w-text-subtle)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="visibility" size={14} /> {article.views} Aufrufe</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="history" size={14} /> Version {article.versions}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
        {article.tags.map(t => <Tag key={t} active>{t}</Tag>)}
      </div>

      {/* Action bar */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 28, padding: '12px 0',
        borderTop: '1px solid var(--w-border-faint)', borderBottom: '1px solid var(--w-border-faint)',
        flexWrap: 'wrap',
      }}>
        <button style={{
          background: WIKI_ACCENT, color: '#fff', border: 'none', padding: '8px 16px',
          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
          transition: 'all .2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = WIKI_ACCENT_HOVER; e.currentTarget.style.boxShadow = `0 0 20px ${WIKI_ACCENT_GLOW}`; }}
          onMouseLeave={e => { e.currentTarget.style.background = WIKI_ACCENT; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Icon name="edit" size={16} /> Bearbeiten
        </button>
        {[
          { icon: 'history', label: 'Versionen' },
          { icon: 'bookmark_add', label: 'Merken' },
          { icon: 'share', label: 'Teilen' },
          { icon: 'print', label: 'Drucken' },
        ].map(a => (
          <button key={a.icon} style={{
            background: 'var(--w-bg-subtle)', border: '1px solid var(--w-border)',
            color: 'var(--w-text-muted)', padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
            fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
          }}>
            <Icon name={a.icon} size={15} /> <span className="action-label">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Rendered content */}
      <div className="article-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(SAMPLE_ARTICLE_MD) }} />
    </div>
  );
};

Object.assign(window, { ArticleCard, ArticleView });
