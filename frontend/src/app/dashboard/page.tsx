'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { MOCK_OVERVIEW } from '@/lib/api'

function SemiGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 52, cx = 68, cy = 68
  const circ = Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width="136" height="88" viewBox="0 0 136 88">
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter:`drop-shadow(0 0 6px ${color}80)`, transition:'stroke-dashoffset 1.2s ease' }} />
        <text x={cx} y={cy-6} textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="Playfair Display, serif">{score}</text>
        <text x={cx} y={cy+10} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="JetBrains Mono, monospace">/100</text>
      </svg>
      <div style={{ fontFamily:'var(--mono,JetBrains Mono)', fontSize:'0.5rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginTop:'-4px' }}>{label}</div>
    </div>
  )
}

const TT = ({ active, payload, label }: any) => active && payload?.length ? (
  <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.12)', borderRadius:2, padding:'8px 12px', fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem' }}>
    <div style={{ color:'rgba(255,255,255,0.5)', marginBottom:4 }}>{label}</div>
    <div style={{ color:payload[0]?.color || '#fff', fontWeight:500 }}>{payload[0]?.value}%</div>
  </div>
) : null

export default function DashboardPage() {
  const [data, setData] = useState(MOCK_OVERVIEW)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<any>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/analytics/overview`)
      .then(r => r.ok ? r.json() : null).then(d => { if (d) setData(d) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const { kpis, risk_distribution, dropout_trend, programs_at_risk, top_risk_factors, recent_alerts } = data

  const KPIS = [
    { label: 'Total Students', value: kpis.total_students, color: 'var(--chrome)', sub: 'Active enrollment' },
    { label: 'Critical Risk', value: kpis.critical_students, color: 'var(--red)', sub: '≥ 80% dropout risk' },
    { label: 'High Risk', value: kpis.high_risk_students, color: 'var(--orange)', sub: '60–80% risk band' },
    { label: 'At-Risk Rate', value: `${kpis.at_risk_rate_pct}%`, color: 'var(--yellow)', sub: 'Of student body' },
    { label: 'Avg. GPA', value: kpis.avg_gpa, color: 'var(--green)', sub: 'Semester average' },
    { label: 'Health Score', value: kpis.institutional_health_score, color: 'var(--green)', sub: 'Institutional index' },
  ]

  return (
    <div style={{ padding: 'clamp(20px, 3vw, 40px)', maxWidth: 1400, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 32, flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ fontFamily:'var(--mono,JetBrains Mono)', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--chrome2,#7a9ab8)', marginBottom:6 }}>
            ◈ Overview
          </div>
          <h1 style={{ fontFamily:'Playfair Display, serif', fontSize:'clamp(1.5rem,3vw,2.25rem)', fontWeight:700, letterSpacing:'-0.02em', color:'#fff', lineHeight:1.05 }}>
            Command Center
          </h1>
          <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)', marginTop:4, fontWeight:300 }}>
            Institutional health overview · Live
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:2, fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', letterSpacing:'0.1em', color:'#4ade80' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px #22c55e', display:'inline-block' }} />
            LIVE
          </div>
          <div style={{ padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:2, fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', letterSpacing:'0.08em', color:'rgba(255,255,255,0.4)' }}>
            SEM 2 · 2024
          </div>
        </div>
      </div>

      {/* KPIs — responsive grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:24 }}>
        {KPIS.map(k => (
          <div key={k.label} style={{ background:'#0a0a0a', padding:'20px 18px' }}>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:10 }}>{k.label}</div>
            <div style={{ fontFamily:'Playfair Display,serif', fontSize:'2rem', fontWeight:700, letterSpacing:'-0.03em', color:k.color, lineHeight:1 }}>{k.value}</div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.08em', color:'rgba(255,255,255,0.3)', marginTop:8 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,2fr)', gap:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:24 }}>
        {/* Gauges */}
        <div style={{ background:'#0a0a0a', padding:'24px 20px' }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:20 }}>Institutional Gauges</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4 }}>
            <SemiGauge score={kpis.institutional_health_score} label="Health" color="#22c55e" />
            <SemiGauge score={Math.round(100 - kpis.at_risk_rate_pct)} label="Retention" color="#c8d8e8" />
            <SemiGauge score={Math.round(kpis.intervention_success_rate)} label="Intervention" color="#f97316" />
          </div>
        </div>

        {/* Dropout Trend */}
        <div style={{ background:'#0a0a0a', padding:'24px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)' }}>Dropout Risk Trend · 12 Months</div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', color:'#f87171', padding:'2px 8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:2 }}>
              AVG {Math.round((dropout_trend as any[]).reduce((a:number,b:any)=>a+b.rate,0)/dropout_trend.length)}%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={dropout_trend}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize:9, fill:'rgba(255,255,255,0.3)', fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:'rgba(255,255,255,0.3)', fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[0,50]} />
              <Tooltip content={<TT />} />
              <Area type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={1.5} fill="url(#rg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:24 }}>
        {/* Risk dist */}
        <div style={{ background:'#0a0a0a', padding:'24px 20px' }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:20 }}>Risk Distribution</div>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
            <PieChart width={160} height={160}>
              <Pie data={risk_distribution} cx={80} cy={80} innerRadius={40} outerRadius={70} dataKey="count" paddingAngle={2}>
                {risk_distribution.map((e:any,i:number) => <Cell key={i} fill={e.color} opacity={0.85} />)}
              </Pie>
            </PieChart>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 16px' }}>
            {risk_distribution.map((item:any) => (
              <div key={item.level} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:item.color, flexShrink:0 }} />
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', color:'rgba(255,255,255,0.5)' }}>{item.level}</span>
                </div>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem', fontWeight:500, color:item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Programs */}
        <div style={{ background:'#0a0a0a', padding:'24px 20px' }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:20 }}>Programs At Risk</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={programs_at_risk} layout="vertical" barSize={6}>
              <XAxis type="number" tick={{ fontSize:8, fill:'rgba(255,255,255,0.3)', fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="program" tick={{ fontSize:8, fill:'rgba(255,255,255,0.5)', fontFamily:'JetBrains Mono' }} width={85} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} />
              <Bar dataKey="at_risk_rate" fill="#f97316" radius={[0,2,2,0]} opacity={0.75} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Factors */}
        <div style={{ background:'#0a0a0a', padding:'24px 20px' }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:20 }}>Top Risk Factors</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {(top_risk_factors as any[]).map((f:any,i:number) => (
              <div key={f.factor}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', color:'rgba(255,255,255,0.55)' }}>{f.factor}</span>
                  <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', fontWeight:500, color:'rgba(200,216,232,0.8)' }}>{f.frequency}</span>
                </div>
                <div style={{ height:2, background:'rgba(255,255,255,0.06)', borderRadius:1 }}>
                  <div style={{ height:'100%', borderRadius:1, width:`${(f.frequency/50)*100}%`, background:`hsl(${210-i*18},65%,60%)`, opacity:0.7, transition:'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div style={{ background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)' }}>
            ◎ Critical Alerts
          </div>
          <a href="/dashboard/alerts" style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>
            View all →
          </a>
        </div>
        <div style={{ overflowX:'auto' }}>
          {(recent_alerts as any[]).map((a:any) => (
            <div key={a.student_id}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.03)', cursor:'pointer', transition:'background 0.12s', gap:12, flexWrap:'wrap' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => setModal(a)}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:2, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'0.875rem', color:'#f87171', flexShrink:0 }}>
                  {a.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.9)', marginBottom:2 }}>{a.name}</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.08em', color:'rgba(255,255,255,0.3)' }}>{a.alert}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.125rem', fontWeight:700, color:'#ef4444' }}>{(a.risk_score*100).toFixed(0)}%</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.3)', marginTop:2 }}>{a.time}</div>
                </div>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.12em', padding:'3px 8px', background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)', borderRadius:2 }}>CRITICAL</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={() => setModal(null)}>
          <div style={{ background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.12)', borderRadius:2, padding:28, maxWidth:420, width:'100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.25rem', fontWeight:700, color:'#fff' }}>{modal.name}</div>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.1em', color:'rgba(255,255,255,0.3)', marginTop:4 }}>{modal.student_id}</div>
              </div>
              <button onClick={() => setModal(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:'1rem', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:16, marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', color:'rgba(255,255,255,0.4)' }}>Risk Score</span>
                <span style={{ fontFamily:'Playfair Display,serif', fontSize:'1.25rem', fontWeight:700, color:'#ef4444' }}>{(modal.risk_score*100).toFixed(1)}%</span>
              </div>
              <div style={{ height:2, background:'rgba(255,255,255,0.06)', borderRadius:1, marginBottom:16 }}>
                <div style={{ height:'100%', borderRadius:1, width:`${modal.risk_score*100}%`, background:'#ef4444' }} />
              </div>
              <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.6)', lineHeight:1.7, fontWeight:300 }}>{modal.alert}</p>
            </div>
            <a href="/dashboard/students" style={{ display:'block', textAlign:'center', padding:'12px 20px', background:'#fff', color:'#000', fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem', letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', borderRadius:2, fontWeight:500 }}>
              View Full Profile →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}