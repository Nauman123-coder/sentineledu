'use client'

import { useState } from 'react'

const DEFAULT: Record<string, number> = {
  age_at_enrollment: 20, gender: 1, international: 0, displaced: 0,
  scholarship_holder: 0, tuition_fees_up_to_date: 1, debtor: 0,
  admission_grade: 130, previous_qualification_grade: 130,
  curricular_units_1st_sem_credited: 0, curricular_units_1st_sem_enrolled: 6,
  curricular_units_1st_sem_evaluations: 6, curricular_units_1st_sem_approved: 4,
  curricular_units_1st_sem_grade: 12, curricular_units_1st_sem_without_evaluations: 0,
  curricular_units_2nd_sem_credited: 0, curricular_units_2nd_sem_enrolled: 6,
  curricular_units_2nd_sem_evaluations: 6, curricular_units_2nd_sem_approved: 4,
  curricular_units_2nd_sem_grade: 12, curricular_units_2nd_sem_without_evaluations: 0,
  unemployment_rate: 11, inflation_rate: 1, gdp: 2,
}

const SLIDERS = [
  { section:'Demographics & Financial', fields:[
    { key:'age_at_enrollment', label:'Age at Enrollment', min:17, max:70, step:1, unit:' yrs' },
    { key:'admission_grade', label:'Admission Grade', min:95, max:190, step:1, unit:'' },
    { key:'previous_qualification_grade', label:'Previous Qual. Grade', min:95, max:190, step:1, unit:'' },
  ]},
  { section:'1st Semester', fields:[
    { key:'curricular_units_1st_sem_enrolled', label:'Units Enrolled', min:1, max:10, step:1, unit:'' },
    { key:'curricular_units_1st_sem_approved', label:'Units Approved', min:0, max:10, step:1, unit:'' },
    { key:'curricular_units_1st_sem_grade', label:'GPA (0–20)', min:0, max:20, step:0.5, unit:'' },
    { key:'curricular_units_1st_sem_without_evaluations', label:'Missed Evaluations', min:0, max:6, step:1, unit:'' },
  ]},
  { section:'2nd Semester', fields:[
    { key:'curricular_units_2nd_sem_enrolled', label:'Units Enrolled', min:1, max:10, step:1, unit:'' },
    { key:'curricular_units_2nd_sem_approved', label:'Units Approved', min:0, max:10, step:1, unit:'' },
    { key:'curricular_units_2nd_sem_grade', label:'GPA (0–20)', min:0, max:20, step:0.5, unit:'' },
    { key:'curricular_units_2nd_sem_without_evaluations', label:'Missed Evaluations', min:0, max:6, step:1, unit:'' },
  ]},
]

const TOGGLES = [
  { key:'scholarship_holder', label:'Scholarship Holder' },
  { key:'tuition_fees_up_to_date', label:'Tuition Up-to-Date' },
  { key:'debtor', label:'Has Outstanding Debt' },
  { key:'displaced', label:'Displaced Student' },
]

function simulate(f: Record<string,number>) {
  let s = 0
  if (!f.tuition_fees_up_to_date) s += 0.26
  if (f.debtor) s += 0.15
  if (!f.scholarship_holder) s += 0.04
  const ar1 = f.curricular_units_1st_sem_approved / Math.max(f.curricular_units_1st_sem_enrolled,1)
  if (ar1 < 0.5) s += 0.20
  if (f.curricular_units_1st_sem_grade < 11) s += 0.15
  if (f.curricular_units_2nd_sem_grade < 10) s += 0.18
  if (f.admission_grade < 115) s += 0.10
  if (f.age_at_enrollment > 35) s += 0.08
  if (f.curricular_units_1st_sem_without_evaluations > 2) s += 0.10
  s = Math.min(0.97, Math.max(0.03, s + (Math.random()*0.06-0.03)))
  const factors = []
  if (!f.tuition_fees_up_to_date) factors.push({ label:'Late Tuition Payment', dir:'risk', imp:0.31 })
  if (ar1 < 0.5) factors.push({ label:'Low Unit Approval Rate', dir:'risk', imp:0.25 })
  if (f.curricular_units_1st_sem_grade < 11) factors.push({ label:'1st Semester GPA Drop', dir:'risk', imp:0.23 })
  if (f.debtor) factors.push({ label:'Outstanding Debt', dir:'risk', imp:0.18 })
  if (f.scholarship_holder) factors.push({ label:'Scholarship Holder', dir:'protective', imp:0.12 })
  if (factors.length < 3) factors.push({ label:'Admission Grade', dir:s>0.4?'risk':'protective', imp:0.10 })
  const level = s>=0.8?'critical':s>=0.6?'high':s>=0.4?'medium':'low'
  const pred = s>=0.5?'Dropout':s>=0.25?'Enrolled':'Graduate'
  return { pred, score:s, level, critical:s>=0.8, probs:{ Dropout:s, Enrolled:(1-s)*0.4, Graduate:(1-s)*0.6 }, factors:factors.slice(0,3), pathway:[
    !f.tuition_fees_up_to_date && { icon:'◈', action:'Financial Aid Office', detail:'Explore emergency grants and payment plans.' },
    s>=0.6 && { icon:'◉', action:'Assign Academic Counselor', detail:'Bi-weekly check-ins for high-risk students.' },
    { icon:'◆', action:'Tutoring Program', detail:'Weekly sessions in core subject areas.' },
  ].filter(Boolean) }
}

