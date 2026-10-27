 import { useEffect, useMemo, useState } from "react";

const API_URL = "/api";

function Dashboard({
  certificates = [],
  onLogout,
  token,
  onNavigate,
}) {
  const [profile, setProfile] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/student-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setProfileMessage(data.detail || "Could not load profile.");
          return;
        }
        setProfile(data);
      } catch (err) {
        console.error(err);
        setProfileMessage("Could not connect to backend.");
      }
    };

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [appRes, internRes, skillRes] = await Promise.all([
          fetch(`${API_URL}/applications`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/internships`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/skills`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const appData = await appRes.json().catch(() => []);
        const internData = await internRes.json().catch(() => []);
        const skillData = await skillRes.json().catch(() => []);

        if (appRes.ok) setApplications(Array.isArray(appData)? appData : []);
        if (internRes.ok) setInternships(Array.isArray(internData)? internData : []);
        if (skillRes.ok) setSkills(Array.isArray(skillData)? skillData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    loadDashboardData();
  }, [token]);

  const handleEditProfile = () => {
    if (!profile) return;
    setPhone(profile.phone || "");
    setUniversity(profile.university || "");
    setCourse(profile.course || "");
    setBio(profile.bio || "");
    setGithubUrl(profile.github_url || "");
    setLinkedinUrl(profile.linkedin_url || "");
    setProfileMessage("");
    setShowProfileEdit(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage("Saving profile...");
    try {
      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone, university, course, bio, github_url: githubUrl, linkedin_url: linkedinUrl }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setProfileMessage(data.detail || "Could not update profile.");
        return;
      }
      setProfile(data.profile || data);
      setShowProfileEdit(false);
      setProfileMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setProfileMessage("Could not connect to backend.");
    }
  };

  const getInternship = (app) => internships.find((i) => i.id === app.internship_id);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Applied": return { background: "#e0edff", color: "#2563eb" };
      case "Under Review": return { background: "#fff4d6", color: "#b45309" };
      case "Shortlisted": return { background: "#dcfce7", color: "#15803d" };
      case "Accepted": return { background: "#d1fae5", color: "#047857" };
      case "Rejected": return { background: "#fee2e2", color: "#dc2626" };
      default: return { background: "#f1f5f9", color: "#475569" };
    }
  };

  const getProgress = (status) => {
    const steps = ["Applied", "Under Review", "Shortlisted", "Accepted"];
    if (status === "Rejected") return -1;
    const idx = steps.indexOf(status);
    return idx === -1? 0 : idx;
  };

  const formatDate = (d) => {
    if (!d) return "Recently";
    const date = new Date(d);
    return Number.isNaN(date.getTime())? String(d) : date.toLocaleDateString();
  };

  const recentApplications = useMemo(() =>
    [...applications].sort((a, b) => (b.applied_at? new Date(b.applied_at).getTime() : 0) - (a.applied_at? new Date(a.applied_at).getTime() : 0)).slice(0, 3),
    [applications]
  );

  const recommendedInternships = useMemo(() =>
    internships.filter((i) => i.status!== "Closed").slice(0, 3),
    [internships]
  );

  const profileFields = [profile?.phone, profile?.university, profile?.course, profile?.bio, profile?.github_url, profile?.linkedin_url];
  const completedProfileFields = profileFields.filter(Boolean).length;
  const profileProgress = profileFields.length? Math.round((completedProfileFields / profileFields.length) * 100) : 0;

  const pageStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #f4f7ff 0%, #eef2ff 45%, #faf7ff 100%)", fontFamily: "Inter, Arial, sans-serif", color: "#172033", padding: "22px" };
  const containerStyle = { maxWidth: "1320px", margin: "0 auto" };
  const cardStyle = { background: "#ffffff", border: "1px solid #e4e9f2", borderRadius: "22px", boxShadow: "0 10px 30px rgba(30, 41, 59, 0.06)" };
  const primaryButton = { border: "none", borderRadius: "11px", padding: "11px 17px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", fontWeight: "800", cursor: "pointer", fontSize: "12px" };
  const secondaryButton = { border: "1px solid #dbe3f0", borderRadius: "11px", padding: "10px 15px", background: "#ffffff", color: "#475569", fontWeight: "700", cursor: "pointer", fontSize: "12px" };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={{...cardStyle, padding: "13px 18px", marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "14px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "23px" }}>S</div>
            <div><h1 style={{ margin: 0, fontSize: "21px", fontWeight: "900" }}>SkillBridge</h1><p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "10px" }}>Student Career Platform</p></div>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {["Dashboard", "Internships", "Applications", "Certificates", "Skills"].map((item) => (
              <button key={item} onClick={() => onNavigate?.(item)} style={{ border: "none", borderRadius: "10px", padding: "9px 13px", background: item === "Dashboard"? "linear-gradient(135deg,#2563eb,#4f46e5)" : "#f8fafc", color: item === "Dashboard"? "#ffffff" : "#475569", fontWeight: "800", fontSize: "11px", cursor: "pointer" }}>{item}</button>
            ))}
            <button onClick={onLogout} style={{ border: "none", borderRadius: "10px", padding: "9px 14px", background: "#fee2e2", color: "#dc2626", fontWeight: "800", fontSize: "11px", cursor: "pointer", marginLeft: "5px" }}>Logout</button>
          </nav>
        </header>

        <section style={{ borderRadius: "26px", overflow: "hidden", minHeight: "330px", position: "relative", marginBottom: "22px", backgroundImage: "linear-gradient(90deg, rgba(20,37,90,0.96) 0%, rgba(37,64,145,0.84) 48%, rgba(79,70,229,0.28) 100%), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85')", backgroundSize: "cover", backgroundPosition: "center", boxShadow: "0 20px 45px rgba(37, 50, 120, 0.16)" }}>
          <div style={{ minHeight: "330px", padding: "38px", display: "flex", alignItems: "center" }}>
            <div style={{ maxWidth: "650px", color: "#ffffff" }}>
              <span style={{ display: "inline-block", padding: "7px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: "900", letterSpacing: "1px" }}>YOUR CAREER JOURNEY</span>
              <h2 style={{ margin: "15px 0 0", fontSize: "clamp(31px, 5vw, 48px)", lineHeight: "1.05", letterSpacing: "-1.8px", fontWeight: "900" }}>Build your skills.<br />Find your opportunity.</h2>
              <p style={{ margin: "15px 0 0", maxWidth: "580px", color: "#dbeafe", fontSize: "14px", lineHeight: "1.7" }}>Discover internships, manage your professional profile, track applications and showcase your achievements with SkillBridge.</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "22px", flexWrap: "wrap" }}>
                <button onClick={() => onNavigate?.("Internships")} style={{...primaryButton, background: "#ffffff", color: "#3730a3" }}>Explore Internships →</button>
                <button onClick={handleEditProfile} style={{...secondaryButton, background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.25)" }}>Complete Profile</button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "15px", marginBottom: "24px" }}>
          {[{ title: "APPLICATIONS", value: applications.length, text: "Applications submitted", icon: "💼", bg: "#eef5ff", color: "#2563eb" }, { title: "OPPORTUNITIES", value: internships.length, text: "Internships available", icon: "🎯", bg: "#f4efff", color: "#7c3aed" }, { title: "CERTIFICATES", value: certificates.length, text: "Learning achievements", icon: "🏆", bg: "#ecfdf5", color: "#059669" }, { title: "PROFILE", value: `${profileProgress}%`, text: "Profile completed", icon: "👤", bg: "#fff7ed", color: "#ea580c" }].map((stat) => (
            <div key={stat.title} style={{...cardStyle, padding: "19px", background: `linear-gradient(135deg,#ffffff,${stat.bg})` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: "900", color: stat.color, letterSpacing: "0.7px" }}>{stat.title}</span>
                <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: stat.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{stat.icon}</span>
              </div>
              <h3 style={{ margin: "10px 0 2px", fontSize: "29px", color: stat.color }}>{stat.value}</h3>
              <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{stat.text}</p>
            </div>
          ))}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, 0.8fr)", gap: "18px", marginBottom: "24px" }}>
          <div style={{...cardStyle, overflow: "hidden" }}>
            <div style={{ height: "105px", backgroundImage: "linear-gradient(90deg,rgba(37,99,235,0.95),rgba(124,58,237,0.65)),url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80')", backgroundSize: "cover", backgroundPosition: "center", padding: "22px", color: "#ffffff", boxSizing: "border-box" }}>
              <span style={{ fontSize: "9px", fontWeight: "900", letterSpacing: "1px" }}>PROFESSIONAL PROFILE</span>
              <h2 style={{ margin: "4px 0 0", fontSize: "23px" }}>{profile?.course || "Software Engineering Student"}</h2>
            </div>
            {!showProfileEdit? (
              <div style={{ padding: "22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "10px" }}>
                  <div style={{ padding: "13px", borderRadius: "13px", background: "#f8fafc" }}><small style={{ color: "#94a3b8", fontWeight: "900", fontSize: "9px" }}>UNIVERSITY</small><p style={{ margin: "5px 0 0", fontSize: "12px", fontWeight: "700" }}>{profile?.university || "Not added"}</p></div>
                  <div style={{ padding: "13px", borderRadius: "13px", background: "#f8fafc" }}><small style={{ color: "#94a3b8", fontWeight: "900", fontSize: "9px" }}>PHONE</small><p style={{ margin: "5px 0 0", fontSize: "12px", fontWeight: "700" }}>{profile?.phone || "Not added"}</p></div>
                  <div style={{ padding: "13px", borderRadius: "13px", background: "#f8fafc" }}><small style={{ color: "#94a3b8", fontWeight: "900", fontSize: "9px" }}>COURSE</small><p style={{ margin: "5px 0 0", fontSize: "12px", fontWeight: "700" }}>{profile?.course || "Not added"}</p></div>
                </div>
                <div style={{ marginTop: "12px", padding: "15px", borderRadius: "14px", background: "linear-gradient(135deg,#eef4ff,#f5efff)" }}><strong style={{ fontSize: "11px", color: "#4f46e5" }}>About Me</strong><p style={{ margin: "6px 0 0", color: "#475569", fontSize: "12px", lineHeight: "1.6" }}>{profile?.bio || "Add a short professional introduction."}</p></div>
                <div style={{ display: "flex", gap: "9px", marginTop: "13px", flexWrap: "wrap" }}>
                  <button onClick={handleEditProfile} style={primaryButton}>Edit Profile</button>
                  {profile?.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" style={{...secondaryButton, textDecoration: "none" }}>GitHub ↗</a>}
                  {profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{...secondaryButton, textDecoration: "none" }}>LinkedIn ↗</a>}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ padding: "22px" }}>
                {[[ "Phone", phone, setPhone], ["University", university, setUniversity], ["Course", course, setCourse], ["GitHub URL", githubUrl, setGithubUrl], ["LinkedIn URL", linkedinUrl, setLinkedinUrl]].map(([label, value, setter]) => (
                  <div key={String(label)} style={{ marginBottom: "13px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "11px", fontWeight: "800", color: "#475569" }}>{label}</label>
                    <input value={String(value)} onChange={(e) => setter(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #dbe3f0", borderRadius: "9px", fontSize: "12px" }} />
                  </div>
                ))}
                <label style={{ display: "block", marginBottom: "5px", fontSize: "11px", fontWeight: "800", color: "#475569" }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #dbe3f0", borderRadius: "9px", fontSize: "12px", resize: "vertical" }} />
                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  <button type="submit" style={primaryButton}>Save Changes</button>
                  <button type="button" onClick={() => setShowProfileEdit(false)} style={secondaryButton}>Cancel</button>
                </div>
                {profileMessage && <p style={{ color: "#2563eb", fontSize: "11px" }}>{profileMessage}</p>}
              </form>
            )}
          </div>
          <div style={{...cardStyle, padding: "22px", background: "linear-gradient(145deg,#ffffff,#f5f3ff)" }}>
            <span style={{ fontSize: "9px", fontWeight: "900", color: "#7c3aed", letterSpacing: "0.9px" }}>CAREER READINESS</span>
            <h2 style={{ margin: "5px 0 18px", fontSize: "22px" }}>Your progress</h2>
            <div style={{ width: "145px", height: "145px", margin: "0 auto 20px", borderRadius: "50%", background: `conic-gradient(#7c3aed ${profileProgress}%, #e9e5ff 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "112px", height: "112px", borderRadius: "50%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <strong style={{ fontSize: "27px", color: "#5b21b6" }}>{profileProgress}%</strong>
                <span style={{ fontSize: "9px", color: "#94a3b8" }}>Complete</span>
              </div>
            </div>
            {[["Profile information", profileProgress >= 50], ["Professional links", Boolean(profile?.github_url || profile?.linkedin_url)], ["Certificates", certificates.length > 0], ["Applications", applications.length > 0]].map(([text, completed]) => (
              <div key={String(text)} style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "11px" }}>
                <span style={{ width: "23px", height: "23px", borderRadius: "50%", background: completed? "#dcfce7" : "#f1f5f9", color: completed? "#16a34a" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "900" }}>{completed? "✓" : "•"}</span>
                <span style={{ fontSize: "11px", color: "#475569", fontWeight: "600" }}>{text}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
            <div><span style={{ fontSize: "9px", fontWeight: "900", color: "#2563eb", letterSpacing: "1px" }}>OPPORTUNITIES</span><h2 style={{ margin: "4px 0 0", fontSize: "25px" }}>Recommended Internships</h2></div>
            <button onClick={() => onNavigate?.("Internships")} style={primaryButton}>View All Internships →</button>
          </div>
          {recommendedInternships.length === 0? (
            <div style={{...cardStyle, padding: "35px", textAlign: "center" }}>No opportunities yet</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "15px" }}>
              {recommendedInternships.map((internship) => (
                <div key={internship.id} style={{...cardStyle, padding: "20px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg,#2563eb,#7c3aed)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginTop: "8px" }}>
                    <div><h3 style={{ margin: "7px 0 5px", fontSize: "16px" }}>{internship.job_title}</h3><p style={{ margin: 0, color: "#4f46e5", fontSize: "12px", fontWeight: "800" }}>{internship.company_name}</p></div>
                    <span style={{ padding: "5px 9px", borderRadius: "999px", background: internship.status === "Open"? "#dcfce7" : "#fee2e2", color: internship.status === "Open"? "#15803d" : "#dc2626", fontSize: "9px", fontWeight: "900" }}>{internship.status || "Open"}</span>
                  </div>
                  <button onClick={() => onNavigate?.("Internships")} style={{...primaryButton, width: "100%", marginTop: "17px" }}>View Opportunity</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "15px", gap: "15px", flexWrap: "wrap" }}>
            <div><span style={{ fontSize: "9px", fontWeight: "900", color: "#7c3aed", letterSpacing: "1px" }}>APPLICATION TRACKER</span><h2 style={{ margin: "4px 0 0", fontSize: "25px" }}>Recent Applications</h2></div>
            <button onClick={() => window.location.reload()} style={secondaryButton}>{isLoading? "Refreshing..." : "↻ Refresh"}</button>
          </div>
          {recentApplications.length === 0? (
            <div style={{...cardStyle, padding: "35px", textAlign: "center" }}>No applications yet</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(330px,1fr))", gap: "15px" }}>
              {recentApplications.map((application) => {
                const internship = getInternship(application);
                return (
                  <div key={application.id} style={{...cardStyle, padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <div><h3 style={{ margin: 0, fontSize: "16px" }}>{internship?.job_title || `Internship #${application.internship_id}`}</h3><p style={{ margin: "4px 0 0", color: "#4f46e5", fontWeight: "800", fontSize: "11px" }}>{internship?.company_name || "Company"}</p></div>
                      <span style={{...getStatusStyle(application.status), padding: "6px 10px", borderRadius: "999px", fontSize: "9px", fontWeight: "900" }}>{application.status}</span>
                    </div>
                    <div style={{ marginTop: "16px", paddingTop: "11px", borderTop: "1px solid #eef1f5", display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#94a3b8" }}>
                      <span>Applied {formatDate(application.applied_at)}</span><span>⏳ {internship?.duration || "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
