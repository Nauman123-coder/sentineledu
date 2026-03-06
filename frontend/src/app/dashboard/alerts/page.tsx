'use client'

import { useState } from 'react'
import { generateMockStudents } from '@/lib/api'

export default function AlertsPage() {
  const all = generateMockStudents(50)
  const critical = all.filter(s => s.alert_level === 'critical')
  const high = all.filter(s => s.alert_level === 'high')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const dismiss = (id: string) => setDismissed(p => new Set([...p, id]))

  return (
    <div style={{ padding:'clamp(20px,3vw,40px)', maxWidth:1400, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(122,154,184,1)', marginBottom:6 }}>◎ Alerts</div>
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(1.5rem,3vw,2.25rem)', fontWeight:700, letterSpacing:'-0.02em', color:'#fff', lineHeight:1.05 }}>Alert Center</h1>
          <p style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.5)', marginTop:4, fontWeight:300 }}>Students requiring immediate intervention</p>
        </div>
        <div style={{ padding:'8px 16px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', letterSpacing:'0.1em', color:'#f87171' }}>
          🚨 {critical.filter(s=>!dismissed.has(s.student_id)).length} CRITICAL ACTIVE
        </div>
      </div>

      {/* Critical */}
      <div style={{ marginBottom:32 }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f87171', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', boxShadow:'0 0 8px #ef4444', display:'inline-block', animation:'ping 1.5s ease infinite' }} />
          Critical Risk — Immediate Action Required
        </div>
        <div style={{ border:'1px solid rgba(239,68,68,0.15)', background:'#0a0a0a' }}>
          {critical.filter(s=>!dismissed.has(s.student_id)).length === 0 ? (
            <div style={{ padding:'24px 20px', textAlign:'center', fontFamily:'JetBrains Mono,monospace', fontSize:'0.5625rem', letterSpacing:'0.1em', color:'rgba(255,255,255,0.2)' }}>
              ALL CRITICAL ALERTS RESOLVED
            </div>
          ) : critical.filter(s=>!dismissed.has(s.student_id)).map((s,i,arr) => (
            <div key={s.student_id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.04)':'none', flexWrap:'wrap', gap:12,
              transition:'background 0.12s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(239,68,68,0.03)')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Playfair Display,serif', fontWeight:700, color:'#f87171', flexShrink:0 }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.9)', marginBottom:2 }}>{s.name}</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.08em', color:'rgba(255,255,255,0.3)' }}>{s.student_id} · {s.program}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.25rem', fontWeight:700, color:'#ef4444' }}>{(s.risk_score*100).toFixed(0)}%</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.3)' }}>risk score</div>
                </div>
                <button onClick={()=>dismiss(s.student_id)}
                  style={{ padding:'7px 14px', background:'transparent', border:'1px solid rgba(200,216,232,0.2)', color:'rgba(200,216,232,0.7)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{(e.target as HTMLElement).style.background='rgba(200,216,232,0.06)';(e.target as HTMLElement).style.color='rgba(200,216,232,1)'}}
                  onMouseLeave={e=>{(e.target as HTMLElement).style.background='transparent';(e.target as HTMLElement).style.color='rgba(200,216,232,0.7)'}}>
                  Mark Contacted
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High */}
      <div>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#fb923c', marginBottom:12 }}>
          ⚠ High Risk — Action Recommended
        </div>
        <div style={{ border:'1px solid rgba(249,115,22,0.12)', background:'#0a0a0a' }}>
          {high.filter(s=>!dismissed.has(s.student_id)).slice(0,8).map((s,i,arr) => (
            <div key={s.student_id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:i<arr.length-1?'1px solid rgba(255,255,255,0.04)':'none', flexWrap:'wrap', gap:12,
              transition:'background 0.12s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(249,115,22,0.02)')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Playfair Display,serif', fontWeight:700, color:'#fb923c', flexShrink:0 }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.9)', marginBottom:2 }}>{s.name}</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.08em', color:'rgba(255,255,255,0.3)' }}>{s.student_id} · {s.program}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.25rem', fontWeight:700, color:'#f97316' }}>{(s.risk_score*100).toFixed(0)}%</div>
                  <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.3)' }}>risk score</div>
                </div>
                <button onClick={()=>dismiss(s.student_id)}
                  style={{ padding:'7px 14px', background:'transparent', border:'1px solid rgba(200,216,232,0.2)', color:'rgba(200,216,232,0.7)', fontFamily:'JetBrains Mono,monospace', fontSize:'0.5rem', letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{(e.target as HTMLElement).style.background='rgba(200,216,232,0.06)'}}
                  onMouseLeave={e=>{(e.target as HTMLElement).style.background='transparent'}}>
                  Schedule Meeting
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  )
}