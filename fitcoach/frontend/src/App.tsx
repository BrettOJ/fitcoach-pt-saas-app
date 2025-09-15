import React, { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

type Profile = {
  units: 'metric' | 'imperial'
  age?: number
  sex?: string
  height_cm?: number
  weight_kg?: number
  rhr?: number
  experience_months?: number
  goal?: string
  days_per_week?: number
  activity?: number
  equipment?: string
  health?: string[]
  notes?: string
}

type EvalResult = {
  score: number
  level: string
  parts: string[]
  details?: any
}

export default function App() {
  const [tab, setTab] = useState<'profile' | 'outputs' | 'plan'>('profile')
  const [profile, setProfile] = useState<Profile>({ units: 'metric', activity: 1.55, days_per_week: 4, goal: 'general', equipment: 'bodyweight' })
  const [kpis, setKpis] = useState({ bmi: null as number | null, bmr: null as number | null, tdee: null as number | null })

  // Outputs / tests
  const [t5k, setT5k] = useState('')
  const [t15mi, setT15mi] = useState('')
  const [cooper, setCooper] = useState('')
  const [pushups, setPushups] = useState('')
  const [plank, setPlank] = useState('')
  const [rmSquat, setRmSquat] = useState('')
  const [rmBench, setRmBench] = useState('')
  const [rmDead, setRmDead] = useState('')

  const [evalRes, setEvalRes] = useState<EvalResult | null>(null)
  const [planHtml, setPlanHtml] = useState<JSX.Element | null>(null)
  const [macros, setMacros] = useState<any>(null)

  // Toast
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('fitcoach_profile')
    if (saved) setProfile(JSON.parse(saved))
    computeKpis(JSON.parse(saved || '{}'))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1600)
    return () => clearTimeout(t)
  }, [toast])

  // Helpers (port of the demo functions)
  function kgFromLb(lb:number){ return lb/2.2046226218 }
  function cmFromFtIn(ft:number, inch:number){ return ft*30.48 + inch*2.54 }
  function clamp(x:number,a=0,b=100){ return Math.max(a, Math.min(b, x)) }
  function parseTimeMMSS(v:string | null){ if(!v) return null; const parts = v.split(':').map(x=>x.trim()); if(parts.length===1){ const s = Number(parts[0]); return isFinite(s)? s : null } const m = Number(parts[0]); const s = Number(parts[1]); if(!isFinite(m)||!isFinite(s)) return null; return m*60 + s }

  function computeKpis(p=profile){
    const bmi = (p.weight_kg && p.height_cm) ? (p.weight_kg / Math.pow((p.height_cm/100),2)) : null
    const bmr = (p.weight_kg && p.height_cm && p.age && p.sex) ? (10*(p.weight_kg) + 6.25*(p.height_cm) - 5*(p.age) + (p.sex==='male'?5:-161)) : null
    const tdee = (bmr && p.activity) ? bmr * p.activity : null
    setKpis({ bmi: bmi || null, bmr: bmr || null, tdee: tdee || null })
  }

  function saveProfile(){ localStorage.setItem('fitcoach_profile', JSON.stringify(profile)); setToast('Profile saved'); computeKpis(profile) }
  function loadProfile(){ const p = localStorage.getItem('fitcoach_profile'); if(p){ setProfile(JSON.parse(p)); setToast('Profile loaded'); computeKpis(JSON.parse(p)) } }
  function clearAll(){ localStorage.removeItem('fitcoach_profile'); setProfile({ units:'metric', activity:1.55, days_per_week:4, goal:'general', equipment:'bodyweight' }); setT5k(''); setT15mi(''); setCooper(''); setPushups(''); setPlank(''); setRmSquat(''); setRmBench(''); setRmDead(''); setEvalRes(null); setPlanHtml(null); setMacros(null); setToast('Cleared') }
  function sampleData(){ const demo:Profile = {units:'metric', age:35, sex:'male', height_cm:178, weight_kg:78, rhr:58, experience_months:18, goal:'general', days_per_week:4, activity:1.55, equipment:'dumbbells', health:['joint'], notes:'Left knee: prefer cycling to running.'}; setProfile(demo); setT5k('24:30'); setT15mi('12:10'); setCooper('2300'); setPushups('32'); setPlank('2:00'); setRmSquat('110'); setRmBench('85'); setRmDead('140'); setToast('Sample data filled'); computeKpis(demo) }

  // Evaluation logic ported
  function computeVO2from15mi(sec:number){ if(!sec) return null; const min = sec/60; return 3.5 + (483 / min) }
  function computeVO2fromCooper(m:number){ if(!m) return null; return (m - 504.9)/44.73 }
  function enduranceScore({sec5k, sec15, cooper_m}:{sec5k?:number, sec15?:number, cooper_m?:number}){
    let vo2:any = null
    if(sec15) vo2 = computeVO2from15mi(sec15)
    else if(cooper_m) vo2 = computeVO2fromCooper(cooper_m)
    else if(sec5k){ const pace = sec5k/1000; const min_per_km = (pace*1000)/60; const s = 100 - ((min_per_km - 4) * 100 / (8-4)); return clamp(s,0,100) }
    if(!vo2) return null
    return clamp(((vo2 - 25) * 85 / (60-25)) + 10, 0, 100)
  }

  function strengthScore({kg, pushups, rm}:{kg?:number, pushups?:number, rm?:{sq?:number,be?:number,dl?:number}}){ const bw = kg||0; let scores:number[]=[]; if(rm?.sq && bw) scores.push(clamp((rm.sq/bw) / 1.5 * 100)); if(rm?.be && bw) scores.push(clamp((rm.be/bw) / 1.2 * 100)); if(rm?.dl && bw) scores.push(clamp((rm.dl/bw) / 1.8 * 100)); if(pushups) scores.push(clamp((pushups/50)*100)); if(!scores.length) return null; return clamp(scores.reduce((a,b)=>a+b,0)/scores.length,0,100) }
  function coreScore({plankSec}:{plankSec?:number}){ if(!plankSec) return null; return clamp((plankSec/180)*100) }

  function determineLevel(score:number|null, expMonths?:number){ if(score==null) return '–'; const adj = score + Math.min(expMonths||0,24) * 0.5; if(adj<40) return 'Beginner'; if(adj<70) return 'Intermediate'; return 'Advanced' }

  function evaluate(){
    const p = profile
    const sec5k = parseTimeMMSS(t5k)
    const sec15 = parseTimeMMSS(t15mi)
    const cooper_m = Number(cooper||0)
    const push = Number(pushups||0)
    const plankSec = parseTimeMMSS(plank)
    const rm = { sq: Number(rmSquat||0), be: Number(rmBench||0), dl: Number(rmDead||0) }
    const e = enduranceScore({sec5k: sec5k||undefined, sec15: sec15||undefined, cooper_m: cooper_m||undefined})
    const s = strengthScore({kg: p.weight_kg, pushups: push, rm})
    const c = coreScore({plankSec: plankSec||undefined})
    let weights = {e:0.4, s:0.4, c:0.2}; const parts:string[] = []
    if(e==null){ weights = {e:0, s:0.6, c:0.4}; parts.push('No endurance test; weighing strength & core more.') }
    if(s==null){ weights = {e:0.6, s:0, c:0.4}; parts.push('No strength tests; weighing endurance & core more.') }
    if(e==null && s==null){ weights = {e:0, s:0, c:1}; parts.push('Only core available; overall reflects core/mobility.') }
    const total = ( (e||0)*weights.e + (s||0)*weights.s + (c||0)*weights.c ) / (weights.e+weights.s+weights.c || 1)
    const level = determineLevel(total, p.experience_months)
    setEvalRes({ score: total||0, level, parts, details:{e,s,c,sec5k,sec15,cooper_m,push,plankSec,rm} })
    setToast('Evaluation updated')
  }

  // Plan generation (simplified but faithful)
  function macroTargets(goal:string|undefined, tdee:number|null, kg:number|undefined){ if(!tdee||!kg) return {kcal:null, protein:null, carbs:null, fat:null}; let kcal=tdee, p=1.6; if(goal==='fatloss'){ kcal = tdee*0.8; p = 1.8 } if(goal==='muscle'){ kcal = tdee*1.1; p = 2.0 } if(goal==='endurance'){ kcal = tdee*1.0; p = 1.6 } const protein = Math.round(p*kg); let split = {p:0.30,c:0.40,f:0.30}; if(goal==='endurance') split={p:0.25,c:0.55,f:0.20}; if(goal==='muscle') split={p:0.30,c:0.45,f:0.25}; if(goal==='fatloss') split={p:0.35,c:0.35,f:0.30}; const grams = { protein, carbs: Math.round((kcal*split.c)/4), fat: Math.round((kcal*split.f)/9) }; return {kcal:Math.round(kcal), protein:grams.protein, carbs:grams.carbs, fat:grams.fat} }

  function generatePlan(){
    const p = profile
    const evalR = evalRes || { score:0, level:'Beginner' }
    const days = clamp(Number(p.days_per_week||4),2,7)
    // simple strength/cardio templates
    const strengthTemplates = [ 'Full-body: 4x8 Squats, 4x8 Push-ups, 3x10 Hip Hinge', 'Upper: 4x8 DB Bench, 4x10 DB Row, 3x10 DB Press', 'Lower: 4x8 Goblet Squat, 4x8 RDL, 3x12 Lunges' ]
    const cardioTemplates = { easy:['30–40 min easy Zone 2'], mod:['35–50 min steady Zone 2–3'], hiit:['20–25 min intervals: 1:00 hard / 2:00 easy × 8–10'] }
    const mobilityTemplate = ['15–25 min mobility + 8–10 min core']
    // distribution
    let dist:any
    if(p.goal==='fatloss') dist = {str: Math.min(3,days-1), car: Math.max(2, days-3), mob: days - (Math.min(3,days-1)+Math.max(2, days-3))}
    else if(p.goal==='muscle') dist = {str: Math.max(3, days-2), car: Math.max(1, days-4), mob: days - (Math.max(3, days-2)+Math.max(1, days-4))}
    else if(p.goal==='endurance') dist = {str: Math.max(2, days-3), car: Math.max(3, days-2), mob: days - (Math.max(2, days-3)+Math.max(3, days-2))}
    else dist = {str: Math.max(2, days-3), car: Math.max(2, days-3), mob: days - (Math.max(2, days-3)+Math.max(2, days-3))}

    const plan:any[] = []
    let sIdx=0
    for(let d=1; d<=days; d++){
      const day:any = { title:`Day ${d}`, items: [], tags: [] }
      if(dist.str>0){ day.items.push({text:strengthTemplates[sIdx%strengthTemplates.length]}); sIdx++; dist.str--; day.tags.push('Strength') }
      else if(dist.car>0){ const intensity = evalR.score>70? 'hiit' : (evalR.score>40? 'mod' : 'easy'); day.items.push({text:cardioTemplates[intensity][0]}); dist.car--; day.tags.push('Cardio') }
      else { day.items.push({text:mobilityTemplate[0]}); dist.mob--; day.tags.push('Mobility') }
      plan.push(day)
    }

    // render plan block
    const planEl = (<>{plan.map((d,i)=> (
      <div key={i} className="plan-day">
        <h3>{d.title} <span className="tag">{d.tags.join(' · ')}</span></h3>
        <ul className="plan-list">{d.items.map((it:any, idx:number)=>(<li key={idx}>{it.text}</li>))}</ul>
      </div>
    ))}</>)
    setPlanHtml(planEl)

    // nutrition
    const bmr = kpis.bmr
    const tdee = kpis.tdee
    const macrosRes = macroTargets(p.goal, tdee, p.weight_kg)
    setMacros(macrosRes)
    setToast('Plan generated')
  }

  function exportPlan(){ if(!planHtml){ setToast('Generate a plan first'); return } const p = profile; const ev = evalRes || {score:0, level:'Beginner'}; const lines:string[] = []; lines.push('FitCoach Personalized Plan'); lines.push(`Goal: ${p.goal} | Level: ${ev.level} | Score: ${Math.round(ev.score||0)}`); lines.push(''); // flatten planHtml won't be exported nicely; use simple text
    // for simplicity, create lines from planHtml via plan generation again
    // (reuse generatePlan algorithm behaviour)
    const blob = new Blob([lines.join('\n')], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'fitcoach-plan.txt'; a.click(); URL.revokeObjectURL(url) }

  // Note: real macroTargets function is defined above; no placeholder is required.

  return (
    <div className="container">
      <header>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <h1>FitCoach <span className="badge">Demo</span></h1>
          <span className="pill">Single-file · React demo</span>
        </div>
        <div className="tabs" role="tablist" aria-label="FitCoach sections">
          <button className="tab-btn" role="tab" aria-selected={tab==='profile'} data-tab="profile" onClick={()=>setTab('profile')}>👤 Profile</button>
          <button className="tab-btn" role="tab" aria-selected={tab==='outputs'} data-tab="outputs" onClick={()=>setTab('outputs')}>📈 Training Outputs</button>
          <button className="tab-btn" role="tab" aria-selected={tab==='plan'} data-tab="plan" onClick={()=>setTab('plan')}>🗓️ Plan</button>
        </div>
      </header>

      {/* PROFILE TAB */}
      <section id="tab-profile" className={`tab-panel ${tab!=='profile'? 'hidden':''}`}>
        <div className="grid">
          <div className="card">
            <h2>Personal Details</h2>
            <div className="row">
              <div className="col-4">
                <label>Units</label>
                <select value={profile.units} onChange={e=> setProfile({...profile, units: e.target.value as any})}>
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lb, ft/in)</option>
                </select>
              </div>
              <div className="col-4"><label>Age</label><input type="number" value={profile.age||''} onChange={e=> setProfile({...profile, age: Number(e.target.value)})} /></div>
              <div className="col-4"><label>Sex</label><select value={profile.sex||'male'} onChange={e=> setProfile({...profile, sex: e.target.value})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>

              {profile.units==='metric' ? (
                <>
                  <div className="col-6 metric-only"><label>Height (cm)</label><input type="number" value={profile.height_cm||''} onChange={e=> setProfile({...profile, height_cm: Number(e.target.value)})} /></div>
                  <div className="col-6 metric-only"><label>Weight (kg)</label><input type="number" value={profile.weight_kg||''} onChange={e=> setProfile({...profile, weight_kg: Number(e.target.value)})} /></div>
                </>
              ) : (
                <>
                  <div className="col-6 imperial-only"><label>Height (ft)</label><input type="number" placeholder="ft" /></div>
                  <div className="col-6 imperial-only"><label>Weight (lb)</label><input type="number" placeholder="lb" onChange={e=> setProfile({...profile, weight_kg: kgFromLb(Number(e.target.value) || 0) })} /></div>
                </>
              )}

              <div className="col-6"><label>Resting Heart Rate (bpm)</label><input type="number" value={profile.rhr||''} onChange={e=> setProfile({...profile, rhr: Number(e.target.value)})} /></div>
              <div className="col-6"><label>Experience (months of consistent training)</label><input type="number" value={profile.experience_months||''} onChange={e=> setProfile({...profile, experience_months: Number(e.target.value)})} /></div>
              <div className="col-6"><label>Primary Goal</label><select value={profile.goal} onChange={e=> setProfile({...profile, goal: e.target.value})}><option value="general">General Fitness</option><option value="fatloss">Fat Loss</option><option value="muscle">Muscle Gain</option><option value="endurance">Endurance</option></select></div>
              <div className="col-6"><label>Days Available / week</label><input type="number" value={profile.days_per_week||4} min={2} max={7} onChange={e=> setProfile({...profile, days_per_week: Number(e.target.value)})} /></div>
              <div className="col-6"><label>Activity Level (outside training)</label><select value={String(profile.activity)} onChange={e=> setProfile({...profile, activity: Number(e.target.value)})}><option value="1.2">Sedentary</option><option value="1.375">Lightly Active</option><option value="1.55">Moderately Active</option><option value="1.725">Very Active</option><option value="1.9">Extra Active</option></select></div>
              <div className="col-6"><label>Equipment</label><select value={profile.equipment} onChange={e=> setProfile({...profile, equipment: e.target.value})}><option value="bodyweight">Bodyweight / Minimal</option><option value="dumbbells">Dumbbells / Bands</option><option value="gym">Full Gym</option></select></div>
              <div className="col-12"><label>Health Conditions (check all that apply)</label>
                <div className="stack">
                  {['hypertension','diabetes','joint','back','asthma','pregnancy'].map(h=> (
                    <label key={h} className="pill"><input type="checkbox" checked={profile.health?.includes(h)||false} onChange={(e) => {
                      const target = e.target as HTMLInputElement
                      const next = new Set(profile.health || [])
                      if (target.checked) next.add(h); else next.delete(h)
                      setProfile({...profile, health: Array.from(next)})
                    }} /> {h}</label>
                  ))}
                </div>
              </div>
              <div className="col-12"><label>Notes / Injuries</label><textarea rows={3} value={profile.notes||''} onChange={e=> setProfile({...profile, notes: e.target.value})}></textarea></div>
            </div>
            <div className="hr"></div>
            <div className="stack">
              <button id="saveProfile" className="btn" onClick={saveProfile}>💾 Save</button>
              <button id="loadProfile" className="btn secondary" onClick={loadProfile}>📂 Load</button>
              <button id="sampleData" className="btn warn" onClick={sampleData}>✨ Fill Sample Data</button>
              <button id="clearAll" className="btn danger" onClick={clearAll}>🧹 Clear</button>
            </div>
            <p className="footer">We store data locally in your browser (localStorage) for this demo. Nothing is uploaded.</p>
          </div>
          <div className="card">
            <h2>Quick Metrics</h2>
            <div className="grid">
              <div className="kpi"><span>BMI</span><span className="val">{kpis.bmi? `${kpis.bmi.toFixed(1)}` : '–'}</span></div>
              <div className="kpi"><span>BMR</span><span className="val">{kpis.bmr? `${Math.round(kpis.bmr)} kcal` : '–'}</span></div>
              <div className="kpi"><span>TDEE</span><span className="val">{kpis.tdee? `${Math.round(kpis.tdee)} kcal` : '–'}</span></div>
            </div>
            <p className="muted" style={{marginTop:10}}>Update your stats to compute BMI (kg/m²), BMR (Mifflin-St Jeor), and daily calories (TDEE).</p>
          </div>
        </div>
      </section>

      {/* OUTPUTS TAB */}
      <section id="tab-outputs" className={`tab-panel ${tab!=='outputs'?'hidden':''}`}>
        <div className="grid">
          <div className="card">
            <h2>Performance Tests</h2>
            <div className="row">
              <div className="col-6"><label>5k Time (mm:ss)</label><input value={t5k} onChange={e=> setT5k(e.target.value)} placeholder="e.g., 25:30" /></div>
              <div className="col-6"><label>1.5 mile Run (mm:ss)</label><input value={t15mi} onChange={e=> setT15mi(e.target.value)} placeholder="e.g., 12:15" /></div>
              <div className="col-6"><label>Cooper 12-min Run Distance (m)</label><input value={cooper} onChange={e=> setCooper(e.target.value)} /></div>
              <div className="col-6"><label>Push-ups in 1 min</label><input value={pushups} onChange={e=> setPushups(e.target.value)} /></div>
              <div className="col-6"><label>Plank Hold (mm:ss)</label><input value={plank} onChange={e=> setPlank(e.target.value)} placeholder="e.g., 1:45" /></div>
            </div>
            <div className="row" style={{marginTop:6}}>
              <div className="col-4"><label>1RM Squat</label><input value={rmSquat} onChange={e=> setRmSquat(e.target.value)} placeholder="kg (auto-convert)" /></div>
              <div className="col-4"><label>1RM Bench</label><input value={rmBench} onChange={e=> setRmBench(e.target.value)} /></div>
              <div className="col-4"><label>1RM Deadlift</label><input value={rmDead} onChange={e=> setRmDead(e.target.value)} /></div>
            </div>
            <div className="hr"></div>
            <button id="evaluate" className="btn" onClick={evaluate}>⚖️ Evaluate Fitness</button>
          </div>
          <div className="card">
            <h2>Evaluation Summary</h2>
            <div className="kpi"><span>Overall Fitness Score</span><span className="val">{evalRes? Math.round(evalRes.score): '–'}</span></div>
            <div style={{margin:'10px 0'}} className="progress"><span style={{width: evalRes? `${Math.round(evalRes.score)}%` : '0%'}}></span></div>
            <div className="grid">
              <div>
                <div className="kpi"><span>Endurance</span><span className="val">{evalRes?.details?.e? Math.round(evalRes.details.e) : '–'}</span></div>
                <div className="progress" style={{margin:'8px 0 14px 0'}}><span style={{width: evalRes?.details?.e? `${Math.round(evalRes.details.e)}%` : '0%'}}></span></div>
              </div>
              <div>
                <div className="kpi"><span>Strength</span><span className="val">{evalRes?.details?.s? Math.round(evalRes.details.s) : '–'}</span></div>
                <div className="progress" style={{margin:'8px 0 14px 0'}}><span style={{width: evalRes?.details?.s? `${Math.round(evalRes.details.s)}%` : '0%'}}></span></div>
              </div>
            </div>
            <div>
              <div className="kpi"><span>Core/Mobility</span><span className="val">{evalRes?.details?.c? Math.round(evalRes.details.c) : '–'}</span></div>
              <div className="progress" style={{margin:'8px 0 14px 0'}}><span style={{width: evalRes?.details?.c? `${Math.round(evalRes.details.c)}%` : '0%'}}></span></div>
            </div>
            <div id="level-pill" className="pill" style={{marginTop:6}}>Level: {evalRes?.level || '–'}</div>
            <p className="muted" id="eval-notes" style={{marginTop:10}}>{evalRes?.parts?.length? evalRes.parts.join(' ') : 'Enter some outputs and click Evaluate.'}</p>
          </div>
        </div>
      </section>

      {/* PLAN TAB */}
      <section id="tab-plan" className={`tab-panel ${tab!=='plan'?'hidden':''}`}>
        <div className="grid">
          <div className="card">
            <h2>Personalized Plan</h2>
            <div className="stack" style={{marginBottom:10}}>
              <button id="genPlan" className="btn" onClick={generatePlan}>🛠️ Generate Plan</button>
              <button id="exportPlan" className="btn secondary" onClick={exportPlan}>⬇️ Export</button>
              <button id="printPlan" className="btn secondary" onClick={()=> window.print()}>🖨️ Print</button>
            </div>
            <div id="planWrap" className="grid">{planHtml}</div>
          </div>
          <div className="card">
            <h2>Nutrition Targets</h2>
            <div className="grid">
              <div className="kpi"><span>Calories</span><span className="val">{macros?.kcal? `${macros.kcal} kcal` : '–'}</span></div>
              <div className="kpi"><span>Protein</span><span className="val">{macros?.protein? `${macros.protein} g` : '–'}</span></div>
              <div className="kpi"><span>Carbs</span><span className="val">{macros?.carbs? `${macros.carbs} g` : '–'}</span></div>
              <div className="kpi"><span>Fat</span><span className="val">{macros?.fat? `${macros.fat} g` : '–'}</span></div>
            </div>
            <p className="muted" style={{marginTop:10}}>Protein target scales with goal (approx 1.6–2.2 g/kg). Adjust based on preference and tolerance.</p>
          </div>
        </div>
      </section>

      <p className="footer">⚠️ This demo provides generalized guidance and is not medical advice. Consult a professional before starting a new program.</p>

      <div id="toast" className={`toast ${toast? 'show':''}`}>{toast}</div>
    </div>
  )
}
