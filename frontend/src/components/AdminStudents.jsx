import { useCallback, useEffect, useMemo, useState } from "react";
const API_URL = "/api";

export default function AdminStudents({ token, onNavigate, onLogout }) {
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sr, ar] = await Promise.all([
        fetch(`${API_URL}/admin/students`, { headers }),
        fetch(`${API_URL}/admin/applications`, { headers }),
      ]);
      if (!sr.ok) throw new Error("Failed to load students.");
      if (!ar.ok) throw new Error("Failed to load applications.");
      const sd = await sr.json(); const ad = await ar.json();
      setStudents(Array.isArray(sd)? sd : sd.students || sd.data || []);
      setApplications(Array.isArray(ad)? ad : ad.applications || ad.data || []);
    } catch (err) { setError(err.message || "Unable to load student data."); } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);
  const doSearch = () => setSearchQuery(searchInput.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!searchQuery) return students;
    return students.filter((s) => [s.name, s.full_name, s.username, s.email, s.id].filter(Boolean).join(" ").toLowerCase().includes(searchQuery));
  }, [students, searchQuery]);

  const getSid = (s) => s.id?? s.student_id;
  const getAid = (a) => a.student_id?? a.student?.id?? a.user_id;
  const sAppMap = useMemo(() => { const m={}; students.forEach(st=>{ const id=String(getSid(st)); m[id]=applications.filter(a=> String(getAid(a))===id); }); return m; },[students,applications]);
  const total = students.length;
  const activeApplicants = students.filter(s=> (sAppMap[String(getSid(s))]||[]).length>0).length;
  const withoutApps = Math.max(total-activeApplicants,0);
  const selected = applications.filter(a=> ["accepted","selected"].includes(String(a.status||"").toLowerCase())).length;

  const statusCounts = useMemo(()=>{ const c={Applied:0,"Under Review":0,Shortlisted:0,Accepted:0,Rejected:0}; applications.forEach(a=>{ const s=String(a.status||"").trim().toLowerCase(); if(s==="applied") c.Applied++; else if(["under review","pending","review"].includes(s)) c["Under Review"]++; else if(s==="shortlisted") c.Shortlisted++; else if(["accepted","selected"].includes(s)) c.Accepted++; else if(s==="rejected") c.Rejected++; }); return c; },[applications]);
  const monthlyApplications = useMemo(()=>{ const now=new Date(); const months=[]; for(let i=5;i>=0;i--){ const d=new Date(now.getFullYear(),now.getMonth()-i,1); months.push({key:`${d.getFullYear()}-${d.getMonth()+1}`,label:d.toLocaleDateString("en-US",{month:"short"}),count:0}); } applications.forEach(a=>{ const dv=a.created_at||a.applied_at||a.application_date; if(!dv) return; const dt=new Date(dv); if(isNaN(dt)) return; const key=`${dt.getFullYear()}-${dt.getMonth()+1}`; const m=months.find(x=>x.key===key); if(m) m.count++; }); return months; },[applications]);
  const maxMonthly = Math.max(...monthlyApplications.map(m=>m.count),1);
  const statusRows=[{label:"Applied",count:statusCounts.Applied,color:"#3b82f6"},{label:"Under Review",count:statusCounts["Under Review"],color:"#8b5cf6"},{label:"Shortlisted",count:statusCounts.Shortlisted,color:"#f59e0b"},{label:"Accepted",count:statusCounts.Accepted,color:"#22c55e"},{label:"Rejected",count:statusCounts.Rejected,color:"#ef4444"}];
  const studentRows = useMemo(()=> filtered.map(s=>{ const id=String(getSid(s)); const apps=sAppMap[id]||[]; let st="No Applications"; if(apps.some(a=>["accepted","selected"].includes(String(a.status||"").toLowerCase()))) st="Selected"; else if(apps.some(a=>["under review","pending","review"].includes(String(a.status||"").toLowerCase()))) st="Under Review"; else if(apps.length>0) st="Applied"; return {...s,applicationCount:apps.length,status:st}; }),[filtered,sAppMap]);

  if(loading) return <div style={s.loading}><div style={s.loadingBox}><div style={s.loadingSpinner}>S</div><div><div style={s.loadingTitle}>Loading Real System</div><div style={s.loadingText}>Fetching SkillBridge live data...</div></div></div></div>;
  if(error) return <div style={s.errorPage}><div style={s.errorCard}><div style={s.errorIcon}>!</div><h2 style={s.errorTitle}>Unable to load</h2><p style={s.errorText}>{error}</p><button onClick={load} style={s.primaryBtn}>Try Again</button></div></div>;

  return (
    <div style={s.page}>
      {/* GRADIENT BLUE + GOLD LINES */}
      <div style={s.goldTop}/><div style={s.meshBlue}/><div style={s.meshGold}/>

      <aside style={s.sidebar}>
        <div style={s.brand}><div style={s.logo}>S</div><div><b style={s.brandName}>SkillBridge</b><div style={s.brandSub}>GRADIENT BLUE • GOLD</div></div><div style={s.livePill}>● LIVE</div></div>
        <div style={s.navSection}>MAIN MENU</div>
        <button onClick={()=>onNavigate("AdminDashboard")} style={s.nav}><span>⌂</span> Dashboard</button>
        <button onClick={()=>onNavigate("AdminInternships")} style={s.nav}><span>▣</span> Internships</button>
        <button style={{...s.nav,...s.active}}><span>●</span> Students <span style={s.navCount}>{total}</span></button>
        <button onClick={()=>onNavigate("AdminApplications")} style={s.nav}><span>▤</span> Applications <span style={s.navCount}>{applications.length}</span></button>
        <div style={{flex:1}}/>
        <div style={s.sidebarBottom}><div style={s.liveDot}/><span>Live API • {total} students • {applications.length} apps</span></div>
        <button onClick={onLogout} style={s.logout}>↪ Sign Out</button>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <div><div style={s.crumb}>Dashboard / Students • Gradient Blue + Gold • Real Data</div><h1 style={s.h1}>Student Management</h1><p style={s.headerText}>Monitor {total} students and {applications.length} real applications - no fake data</p></div>
          <div style={s.headerActions}>
            <div style={s.searchBox}><span>⌕</span><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="Search real students..." style={s.input}/></div>
            <button onClick={doSearch} style={s.searchBtn}>Search</button>
            <button onClick={load} style={s.refresh}>↻</button>
          </div>
        </header>

        <section style={s.cardGrid}>
          <div style={{...s.statCard,...s.statCardGold}}><div style={s.goldLineTop}/><div style={{...s.iconBox,background:"linear-gradient(135deg,#3b82f6,#2563eb)",boxShadow:"0 8px 18px rgba(37,99,235,0.35)"}}>👥</div><div style={s.statContent}><div style={s.statLabel}>Total Students</div><div style={s.statNum}>{total}</div><div style={s.statSub}>Registered • Real API</div></div><div style={s.statBadgeGold}>100%</div></div>
          <div style={s.statCard}><div style={s.goldLineTop}/><div style={{...s.iconBox,background:"linear-gradient(135deg,#8b5cf6,#7c3aed)"}}>▤</div><div style={s.statContent}><div style={s.statLabel}>Active Applicants</div><div style={s.statNum}>{activeApplicants}</div><div style={s.statSub}>With applications • Real</div></div><div style={s.statBadge}>{total>0?`${Math.round((activeApplicants/total)*100)}%`:"0%"}</div></div>
          <div style={s.statCard}><div style={s.goldLineTop}/><div style={{...s.iconBox,background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>✓</div><div style={s.statContent}><div style={s.statLabel}>Selected Students</div><div style={s.statNum}>{selected}</div><div style={s.statSub}>Accepted • Real</div></div><div style={s.statBadge}>{applications.length>0?`${Math.round((selected/applications.length)*100)}%`:"0%"}</div></div>
          <div style={s.statCard}><div style={s.goldLineTop}/><div style={{...s.iconBox,background:"linear-gradient(135deg,#f59e0b,#d97706)"}}>+</div><div style={s.statContent}><div style={s.statLabel}>Without Applications</div><div style={s.statNum}>{withoutApps}</div><div style={s.statSub}>Needs support • Real</div></div><div style={s.statBadge}>{total>0?`${Math.round((withoutApps/total)*100)}%`:"0%"}</div></div>
        </section>

        <section style={s.midGrid}>
          <div style={s.chartCard}>
            <div style={s.chartHeader}><div><h3 style={s.chartTitle}>Application Activity • REAL</h3><p style={s.chartSub}>Last 6 months from real applications - no Engineering 87% fake</p></div><div style={s.realBadge}><span style={s.realDot}/>REAL DATA</div></div>
            {applications.length===0? <div style={s.chartEmpty}><div style={s.emptyIcon}>▤</div><b>No real application data yet</b><span>Chart shows real data when students apply</span></div> :
            <div style={s.activityChart}><div style={s.yAxis}><span>{maxMonthly}</span><span>{Math.ceil(maxMonthly/2)}</span><span>0</span></div><div style={s.barsArea}><div style={s.gridLine}/><div style={{...s.gridLine,top:"50%"}}/><div style={s.bars}>{monthlyApplications.map(m=>{ const h=m.count===0?4:Math.max((m.count/maxMonthly)*100,10); return (<div key={m.key} style={s.barCol}><div style={s.barVal}>{m.count}</div><div style={{...s.bar,height:`${h}%`,background:m.count===monthlyApplications[5]?.count&&m.count>0?"linear-gradient(180deg,#3b82f6,#2563eb)":"linear-gradient(180deg,#93c5fd,#60a5fa)",borderTop:m.count>0?"2px solid #fbbf24":"none",boxShadow:m.count>0?"0 4px 12px rgba(37,99,235,0.25)":"none"}}/><span style={s.barLabel}>{m.label}</span></div>); })}</div></div></div>}
          </div>
          <div style={s.chartCard}>
            <div style={s.chartHeader}><div><h3 style={s.chartTitle}>Application Status • REAL</h3><p style={s.chartSub}>Status from {applications.length} real applications</p></div><div style={s.totalPill}>{applications.length}<span>Total</span></div></div>
            <div style={s.statusList}>{statusRows.map(r=>{ const pct=applications.length>0?Math.round((r.count/applications.length)*100):0; return (<div key={r.label} style={s.statusRow}><div style={s.statusTop}><div style={s.statusName}><span style={{...s.dot,background:r.color}}/> {r.label}</div><div style={s.statusCount}>{r.count}<span>{pct}%</span></div></div><div style={s.track}><div style={{...s.fill,width:`${pct}%`,background:r.color,boxShadow:`0 2px 8px ${r.color}55`}}/></div></div>); })}</div>
          </div>
        </section>

        <section style={s.tableCard}>
          <div style={s.tableHeader}><div><h2 style={s.tableTitle}>Student Directory • Real</h2><p style={s.tableSub}>{filtered.length} shown{searchQuery?` for "${searchQuery}"`:""} • Real matching from API</p></div><div style={s.dirBadge}>{total} Registered</div></div>
          {studentRows.length===0? <div style={s.noStudents}><div style={s.noIcon}>⌕</div><h3>No students found</h3><p>{searchQuery?"Try different term":"No students registered"}</p></div> :
          <div style={s.tableWrap}><table style={s.table}><thead><tr><th style={s.th}>STUDENT • REAL</th><th style={s.th}>EMAIL • REAL</th><th style={s.th}>APPLICATIONS • REAL</th><th style={s.th}>STATUS • REAL</th><th style={s.th}>REGISTERED • REAL</th></tr></thead><tbody>{studentRows.map(st=><tr key={st.id} style={s.tr}><td style={s.td}><div style={s.cell}><div style={s.av}>{(st.name||"S")[0].toUpperCase()}</div><div><div style={s.name}>{st.name||"Unnamed"}</div><div style={s.idSmall}>ID: {st.id}</div></div></div></td><td style={s.td}>{st.email||"—"}</td><td style={s.td}><span style={s.appCount}>{st.applicationCount}</span></td><td style={s.td}><span style={{...s.statusBadge,background:st.status==="Selected"?"#dcfce7":st.status==="Under Review"?"#ede9fe":st.status==="Applied"?"#dbeafe":"#f1f5f9",color:st.status==="Selected"?"#15803d":st.status==="Under Review"?"#6d28d9":st.status==="Applied"?"#1d4ed8":"#64748b"}}><span style={{...s.badgeDot,background:st.status==="Selected"?"#15803d":st.status==="Under Review"?"#6d28d9":st.status==="Applied"?"#1d4ed8":"#64748b"}}/>{st.status}</span></td><td style={s.td}>{st.created_at? new Date(st.created_at).toLocaleDateString("en-GB"):"—"}</td></tr>)}</tbody></table></div>}
          <div style={s.tableFooter}><span>Showing {filtered.length} of {total} real students</span><span style={s.footerReal}>● Connected to live API • Gradient Blue + Gold</span></div>
        </section>
      </main>
    </div>
  );
}

const s={
  page:{minHeight:"100vh",display:"flex",background:"linear-gradient(135deg,#dbeafe 0%,#bfdbfe 30%,#e0f2fe 70%,#eff6ff 100%)",fontFamily:"Inter,ui-sans-serif,system-ui",color:"#0f172a",position:"relative",overflow:"hidden"},
  goldTop:{position:"fixed",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)",zIndex:100,boxShadow:"0 2px 10px rgba(251,191,36,0.4)"},
  meshBlue:{position:"absolute",width:"70%",height:"60%",left:"-10%",top:"-10%",background:"radial-gradient(ellipse, rgba(59,130,246,0.18), transparent 70%)",filter:"blur(40px)",pointerEvents:"none"},
  meshGold:{position:"absolute",width:"50%",height:"40%",right:"-5%",bottom:"-10%",background:"radial-gradient(ellipse, rgba(251,191,36,0.12), transparent 70%)",filter:"blur(40px)",pointerEvents:"none"},
  sidebar:{width:210,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(16px)",minHeight:"100vh",padding:"16px 10px",display:"flex",flexDirection:"column",gap:4,position:"fixed",left:0,top:0,bottom:0,borderRight:"2px solid #fbbf24",boxShadow:"6px 0 24px rgba(37,99,235,0.08)",zIndex:20},
  brand:{display:"flex",gap:9,alignItems:"center",padding:"4px 8px 16px",borderBottom:"1px solid #e2e8f0"}, logo:{width:34,height:34,background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"#fff",display:"grid",placeItems:"center",borderRadius:10,fontWeight:900,border:"2px solid #fbbf24",boxShadow:"0 6px 16px rgba(37,99,235,0.25)"}, brandName:{fontSize:13,color:"#172554"}, brandSub:{fontSize:6,letterSpacing:1,color:"#94a3b8"}, livePill:{marginLeft:"auto",fontSize:7,background:"#dcfce7",color:"#16a34a",padding:"3px 6px",borderRadius:10,border:"1px solid #bbf7d0",fontWeight:800},
  navSection:{fontSize:7,fontWeight:800,color:"#94a3b8",letterSpacing:1,padding:"14px 10px 6px"}, nav:{border:"none",background:"transparent",color:"#64748b",textAlign:"left",padding:"9px 11px",borderRadius:9,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",gap:8,width:"100%"}, active:{background:"linear-gradient(90deg,#eff6ff,#dbeafe)",color:"#2563eb",fontWeight:800,boxShadow:"inset 3px 0 0 #fbbf24, 0 2px 8px rgba(37,99,235,0.1)",border:"1px solid #bfdbfe"}, navCount:{marginLeft:"auto",fontSize:7,background:"#eef2ff",color:"#4f46e5",padding:"3px 6px",borderRadius:8,fontWeight:800},
  sidebarBottom:{display:"flex",alignItems:"center",gap:6,color:"#64748b",fontSize:7,padding:"8px",background:"linear-gradient(90deg,#fef3c7,#fde68a)",border:"1px solid #fbbf24",borderRadius:8,marginBottom:6}, liveDot:{width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 0 3px #dcfce7"}, logout:{background:"#fff1f2",color:"#e11d48",border:"1px solid #ffe4e6",padding:"9px 11px",borderRadius:9,cursor:"pointer",fontSize:10},
  main:{marginLeft:210,flex:1,padding:"20px 22px 28px",maxWidth:"calc(100vw - 210px)",position:"relative",zIndex:1},
  header:{background:"rgba(255,255,255,0.88)",backdropFilter:"blur(16px)",border:"1px solid #bfdbfe",borderLeft:"4px solid #fbbf24",borderRadius:14,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,boxShadow:"0 8px 28px rgba(37,99,235,0.1)"}, crumb:{fontSize:8,color:"#f59e0b",fontWeight:800,letterSpacing:0.6}, h1:{margin:0,fontSize:20,fontWeight:900,color:"#172033"}, headerText:{margin:"4px 0 0",fontSize:9,color:"#64748b"}, headerActions:{display:"flex",gap:7,alignItems:"center"}, searchBox:{display:"flex",gap:7,alignItems:"center",background:"#f8fafc",border:"1px solid #bfdbfe",borderBottom:"2px solid #fbbf24",borderRadius:9,padding:"0 10px",height:34}, input:{border:"none",outline:"none",background:"transparent",width:160,fontSize:10}, searchBtn:{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",border:"none",padding:"0 14px",height:34,borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:10,boxShadow:"0 4px 12px rgba(37,99,235,0.3)",borderBottom:"2px solid #fbbf24"}, refresh:{width:34,height:34,background:"#fff",color:"#475569",border:"1px solid #e2e8f0",borderRadius:9,cursor:"pointer"},
  cardGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:14},
  statCard:{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",border:"1px solid #bfdbfe",borderRadius:14,padding:14,display:"flex",alignItems:"center",gap:11,position:"relative",minHeight:94,boxShadow:"0 8px 24px rgba(37,99,235,0.08)",overflow:"hidden"}, statCardGold:{background:"linear-gradient(135deg,#ffffff 0%,#eff6ff 100%)",border:"1px solid #fbbf24",boxShadow:"0 12px 28px rgba(251,191,36,0.18), 0 6px 16px rgba(37,99,235,0.1)"}, goldLineTop:{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)"}, iconBox:{width:42,height:42,borderRadius:11,display:"grid",placeItems:"center",color:"#fff",fontWeight:900,fontSize:16,flexShrink:0,border:"2px solid #fff"}, statContent:{minWidth:0}, statLabel:{fontSize:8,fontWeight:700,color:"#64748b"}, statNum:{fontSize:24,fontWeight:900,color:"#0f172a",marginTop:2}, statSub:{fontSize:7,color:"#94a3b8",marginTop:3}, statBadge:{position:"absolute",top:11,right:11,fontSize:7,fontWeight:800,color:"#64748b",background:"#f8fafc",padding:"4px 7px",borderRadius:8,border:"1px solid #e2e8f0"}, statBadgeGold:{position:"absolute",top:11,right:11,fontSize:7,fontWeight:800,color:"#92400e",background:"#fef3c7",padding:"4px 7px",borderRadius:8,border:"1px solid #fbbf24"},
  midGrid:{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:12,marginTop:12},
  chartCard:{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",border:"1px solid #bfdbfe",borderTop:"3px solid #fbbf24",borderRadius:14,padding:16,boxShadow:"0 8px 24px rgba(37,99,235,0.08)"}, chartHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingBottom:11,borderBottom:"1px solid #f1f5f9",marginBottom:12}, chartTitle:{margin:0,fontSize:12,fontWeight:800,color:"#172033"}, chartSub:{margin:"3px 0 0",fontSize:7,color:"#94a3b8"}, realBadge:{display:"flex",gap:5,alignItems:"center",fontSize:7,fontWeight:800,color:"#16a34a",background:"#f0fdf4",border:"1px solid #bbf7d0",padding:"4px 8px",borderRadius:8}, realDot:{width:5,height:5,borderRadius:"50%",background:"#22c55e"}, totalPill:{fontSize:16,fontWeight:900,color:"#2563eb",textAlign:"right"},
  activityChart:{display:"flex",height:170,paddingTop:10}, yAxis:{width:24,display:"flex",flexDirection:"column",justifyContent:"space-between",paddingBottom:22,color:"#94a3b8",fontSize:7,textAlign:"right",paddingRight:6}, barsArea:{flex:1,position:"relative",borderBottom:"2px solid #fbbf24"}, gridLine:{position:"absolute",left:0,right:0,top:0,borderTop:"1px dashed #dbeafe"}, bars:{position:"absolute",inset:"0 4px 0 4px",display:"flex",justifyContent:"space-around",gap:8}, barCol:{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",gap:3}, barVal:{fontSize:8,fontWeight:800,color:"#1e40af"}, bar:{width:"55%",maxWidth:30,minWidth:12,borderRadius:"8px 8px 2px 2px",minHeight:4}, barLabel:{fontSize:7,color:"#64748b"},
  statusList:{display:"flex",flexDirection:"column",gap:12,paddingTop:4}, statusRow:{}, statusTop:{display:"flex",justifyContent:"space-between",marginBottom:5}, statusName:{display:"flex",gap:6,alignItems:"center",fontSize:9,color:"#334155",fontWeight:600}, dot:{width:7,height:7,borderRadius:"50%"}, statusCount:{display:"flex",gap:6,fontSize:9,fontWeight:800,color:"#1e293b"}, track:{height:6,background:"#f1f5f9",borderRadius:10,overflow:"hidden"}, fill:{height:"100%",borderRadius:10},
  chartEmpty:{height:170,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,color:"#64748b",fontSize:9,textAlign:"center"}, emptyIcon:{width:36,height:36,borderRadius:10,display:"grid",placeItems:"center",background:"#eff6ff",color:"#2563eb",fontSize:16},
  tableCard:{background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",border:"1px solid #bfdbfe",borderRadius:14,marginTop:12,overflow:"hidden",boxShadow:"0 8px 24px rgba(37,99,235,0.08)"}, tableHeader:{padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"2px solid #fbbf24"}, tableTitle:{margin:0,fontSize:13,fontWeight:850,color:"#172033"}, tableSub:{margin:"3px 0 0",fontSize:7,color:"#94a3b8"}, dirBadge:{background:"linear-gradient(90deg,#eff6ff,#dbeafe)",color:"#2563eb",border:"1px solid #fbbf24",borderRadius:8,padding:"5px 9px",fontSize:8,fontWeight:800},
  tableWrap:{overflowX:"auto"}, table:{width:"100%",borderCollapse:"collapse",minWidth:700}, th:{textAlign:"left",fontSize:7,fontWeight:800,color:"#1e40af",padding:"9px 12px",background:"linear-gradient(90deg,#eff6ff,#f8fafc)",borderBottom:"1px solid #bfdbfe"}, tr:{borderBottom:"1px solid #f1f5f9"}, td:{padding:"10px 12px",fontSize:9,color:"#475569"}, cell:{display:"flex",gap:9,alignItems:"center"}, av:{width:31,height:31,background:"linear-gradient(135deg,#3b82f6,#60a5fa)",color:"#fff",display:"grid",placeItems:"center",borderRadius:9,fontWeight:850,border:"2px solid #fbbf24"}, name:{fontSize:10,fontWeight:800,color:"#1e293b"}, idSmall:{fontSize:7,color:"#94a3b8"}, appCount:{background:"#ede9fe",color:"#6d28d9",padding:"4px 8px",borderRadius:8,fontWeight:800,border:"1px solid #ddd6fe"}, statusBadge:{display:"inline-flex",gap:5,alignItems:"center",padding:"5px 9px",borderRadius:8,fontSize:7,fontWeight:800,border:"1px solid transparent"}, badgeDot:{width:5,height:5,borderRadius:"50%"},
  tableFooter:{padding:"10px 14px",display:"flex",justifyContent:"space-between",color:"#94a3b8",fontSize:8,background:"linear-gradient(90deg,#fafbfc,#f8fafc)",borderTop:"1px solid #f1f5f9"}, footerReal:{color:"#16a34a",fontWeight:700},
  noStudents:{padding:"36px 20px",textAlign:"center",color:"#64748b"}, noIcon:{width:42,height:42,borderRadius:12,background:"#eff6ff",color:"#2563eb",display:"grid",placeItems:"center",margin:"0 auto 10px",fontSize:20},
  loading:{minHeight:"100vh",display:"grid",placeItems:"center",background:"linear-gradient(135deg,#dbeafe,#eff6ff)"}, loadingBox:{display:"flex",gap:12,alignItems:"center",background:"#fff",padding:18,borderRadius:14,border:"2px solid #fbbf24",boxShadow:"0 12px 28px rgba(37,99,235,0.15)"}, loadingSpinner:{width:36,height:36,display:"grid",placeItems:"center",borderRadius:10,background:"linear-gradient(135deg,#2563eb,#3b82f6)",color:"#fff",fontWeight:900}, loadingTitle:{fontSize:12,fontWeight:800}, loadingText:{fontSize:8,color:"#94a3b8"},
  errorPage:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#dbeafe"}, errorCard:{background:"#fff",border:"1px solid #fecdd3",padding:22,borderRadius:14,textAlign:"center"}, errorIcon:{width:40,height:40,display:"grid",placeItems:"center",margin:"0 auto 10px",borderRadius:10,background:"#fff1f2",color:"#e11d48",fontWeight:900}, errorTitle:{margin:0,fontSize:14}, errorText:{fontSize:9,color:"#64748b",margin:"6px 0 12px"}, primaryBtn:{background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",border:"none",padding:"9px 16px",borderRadius:9,cursor:"pointer",fontWeight:800,borderBottom:"2px solid #fbbf24"},
};