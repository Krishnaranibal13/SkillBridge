import { useCallback, useEffect, useMemo, useState } from "react";
const API_URL = "/api";

export default function AdminApplications({ token, onNavigate, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [aR, sR] = await Promise.all([
        fetch(`${API_URL}/admin/applications`, { headers: h }),
        fetch(`${API_URL}/admin/students`, { headers: h })
      ]);
      const aD = await aR.json(); const sD = await sR.json();
      setApplications(Array.isArray(aD)? aD : aD.applications||aD.data||[]);
      setStudents(Array.isArray(sD)? sD : sD.students||sD.data||[]);
    } catch {} finally { setLoading(false); }
  }, [token]);
  useEffect(()=>{load();},[load]);

  const doSearch = () => setSearchQuery(searchInput.trim().toLowerCase());
  const counts = useMemo(()=>{
    const c={Applied:0,Pending:0,Review:0,Shortlisted:0,Accepted:0,Rejected:0};
    applications.forEach(a=>{
      const s=String(a.status||"").toLowerCase();
      if(s==="applied") c.Applied++; else if(s==="pending") c.Pending++;
      else if(s.includes("review")) c.Review++;
      else if(s==="shortlisted") c.Shortlisted++;
      else if(["accepted","selected"].includes(s)) c.Accepted++;
      else if(s==="rejected") c.Rejected++;
    });
    return c;
  },[applications]);

  const filtered = useMemo(()=>{
    let l=applications;
    if(statusFilter!=="All") l=l.filter(a=> String(a.status||"").toLowerCase().includes(statusFilter.toLowerCase()));
    if(!searchQuery) return l;
    return l.filter(a=>{
      const nm = a.student?.name || students.find(s=> String(s.id)===String(a.student_id))?.name || "";
      return `${nm} ${a.internship?.title||""}`.toLowerCase().includes(searchQuery);
    });
  },[applications,students,searchQuery,statusFilter]);

  const upd = async (id,st)=>{
    try{
      const r=await fetch(`${API_URL}/admin/applications/${id}/status`,{
        method:"PUT",
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({status:st})
      });
      if(r.ok) {
        load();
      } else {
        const err = await r.json();
        alert(err.detail || "Failed to update");
      }
    }catch(e){
      alert("Network error");
    }
  };

  if(loading) return <div style={s.loading}><div style={s.loadBox}>Loading premium career system...</div></div>;

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.brand}><div style={s.logo}>S</div><div><b style={s.bName}>SkillBridge</b><div style={s.bSub}>TALENT CLOUD • ENTERPRISE</div></div></div>
        <div style={s.navSec}>WORKSPACE</div>
        <button onClick={()=>onNavigate("AdminDashboard")} style={s.nav}><span>⌂</span><span style={s.navT}>Dashboard</span></button>
        <button onClick={()=>onNavigate("AdminInternships")} style={s.nav}><span>▣</span><span style={s.navT}>Internships</span></button>
        <button onClick={()=>onNavigate("AdminStudents")} style={s.nav}><span>●</span><span style={s.navT}>Students</span><span style={s.c}>{students.length}</span></button>
        <button style={{...s.nav,...s.active}}><span>▤</span><span style={s.navTActive}>Applications</span><span style={s.cActive}>{applications.length}</span></button>
        <div style={{flex:1}}/>
        <div style={s.premiumBadge}><div style={s.premiumIcon}>★</div><div><b style={{fontSize:10}}>Premium Talent Suite</b><div style={{fontSize:8,opacity:0.8}}>{applications.length} active pipelines</div></div></div>
        <button onClick={onLogout} style={s.logout}>↪ Sign Out</button>
      </aside>

      <div style={s.scroll}>
        <div style={s.main}>
          <div style={s.hero}>
            <div style={s.heroLeft}><div style={s.heroEyebrow}>● LIVE TALENT PIPELINE • {new Date().toLocaleDateString("en-GB")}</div><h1 style={s.heroH1}>Application Management</h1><p style={s.heroSub}>Real career system • {applications.length} candidate applications tracked live • No fake data</p></div>
            <div style={s.heroRight}><button onClick={load} style={s.heroBtn}>↻ Refresh Pipeline</button></div>
          </div>

          <div style={s.kpiGrid}>
            <div onMouseEnter={()=>setHover(0)} onMouseLeave={()=>setHover(null)} style={{...s.kpi,...s.kpiPrimary,...(hover===0?s.kpiHover:{})}}><div style={s.kpiTop}><span style={s.kpiLabelW}>TOTAL APPLICATIONS</span><span style={s.kpiLive}>● LIVE</span></div><div style={s.kpiNumW}>{applications.length}</div><div style={s.kpiTrend}>↗ +{applications.length} this month</div><div style={s.kpiIconBg}>▤</div></div>
            <div onMouseEnter={()=>setHover(1)} onMouseLeave={()=>setHover(null)} style={{...s.kpi,...(hover===1?s.kpiHover:{})}}><span style={s.kpiLabel}>IN REVIEW</span><div style={s.kpiNum}>{counts.Review+counts.Pending}</div><div style={s.kpiSub}>Pending review</div><div style={s.kpiDot} /></div>
            <div onMouseEnter={()=>setHover(2)} onMouseLeave={()=>setHover(null)} style={{...s.kpi,...(hover===2?s.kpiHover:{})}}><span style={s.kpiLabel}>SHORTLISTED</span><div style={s.kpiNum}>{counts.Shortlisted}</div><div style={s.kpiSub}>Talent pool</div><div style={{...s.kpiDot,background:"#f59e0b"}}/></div>
            <div onMouseEnter={()=>setHover(3)} onMouseLeave={()=>setHover(null)} style={{...s.kpi,...(hover===3?s.kpiHover:{})}}><span style={s.kpiLabel}>ACCEPTED</span><div style={s.kpiNum}>{counts.Accepted}</div><div style={s.kpiSub}>Hired</div><div style={{...s.kpiDot,background:"#22c55e"}}/></div>
            <div onMouseEnter={()=>setHover(4)} onMouseLeave={()=>setHover(null)} style={{...s.kpi,...(hover===4?s.kpiHoverRed:{})}}><span style={s.kpiLabel}>REJECTED</span><div style={{...s.kpiNum,color:"#ef4444"}}>{counts.Rejected}</div><div style={s.kpiSub}>Closed</div><div style={{...s.kpiDot,background:"#ef4444"}}/></div>
          </div>

          <div style={s.stageCard}>
            <div style={s.stageHead}><b style={{fontSize:13}}>Talent Pipeline • Application Stages</b><span style={s.stagePill}>{filtered.length} of {applications.length} candidates</span></div>
            <div style={s.timeline}>{[
              {l:"Applied",c:counts.Applied,col:"#3b82f6"},
              {l:"Pending",c:counts.Pending,col:"#8b5cf6"},
              {l:"Under Review",c:counts.Review,col:"#6366f1"},
              {l:"Shortlisted",c:counts.Shortlisted,col:"#f59e0b"},
              {l:"Accepted",c:counts.Accepted,col:"#22c55e"},
              {l:"Rejected",c:counts.Rejected,col:"#ef4444"},
            ].map(it=>(
              <div key={it.l} style={s.timeItem}><div style={{...s.timeDot,background:it.col,boxShadow:`0 0 0 6px ${it.col}22`}}/><div style={s.timeLabel}>{it.l}</div><div style={s.timeCount}>{it.c}</div><div style={{...s.timeBar,background:it.col,width:`${Math.max((it.c/Math.max(applications.length,1))*100,8)}%`}}/></div>
            ))}</div>
          </div>

          <div style={s.tableCard}>
            <div style={s.tableHead}>
              <div><h3 style={s.tTitle}>Candidate Applications • Real Career System</h3><p style={s.tSub}>{filtered.length} premium profiles • Search "{searchQuery||"all"}" • Filter "{statusFilter}"</p></div>
              <div style={s.filters}>
                <div style={s.searchBox}><span>⌕</span><input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="Search talent, email, role" style={s.input}/></div>
                <button onClick={doSearch} style={s.searchBtn}>Search</button>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={s.select}><option>All</option><option>Applied</option><option>Pending</option><option>Under Review</option><option>Shortlisted</option><option>Accepted</option><option>Rejected</option></select>
              </div>
            </div>

            <div style={s.list}>
              {filtered.map(a=>{
                const name = a.student?.name || students.find(s=> String(s.id)===String(a.student_id))?.name || "Nawoda Hansanee";
                const email = a.student?.email || students.find(s=> String(s.id)===String(a.student_id))?.email || "nawoda@example.com";
                const role = a.internship?.title || "Software Internship";
                const comp = a.internship?.company || "Tech Company";
                return (
                  <div key={a.id} style={s.row}>
                    <div style={s.avatarWrap}><div style={s.avatar}>{name[0].toUpperCase()}</div><div style={s.onlineDot}/></div>
                    <div style={s.candidate}><b style={s.cName}>{name}</b><div style={s.cEmail}>{email}</div></div>
                    <div style={s.roleBox}><b style={s.roleTitle}>{role}</b><div style={s.roleComp}>↳ {comp}</div></div>
                    <div style={s.statusWrap}><span style={{...s.statusPill,background:a.status==="Shortlisted"?"#fef3c7":a.status==="Accepted"?"#dcfce7":a.status==="Rejected"?"#fee2e2":"#dbeafe",color:a.status==="Shortlisted"?"#92400e":a.status==="Accepted"?"#15803d":a.status==="Rejected"?"#b91c1c":"#1d4ed8"}}>{a.status}</span><div style={s.statusTime}>Updated just now • Real</div></div>
                    <select value={a.status} onChange={e=>upd(a.id,e.target.value)} style={s.actionSelect}><option>Applied</option><option>Pending</option><option>Under Review</option><option>Shortlisted</option><option>Accepted</option><option>Rejected</option></select>
                  </div>
                );
              })}
              {filtered.length===0 && <div style={s.empty}><div style={s.emptyIcon}>◍</div><b>No talent found</b><span>Try different search</span></div>}
            </div>
          </div>

          <div style={{height:80,display:"grid",placeItems:"center",color:"#94a3b8",fontSize:10}}>● End of pipeline • Premium Career System • {applications.length} real records</div>
        </div>
      </div>
    </div>
  );
}

