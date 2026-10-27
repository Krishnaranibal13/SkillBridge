import { useEffect, useState } from "react";
const API_URL = "/api";

export function useCurrentUser(token){
  const [user,setUser]=useState(null);
  useEffect(()=>{
    if(!token) return;
    fetch(`${API_URL}/users/me`,{ headers:{ Authorization:`Bearer ${token}` }})
    .then(r=>r.json()).then(d=>setUser(d)).catch(()=>{});
  },[token]);
  return user;
}

export function Sidebar({ onNavigate, active }){
  const items=[
    {l:"Dashboard",i:"▤",v:"Dashboard"},
    {l:"Courses",i:"📖",v:"Skills"},
    {l:"Certificates",i:"🎓",v:"Certificates"},
    {l:"Career Path",i:"↗",v:"Dashboard"},
    {l:"Opportunities",i:"💼",v:"Internships"},
    {l:"Community",i:"👥",v:"Dashboard"},
    {l:"Profile",i:"👤",v:"Profile"},
    {l:"Settings",i:"⚙️",v:"Dashboard"},
  ];
  return (
    <div style={{ width:260, background:"#111111", color:"#fff", padding:20, display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ fontSize:11, color:"#6b7280", fontWeight:800, letterSpacing:.8, marginBottom:10 }}>MAIN MENU</div>
      {items.map(it=>(
        <button key={it.l} onClick={()=>onNavigate?.(it.v)} style={{ width:"100%", textAlign:"left", border:"none", padding:"13px 14px", borderRadius:12, background: active===it.l? "linear-gradient(90deg,#C9A86A,#E8D5A3)":"transparent", color: active===it.l? "#fff":"#9ca3af", fontWeight:700, display:"flex", gap:12, cursor:"pointer" }}>{it.i} {it.l}</button>
      ))}
      <div style={{ marginTop:22, background:"linear-gradient(135deg,#C9A86A,#E8D5A3)", borderRadius:16, padding:16, color:"#111827" }}>
        <div style={{ fontWeight:900 }}>Upgrade to Premium</div>
        <div style={{ fontSize:12, marginTop:4, opacity:.8 }}>Unlock advanced analytics</div>
        <button style={{ marginTop:12, width:"100%", background:"#111827", color:"#fff", border:"none", padding:11, borderRadius:10, fontWeight:800 }}>Upgrade Now</button>
      </div>
    </div>
  );
}

export function Topbar({ token, onNavigate, onLogout, search, setSearch }){
  const user = useCurrentUser(token);
  const displayName = user?.name || user?.full_name || user?.email?.split("@")[0] || "Loading...";
  const initials = (displayName[0] || "U").toUpperCase();

  return (
    <div style={{ background:"#f8f6f3", borderBottom:"1px solid #e7e0d2", padding:"14px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>onNavigate?.("Dashboard")}><span style={{ fontSize:26 }}>⛩️</span><b style={{ fontSize:20 }}>SkillBridge</b></div>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ position:"relative" }}><span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>⌕</span><input value={search||""} onChange={e=>setSearch?.(e.target.value)} placeholder="Search certificates, skills..." style={{ padding:"10px 14px 10px 34px", borderRadius:12, border:"1px solid #e7e0d2", width:280, background:"#fff", outline:"none" }} /></div>
        <div onClick={()=>onNavigate?.("Profile")} style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #e7e0d2", padding:"6px 12px 6px 6px", borderRadius:14, cursor:"pointer" }}>
          <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#c9a86a,#e8d5a3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff" }}>{initials}</div><div style={{ fontWeight:700, fontSize:14 }}>{displayName}</div>
        </div>
        <button onClick={onLogout} style={{ background:"#111827", color:"#fff", border:"none", padding:"9px 14px", borderRadius:10, fontWeight:700, cursor:"pointer" }}>Logout</button>
      </div>
    </div>
  );
}