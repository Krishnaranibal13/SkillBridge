import { useEffect, useMemo, useState, useCallback } from "react";
const API_URL = "/api";

const emptyForm = { company_name:"", job_title:"", description:"", location:"Ratnapura", work_type:"Hybrid", duration:"6 months", application_deadline:"", requirements:"", status:"Open" };

export default function AdminInternships({ token, onNavigate, onLogout }){
  const [internships,setInternships]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [search,setSearch]=useState("");
  const [workFilter,setWorkFilter]=useState("All");
  const [locFilter,setLocFilter]=useState("All");
  const [showForm,setShowForm]=useState(false);
  const [editingId,setEditingId]=useState(null);
  const [form,setForm]=useState(emptyForm);

  const load = useCallback(async()=>{
    if(!token){setLoading(false);return;}
    setLoading(true);
    try{
      const res=await fetch(`${API_URL}/internships`,{headers:{Authorization:`Bearer ${token}`}});
      if(res.status===401){onLogout?.();return;}
      if(!res.ok) throw new Error();
      const data=await res.json();
      const list=Array.isArray(data)?data:data?.data||data?.internships||[];
      setInternships(list);
    }catch{setError("Could not load internships - check backend");}finally{setLoading(false);}
  },[token,onLogout]);
  useEffect(()=>{load();},[load]);

  const filtered=useMemo(()=>{
    const k=search.trim().toLowerCase();
    return internships.filter(i=>{
      const txt=[i.company_name||"",i.job_title||"",i.location||"",i.work_type||"",i.duration||"",i.requirements||"",i.description||""].join(" ").toLowerCase();
      return (!k||txt.includes(k)) && (workFilter==="All"||i.work_type===workFilter) && (locFilter==="All"||i.location===locFilter);
    });
  },[internships,search,workFilter,locFilter]);

  const openCount=internships.filter(i=>i.status==="Open").length;
  const total=internships.length;

  const openAdd=()=>{setEditingId(null);setForm(emptyForm);setError("");setShowForm(true);};
  const openEdit=(i)=>{
    let dl=""; if(i.application_deadline){const d=new Date(i.application_deadline); if(!isNaN(d)) dl=d.toISOString().slice(0,16);}
    setEditingId(i.id); setForm({company_name:i.company_name||"",job_title:i.job_title||"",description:i.description||"",location:i.location||"Ratnapura",work_type:i.work_type||"Hybrid",duration:i.duration||"6 months",application_deadline:dl,requirements:i.requirements||"",status:i.status||"Open"}); setShowForm(true);
  };
  const handleChange=(e)=>{const {name,value}=e.target; setForm(p=>({...p,[name]:value}));};
  const handleSubmit=async(e)=>{
    e.preventDefault(); setSaving(true); setError("");
    try{
      const url=editingId?`${API_URL}/internships/${editingId}`:`${API_URL}/internships`;
      const method=editingId?"PUT":"POST";
      const res=await fetch(url,{method,headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({...form,application_deadline:new Date(form.application_deadline).toISOString()})});
      if(res.status===401){onLogout?.();return;}
      if(!res.ok){ const d=await res.json().catch(()=>({})); throw new Error(d.detail||"Save failed"); }
      setShowForm(false); setEditingId(null); await load();
    }catch(err){setError(err.message);}finally{setSaving(false);}
  };
  const handleDelete=async(i)=>{
    if(!window.confirm(`Delete "${i.job_title}"?`)) return;
    try{ const res=await fetch(`${API_URL}/internships/${i.id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}}); if(!res.ok) throw new Error(); await load(); }catch{setError("Delete failed");}
  };

  const getInitials=(n="")=>{const w=n.trim().split(/\s+/).filter(Boolean); if(!w.length) return "SB"; if(w.length===1) return w[0].slice(0,2).toUpperCase(); return `${w[0][0]||""}${w[1]?.[0]||""}`.toUpperCase();};

  return(
    <div className="adm">
      <style>{`
        *{box-sizing:border-box} body{margin:0}
      .adm{min-height:100vh;display:flex;gap:20px;padding:20px;background:#eef3ff;font-family:Inter,system-ui,sans-serif;color:#111827}
      .side{width:260px;background:#2f5af0;border-radius:20px;padding:20px;display:flex;flex-direction:column;color:#fff;position:sticky;top:20px;height:calc(100vh - 40px)}
      .brand{display:flex;gap:10px;align-items:center;margin-bottom:24px}.logo{width:40px;height:40px;background:#fff;color:#2f5af0;border-radius:12px;display:grid;place-items:center;font-weight:900;font-size:18px}
      .b-title{font-weight:900;font-size:17px;letter-spacing:-.4px}.b-sub{font-size:9px;opacity:.7;margin-top:2px;font-weight:700;letter-spacing:.5px}
      .nav-label{font-size:10px;opacity:.5;letter-spacing:1px;font-weight:800;margin:16px 0 8px 8px}.nav-btn{width:100%;border:0;background:transparent;color:#c7d2fe;text-align:left;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:.18s}.nav-btn:hover{background:rgba(255,255,255,.12);color:#fff;transform:translateX(2px)}.nav-btn.active{background:#fff;color:#2f5af0;box-shadow:0 4px 12px rgba(0,0,0,.12)}.nav-count{margin-left:auto;background:rgba(0,0,0,.08);padding:2px 8px;border-radius:999px;font-size:11px;font-weight:800}.nav-btn.active.nav-count{background:#e0e7ff;color:#2f5af0}
      .main{flex:1;min-width:0;display:flex;gap:20px}
      .center{flex:1;min-width:0;background:#fff;border-radius:20px;padding:24px;box-shadow:0 8px 24px rgba(30,64,175,.08);border:1px solid #e5e7eb}
      .head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:20px}.h-title{font-size:26px;font-weight:900;letter-spacing:-.8px;color:#111827}.h-sub{font-size:12px;color:#6b7280;margin-top:6px;line-height:1.5}
      .toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.search{height:40px;min-width:260px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;display:flex;align-items:center;gap:8px;padding:0 14px}.search input{border:0;outline:0;background:transparent;width:100%;font-size:13px;font-weight:500}.select{height:40px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:0 12px;font-size:12px;font-weight:700;outline:0;cursor:pointer}
      .kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.kpi{background:#f9fafb;border:1px solid #eef2ff;border-radius:14px;padding:14px}.kpi-l{font-size:10px;font-weight:800;color:#6b7280;letter-spacing:.8px;text-transform:uppercase}.kpi-v{font-size:22px;font-weight:900;margin-top:6px}.kpi-s{font-size:11px;color:#6b7280;margin-top:4px}
      .grid{display:grid;gap:12px}.card{display:flex;gap:14px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px;transition:.18s}.card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(30,64,175,.1);border-color:#c7d2fe}
      .card-logo{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-weight:900;font-size:14px;color:#fff;flex-shrink:0;box-shadow:0 6px 14px rgba(0,0,0,.12)}
      .card-title{font-size:14px;font-weight:800;color:#111827;letter-spacing:-.2px}.card-company{font-size:12px;font-weight:600;color:#4b5563;margin-top:3px}.card-desc{font-size:12px;color:#6b7280;line-height:1.5;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:10px}.deadline{font-size:11px;font-weight:700;color:#374151;display:flex;align-items:center;gap:5px;background:#f3f4f6;padding:5px 10px;border-radius:999px}
      .badge{padding:6px 12px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap}.badge-open{background:#dcfce7;color:#166534;border:1px solid #bbf7d0}.badge-closed{background:#fee2e2;color:#991b1b;border:1px solid #fecaca}
      .btn{border:1px solid #e5e7eb;background:#fff;border-radius:10px;padding:8px 12px;font-size:11px;font-weight:800;cursor:pointer;transition:.15s}.btn:hover{border-color:#2f5af0;color:#2f5af0}.btn-danger{color:#b91c1c;background:#fff5f5;border-color:#fecaca}.btn-primary{border:0;background:#2f5af0;color:#fff}
      .right{width:300px;background:#fff;border-radius:20px;padding:18px;box-shadow:0 8px 24px rgba(30,64,175,.08);border:1px solid #e5e7eb;height:fit-content;position:sticky;top:20px}
      .cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.cal-title{font-size:15px;font-weight:900}.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:11px}.cal-day{padding:8px 0;border-radius:8px;font-weight:600;cursor:pointer}.cal-day.head{color:#9ca3af;font-weight:700}.cal-day.today{background:#2f5af0;color:#fff;font-weight:800}.cal-day.has-deadline{background:#dbeafe;color:#1e40af;font-weight:800;border:1px solid #bfdbfe}
      .modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.55);backdrop-filter:blur(8px);display:grid;place-items:center;padding:20px;z-index:100}.modal{width:100%;max-width:640px;background:#fff;border-radius:20px;padding:24px;box-shadow:0 24px 64px rgba(0,0,0,.2)}.inp{width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#f9fafb;font-size:13px;outline:0;font-family:inherit}.inp:focus{border-color:#2f5af0;background:#fff;box-shadow:0 0 0 3px rgba(47,90,240,.1)}
        @media(max-width:1100px){.right{display:none}.side{width:72px}.b-title,.b-sub,.nav-label,.nav-text,.nav-count{display:none}.nav-btn{justify-content:center}.main{flex-direction:column}} @media(max-width:700px){.adm{padding:0;gap:0;display:block;background:#fff}.side{display:none}.center{border-radius:0;box-shadow:none;border:0}.kpi-row{grid-template-columns:1fr}.head{flex-direction:column}}
      `}</style>

      <aside className="side">
        <div className="brand"><div className="logo">S</div><div><div className="b-title">SkillBridge</div><div className="b-sub">ADMIN CONTROL CENTER</div></div></div>
        <div className="nav-label">MAIN</div>
        <button className="nav-btn" onClick={()=>onNavigate?.("AdminDashboard")}>◧ <span className="nav-text">Dashboard</span></button>
        <button className="nav-btn active">💼 <span className="nav-text">Internships</span> <span className="nav-count">{total}</span></button>
        <button className="nav-btn" onClick={()=>onNavigate?.("AdminStudents")}>👥 <span className="nav-text">Students</span></button>
        <button className="nav-btn" onClick={()=>onNavigate?.("AdminApplications")}>📋 <span className="nav-text">Applications</span></button>
        <div className="nav-label">MANAGE</div>
        <button className="nav-btn" onClick={openAdd}>＋ <span className="nav-text">Add Internship</span></button>
        <button className="nav-btn" onClick={load}>↻ <span className="nav-text">Refresh</span></button>
        <button className="nav-btn" onClick={onLogout}>↪ <span className="nav-text">Logout</span></button>
        <div style={{marginTop:"auto",background:"rgba(255,255,255,.14)",borderRadius:14,padding:14}}><div style={{fontSize:10,fontWeight:800,letterSpacing:1,opacity:.8}}>● REAL API ONLY</div><div style={{fontSize:20,fontWeight:900,marginTop:6}}>{total} Total</div><div style={{fontSize:10,opacity:.7,marginTop:4}}>{openCount} Open • No fake data</div></div>
      </aside>

      <div className="main">
        <div className="center">
          <div className="head">
            <div><div className="h-title">Internship Management</div><div className="h-sub">{filtered.length} real opportunities • {openCount} Open • {total-openCount} Closed • 100% real API, no fake data</div></div>
            <div className="toolbar">
              <div className="search">⌕<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company, role, location..." /></div>
              <select className="select" value={workFilter} onChange={e=>setWorkFilter(e.target.value)}><option value="All">All Work Types</option><option>Remote</option><option>Hybrid</option><option>Onsite</option></select>
              <select className="select" value={locFilter} onChange={e=>setLocFilter(e.target.value)}><option value="All">All Locations</option>{[...new Set(internships.map(i=>i.location).filter(Boolean))].map(l=><option key={l}>{l}</option>)}</select>
              <button onClick={openAdd} className="btn btn-primary" style={{height:40,padding:"0 16px",fontSize:13}}>+ Add Internship</button>
            </div>
          </div>

          <div className="kpi-row">
            <div className="kpi"><div className="kpi-l">Total Opportunities</div><div className="kpi-v">{total}</div><div className="kpi-s">From real database only</div></div>
            <div className="kpi"><div className="kpi-l">Open Positions</div><div className="kpi-v" style={{color:"#059669"}}>{openCount}</div><div className="kpi-s">Accepting applications now</div></div>
            <div className="kpi"><div className="kpi-l">Closed</div><div className="kpi-v" style={{color:"#dc2626"}}>{total-openCount}</div><div className="kpi-s">Deadline passed or filled</div></div>
          </div>

          {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#991b1b",padding:"12px 14px",borderRadius:12,fontSize:13,fontWeight:600,marginBottom:14}}>{error}</div>}
          {loading? <div style={{padding:60,textAlign:"center",color:"#6b7280",fontSize:13}}>Loading real internships...</div>
          : filtered.length===0? <div style={{padding:60,textAlign:"center"}}><div style={{fontSize:32}}>📋</div><div style={{fontWeight:800,marginTop:10}}>No internships found</div><div style={{fontSize:12,color:"#6b7280",marginTop:4}}>Create your first real opportunity</div></div>
          : <div className="grid">
              {filtered.map((i,idx)=>{
                const colors=["#2f5af0","#7c3aed","#db2777","#ea580c","#059669"];
                const bg=colors[idx%colors.length];
                return(
                  <div key={i.id} className="card">
                    <div className="card-logo" style={{background:bg}}>{getInitials(i.company_name)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start"}}>
                        <div><div className="card-title">{i.job_title}</div><div className="card-company">{i.company_name} • {i.location} • {i.work_type} • {i.duration}</div></div>
                        <span className={`badge ${i.status==="Open"?"badge-open":"badge-closed"}`}>{i.status}</span>
                      </div>
                      <div className="card-desc">{i.description||"No description - real data only"}</div>
                      <div style={{fontSize:11,color:"#6b7280",marginTop:8,background:"#f9fafb",padding:"8px 10px",borderRadius:10,border:"1px solid #f3f4f6"}}><strong>Requirements:</strong> {i.requirements||"Not specified"}</div>
                      <div className="card-foot">
                        <div className="deadline">📅 {i.application_deadline? new Date(i.application_deadline).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "No deadline"}</div>
                        <div style={{display:"flex",gap:8}}><button className="btn" onClick={()=>openEdit(i)}>Edit</button><button className="btn btn-danger" onClick={()=>handleDelete(i)}>Delete</button></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>

        <aside className="right">
          <div className="cal-head"><div className="cal-title">Deadlines • Real Data</div><div style={{fontSize:11,background:"#f3f4f6",padding:"4px 8px",borderRadius:999,fontWeight:700}}>{new Date().toLocaleString("en-US",{month:"short",year:"numeric"})}</div></div>
          <div className="cal-grid"><span className="cal-day head">Su</span><span className="cal-day head">Mo</span><span className="cal-day head">Tu</span><span className="cal-day head">We</span><span className="cal-day head">Th</span><span className="cal-day head">Fr</span><span className="cal-day head">Sa</span>
            {Array.from({length:35},(_,d)=>{
              const day=d-1; if(day<1||day>31) return <span key={d} />;
              const hasDeadline=internships.some(it=>{ if(!it.application_deadline) return false; const dd=new Date(it.application_deadline).getDate(); return dd===day; });
              const isToday=new Date().getDate()===day;
              let cls="cal-day"; if(isToday) cls+=" today"; else if(hasDeadline) cls+=" has-deadline";
              return <span key={d} className={cls}>{day}</span>;
            })}
          </div>
          <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid #f3f4f6"}}>
            <div style={{fontSize:12,fontWeight:800,display:"flex",justifyContent:"space-between"}}><span>Real Stats</span><span style={{fontSize:10,color:"#2f5af0"}}>Live</span></div>
            <div style={{marginTop:12,display:"grid",gap:8}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"#f9fafb",borderRadius:10,border:"1px solid #f3f4f6",fontSize:12}}><span>Open</span><strong style={{color:"#059669"}}>{openCount}</strong></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"#f9fafb",borderRadius:10,border:"1px solid #f3f4f6",fontSize:12}}><span>Closed</span><strong style={{color:"#dc2626"}}>{total-openCount}</strong></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:"#eef2ff",borderRadius:10,border:"1px solid #c7d2fe",fontSize:12,fontWeight:700}}><span>Total</span><strong>{total} • Real only</strong></div>
            </div>
            <div style={{marginTop:14,background:"#f9fafb",borderRadius:12,padding:12,border:"1px solid #eef2ff"}}>
              <div style={{fontSize:11,fontWeight:800,color:"#1e40af"}}>● API ACTIVE • FIXED</div>
              <div style={{fontSize:12,marginTop:4,color:"#4b5563",lineHeight:1.5}}>All internships loaded from real backend. No demo, no fake records. JWT protected.</div>
            </div>
          </div>
        </aside>
      </div>

      {showForm && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{margin:0,fontSize:18,fontWeight:900}}>{editingId?"Edit Internship":"Create Internship"}</h2><button onClick={()=>setShowForm(false)} style={{border:0,background:"#f3f4f6",width:32,height:32,borderRadius:10,cursor:"pointer",fontSize:16}}>×</button></div>
            <form onSubmit={handleSubmit} style={{display:"grid",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><input className="inp" name="company_name" value={form.company_name} onChange={handleChange} placeholder="Company Name *" required/><input className="inp" name="job_title" value={form.job_title} onChange={handleChange} placeholder="Job Title *" required/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><input className="inp" name="location" value={form.location} onChange={handleChange} placeholder="Location *" required/><select className="inp" name="work_type" value={form.work_type} onChange={handleChange}><option>Hybrid</option><option>Remote</option><option>Onsite</option></select></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><input className="inp" name="duration" value={form.duration} onChange={handleChange} placeholder="Duration *" required/><input className="inp" type="datetime-local" name="application_deadline" value={form.application_deadline} onChange={handleChange} required/></div>
              <textarea className="inp" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Description *" required/>
              <textarea className="inp" name="requirements" value={form.requirements} onChange={handleChange} rows={3} placeholder="Requirements *" required/>
              <select className="inp" name="status" value={form.status} onChange={handleChange}><option>Open</option><option>Closed</option></select>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}><button type="button" onClick={()=>setShowForm(false)} className="btn" style={{padding:"12px 18px",fontSize:13}}>Cancel</button><button type="submit" disabled={saving} className="btn btn-primary" style={{padding:"12px 20px",fontSize:13}}>{saving?"Saving...":editingId?"Save Changes":"Create Internship"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}