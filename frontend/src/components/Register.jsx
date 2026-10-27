import { useState } from "react";

const API_URL = "/api";

function Register({ onNavigate, onRegisterSuccess }) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields."); return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setIsRegistering(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, role: "student" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Registration failed.");
      setMessage("Account created successfully! Redirecting to login...");
      setFormData({ name: "", email: "", password: "" });
      setTimeout(() => {
        if (onRegisterSuccess) onRegisterSuccess();
        else if (onNavigate) onNavigate("Login");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.wrapper}>
        {/* LEFT - SAME AS LOGIN */}
        <div style={s.left}>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200" alt="" style={s.leftImg} />
          <div style={s.leftOverlay}></div>
          <div style={s.leftTop}>
            <div style={s.brandPill}><span style={s.brandDot}></span> Join 10,000+ students today</div>
          </div>
          <div style={s.leftBottom}>
            <div style={s.bottomTitle}>Start your journey</div>
            <div style={s.bottomSub}>Create profile • Apply • Get hired</div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div style={s.right}>
          <div style={s.formBox}>
            <div style={s.logoWrap}>
              <div style={s.logoIcon}>S</div>
              <div><div style={s.logoName}>SkillBridge</div><div style={s.logoVer}>STUDENT CAREER PLATFORM v2</div></div>
            </div>

            <h1 style={s.h1}>Create account</h1>
            <p style={s.sub}>Join SkillBridge and build your career profile</p>

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Full name</label>
                <input style={s.input} type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} autoComplete="name" required />
              </div>

              <div style={s.field}>
                <label style={s.label}>Work email</label>
                <input style={s.input} type="email" name="email" placeholder="you@university.edu" value={formData.email} onChange={handleChange} autoComplete="email" required />
              </div>

              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.passBox}>
                  <input style={{...s.input, margin:0, border:"none"}} type={showPass?"text":"password"} name="password" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} autoComplete="new-password" required />
                  <button type="button" onClick={()=>setShowPass(!showPass)} style={s.eye}>{showPass?"🙈":"👁️"}</button>
                </div>
                <div style={s.hint}>Must be at least 6 characters</div>
              </div>

              <button type="submit" disabled={isRegistering} style={{...s.submit, opacity:isRegistering?0.7:1}}>
                {isRegistering ? "Creating account..." : "Create account →"}
              </button>

              {message && <div style={s.ok}>✓ {message}</div>}
              {error && <div style={s.err}>⚠ {error}</div>}

              <div style={s.registerWrap}>
                <p style={s.registerText}>Already have an account?</p>
                <button type="button" onClick={() => onNavigate("Login")} style={s.registerBtn}>Sign in instead</button>
              </div>
            </form>

            <div style={s.foot}>© 2024 SkillBridge • Privacy • Terms</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:{ minHeight:"100vh", background:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", padding:16, fontFamily:"Inter, sans-serif" },
  wrapper:{ width:"100%", maxWidth:1080, display:"flex", background:"#fff", borderRadius:28, overflow:"hidden", boxShadow:"0 30px 90px rgba(0,0,0,0.12)", minHeight:640 },
  left:{ flex:1.15, position:"relative", background:"#1e293b" },
  leftImg:{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" },
  leftOverlay:{ position:"absolute", inset:0, background:"linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.75) 100%)" },
  leftTop:{ position:"absolute", top:20, left:20 },
  brandPill:{ background:"rgba(255,255,255,0.14)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", padding:"7px 12px", borderRadius:100, fontSize:11, fontWeight:700, display:"flex", gap:6, alignItems:"center" },
  brandDot:{ width:8, height:8, borderRadius:10, background:"#22c55e" },
  leftBottom:{ position:"absolute", bottom:24, left:24, color:"#fff" },
  bottomTitle:{ fontSize:22, fontWeight:900 }, bottomSub:{ fontSize:11, color:"#cbd5e1", marginTop:4, letterSpacing:1 },
  right:{ flex:1, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"28px 20px" },
  formBox:{ width:"100%", maxWidth:340 },
  logoWrap:{ display:"flex", gap:10, alignItems:"center", marginBottom:22 }, logoIcon:{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#2563eb,#7c3aed)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900 }, logoName:{ fontSize:16, fontWeight:900, color:"#0f172a" }, logoVer:{ fontSize:8, letterSpacing:1.5, color:"#94a3b8", fontWeight:800 },
  h1:{ margin:0, fontSize:24, fontWeight:900, color:"#0f172a" }, sub:{ margin:"6px 0 20px", fontSize:12, color:"#64748b" },
  field:{ marginBottom:13 }, label:{ display:"block", fontSize:11, fontWeight:800, color:"#334155", marginBottom:6 }, input:{ width:"100%", boxSizing:"border-box", padding:"12px 13px", borderRadius:12, border:"1px solid #e2e8f0", background:"#f8fafc", fontSize:13, outline:"none" },
  passBox:{ display:"flex", alignItems:"center", border:"1px solid #e2e8f0", background:"#f8fafc", borderRadius:12, overflow:"hidden" }, eye:{ border:"none", background:"transparent", padding:"0 12px", cursor:"pointer" },
  hint:{ fontSize:10, color:"#94a3b8", marginTop:6 },
  submit:{ width:"100%", marginTop:4, border:"none", background:"#0f172a", color:"#fff", borderRadius:12, padding:"13px", fontWeight:800, fontSize:13, cursor:"pointer" },
  ok:{ marginTop:12, background:"#ecfdf5", border:"1px solid #bbf7d0", color:"#047857", padding:"10px 12px", borderRadius:10, fontSize:11, fontWeight:700 }, err:{ marginTop:12, background:"#fef2f2", border:"1px solid #fecaca", color:"#b91c1c", padding:"10px 12px", borderRadius:10, fontSize:11, fontWeight:700 },
  registerWrap:{ marginTop:18, textAlign:"center", background:"#f8fafc", border:"1px solid #eef2f7", borderRadius:16, padding:14 }, registerText:{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"#475569" }, registerBtn:{ width:"100%", border:"1px solid #0f172a", background:"#fff", color:"#0f172a", borderRadius:12, padding:"11px", fontWeight:800, fontSize:12, cursor:"pointer" },
  foot:{ textAlign:"center", fontSize:9, color:"#94a3b8", marginTop:16 },
};

export default Register;