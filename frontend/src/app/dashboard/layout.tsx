'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '◉' },
  { href: '/dashboard/students', label: 'Students', icon: '◈' },
  { href: '/dashboard/predict', label: 'Predict', icon: '◆' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: '◎', badge: 18 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400;1,700&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --black:  #050505;
          --black2: #0a0a0a;
          --black3: #111111;
          --black4: #161616;
          --white:  #ffffff;
          --w90: rgba(255,255,255,0.9);
          --w60: rgba(255,255,255,0.6);
          --w40: rgba(255,255,255,0.4);
          --w20: rgba(255,255,255,0.2);
          --w10: rgba(255,255,255,0.1);
          --w06: rgba(255,255,255,0.06);
          --w03: rgba(255,255,255,0.03);
          --chrome: #c8d8e8;
          --chrome2: #7a9ab8;
          --border: rgba(255,255,255,0.07);
          --border2: rgba(255,255,255,0.12);
          --red:    #ef4444;
          --orange: #f97316;
          --yellow: #eab308;
          --green:  #22c55e;
          --serif:  'Playfair Display', Georgia, serif;
          --sans:   'Outfit', system-ui, sans-serif;
          --mono:   'JetBrains Mono', monospace;
          --sidebar-w: 220px;
        }
        html, body { height: 100%; background: var(--black); color: var(--white); font-family: var(--sans); font-weight: 300; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        ::selection { background: rgba(200,216,232,0.15); }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: var(--black); }
        ::-webkit-scrollbar-thumb { background: var(--w10); border-radius: 2px; }

        /* grain */
        body::before { content:''; position:fixed; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events:none; z-index:9999; opacity:0.5; }

        /* ── Layout shell ── */
        .dash-shell { display:flex; height:100vh; overflow:hidden; }

        /* ── Sidebar ── */
        .sidebar {
          width: var(--sidebar-w); flex-shrink:0;
          display:flex; flex-direction:column;
          background: var(--black2);
          border-right: 1px solid var(--border);
          overflow-y:auto; overflow-x:hidden;
          transition: transform 0.3s ease;
          z-index: 50;
        }
        .sidebar-top { padding: 28px 20px 24px; border-bottom: 1px solid var(--border); }
        .sidebar-logo { font-family:var(--serif); font-size:1.0625rem; font-weight:700; color:var(--white); text-decoration:none; display:flex; align-items:center; gap:10px; }
        .sidebar-logo-dot { width:7px; height:7px; border-radius:50%; background:var(--chrome); box-shadow:0 0 10px var(--chrome),0 0 20px rgba(200,216,232,0.3); flex-shrink:0; }
        .sidebar-sub { font-family:var(--mono); font-size:0.5625rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--chrome2); margin-top:4px; padding-left:17px; }

        .sidebar-nav { padding: 20px 12px; flex:1; }
        .nav-section-label { font-family:var(--mono); font-size:0.5rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--w20); padding: 0 8px; margin-bottom:8px; }

        .nav-item {
          display:flex; align-items:center; gap:10px;
          padding: 9px 10px; border-radius:2px; margin-bottom:2px;
          font-size:0.875rem; font-weight:400; color:var(--w60);
          text-decoration:none; transition:all 0.15s;
          position:relative; border:1px solid transparent;
        }
        .nav-item:hover { color:var(--white); background:var(--w06); }
        .nav-item.active {
          color:var(--white); background:var(--w06);
          border-color:var(--border2);
        }
        .nav-item.active::before { content:''; position:absolute; left:0; top:6px; bottom:6px; width:2px; background:var(--white); border-radius:0 1px 1px 0; }
        .nav-icon { font-size:0.75rem; color:var(--w40); width:16px; text-align:center; flex-shrink:0; }
        .nav-item.active .nav-icon { color:var(--white); }
        .nav-badge { margin-left:auto; font-family:var(--mono); font-size:0.5rem; letter-spacing:0.05em; padding:2px 6px; background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.2); border-radius:2px; }

        .sidebar-bottom { padding:16px 12px 20px; border-top:1px solid var(--border); }
        .status-pill { display:flex; align-items:center; gap:8px; padding:10px 12px; background:var(--w03); border:1px solid var(--border); border-radius:2px; margin-bottom:8px; }
        .status-dot { width:6px; height:6px; border-radius:50%; background:var(--green); box-shadow:0 0 6px var(--green); flex-shrink:0; animation:pulse-dot 2s ease infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .status-text { font-family:var(--mono); font-size:0.5625rem; letter-spacing:0.08em; color:var(--w60); }
        .back-link { display:flex; align-items:center; gap:6px; font-family:var(--mono); font-size:0.5625rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--w20); text-decoration:none; padding:8px 12px; transition:color 0.15s; }
        .back-link:hover { color:var(--w60); }

        /* ── Mobile header ── */
        .mobile-header {
          display:none; position:fixed; top:0; left:0; right:0; z-index:60;
          align-items:center; justify-content:space-between;
          padding:16px 20px;
          background:rgba(5,5,5,0.95); backdrop-filter:blur(20px);
          border-bottom:1px solid var(--border);
        }
        .mobile-logo { font-family:var(--serif); font-size:1rem; font-weight:700; color:var(--white); text-decoration:none; display:flex; align-items:center; gap:8px; }
        .mobile-logo-dot { width:6px; height:6px; border-radius:50%; background:var(--chrome); box-shadow:0 0 8px var(--chrome); }
        .hamburger { background:none; border:1px solid var(--border); color:var(--w60); width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; border-radius:2px; font-size:1rem; transition:all 0.15s; }
        .hamburger:hover { color:var(--white); border-color:var(--border2); }

        /* Mobile overlay */
        .mobile-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:49; backdrop-filter:blur(4px); }

        /* ── Main content ── */
        .main-content { flex:1; overflow-y:auto; overflow-x:hidden; position:relative; }

        /* ── Shared card ── */
        .card { background:var(--black2); border:1px solid var(--border); border-radius:2px; }
        .card-hover { transition:background 0.2s, border-color 0.2s; }
        .card-hover:hover { background:var(--black3); border-color:var(--border2); }

        /* ── Typography ── */
        .page-title { font-family:var(--serif); font-size:clamp(1.5rem,3vw,2rem); font-weight:700; letter-spacing:-0.02em; color:var(--white); line-height:1.1; }
        .page-sub { font-size:0.8125rem; font-weight:300; color:var(--w60); margin-top:4px; }
        .section-mono { font-family:var(--mono); font-size:0.5625rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--chrome2); }

        /* ── KPI card ── */
        .kpi-card { padding:20px; }
        .kpi-label { font-family:var(--mono); font-size:0.5rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--w40); margin-bottom:12px; }
        .kpi-value { font-family:var(--serif); font-size:2.25rem; font-weight:700; letter-spacing:-0.03em; line-height:1; }
        .kpi-sub { font-family:var(--mono); font-size:0.5625rem; letter-spacing:0.08em; color:var(--w40); margin-top:8px; }

        /* ── Risk badge ── */
        .rbadge { font-family:var(--mono); font-size:0.5rem; letter-spacing:0.12em; text-transform:uppercase; padding:3px 8px; border-radius:2px; display:inline-flex; align-items:center; gap:4px; border:1px solid; }
        .rbadge-critical { background:rgba(239,68,68,0.1); color:#f87171; border-color:rgba(239,68,68,0.25); }
        .rbadge-high { background:rgba(249,115,22,0.1); color:#fb923c; border-color:rgba(249,115,22,0.25); }
        .rbadge-medium { background:rgba(234,179,8,0.1); color:#facc15; border-color:rgba(234,179,8,0.25); }
        .rbadge-low { background:rgba(34,197,94,0.1); color:#4ade80; border-color:rgba(34,197,94,0.25); }

        /* ── Risk bar ── */
        .rbar-bg { height:2px; background:var(--w06); border-radius:1px; }
        .rbar-fill { height:100%; border-radius:1px; transition:width 0.8s ease; }

        /* ── Table ── */
        .data-table { width:100%; border-collapse:collapse; }
        .data-table th { font-family:var(--mono); font-size:0.5rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--w30,rgba(255,255,255,0.3)); padding:10px 16px; border-bottom:1px solid var(--border); text-align:left; white-space:nowrap; }
        .data-table td { padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.03); vertical-align:middle; }
        .data-table tr:last-child td { border-bottom:none; }
        .data-table tbody tr { transition:background 0.12s; cursor:pointer; }
        .data-table tbody tr:hover { background:var(--w03); }

        /* ── Recharts override ── */
        .recharts-tooltip-wrapper { outline:none !important; }
        .custom-tooltip { background:var(--black3) !important; border:1px solid var(--border2) !important; border-radius:2px; padding:8px 12px; font-family:var(--mono); font-size:0.625rem; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .sidebar { position:fixed; top:0; bottom:0; left:0; transform:translateX(-100%); }
          .sidebar.open { transform:translateX(0); box-shadow:20px 0 60px rgba(0,0,0,0.8); }
          .mobile-header { display:flex; }
          .mobile-overlay.open { display:block; }
          .main-content { padding-top:60px; }
          .dash-shell { display:block; }
        }
      `}</style>

      <div className="dash-shell">
        {/* Sidebar */}
        <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
          <div className="sidebar-top">
            <Link href="/" className="sidebar-logo" onClick={() => setMobileOpen(false)}>
              <span className="sidebar-logo-dot" />
              SentinelEdu
            </Link>
            <div className="sidebar-sub">Command Center</div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label" style={{ marginBottom: 12 }}>Navigation</div>
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${pathname === item.href ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </Link>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="status-pill">
              <div className="status-dot" />
              <div>
                <div className="status-text">System Online</div>
                <div className="status-text" style={{ color: 'var(--w40)', marginTop: 2 }}>Model v1.0 · 150 students</div>
              </div>
            </div>
            <Link href="/" className="back-link" onClick={() => setMobileOpen(false)}>
              ← Back to Home
            </Link>
          </div>
        </aside>

        {/* Mobile overlay */}
        <div className={`mobile-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />

        {/* Mobile header */}
        <header className="mobile-header">
          <Link href="/" className="mobile-logo">
            <span className="mobile-logo-dot" />
            SentinelEdu
          </Link>
          <button className="hamburger" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </header>

        {/* Main */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  )
}