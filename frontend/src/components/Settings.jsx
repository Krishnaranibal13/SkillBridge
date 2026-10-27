import { useEffect, useState } from "react";
const API_URL = "/api";

export default function Settings({ token, onNavigate, onLogout }) {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifIntern, setNotifIntern] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(()=>{
    fetch(`${API_URL}/users/me`, { headers:{ Authorization:`Bearer ${token}` }})
   .then(r=>r.json()).then(d=>setUser(d)).catch(()=>{});
  },[token]);

  const displayName = user?.name || user?.full_name || user?.email?.split("@")[0] || "My Account";
  const email = user?.email || "";
  const initials = (displayName[0] || "U").toUpperCase();

  const showMsg = (t)=>{ setMsg(t); setTimeout(()=>setMsg(""),2500); };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f3ef", fontFamily:"Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&display=swap');`}</style>

      {/* TOPBAR - Dynamic user */}
      <div style={{ background:"#f8f6f3", borderBottom:"1px solid #e7e0d2", padding:"14px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>onNavigate?.("Dashboard")}><span style={{ fontSize:26 }}>⛩️</span><b style={{ fontSize:20 }}>SkillBridge</b></div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ position:"relative" }}><span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search settings..." style={{ padding:"10px 14px 10px 34px", borderRadius:12, border:"1px solid #e7e0d2", width:260, background:"#fff", outline:"none" }} /></div>
          <div onClick={()=>onNavigate?.("Profile")} style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #e7e0d2", padding:"6px 12px 6px 6px", borderRadius:14, cursor:"pointer" }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#c9a86a,#e8d5a3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff" }}>{initials}</div><div style={{ fontWeight:700, fontSize:14 }}>{displayName} ▾</div>
          </div>
          <button onClick={onLogout} style={{ background:"#111827", color:"#fff", border:"none", padding:"9px 14px", borderRadius:10, fontWeight:700, cursor:"pointer" }}>Logout</button>
        </div>
      </div>

      <div style={{ display:"flex", maxWidth:1440, margin:"0 auto" }}>
        {/* SIDEBAR */}
        <div style={{ width:260, background:"#111111", color:"#fff", padding:20, display:"flex", flexDirection:"column", gap:6 }}>
          {["Dashboard","Courses","Certificates","Career Path","Opportunities","Community","Profile","Settings"].map(it=>(
            <button key={it} onClick={()=>onNavigate?.(it==="Courses"?"Skills":it==="Opportunities"?"Internships":it)} style={{ width:"100%", textAlign:"left", border:"none", padding:"13px 14px", borderRadius:12, background: it==="Settings"? "linear-gradient(90deg,#C9A86A,#E8D5A3)":"transparent", color: it==="Settings"? "#fff":"#9ca3af", fontWeight:700, display:"flex", gap:12, cursor:"pointer" }}>{it==="Settings"?"⚙️":it==="Profile"?"👤":it==="Certificates"?"🎓":it==="Courses"?"📖":"▤"} {it}</button>
          ))}
          <div style={{ marginTop:20, background:"linear-gradient(135deg,#C9A86A,#E8D5A3)", borderRadius:16, padding:16, color:"#111827" }}><div style={{ fontWeight:900 }}>Upgrade to Premium</div><div style={{ fontSize:12, marginTop:4, opacity:.8 }}>Unlock advanced analytics</div><button style={{ marginTop:12, width:"100%", background:"#111827", color:"#fff", border:"none", padding:11, borderRadius:10, fontWeight:800 }}>Upgrade Now</button></div>
        </div>

        {/* MAIN */}
        <div style={{ flex:1, padding:28 }}>
          <h1 style={{ margin:0, fontSize:44, fontWeight:900, letterSpacing:-1.5 }}>Settings</h1>
          <p style={{ color:"#57534e", marginTop:6 }}>Manage your account preferences and security</p>

          {msg && <div style={{ marginTop:14, background:"#ecfdf5", border:"1px solid #bbf7d0", color:"#047857", padding:"12px 14px", borderRadius:12, fontWeight:700 }}>✓ {msg}</div>}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginTop:18 }}>
            {/* ACCOUNT */}
            <div style={{ background:"#fff", border:"1px solid #ece6d8", borderRadius:14, padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:56, height:56, borderRadius:14, background:"#111827", color:"#E8D5A3", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900 }}>{initials}</div>
                <div><div style={{ fontWeight:900, fontSize:16 }}>{displayName}</div><div style={{ fontSize:12, color:"#78716c" }}>{email}</div></div>
                <button onClick={()=>onNavigate?.("Profile")} style={{ marginLeft:"auto", background:"#f5f1e8", border:"1px solid #e7e0d2", padding:"8px 12px", borderRadius:10, fontWeight:700, cursor:"pointer" }}>Edit Profile</button>
              </div>
              <div style={{ borderTop:"1px solid #f1e9d2", paddingTop:14 }}>
                <h4 style={{ margin:"0 0 10px" }}>Security</h4>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>showMsg("Password reset email sent to "+email)} style={{ flex:1, background:"#fff", border:"1px solid #111827", padding:10, borderRadius:10, fontWeight:700, cursor:"pointer" }}>🔒 Change Password</button>
                  <button onClick={()=>showMsg("2FA enabled successfully!")} style={{ flex:1, background:"#111827", color:"#fff", border:"none", padding:10, borderRadius:10, fontWeight:700, cursor:"pointer" }}>🛡️ Enable 2FA</button>
                </div>
              </div>
            </div>

            {/* NOTIFICATIONS */}
            <div style={{ background:"#fff", border:"1px solid #ece6d8", borderRadius:14, padding:18 }}>
              <h4 style={{ margin:"0 0 14px" }}>🔔 Notifications</h4>
              {[
                { l:"Email Notifications", d:"Receive updates via email", v:notifEmail, s:setNotifEmail },
                { l:"Push Notifications", d:"In-app alerts & reminders", v:notifPush, s:setNotifPush },
                { l:"Internship Alerts", d:"New opportunities matching skills", v:notifIntern, s:setNotifIntern },
              ].map(it=>(
                <div key={it.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f5f1e8" }}>
                  <div><div style={{ fontWeight:700, fontSize:13 }}>{it.l}</div><div style={{ fontSize:11, color:"#78716c" }}>{it.d}</div></div>
                  <div onClick={()=>{it.s(!it.v); showMsg(it.l+" "+(!it.v?"enabled":"disabled"));}} style={{ width:44, height:26, borderRadius:999, background: it.v? "linear-gradient(90deg,#C9A86A,#E8D5A3)":"#e7e0d2", position:"relative", cursor:"pointer", transition:".2s" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: it.v? 21:3, transition:".2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* PRIVACY */}
            <div style={{ background:"#fff", border:"1px solid #ece6d8", borderRadius:14, padding:18 }}>
              <h4 style={{ margin:"0 0 14px" }}>👁️ Privacy</h4>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div><div style={{ fontWeight:700, fontSize:13 }}>Private Profile</div><div style={{ fontSize:11, color:"#78716c" }}>Only connections can view</div></div>
                <div onClick={()=>setIsPrivate(!isPrivate)} style={{ width:44, height:26, borderRadius:999, background: isPrivate? "#111827":"#e7e0d2", position:"relative", cursor:"pointer" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: isPrivate? 21:3, transition:".2s" }} />
                </div>
              </div>
              <div style={{ marginTop:14, background:"#f8fafc", border:"1px solid #edf1f7", borderRadius:10, padding:12, fontSize:12, color:"#475569" }}>Your certificates are always verified on-chain 🛡️ Shareable to LinkedIn even if profile is private.</div>
            </div>

            {/* DANGER ZONE */}
            <div style={{ background:"#fff", border:"1px solid #fecaca", borderRadius:14, padding:18 }}>
              <h4 style={{ margin:"0 0 14px", color:"#dc2626" }}>⚠️ Danger Zone</h4>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={onLogout} style={{ flex:1, background:"#fff", border:"1px solid #fecaca", color:"#dc2626", padding:10, borderRadius:10, fontWeight:700, cursor:"pointer" }}>Logout All Devices</button>
                <button onClick={()=>{ if(confirm("Delete account permanently?")) showMsg("Delete request sent to admin"); }} style={{ flex:1, background:"#fee2e2", border:"none", color:"#dc2626", padding:10, borderRadius:10, fontWeight:800, cursor:"pointer" }}>Delete Account</button>
              </div>
              <div style={{ marginTop:12, display:"flex", gap:8 }}>
                <button onClick={()=>onNavigate?.("Dashboard")} style={{ flex:1, background:"#111827", color:"#fff", border:"none", padding:11, borderRadius:10, fontWeight:800, cursor:"pointer" }}>← Back to Dashboard</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}