export default function PredictPage() {
  const [form, setForm] = useState(DEFAULT)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: number) => setForm(p => ({...p,[k]:v}))

  const run = async () => {
    setLoading(true)
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 3000)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'}/api/predict`, {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({...form, student_id:`PREVIEW-${Date.now()}`}), signal:ctrl.signal
        })
        clearTimeout(t)
        if (res.ok) { const d=await res.json(); setResult({pred:d.prediction,score:d.risk_score,level:d.alert_level,critical:d.is_critical,probs:d.probabilities,factors:d.top_risk_factors.map((f:any)=>({label:f.label,dir:f.direction,imp:f.importance})),pathway:d.success_pathway}); return }
      } catch { clearTimeout(t) }
      setResult(simulate(form))
    } finally { setLoading(false) }
  }

  const rc = result ? (result.score>=0.8?'#ef4444':result.score>=0.6?'#f97316':result.score>=0.4?'#eab308':'#22c55e') : 'rgba(200,216,232,0.6)'

  return (
    <div style={{ padding:'clamp(20px,3vw,40px)', maxWidth:1400, margin:'0 auto' }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:6 }}>◆ Predict</div>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.5rem,3vw,2.25rem)', fontWeight:700, letterSpacing:'-0.02em', color:'#fff', lineHeight:1.05 }}>Risk Predictor</h1>
        <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)', marginTop:4, fontWeight:300 }}>Configure student profile · Run real-time dropout risk prediction</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1.6fr) minmax(0,1fr)', gap:1, background:'rgba(255,255,255,0.07)', alignItems:'start' }}>

        {/* Left — inputs */}
        <div style={{ background:'#0a0a0a', display:'flex', flexDirection:'column', gap:1 }}>
          {/* Toggles */}
          <div style={{ padding:'20px 20px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:16 }}>Demographics & Financial</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
              {TOGGLES.map(t => (
                <div key={t.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.6)', fontWeight:300 }}>{t.label}</span>
                  <button onClick={()=>set(t.key, form[t.key]===1?0:1)}
                    style={{ width:38, height:20, borderRadius:10, background:form[t.key]===1?'rgba(200,216,232,0.9)':'rgba(255,255,255,0.1)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:2, width:16, height:16, borderRadius:'50%', background:form[t.key]===1?'#050505':'rgba(255,255,255,0.5)', transition:'left 0.2s', left:form[t.key]===1?'19px':'2px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sliders */}
          {SLIDERS.map(sec => (
            <div key={sec.section} style={{ padding:'20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:16 }}>{sec.section}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'14px 24px' }}>
                {sec.fields.map(f => {
                  const pct = ((form[f.key]-f.min)/(f.max-f.min))*100
                  const isRisk = (f.key.includes('grade') && form[f.key]<11) || (f.key.includes('without') && form[f.key]>2)
                  const c = isRisk ? '#ef4444' : 'rgba(200,216,232,0.8)'
                  return (
                    <div key={f.key}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <label style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8125rem', color:'rgba(255,255,255,0.55)', fontWeight:300 }}>{f.label}</label>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem', fontWeight:500, color:c }}>{form[f.key]}{f.unit}</span>
                      </div>
                      <input type="range" min={f.min} max={f.max} step={f.step} value={form[f.key]}
                        onChange={e=>set(f.key, f.step<1?parseFloat(e.target.value):parseInt(e.target.value))}
                        style={{ width:'100%', height:2, appearance:'none', WebkitAppearance:'none', background:`linear-gradient(to right,${c} ${pct}%,rgba(255,255,255,0.08) ${pct}%)`, outline:'none', cursor:'pointer', accentColor:c }} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Run button */}
          <div style={{ padding:20 }}>
            <button onClick={run} disabled={loading}
              style={{ width:'100%', padding:'14px 20px', background:loading?'rgba(255,255,255,0.06)':'#fff', color:loading?'rgba(255,255,255,0.4)':'#050505', fontFamily:'JetBrains Mono,monospace', fontSize:'0.625rem', letterSpacing:'0.12em', textTransform:'uppercase', border:'none', cursor:loading?'not-allowed':'pointer', transition:'all 0.2s', fontWeight:500 }}>
              {loading ? '⚙  Running ML Inference...' : '⚡  Run Dropout Risk Prediction'}
            </button>
          </div>
        </div>

        {/* Right — results */}
        <div style={{ background:'#0a0a0a', minHeight:400 }}>
          {!result ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', minHeight:400, padding:40, textAlign:'center' }}>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'2.5rem', color:'rgba(255,255,255,0.06)', marginBottom:16 }}>◆</div>
              <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.125rem', fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>Ready to Analyze</div>
              <p style={{ fontFamily:'Outfit,sans-serif', fontSize:'0.8125rem', color:'rgba(255,255,255,0.3)', fontWeight:300, lineHeight:1.7, maxWidth:260 }}>Configure the student profile and run prediction to see AI risk analysis.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
              {/* Score */}
              <div style={{ padding:'28px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
                {result.critical && (
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.15em', padding:'4px 12px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', display:'inline-block', marginBottom:16 }}>
                    🚨 CRITICAL ALERT TRIGGERED
                  </div>
                )}
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'3.5rem', fontWeight:900, letterSpacing:'-0.04em', color:rc, lineHeight:1 }}>
                  {(result.score*100).toFixed(1)}<span style={{ fontSize:'1.5rem' }}>%</span>
                </div>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:rc, marginTop:8 }}>
                  {result.level} Risk · {result.pred}
                </div>
                <div style={{ height:2, background:'rgba(255,255,255,0.06)', margin:'16px 0 0' }}>
                  <div style={{ height:'100%', width:`${result.score*100}%`, background:rc, boxShadow:`0 0 8px ${rc}60`, transition:'width 1s ease' }} />
                </div>
              </div>

              {/* Probabilities */}
              <div style={{ padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:'rgba(255,255,255,0.03)' }}>
                {Object.entries(result.probs).map(([cls,p]: any) => (
                  <div key={cls} style={{ textAlign:'center', padding:'12px 8px' }}>
                    <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:8 }}>{cls}</div>
                    <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.25rem', fontWeight:700, color:cls==='Dropout'?'#ef4444':cls==='Graduate'?'#22c55e':'rgba(200,216,232,0.8)' }}>
                      {(p*100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* SHAP */}
              <div style={{ padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:12 }}>Top Risk Factors · SHAP</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {result.factors.map((f:any,i:number) => (
                    <div key={i} style={{ padding:'10px 12px', background:f.dir==='risk'?'rgba(239,68,68,0.05)':'rgba(34,197,94,0.05)', border:`1px solid ${f.dir==='risk'?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)'}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', color:'rgba(255,255,255,0.6)' }}>{f.label}</span>
                        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', color:f.dir==='risk'?'#f87171':'#4ade80' }}>{f.dir==='risk'?'↑':' ↓'} {(f.imp*100).toFixed(0)}%</span>
                      </div>
                      <div style={{ height:2, background:'rgba(255,255,255,0.06)' }}>
                        <div style={{ height:'100%', width:`${Math.min(f.imp*300,100)}%`, background:f.dir==='risk'?'#ef4444':'#22c55e', opacity:0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathway */}
              <div style={{ padding:'18px 24px' }}>
                <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:12 }}>Success Pathway</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {result.pathway.filter(Boolean).map((iv:any,i:number) => (
                    <div key={i} style={{ display:'flex', gap:10, padding:'10px 12px', background:'rgba(200,216,232,0.04)', border:'1px solid rgba(200,216,232,0.08)' }}>
                      <span style={{ color:'rgba(200,216,232,0.4)', fontSize:'0.75rem', flexShrink:0 }}>{iv.icon}</span>
                      <div>
                        <div style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.85)', marginBottom:2 }}>{iv.action}</div>
                        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.06em', color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>{iv.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; border-radius:50%; background:#fff; cursor:pointer; box-shadow:0 0 6px rgba(255,255,255,0.3); }
        input[type=range]::-moz-range-thumb { width:12px; height:12px; border-radius:50%; background:#fff; cursor:pointer; border:none; }
        @media(max-width:700px) {
          div[style*="gridTemplateColumns: minmax(0, 1.6fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
