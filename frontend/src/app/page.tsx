'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ─── Animated counter ─── */
function useCountUp(target: number, duration = 2000, triggered = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!triggered) return
    let start: number
    const raf = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 4)
      setVal(Math.floor(ease * target))
      if (p < 1) requestAnimationFrame(raf)
      else setVal(target)
    }
    requestAnimationFrame(raf)
  }, [target, duration, triggered])
  return val
}

function Stat({ n, suffix, label, delay }: { n: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  const val = useCountUp(n, 1800, on)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true) }, { threshold: 0.4 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="stat-item" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-number">{val}<span className="stat-suffix">{suffix}</span></div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

const FEATURES = [
  { icon: '◈', title: 'Ensemble Prediction', body: 'Random Forest + XGBoost voting classifier achieves 85%+ accuracy across three outcome classes with real-time inference under 50ms.', tag: 'ML ENGINE' },
  { icon: '◉', title: 'SHAP Explainability', body: 'Every prediction surfaces the top 3 causal risk factors in plain language — not a black box, but a transparent decision trail counselors can act on.', tag: 'XAI' },
  { icon: '◆', title: 'Automated Alerting', body: 'Students crossing the 0.80 risk threshold are instantly flagged Critical and routed to the intervention queue — zero manual monitoring required.', tag: 'ALERTS' },
  { icon: '◎', title: 'Success Pathways', body: 'AI-generated per-student action plans: financial aid referrals, tutoring schedules, counselor assignments — tailored to each risk profile.', tag: 'INTERVENTIONS' },
  { icon: '▣', title: 'Command Center', body: 'Institutional health gauges, 12-month dropout trend charts, program-level risk breakdowns, and an early warning table — all in one dashboard.', tag: 'ANALYTICS' },
  { icon: '⬡', title: 'One-Command Deploy', body: 'Docker Compose orchestrates the entire stack — ML engine, FastAPI backend, Next.js frontend, and PostgreSQL — live in under five minutes.', tag: 'DEVOPS' },
]

const STEPS = [
  { n: '01', title: 'Ingest', body: 'Student records, GPA, attendance, and financial data enter the engine.' },
  { n: '02', title: 'Classify', body: 'Ensemble model outputs Dropout / Enrolled / Graduate probabilities.' },
  { n: '03', title: 'Explain', body: 'SHAP isolates the top 3 causal risk factors per student.' },
  { n: '04', title: 'Act', body: 'Counselors receive targeted pathways and automated critical alerts.' },
]

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const h = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --black: #050505;
          --black2: #0a0a0a;
          --black3: #111111;
          --white: #ffffff;
          --white90: rgba(255,255,255,0.9);
          --white60: rgba(255,255,255,0.6);
          --white30: rgba(255,255,255,0.3);
          --white10: rgba(255,255,255,0.1);
          --white05: rgba(255,255,255,0.05);
          --white03: rgba(255,255,255,0.03);
          --chrome: #c8d8e8;
          --chrome2: #8faabf;
          --accent: #e8f4ff;
          --red: #ef4444;
          --orange: #f97316;
          --yellow: #eab308;
          --green: #22c55e;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'Outfit', system-ui, sans-serif;
          --mono: 'JetBrains Mono', monospace;
          --border: rgba(255,255,255,0.08);
          --border-hover: rgba(255,255,255,0.18);
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--black);
          color: var(--white);
          font-family: var(--sans);
          font-weight: 300;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        ::selection { background: rgba(200,216,232,0.2); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--black); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

        /* ── Grain overlay ── */
        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.6;
        }

        /* ── Nav ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 48px;
          transition: background 0.4s, border-color 0.4s;
        }
        .nav.scrolled {
          background: rgba(5,5,5,0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .logo {
          font-family: var(--serif);
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--white);
          text-decoration: none;
          display: flex; align-items: center; gap: 10px;
        }
        .logo-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--chrome);
          box-shadow: 0 0 12px var(--chrome), 0 0 24px rgba(200,216,232,0.4);
          flex-shrink: 0;
        }
        .nav-links { display: flex; align-items: center; gap: 40px; }
        .nav-links a {
          font-size: 0.8125rem; font-weight: 400; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--white60);
          text-decoration: none; transition: color 0.2s;
        }
        .nav-links a:hover { color: var(--white); }
        .nav-cta {
          font-family: var(--sans); font-size: 0.8125rem; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--black) !important;
          background: var(--white);
          padding: 10px 24px; border-radius: 2px;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s;
        }
        .nav-cta:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ── Hero ── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 48px 80px;
          position: relative; text-align: center;
          overflow: hidden;
        }

        /* Shiny radial bg */
        .hero::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,216,232,0.06) 0%, transparent 70%),
                      radial-gradient(ellipse 40% 40% at 80% 80%, rgba(200,216,232,0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Horizontal rule lines */
        .hero-line {
          position: absolute;
          left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }

        .eyebrow {
          font-family: var(--mono);
          font-size: 0.6875rem; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--chrome2);
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 32px;
          position: relative; z-index: 1;
          animation: fadeUp 0.8s ease both;
        }
        .eyebrow::before, .eyebrow::after {
          content: ''; flex: 1; max-width: 60px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--chrome2));
        }
        .eyebrow::after { transform: scaleX(-1); }

        .hero-title {
          font-family: var(--serif);
          font-size: clamp(3.5rem, 9vw, 8rem);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: var(--white);
          position: relative; z-index: 1;
          animation: fadeUp 0.8s 0.1s ease both;
          margin-bottom: 8px;
        }
        .hero-title em {
          font-style: italic;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.7);
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(200,216,232,0.6));
          -webkit-background-clip: text;
          background-clip: text;
        }

        .hero-sub {
          font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 300; line-height: 1.7;
          color: var(--white60);
          max-width: 560px; margin: 32px auto 48px;
          position: relative; z-index: 1;
          animation: fadeUp 0.8s 0.2s ease both;
        }

        .hero-actions {
          display: flex; align-items: center; gap: 20px;
          justify-content: center;
          position: relative; z-index: 1;
          animation: fadeUp 0.8s 0.3s ease both;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--sans); font-size: 0.875rem; font-weight: 500;
          letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--black); background: var(--white);
          padding: 14px 32px; border-radius: 2px;
          text-decoration: none;
          transition: transform 0.25s, box-shadow 0.25s;
          box-shadow: 0 0 40px rgba(255,255,255,0.12);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(255,255,255,0.2);
        }
        .btn-primary .arrow {
          transition: transform 0.25s;
        }
        .btn-primary:hover .arrow { transform: translateX(4px); }

        .btn-ghost {
          font-family: var(--sans); font-size: 0.875rem; font-weight: 400;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--white60); background: transparent;
          padding: 14px 32px; border: 1px solid var(--border);
          border-radius: 2px; text-decoration: none;
          transition: color 0.2s, border-color 0.2s;
        }
        .btn-ghost:hover { color: var(--white); border-color: var(--border-hover); }

        /* ── Stats ── */
        .stats-strip {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: var(--border);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          width: 100%; max-width: 900px;
          margin: 64px auto 0;
          position: relative; z-index: 1;
          animation: fadeUp 0.8s 0.4s ease both;
        }
        .stat-item {
          background: var(--black);
          padding: 32px 24px; text-align: center;
        }
        .stat-number {
          font-family: var(--serif);
          font-size: 2.75rem; font-weight: 700;
          letter-spacing: -0.03em; color: var(--white);
          line-height: 1;
        }
        .stat-suffix { font-size: 1.75rem; }
        .stat-label {
          font-family: var(--mono); font-size: 0.625rem;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--chrome2); margin-top: 8px;
        }

        /* ── Section ── */
        .section {
          max-width: 1200px; margin: 0 auto;
          padding: 120px 48px;
        }
        .section-label {
          font-family: var(--mono); font-size: 0.625rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--chrome2); margin-bottom: 24px;
          display: flex; align-items: center; gap: 16px;
        }
        .section-label::after {
          content: ''; flex: 1; max-width: 48px; height: 1px;
          background: var(--chrome2);
        }
        .section-title {
          font-family: var(--serif);
          font-size: clamp(2.25rem, 5vw, 4rem);
          font-weight: 700; letter-spacing: -0.02em;
          line-height: 1.05; color: var(--white);
          margin-bottom: 20px;
        }
        .section-title em { font-style: italic; color: var(--white60); }
        .section-body {
          font-size: 1rem; font-weight: 300; line-height: 1.8;
          color: var(--white60); max-width: 540px;
        }

        /* ── Features Grid ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border);
        }
        .feature-card {
          background: var(--black);
          padding: 40px 32px;
          transition: background 0.25s;
          cursor: default;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { background: var(--black3); }
        .feature-card:hover::before { opacity: 1; }

        .feature-tag {
          font-family: var(--mono); font-size: 0.5625rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--chrome2); margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .feature-tag::before {
          content: ''; width: 16px; height: 1px; background: var(--chrome2);
        }
        .feature-icon {
          font-size: 1.25rem; color: var(--white30);
          margin-bottom: 16px; display: block;
        }
        .feature-title {
          font-family: var(--serif); font-size: 1.25rem;
          font-weight: 600; letter-spacing: -0.01em;
          color: var(--white); margin-bottom: 12px; line-height: 1.2;
        }
        .feature-body {
          font-size: 0.875rem; font-weight: 300;
          line-height: 1.75; color: var(--white60);
        }

        /* ── Process ── */
        .process-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border);
        }
        .process-item {
          background: var(--black); padding: 40px 28px;
          position: relative;
        }
        .process-num {
          font-family: var(--mono); font-size: 0.625rem;
          letter-spacing: 0.15em; color: var(--white30);
          margin-bottom: 24px;
        }
        .process-title {
          font-family: var(--serif); font-size: 1.5rem;
          font-weight: 700; color: var(--white);
          margin-bottom: 12px; letter-spacing: -0.02em;
        }
        .process-body {
          font-size: 0.875rem; font-weight: 300;
          line-height: 1.75; color: var(--white60);
        }
        .process-connector {
          position: absolute; top: 40px; right: -1px;
          width: 1px; height: 32px;
          background: linear-gradient(180deg, transparent, var(--border-hover), transparent);
        }

        /* ── Risk preview ── */
        .risk-preview {
          border: 1px solid var(--border);
          background: var(--black2);
          overflow: hidden;
        }
        .risk-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 8px;
        }
        .risk-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .risk-title-bar {
          font-family: var(--mono); font-size: 0.625rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--white30); margin-left: auto;
        }
        .risk-row {
          display: flex; align-items: center;
          padding: 14px 24px; gap: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.15s;
        }
        .risk-row:hover { background: var(--white03); }
        .risk-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 600; flex-shrink: 0;
        }
        .risk-name { font-size: 0.875rem; color: var(--white90); flex: 1; }
        .risk-prog {
          font-family: var(--mono); font-size: 0.625rem;
          letter-spacing: 0.08em; color: var(--white30);
        }
        .risk-score { font-family: var(--mono); font-size: 0.875rem; font-weight: 500; }
        .risk-bar-wrap { width: 80px; }
        .risk-bar-bg {
          height: 2px; border-radius: 1px;
          background: rgba(255,255,255,0.06);
        }
        .risk-bar-fill { height: 100%; border-radius: 1px; }
        .risk-badge {
          font-family: var(--mono); font-size: 0.5625rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 4px 8px; border-radius: 2px;
        }

        /* ── CTA ── */
        .cta-section {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 120px 48px; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 50% 100%, rgba(200,216,232,0.04) 0%, transparent 70%);
        }
        .cta-title {
          font-family: var(--serif);
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 900; letter-spacing: -0.03em;
          line-height: 1; color: var(--white);
          margin-bottom: 24px; position: relative; z-index: 1;
        }
        .cta-sub {
          font-size: 1rem; font-weight: 300;
          color: var(--white60); max-width: 440px;
          margin: 0 auto 48px; line-height: 1.75;
          position: relative; z-index: 1;
        }

        /* ── Footer ── */
        .footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 32px 48px;
          border-top: 1px solid var(--border);
        }
        .footer-logo {
          font-family: var(--serif); font-size: 1rem; font-weight: 700;
          color: var(--white60); text-decoration: none;
        }
        .footer-copy {
          font-family: var(--mono); font-size: 0.5625rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--white30);
        }

        /* ── Divider ── */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          max-width: 1200px; margin: 0 auto;
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .nav { padding: 20px 24px; }
          .nav-links { gap: 24px; }
          .hero { padding: 100px 24px 64px; }
          .section { padding: 80px 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .process-grid { grid-template-columns: 1fr 1fr; }
          .stats-strip { grid-template-columns: repeat(2, 1fr); }
          .cta-section { padding: 80px 24px; }
          .footer { flex-direction: column; gap: 16px; padding: 24px; text-align: center; }
        }
        @media (max-width: 600px) {
          .nav-links .hide-mobile { display: none; }
          .process-grid { grid-template-columns: 1fr; }
          .stats-strip { grid-template-columns: 1fr 1fr; }
          .hero-title { letter-spacing: -0.02em; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className={`nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <Link href="/" className="logo">
          <span className="logo-dot" />
          SentinelEdu
        </Link>
        <div className="nav-links">
          <a href="#features" className="hide-mobile">Features</a>
          <a href="#process" className="hide-mobile">How It Works</a>
          <Link href="/dashboard" className="nav-cta">Open Dashboard</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-line" style={{ top: '28%' }} />
        <div className="hero-line" style={{ top: '72%' }} />

        <div className="eyebrow">Early Warning Intelligence System</div>

        <h1 className="hero-title">
          Stop Dropouts<br />
          <em>Before They Happen.</em>
        </h1>

        <p className="hero-sub">
          SentinelEdu uses explainable machine learning to identify at-risk students
          weeks before they withdraw — giving counselors the insight to act at exactly the right moment.
        </p>

        <div className="hero-actions">
          <Link href="/dashboard" className="btn-primary">
            Launch Command Center
            <span className="arrow">→</span>
          </Link>
          <a href="#features" className="btn-ghost">Explore Features</a>
        </div>

        {/* Stats strip */}
        <div className="stats-strip">
          <Stat n={85} suffix="%" label="Prediction Accuracy" delay={0} />
          <Stat n={3} suffix="×" label="Faster Intervention" delay={80} />
          <Stat n={67} suffix="%" label="Prevention Rate" delay={160} />
          <Stat n={150} suffix="+" label="Students Monitored" delay={240} />
        </div>
      </section>

      {/* ── Dashboard preview ── */}
      <div className="section" style={{ paddingTop: 0 }} id="demo">
        <div style={{ marginBottom: 48 }}>
          <div className="section-label">Live System Preview</div>
          <h2 className="section-title">The Early Warning<br /><em>Command Center</em></h2>
        </div>

        <div className="risk-preview">
          <div className="risk-header">
            <div className="risk-dot" style={{ background: '#ef4444' }} />
            <div className="risk-dot" style={{ background: '#eab308', marginLeft: 4 }} />
            <div className="risk-dot" style={{ background: '#22c55e', marginLeft: 4 }} />
            <div className="risk-title-bar">SENTINELEDU — EARLY WARNING TABLE</div>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px 80px', gap: 16, padding: '10px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Student', 'Program', 'Risk Score', 'GPA', 'Status'].map(h => (
              <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: '0.5625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white30)' }}>{h}</div>
            ))}
          </div>

          {[
            { name: 'Carlos Martinez', prog: 'CS', risk: 0.91, gpa: 9.2, level: 'critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
            { name: 'Priya Sharma', prog: 'Business', risk: 0.85, gpa: 10.1, level: 'critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
            { name: 'Wei Zhang', prog: 'Nursing', risk: 0.71, gpa: 11.5, level: 'high', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
            { name: 'Fatima Hassan', prog: 'Engineering', risk: 0.58, gpa: 12.8, level: 'medium', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
            { name: 'James Okonkwo', prog: 'Psychology', risk: 0.21, gpa: 16.2, level: 'low', color: '#22c55e', bg: 'transparent' },
          ].map(s => (
            <div key={s.name} className="risk-row" style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px 80px', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="risk-avatar" style={{ background: s.bg, color: s.color }}>
                  {s.name.charAt(0)}
                </div>
                <span className="risk-name">{s.name}</span>
              </div>
              <span className="risk-prog">{s.prog}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="risk-score" style={{ color: s.color }}>{(s.risk * 100).toFixed(0)}%</span>
                </div>
                <div className="risk-bar-bg">
                  <div className="risk-bar-fill" style={{ width: `${s.risk * 100}%`, background: s.color, opacity: 0.7 }} />
                </div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: s.gpa < 11 ? '#f87171' : 'var(--white60)' }}>{s.gpa}</span>
              <span className="risk-badge" style={{
                background: s.bg || 'rgba(34,197,94,0.1)',
                color: s.color,
                border: `1px solid ${s.color}30`
              }}>{s.level}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ── Features ── */}
      <div className="section" id="features">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, marginBottom: 64, alignItems: 'end' }}>
          <div>
            <div className="section-label">Platform Capabilities</div>
            <h2 className="section-title">Every Tool to<br /><em>Protect Success</em></h2>
          </div>
          <div className="section-body">
            Six tightly integrated capabilities — from raw data ingestion to counselor-ready action plans — running on a self-hosted stack with no cloud dependencies.
          </div>
        </div>

        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-tag">{f.tag}</div>
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <p className="feature-body">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ── Process ── */}
      <div className="section" id="process">
        <div style={{ marginBottom: 64 }}>
          <div className="section-label">How It Works</div>
          <h2 className="section-title">From Data<br /><em>to Intervention</em></h2>
        </div>

        <div className="process-grid">
          {STEPS.map((s, i) => (
            <div key={s.n} className="process-item">
              <div className="process-num">STEP {s.n}</div>
              <div className="process-title">{s.title}</div>
              <p className="process-body">{s.body}</p>
              {i < STEPS.length - 1 && <div className="process-connector" />}
            </div>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to<br />Intervene?</h2>
        <p className="cta-sub">
          Deploy SentinelEdu in minutes with Docker Compose. Full data sovereignty — nothing leaves your infrastructure.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Link href="/dashboard" className="btn-primary">
            Open Command Center <span className="arrow">→</span>
          </Link>
          <a href="#features" className="btn-ghost">Learn More</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <Link href="/" className="footer-logo">SentinelEdu</Link>
        <div className="footer-copy">© 2024 · Built with Next.js 14, FastAPI & scikit-learn</div>
        <Link href="/dashboard" style={{ fontFamily: 'var(--mono)', fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--white30)', textDecoration: 'none' }}>
          Dashboard →
        </Link>
      </footer>
    </>
  )
}