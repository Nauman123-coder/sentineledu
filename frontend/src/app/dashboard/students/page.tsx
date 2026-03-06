'use client'

import { useEffect, useState } from 'react'
import { generateMockStudents } from '@/lib/api'

type S = ReturnType<typeof generateMockStudents>[number]

function RBadge({ level }: { level: string }) {
  const map: Record<string, string> = { critical: 'rbadge-critical', high: 'rbadge-high', medium: 'rbadge-medium', low: 'rbadge-low' }
  const dot: Record<string, string> = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#22c55e' }
  return (
    <span className={`rbadge ${map[level] || 'rbadge-low'}`}>
      <span style={{ width:4, height:4, borderRadius:'50%', background:dot[level], display:'inline-block' }} />
      {level}
    </span>
  )
}

function Modal({ s, onClose }: { s: S; onClose: () => void }) {
  const rc = s.risk_score >= 0.8 ? '#ef4444' : s.risk_score >= 0.6 ? '#f97316' : s.risk_score >= 0.4 ? '#eab308' : '#22c55e'
  const interventions = [
    (s as any).tuition_up_to_date === false && { icon:'◈', action:'Connect with Financial Aid Office', detail:'Explore emergency grants and payment plans.' },
    s.gpa_1st_sem < 11 && { icon:'◆', action:'Academic Coaching Program', detail:'Weekly tutoring in core subject areas recommended.' },
    s.risk_score >= 0.6 && { icon:'◉', action:'Assign Dedicated Counselor', detail:'High-risk student — bi-weekly check-ins.' },
    { icon:'▣', action:'Student Success Workshop', detail:'Proactive engagement through career events.' },
  ].filter(Boolean) as any[]

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', backdropFilter:'blur(10px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'#0d0d0d', border:'1px solid rgba(255,255,255,0.12)', width:'100%', maxWidth:520, maxHeight:'88vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:'24px 24px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            <div style={{ width:44, height:44, background:`${rc}15`, border:`1px solid ${rc}30`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'1.125rem', color:rc }}>
              {s.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.125rem', fontWeight:700, color:'#fff' }}>{s.name}</div>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.1em', color:'rgba(255,255,255,0.35)', marginTop:3 }}>
                {s.student_id} · {s.program} · Year {s.year}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <RBadge level={s.alert_level} />
            <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:'1rem', cursor:'pointer', padding:4 }}>✕</button>
          </div>
        </div>

        <div style={{ padding:24, display:'flex', flexDirection:'column', gap:24 }}>
          {/* Risk score */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>Dropout Risk Score</span>
              <span style={{ fontFamily:'Playfair Display,serif', fontSize:'1.5rem', fontWeight:700, color:rc }}>{(s.risk_score*100).toFixed(1)}%</span>
            </div>
            <div style={{ height:3, background:'rgba(255,255,255,0.06)' }}>
              <div style={{ height:'100%', width:`${s.risk_score*100}%`, background:rc, boxShadow:`0 0 8px ${rc}60`, transition:'width 1s ease' }} />
            </div>
          </div>

          {/* Snapshot */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:'rgba(255,255,255,0.07)' }}>
            {[
              { l:'1st Sem GPA', v:s.gpa_1st_sem, c:s.gpa_1st_sem < 11 ? '#ef4444' : '#22c55e' },
              { l:'2nd Sem GPA', v:s.gpa_2nd_sem, c:s.gpa_2nd_sem < 11 ? '#ef4444' : '#22c55e' },
              { l:'Scholarship', v:(s as any).scholarship_holder ? 'Yes' : 'No', c:(s as any).scholarship_holder ? '#22c55e' : '#f97316' },
            ].map(x => (
              <div key={x.l} style={{ background:'#111', padding:'14px 12px', textAlign:'center' }}>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>{x.l}</div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.25rem', fontWeight:700, color:x.c }}>{x.v}</div>
              </div>
            ))}
          </div>

          {/* SHAP factors */}
          <div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:12 }}>
              Top AI Risk Factors · SHAP
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {s.top_risk_factors.map((f: any, i: number) => (
                <div key={i} style={{ padding:'10px 12px', background:f.direction==='risk'?'rgba(239,68,68,0.05)':'rgba(34,197,94,0.05)', border:`1px solid ${f.direction==='risk'?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', color:'rgba(255,255,255,0.6)' }}>{f.label}</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', fontWeight:500, color:f.direction==='risk'?'#f87171':'#4ade80' }}>
                      {f.direction==='risk'?'↑ Risk':'↓ Protective'}
                    </span>
                  </div>
                  <div style={{ height:2, background:'rgba(255,255,255,0.06)' }}>
                    <div style={{ height:'100%', width:`${Math.min(f.importance*300,100)}%`, background:f.direction==='risk'?'#ef4444':'#22c55e', opacity:0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions */}
          <div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:12 }}>
              AI Success Pathway
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {interventions.map((iv: any, i: number) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'12px 14px', background:'rgba(200,216,232,0.04)', border:'1px solid rgba(200,216,232,0.08)' }}>
                  <span style={{ color:'rgba(200,216,232,0.5)', fontSize:'0.75rem', flexShrink:0, marginTop:1 }}>{iv.icon}</span>
                  <div>
                    <div style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.9)', marginBottom:3 }}>{iv.action}</div>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.06em', color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>{iv.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StudentsPage() {
  const [students, setStudents] = useState<S[]>([])
  const [filtered, setFiltered] = useState<S[]>([])
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [selected, setSelected] = useState<S | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'}/api/students?page_size=50`)
      .then(r => r.ok ? r.json() : null).then(d => { if(d) setStudents(d.students) })
      .catch(() => setStudents(generateMockStudents(50) as any))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let d = [...students]
    if (search) { const q=search.toLowerCase(); d=d.filter(s=>s.name.toLowerCase().includes(q)||s.student_id.toLowerCase().includes(q)) }
    if (filterLevel!=='all') d=d.filter(s=>s.alert_level===filterLevel)
    d.sort((a,b)=>b.risk_score-a.risk_score)
    setFiltered(d)
  }, [students, search, filterLevel])

  const counts = { all:students.length, critical:students.filter(s=>s.alert_level==='critical').length, high:students.filter(s=>s.alert_level==='high').length, medium:students.filter(s=>s.alert_level==='medium').length, low:students.filter(s=>s.alert_level==='low').length }
  const CHIPS = [
    { key:'all', label:`All · ${counts.all}`, color:'rgba(200,216,232,0.8)' },
    { key:'critical', label:`Critical · ${counts.critical}`, color:'#f87171' },
    { key:'high', label:`High · ${counts.high}`, color:'#fb923c' },
    { key:'medium', label:`Medium · ${counts.medium}`, color:'#facc15' },
    { key:'low', label:`Low · ${counts.low}`, color:'#4ade80' },
  ]

  return (
    <div style={{ padding:'clamp(20px,3vw,40px)', maxWidth:1400, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:6 }}>◈ Students</div>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.5rem,3vw,2.25rem)', fontWeight:700, letterSpacing:'-0.02em', color:'#fff', lineHeight:1.05 }}>Early Warning System</h1>
        <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)', marginTop:4, fontWeight:300 }}>
          {students.length} students monitored · Click any row for deep-dive analysis
        </p>
      </div>

      {/* Filter chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:20 }}>
        {CHIPS.map(c => (
          <button key={c.key} onClick={() => setFilterLevel(c.key)}
            style={{ padding:'10px 16px', background:filterLevel===c.key?'rgba(255,255,255,0.06)':'#0a0a0a', color:filterLevel===c.key?c.color:'rgba(255,255,255,0.35)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', letterSpacing:'0.1em', textTransform:'uppercase', border:'none', cursor:'pointer', transition:'all 0.15s', borderBottom:filterLevel===c.key?`1px solid ${c.color}`:'1px solid transparent' }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:20, position:'relative' }}>
        <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.25)', fontSize:'0.75rem', pointerEvents:'none' }}>⌕</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by name or student ID..."
          style={{ width:'100%', maxWidth:420, paddingLeft:36, paddingRight:16, paddingTop:10, paddingBottom:10, background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.8)', fontFamily:'Outfit,sans-serif', fontSize:'0.875rem', fontWeight:300, outline:'none', borderRadius:0 }} />
      </div>

      {/* Table */}
      <div style={{ background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.07)', overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
          <thead>
            <tr>
              {['Student','Program / Year','Risk Score','GPA 1st → 2nd','Tuition','Status',''].map(h => (
                <th key={h} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({length:7}).map((_,i) => (
              <tr key={i}>
                {Array.from({length:7}).map((_,j) => (
                  <td key={j} style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ height:10, background:'rgba(255,255,255,0.04)', borderRadius:1, width:`${50+Math.random()*40}%` }} />
                  </td>
                ))}
              </tr>
            )) : filtered.map(s => {
              const rc = s.risk_score>=0.8?'#ef4444':s.risk_score>=0.6?'#f97316':s.risk_score>=0.4?'#eab308':'#22c55e'
              return (
                <tr key={s.student_id} onClick={()=>setSelected(s)}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                  style={{ cursor:'pointer', transition:'background 0.12s', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, background:`${rc}12`, border:`1px solid ${rc}25`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'0.8125rem', color:rc, flexShrink:0 }}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.9)' }}>{s.name}</div>
                        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.08em', color:'rgba(255,255,255,0.3)', marginTop:2 }}>{s.student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <div style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.6)' }}>{s.program}</div>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.3)', marginTop:2 }}>Yr {s.year}</div>
                  </td>
                  <td style={{ padding:'12px 16px', minWidth:120 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.75rem', fontWeight:500, color:rc }}>{(s.risk_score*100).toFixed(0)}%</span>
                    </div>
                    <div style={{ height:2, background:'rgba(255,255,255,0.06)', borderRadius:1 }}>
                      <div style={{ height:'100%', width:`${s.risk_score*100}%`, background:rc, opacity:0.8, borderRadius:1 }} />
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem', color:s.gpa_1st_sem<11?'#f87171':'rgba(255,255,255,0.6)' }}>{s.gpa_1st_sem}</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.25)', margin:'0 4px' }}>→</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem', color:s.gpa_2nd_sem<11?'#f87171':'rgba(255,255,255,0.6)' }}>{s.gpa_2nd_sem}</span>
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.08em', color:(s as any).tuition_up_to_date!==false?'#4ade80':'#f87171' }}>
                      {(s as any).tuition_up_to_date!==false?'✓ PAID':'✗ OVERDUE'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 16px' }}><RBadge level={s.alert_level} /></td>
                  <td style={{ padding:'12px 16px', color:'rgba(255,255,255,0.2)', fontSize:'0.75rem' }}>→</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div style={{ padding:'40px 20px', textAlign:'center', fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem', letterSpacing:'0.12em', color:'rgba(255,255,255,0.2)' }}>
            NO STUDENTS MATCH YOUR FILTERS
          </div>
        )}
      </div>

      {selected && <Modal s={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}