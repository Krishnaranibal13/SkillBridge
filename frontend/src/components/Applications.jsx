import React, { useEffect, useMemo, useState } from "react";

const API_URL = "/api";

function Internships({ token, onNavigate, onLogout }) {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");
  const [type, setType] = useState("All");
  const [duration, setDuration] = useState("All");
  const [status, setStatus] = useState("Open");
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");

  const loadInternships = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await fetch(`${API_URL}/internships`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) { onLogout?.(); return; }
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "Failed to load");
      }
      const data = await response.json();
      const list = Array.isArray(data)? data : data.internships || data.data || [];
      setInternships(list);
    } catch (e) {
      console.error(e);
      setLoadError("Could not load internships. Please make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (token) loadInternships(); }, [token]);

  const formattedInternships = useMemo(() => {
    return internships.map((i) => ({
     ...i,
      title: i.job_title || "Internship Opportunity",
      company: i.company_name || "Company",
      location: i.location || "Remote",
      type: i.work_type || "Full-time",
      duration: i.duration || "3 Months",
      status: i.status || "Open",
      skills: i.requirements? i.requirements.split(",").map(s=>s.trim()).filter(Boolean) : [],
      description: i.description || "Join our team and gain real-world experience building products used by thousands.",
      deadline: i.application_deadline || null,
      posted: i.created_at? new Date(i.created_at).toLocaleDateString() : "Recently",
    }));
  }, [internships]);

  const filteredInternships = useMemo(() => {
    return formattedInternships.filter((job) => {
      const q = search.toLowerCase().trim();
      const matchQ =!q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.skills.join(" ").toLowerCase().includes(q);
      return matchQ && (location==="All"||job.location===location) && (type==="All"||job.type===type) && (duration==="All"||job.duration.toLowerCase().includes(duration.toLowerCase())) && (status==="All"||job.status.toLowerCase()===status.toLowerCase());
    });
  }, [formattedInternships, search, location, type, duration, status]);

  const locations = useMemo(() => ["All",...new Set(formattedInternships.map(j=>j.location))], [formattedInternships]);
  const types = useMemo(() => ["All",...new Set(formattedInternships.map(j=>j.type))], [formattedInternships]);
  const durations = useMemo(() => ["All",...new Set(formattedInternships.map(j=>j.duration))], [formattedInternships]);

  const toggleSave = (id) => setSavedJobs(c => c.includes(id)? c.filter(x=>x!==id) : [...c, id]);
  const clearFilters = () => { setSearch(""); setLocation("All"); setType("All"); setDuration("All"); setStatus("Open"); };
  const hasActiveFilters = search.trim()!== "" || location!== "All" || type!== "All" || duration!== "All" || status!== "Open";

  const handleApply = async () => {
    if (!selectedInternship ||!token) { setApplicationMessage("Please log in to apply."); return; }
    setIsApplying(true); setApplicationMessage("");
    try {
      const res = await fetch(`${API_URL}/applications`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ internship_id: selectedInternship.id }) });
      const data = await res.json();
      if (!res.ok) { setApplicationMessage(data.detail || "Could not submit application."); return; }
      setApplicationMessage("Application submitted successfully! ✓");
      setTimeout(()=>{ setSelectedInternship(null); setApplicationMessage(""); }, 1200);
    } catch { setApplicationMessage("Could not connect to the backend."); } finally { setIsApplying(false); }
  };

  const formatDeadline = (d) => { if(!d) return "No deadline"; const p=new Date(d); return isNaN(p.getTime())? d : p.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}); };

  return (
    <div style={{ minHeight:"100vh", background:"#f8f9ff", fontFamily:"Inter, sans-serif", color:"#111827" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap');
       .sb-card { transition: all.25s cubic-bezier(.2,.8,.2,1); }
       .sb-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(79,70,229,.12), 0 8px 20px rgba(15,23,42,.06)!important; border-color: #e0e7ff!important; }
       .sb-btn-apply { transition: all.2s; }
       .sb-btn-apply:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(79,70,229,.35); }
       .glass { backdrop-filter: blur(16px); background: rgba(255,255,255,.82); border: 1px solid rgba(255,255,255,.6); }
       .shimmer { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position: -200% 0} 100%{background-position: 200% 0} }
      `}</style>

      {/* HEADER - Premium SaaS */}
      <header className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid #eef2ff", padding:"14px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          <div style={{width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#3b82f6 100%)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:20, boxShadow:"0 8px 20px rgba(99,102,241,.3)"}}>S</div>
          <div><div style={{fontWeight:900, fontSize:18, letterSpacing:-.3}}>SkillBridge</div><div style={{fontSize:10, color:"#64748b", fontWeight:700, letterSpacing:.6, textTransform:"uppercase"}}>Student Career Platform</div></div>
        </div>
        <nav style={{display:"flex", gap:6, alignItems:"center"}}>
          {["Dashboard","Internships","Applications","Certificates","Skills"].map(item=>(
            <button key={item} onClick={()=>onNavigate?.(item)} style={{ border:"none", padding:"8px 14px", borderRadius:999, fontSize:12, fontWeight:700, cursor:"pointer", background: item==="Internships"? "#111827" : "transparent", color: item==="Internships"? "#fff" : "#64748b" }}>{item}</button>
          ))}
          <button onClick={onLogout} style={{ marginLeft:8, border:"1px solid #fee2e2", background:"#fff", color:"#ef4444", padding:"8px 14px", borderRadius:999, fontWeight:700, fontSize:12, cursor:"pointer" }}>Logout</button>
        </nav>
      </header>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 22px 60px" }}>

        {/* TITLE */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16, marginBottom:28 }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 12px", borderRadius:999, background:"linear-gradient(90deg,#eef2ff,#f5f3ff)", border:"1px solid #e0e7ff", color:"#6366f1", fontSize:11, fontWeight:800, letterSpacing:.6, textTransform:"uppercase", marginBottom:12 }}>
              <span style={{ width:6, height:6, borderRadius:999, background:"#6366f1", display:"inline-block" }}></span> Live Opportunities
            </div>
            <h1 style={{ margin:0, fontSize:36, fontWeight:900, letterSpacing:-1.2, lineHeight:1.1 }}>Find your next<br/><span style={{ background:"linear-gradient(90deg,#6366f1,#8b5cf6,#3b82f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>internship.</span></h1>
            <p style={{ margin:"10px 0 0", color:"#64748b", fontSize:15, maxWidth:480 }}>Hand-picked roles from top companies. Filter by skills, location and type to find your perfect match.</p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:999, padding:"10px 16px", fontSize:13, fontWeight:700, boxShadow:"0 4px 12px rgba(0,0,0,.04)" }}>
              <span style={{ color:"#6366f1" }}>{filteredInternships.length}</span> <span style={{ color:"#64748b" }}>open roles</span>
            </div>
          </div>
        </div>

        {/* GLASS FILTER BAR */}
        <div className="glass" style={{ borderRadius:20, padding:14, boxShadow:"0 8px 30px rgba(15,23,42,.06)", marginBottom:24, position:"sticky", top:76, zIndex:40 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.8fr 1fr 1fr 1fr 1fr auto", gap:10, alignItems:"center" }}>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}>⌕</div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search role, company, skill..." style={{ width:"100%", padding:"12px 14px 12px 38px", borderRadius:12, border:"1px solid #e2e8f0", background:"#f8fafc", outline:"none", fontSize:13.5, fontWeight:500, boxSizing:"border-box" }} />
            </div>
            <select value={location} onChange={e=>setLocation(e.target.value)} style={{ padding:"12px", borderRadius:12, border:"1px solid #e2e8f0", background:"#f8fafc", fontSize:13 }}>{locations.map(o=><option key={o} value={o}>{o==="All"?"All Locations":o}</option>)}</select>
            <select value={type} onChange={e=>setType(e.target.value)} style={{ padding:"12px", borderRadius:12, border:"1px solid #e2e8f0", background:"#f8fafc", fontSize:13 }}>{types.map(o=><option key={o} value={o}>{o==="All"?"All Types":o}</option>)}</select>
            <select value={duration} onChange={e=>setDuration(e.target.value)} style={{ padding:"12px", borderRadius:12, border:"1px solid #e2e8f0", background:"#f8fafc", fontSize:13 }}>{durations.map(o=><option key={o} value={o}>{o==="All"?"All Durations":o}</option>)}</select>
            <select value={status} onChange={e=>setStatus(e.target.value)} style={{ padding:"12px", borderRadius:12, border:"1px solid #e2e8f0", background:"#f8fafc", fontSize:13 }}><option value="Open">Open Only</option><option value="All">All</option></select>
            <button onClick={clearFilters} style={{ border:"none", padding:"12px 16px", borderRadius:12, background: hasActiveFilters? "#111827" : "#f1f5f9", color: hasActiveFilters? "#fff" : "#94a3b8", fontWeight:700, fontSize:12, cursor: hasActiveFilters? "pointer" : "not-allowed" }}>Clear</button>
          </div>
        </div>

        {/* STATES */}
        {isLoading && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:16 }}>
            {[1,2,3,4,5,6].map(i=><div key={i} style={{ background:"#fff", borderRadius:20, padding:22, border:"1px solid #eef2ff" }}><div className="shimmer" style={{ height:46, width:46, borderRadius:12, marginBottom:16 }}></div><div className="shimmer" style={{ height:18, width:"60%", borderRadius:8, marginBottom:10 }}></div><div className="shimmer" style={{ height:14, width:"40%", borderRadius:8 }}></div></div>)}
          </div>
        )}

        {!isLoading && loadError && (
          <div style={{ textAlign:"center", padding:"60px 20px", background:"#fff", border:"1px solid #fecaca", borderRadius:24 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"#fef2f2", color:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 14px" }}>!</div>
            <h3 style={{ margin:"0 0 6px" }}>Could not load internships</h3><p style={{ color:"#64748b", fontSize:14, marginBottom:18 }}>{loadError}</p>
            <button onClick={loadInternships} style={{ border:"none", padding:"12px 20px", borderRadius:999, background:"#111827", color:"#fff", fontWeight:700, cursor:"pointer" }}>Try Again</button>
          </div>
        )}

        {!isLoading &&!loadError && filteredInternships.length===0 && (
          <div style={{ textAlign:"center", padding:"70px 20px", background:"#fff", border:"1px dashed #e2e8f0", borderRadius:24 }}>
            <div style={{ fontSize:42, marginBottom:12 }}>🔍</div><h3 style={{ margin:0 }}>No matching internships</h3><p style={{ color:"#64748b", fontSize:14 }}>Try adjusting filters or check back later. New roles are added daily.</p><button onClick={clearFilters} style={{ marginTop:14, border:"none", padding:"10px 18px", borderRadius:999, background:"#111827", color:"#fff", fontWeight:700, cursor:"pointer" }}>Clear Filters</button>
          </div>
        )}

        {/* PREMIUM CARDS */}
        {!isLoading &&!loadError && filteredInternships.length>0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:18 }}>
            {filteredInternships.map(job=>{
              const isSaved=savedJobs.includes(job.id);
              const isOpen=job.status.toLowerCase()==="open";
              return (
                <div key={job.id} className="sb-card" style={{ background:"#fff", border:"1px solid #eef2ff", borderRadius:22, padding:22, boxShadow:"0 6px 20px rgba(15,23,42,.04)", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                      <div style={{ display:"flex", gap:12 }}>
                        <div style={{ width:48, height:48, borderRadius:12, background:"linear-gradient(135deg,#eef2ff,#f5f3ff)", border:"1px solid #e0e7ff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#6366f1", fontSize:18 }}>{job.company.charAt(0).toUpperCase()}</div>
                        <div><div style={{ fontWeight:800, fontSize:15.5, lineHeight:1.2 }}>{job.title}</div><div style={{ color:"#6366f1", fontWeight:700, fontSize:13, marginTop:3 }}>{job.company}</div></div>
                      </div>
                      <button onClick={()=>toggleSave(job.id)} style={{ border:"none", background:"#f8fafc", width:32, height:32, borderRadius:999, cursor:"pointer", fontSize:16 }}>{isSaved?"★":"☆"}</button>
                    </div>

                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                      <span style={{ padding:"6px 10px", borderRadius:999, background:"#f8fafc", border:"1px solid #f1f5f9", fontSize:11, fontWeight:700, color:"#475569" }}>📍 {job.location}</span>
                      <span style={{ padding:"6px 10px", borderRadius:999, background:"#f0fdf4", border:"1px solid #dcfce7", fontSize:11, fontWeight:700, color:"#15803d" }}>⏱ {job.duration}</span>
                      <span style={{ padding:"6px 10px", borderRadius:999, background:"#eff6ff", border:"1px solid #dbeafe", fontSize:11, fontWeight:700, color:"#2563eb" }}>{job.type}</span>
                      <span style={{ padding:"6px 10px", borderRadius:999, background: isOpen?"#ecfdf5":"#fef2f2", border:`1px solid ${isOpen?"#a7f3d0":"#fecaca"}`, fontSize:11, fontWeight:800, color: isOpen?"#047857":"#dc2626" }}>{isOpen?"● Open":"● Closed"}</span>
                    </div>

                    <p style={{ margin:"0 0 14px", color:"#64748b", fontSize:13.5, lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{job.description}</p>

                    {job.skills.length>0 && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                        {job.skills.slice(0,4).map((s,i)=><span key={i} style={{ padding:"5px 9px", borderRadius:8, background:"#f8fafc", border:"1px solid #e2e8f0", fontSize:11, color:"#475569", fontWeight:600 }}>{s}</span>)}
                        {job.skills.length>4 && <span style={{ fontSize:11, color:"#94a3b8", fontWeight:700, padding:"5px 2px" }}>+{job.skills.length-4} more</span>}
                      </div>
                    )}
                  </div>

                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:14, borderTop:"1px solid #f1f5f9" }}>
                    <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>📅 {formatDeadline(job.deadline)}</span>
                    <button className="sb-btn-apply" onClick={()=>{ setSelectedInternship(job); setApplicationMessage(""); }} style={{ border:"none", padding:"10px 16px", borderRadius:999, background:"#111827", color:"#fff", fontWeight:700, fontSize:12.5, cursor:"pointer" }}>View & Apply →</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL - PREMIUM */}
        {selectedInternship && (
          <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.55)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, zIndex:9999 }} onClick={()=>setSelectedInternship(null)}>
            <div onClick={e=>e.stopPropagation()} style={{ width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto", background:"#fff", borderRadius:28, padding:28, boxShadow:"0 30px 80px rgba(0,0,0,.3)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
                <div style={{ display:"flex", gap:14 }}><div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#eef2ff,#f5f3ff)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#6366f1", fontSize:22 }}>{selectedInternship.company.charAt(0).toUpperCase()}</div><div><h2 style={{ margin:0, fontSize:22, fontWeight:900, letterSpacing:-.5 }}>{selectedInternship.title}</h2><p style={{ margin:"4px 0 0", color:"#6366f1", fontWeight:800 }}>{selectedInternship.company}</p></div></div>
                <button onClick={()=>setSelectedInternship(null)} style={{ width:36, height:36, borderRadius:999, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer" }}>✕</button>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:24 }}>
                {[
                  ["LOCATION", `📍 ${selectedInternship.location}`],
                  ["DURATION", `⏱ ${selectedInternship.duration}`],
                  ["TYPE", `💼 ${selectedInternship.type}`],
                  ["STATUS", selectedInternship.status],
                  ["DEADLINE", `📅 ${formatDeadline(selectedInternship.deadline)}`],
                ].map(([k,v])=>(
                  <div key={k} style={{ padding:12, borderRadius:14, background:"#f8fafc", border:"1px solid #f1f5f9" }}><div style={{ fontSize:10, letterSpacing:.8, color:"#94a3b8", fontWeight:800 }}>{k}</div><div style={{ fontSize:13, fontWeight:700, marginTop:4 }}>{v}</div></div>
                ))}
              </div>

              <div style={{ marginTop:24 }}><h3 style={{ fontSize:14, fontWeight:800, marginBottom:8 }}>About</h3><p style={{ color:"#475569", fontSize:14, lineHeight:1.7 }}>{selectedInternship.description}</p></div>
              <div style={{ marginTop:18 }}><h3 style={{ fontSize:14, fontWeight:800, marginBottom:8 }}>Requirements</h3><p style={{ color:"#475569", fontSize:14, lineHeight:1.7 }}>{selectedInternship.requirements || "No specific requirements"}</p></div>

              {selectedInternship.skills.length>0 && (
                <div style={{ marginTop:18 }}><h3 style={{ fontSize:14, fontWeight:800, marginBottom:10 }}>Skills</h3><div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{selectedInternship.skills.map((s,i)=><span key={i} style={{ padding:"7px 12px", borderRadius:999, background:"#eef2ff", color:"#4f46e5", fontSize:12, fontWeight:700 }}>{s}</span>)}</div></div>
              )}

              <div style={{ display:"flex", gap:10, marginTop:28 }}>
                <button onClick={handleApply} disabled={isApplying || selectedInternship.status.toLowerCase()!=="open"} style={{ flex:1, border:"none", borderRadius:999, padding:14, background: selectedInternship.status.toLowerCase()!=="open"? "#e2e8f0" : "#111827", color:"#fff", fontWeight:800, cursor: isApplying? "not-allowed" : "pointer" }}>{isApplying? "Applying..." : selectedInternship.status.toLowerCase()!=="open"? "Closed" : "Apply Now →"}</button>
                <button onClick={()=>setSelectedInternship(null)} style={{ padding:"14px 20px", borderRadius:999, border:"1px solid #e2e8f0", background:"#fff", fontWeight:700, cursor:"pointer" }}>Close</button>
              </div>
              {applicationMessage && <p style={{ textAlign:"center", marginTop:12, fontWeight:800, fontSize:13, color: applicationMessage.includes("success")? "#16a34a" : "#ef4444" }}>{applicationMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Internships;