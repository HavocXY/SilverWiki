// SteelPilot App — shared UI atoms
// Ported loosely from css/steelpilot-components.css + src/hub/ React code.
const { useState } = React;

const MSI = ({name, size=20, color, weight=400, fill=0, className=""}) => (
  <span className={"material-symbols-outlined " + className}
    style={{fontFamily:"'Material Symbols Outlined'", fontSize:size, color, fontVariationSettings:`'FILL' ${fill}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`, fontFeatureSettings:"'liga'", WebkitFontFeatureSettings:"'liga'", userSelect:"none", lineHeight:1}}>
    {name}
  </span>
);

const Brand = ({sub, size=15}) => (
  <div className="sp-brand" style={{fontSize:size}}>
    <span className="sp-brand-main">SteelPilot</span>
    {sub && <span className="sp-brand-sub">.{sub}</span>}
  </div>
);

const Button = ({variant="primary", icon, children, onClick, style={}}) => {
  const base = {
    border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, fontSize:14,
    padding:"10px 18px", borderRadius:8, display:"inline-flex", alignItems:"center", gap:8,
    transition:"all .25s cubic-bezier(.2,0,0,1)"
  };
  const variants = {
    primary: {background:"#6366f1", color:"#fff"},
    secondary: {background:"rgba(255,255,255,.06)", color:"#fff", border:"1px solid rgba(255,255,255,.12)"},
    ghost: {background:"transparent", color:"#cbd5e1"},
    danger: {background:"#ef4444", color:"#fff"},
  };
  return (
    <button style={{...base, ...variants[variant], ...style}} onClick={onClick}
      onMouseEnter={e=>{ if(variant==="primary"){e.currentTarget.style.background="#4f46e5";e.currentTarget.style.boxShadow="0 0 20px rgba(99,102,241,.4)";e.currentTarget.style.transform="translateY(-1px)"}}}
      onMouseLeave={e=>{ if(variant==="primary"){e.currentTarget.style.background="#6366f1";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}}
    >
      {icon && <MSI name={icon} size={18} />}
      {children}
    </button>
  );
};

const Chip = ({children, mono=true, tone="neutral"}) => {
  const tones = {
    neutral:{bg:"rgba(255,255,255,.05)",bd:"rgba(255,255,255,.1)",c:"#cbd5e1"},
    cut:{bg:"rgba(34,211,238,.15)",bd:"rgba(34,211,238,.3)",c:"#67e8f9"},
    success:{bg:"rgba(16,185,129,.15)",bd:"rgba(16,185,129,.3)",c:"#6ee7b7"},
    warn:{bg:"rgba(245,158,11,.15)",bd:"rgba(245,158,11,.3)",c:"#fcd34d"},
  };
  const t = tones[tone];
  return <span style={{fontFamily: mono?"'JetBrains Mono',monospace":"inherit", fontSize:11, padding:"3px 9px", borderRadius:6, background:t.bg, border:`1px solid ${t.bd}`, color:t.c, fontWeight:600}}>{children}</span>;
};

const Card = ({children, glass=false, style={}, className=""}) => (
  <div className={className} style={{
    padding:24, borderRadius:16,
    background: glass ? "rgba(30,41,59,.7)" : "#1e293b",
    border: glass ? "1px solid rgba(255,255,255,.12)" : "1px solid rgba(255,255,255,.08)",
    backdropFilter: glass ? "blur(16px)" : "none",
    ...style
  }}>{children}</div>
);

const Eyebrow = ({children, color="#94a3b8"}) => (
  <div style={{fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".18em", color}}>{children}</div>
);

Object.assign(window, { MSI, Brand, Button, Chip, Card, Eyebrow });