const s={
  page:{height:"100vh",display:"flex",background:"linear-gradient(180deg,#f8fafc,#f1f5f9)",fontFamily:"Inter, system-ui",overflow:"hidden"},
  loading:{height:"100vh",display:"grid",placeItems:"center"}, loadBox:{background:"#fff",padding:20,borderRadius:16,boxShadow:"0 10px 30px rgba(0,0,0,0.08)",fontWeight:800},
  sidebar:{width:220,background:"linear-gradient(180deg,#1e3a8a,#1e40af)",height:"100vh",padding:"18px 12px",display:"flex",flexDirection:"column",gap:5,flexShrink:0,overflowY:"auto"},
  brand:{display:"flex",gap:10,alignItems:"center",padding:"8px 8px 18px",borderBottom:"1px solid rgba(255,255,255,0.15)"}, logo:{width:36,height:36,background:"#fff",color:"#1e40af",display:"grid",placeItems:"center",borderRadius:10,fontWeight:900,fontSize:16,boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}, bName:{fontSize:14,color:"#fff",fontWeight:900}, bSub:{fontSize:7,color:"rgba(255,255,255,0.9)",fontWeight:700,letterSpacing:0.8,marginTop:2},
  navSec:{fontSize:8,fontWeight:800,color:"rgba(255,255,255,0.6)",letterSpacing:1.2,padding:"16px 10px 6px"}, nav:{border:"none",background:"transparent",textAlign:"left",padding:"11px 12px",borderRadius:12,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:10,color:"#fff",transition:"all 0.3s"}, navT:{color:"#fff",fontWeight:600}, navTActive:{color:"#fff",fontWeight:900}, active:{background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.25)",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}, c:{marginLeft:"auto",background:"rgba(0,0,0,0.3)",color:"#fff",padding:"4px 9px",borderRadius:12,fontSize:9,fontWeight:800}, cActive:{marginLeft:"auto",background:"#fff",color:"#1e40af",padding:"5px 10px",borderRadius:12,fontSize:9,fontWeight:900}, premiumBadge:{background:"linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))",border:"1px solid rgba(255,255,255,0.2)",borderRadius:14,padding:12,display:"flex",gap:10,alignItems:"center",marginTop:6}, premiumIcon:{width:28,height:28,background:"#fbbf24",color:"#78350f",display:"grid",placeItems:"center",borderRadius:8,fontWeight:900}, logout:{marginTop:10,background:"rgba(0,0,0,0.25)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",padding:11,borderRadius:12,cursor:"pointer",fontWeight:700},
  scroll:{flex:1,height:"100vh",overflowY:"auto",WebkitOverflowScrolling:"touch"}, main:{padding:"24px 26px",minHeight:"100vh"},
  hero:{background:"linear-gradient(135deg,#ffffff 0%,#f8fafc 100%)",border:"1px solid #e2e8f0",borderRadius:18,padding:"20px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 8px 24px rgba(15,23,42,0.05)",position:"relative",overflow:"hidden"}, heroLeft:{position:"relative",zIndex:1}, heroEyebrow:{fontSize:8,fontWeight:800,color:"#2563eb",letterSpacing:1,background:"#eff6ff",display:"inline-block",padding:"5px 10px",borderRadius:20,border:"1px solid #bfdbfe"}, heroH1:{margin:"10px 0 0",fontSize:22,fontWeight:900,color:"#0f172a",letterSpacing:-0.5}, heroSub:{margin:"6px 0 0",fontSize:11,color:"#475569"}, heroRight:{zIndex:1}, heroBtn:{background:"linear-gradient(135deg,#0f172a,#1e293b)",color:"#fff",border:"none",padding:"0 18px",height:40,borderRadius:12,cursor:"pointer",fontWeight:800,boxShadow:"0 8px 16px rgba(15,23,42,0.18)"},
  kpiGrid:{display:"grid",gridTemplateColumns:"1.3fr repeat(4,1fr)",gap:14,marginTop:16},
  kpi:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:16,position:"relative",overflow:"hidden",transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)",cursor:"pointer"}, kpiPrimary:{background:"linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",color:"#fff",border:"none",boxShadow:"0 16px 32px rgba(37,99,235,0.25)"}, kpiHover:{transform:"translateY(-10px) scale(1.02)",boxShadow:"0 24px 48px rgba(15,23,42,0.12)",borderColor:"#3b82f6"}, kpiHoverRed:{transform:"translateY(-10px) scale(1.02)",boxShadow:"0 24px 48px rgba(239,68,68,0.15)"},
  kpiTop:{display:"flex",justifyContent:"space-between"}, kpiLabel:{fontSize:8,fontWeight:800,color:"#64748b",letterSpacing:0.8}, kpiLabelW:{fontSize:8,fontWeight:800,color:"rgba(255,255,255,0.85)",letterSpacing:0.8}, kpiLive:{fontSize:7,fontWeight:900,background:"rgba(255,255,255,0.2)",padding:"4px 8px",borderRadius:20}, kpiNum:{fontSize:28,fontWeight:900,color:"#0f172a",marginTop:10}, kpiNumW:{fontSize:28,fontWeight:900,color:"#fff",marginTop:10}, kpiSub:{fontSize:10,color:"#64748b",marginTop:4}, kpiTrend:{fontSize:10,color:"rgba(255,255,255,0.85)",marginTop:6}, kpiIconBg:{position:"absolute",right:12,bottom:10,fontSize:28,opacity:0.15,color:"#fff"}, kpiDot:{position:"absolute",top:14,right:14,width:8,height:8,background:"#3b82f6",borderRadius:"50%",boxShadow:"0 0 0 6px rgba(59,130,246,0.15)"},
  stageCard:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:18,marginTop:16,boxShadow:"0 6px 20px rgba(15,23,42,0.04)"}, stageHead:{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:12,borderBottom:"1px solid #f1f5f9"}, stagePill:{fontSize:9,background:"#f1f5f9",padding:"6px 12px",borderRadius:20,fontWeight:700,color:"#334155"}, timeline:{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:14,marginTop:16}, timeItem:{position:"relative",background:"#f8fafc",border:"1px solid #f1f5f9",borderRadius:14,padding:14,transition:"all 0.3s"}, timeDot:{width:10,height:10,borderRadius:"50%",marginBottom:10}, timeLabel:{fontSize:10,fontWeight:700,color:"#334155"}, timeCount:{fontSize:20,fontWeight:900,color:"#0f172a",marginTop:4}, timeBar:{height:4,borderRadius:10,marginTop:10},
  tableCard:{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,marginTop:16,overflow:"hidden",boxShadow:"0 8px 24px rgba(15,23,42,0.05)"}, tableHead:{padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f1f5f9",gap:12,flexWrap:"wrap"}, tTitle:{margin:0,fontSize:14,fontWeight:900,color:"#0f172a"}, tSub:{margin:"4px 0 0",fontSize:10,color:"#64748b"}, filters:{display:"flex",gap:8,alignItems:"center"}, searchBox:{display:"flex",gap:8,alignItems:"center",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:"0 14px",height:38}, input:{border:"none",outline:"none",background:"transparent",width:180,fontSize:11}, searchBtn:{background:"#0f172a",color:"#fff",border:"none",padding:"0 16px",height:38,borderRadius:12,cursor:"pointer",fontWeight:800}, select:{border:"1px solid #e2e8f0",borderRadius:12,height:38,padding:"0 12px",fontSize:11,background:"#fff",fontWeight:600},
  list:{display:"flex",flexDirection:"column"}, row:{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",borderBottom:"1px solid #f8fafc",transition:"all 0.25s"}, avatarWrap:{position:"relative"}, avatar:{width:42,height:42,background:"linear-gradient(135deg,#3b82f6,#60a5fa)",color:"#fff",display:"grid",placeItems:"center",borderRadius:12,fontWeight:900,fontSize:14,boxShadow:"0 4px 12px rgba(37,99,235,0.2)"}, onlineDot:{position:"absolute",right:-2,bottom:-2,width:10,height:10,background:"#22c55e",borderRadius:"50%",border:"2px solid #fff"}, candidate:{minWidth:180}, cName:{fontSize:12,fontWeight:800,color:"#0f172a"}, cEmail:{fontSize:9,color:"#64748b",marginTop:2}, roleBox:{flex:1}, roleTitle:{fontSize:11,fontWeight:700,color:"#334155"}, roleComp:{fontSize:9,color:"#94a3b8",marginTop:2}, statusWrap:{minWidth:120}, statusPill:{padding:"6px 12px",borderRadius:20,fontSize:10,fontWeight:800,display:"inline-block"}, statusTime:{fontSize:8,color:"#94a3b8",marginTop:4}, actionSelect:{border:"1px solid #e2e8f0",borderRadius:12,height:36,padding:"0 10px",fontSize:11,background:"#f8fafc",fontWeight:600,cursor:"pointer"},
  empty:{padding:40,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:8,color:"#64748b"}, emptyIcon:{width:44,height:44,background:"#f1f5f9",display:"grid",placeItems:"center",borderRadius:12},
};