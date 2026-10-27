import { useEffect, useMemo, useState } from "react";
const API_URL = "/api";

export default function Skills({ token, onNavigate, onLogout }) {
  const [skills, setSkills] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState(null);
  const [form, setForm] = useState({ skill_name: "", skill_level: "Intermediate" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [uR, sR] = await Promise.all([
        fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/skills`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (uR.ok) {
        const uData = await uR.json();
        setUser(uData);
      }
      const data = await sR.json();
      setSkills(Array.isArray(data)? data : []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const displayName = user? (user.name || user.full_name || user.email) : "Student";
  const initials = displayName.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const filtered = useMemo(() => {
    let list = skills;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.skill_name.toLowerCase().includes(q));
    }
    if (filter!== "All") {
      list = list.filter((s) => s.skill_level === filter);
    }
    return list;
  }, [skills, search, filter]);

  const getProgress = (level) => {
    if (level === "Expert") return 92;
    if (level === "Advanced") return 78;
    if (level === "Intermediate") return 62;
    return 38;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ skill_name: form.skill_name.trim(), skill_level: form.skill_level })
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ skill_name: "", skill_level: "Intermediate" });
        loadData();
      } else {
        alert("Failed");
      }
    } catch {
      alert("Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete skill?")) return;
    await fetch(`${API_URL}/skills/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setSkills((prev) => prev.filter((x) => x.id!== id));
    setView(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fbfaf7", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => onNavigate("Dashboard")} style={{ background: "#fff", border: "1px solid #e7e0d2", padding: "8px 14px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>← Back to Dashboard</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "#fff", border: "1px solid #e7e0d2", padding: "6px 12px 6px 6px", borderRadius: 999, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #C9A86A, #E8D5A3)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 11 }}>{initials}</div>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{displayName}</span>
          </div>
          <button onClick={onLogout} style={{ background: "#111827", color: "#fff", border: 0, padding: "8px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "6px 20px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #f0ece2", boxShadow: "0 8px 32px rgba(0,0,0,0.06)", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Skills</h1>
              <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>Your professional skills and expertise • Showcase your strengths • Student: {displayName}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAdd(true)} style={{ background: "#111827", color: "#fff", border: 0, padding: "9px 14px", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>+ Add Skill</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>📚</div><div style={{ fontSize: 12, fontWeight: 700 }}>Total Skills</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{skills.length}</div><div style={{ fontSize: 11, color: "#6b7280" }}>Skills in portfolio</div></div>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>🏆</div><div style={{ fontSize: 12, fontWeight: 700 }}>Expert Level</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{skills.filter((s) => s.skill_level === "Expert").length}</div><div style={{ fontSize: 11, color: "#6b7280" }}>Certified experts</div></div>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>🎯</div><div style={{ fontSize: 12, fontWeight: 700 }}>In Progress</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{skills.filter((s) => s.skill_level!== "Expert").length}</div><div style={{ fontSize: 11, color: "#6b7280" }}>Active learning</div></div>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>✨</div><div style={{ fontSize: 12, fontWeight: 700 }}>Skill Score</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>88%</div><div style={{ fontSize: 11, color: "#16a34a" }}>+5% vs last month</div></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #f0ece2", borderRadius: 10, padding: "8px 12px", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills..." style={{ padding: "7px 10px 7px 26px", borderRadius: 999, border: "1px solid #e7e0d2", width: 160, fontSize: 12, outline: "none" }} /></div>
              {["All", "Expert", "Advanced", "Intermediate", "Beginner"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} style={{ border: 0, padding: "7px 12px", borderRadius: 999, background: filter === f? "#111827" : "#f5f1e8", color: filter === f? "#fff" : "#444", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{f}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Sort by: <b>Most Proficient</b> ›</div>
          </div>

          {loading? <div style={{ textAlign: "center", padding: 40 }}>Loading...</div> : filtered.length === 0? <div style={{ textAlign: "center", padding: 40, border: "1px dashed #e7e0d2", borderRadius: 12, background: "#fff" }}>No skills found. Add your first skill.</div> : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {filtered.map((s) => (
                <div key={s.id} style={{ background: "#fff", border: "1px solid #ece6d8", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ height: 14, background: "linear-gradient(90deg, #C9A86A, #E8D5A3)" }} />
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center", fontWeight: 800, color: "#92400e" }}>{s.skill_name.charAt(0).toUpperCase()}</div>
                      <span style={{ background: s.skill_level === "Expert"? "#dcfce7" : s.skill_level === "Advanced"? "#fef3c7" : "#f5f1e8", color: s.skill_level === "Expert"? "#15803d" : "#92400e", padding: "4px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800 }}>{s.skill_level}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 13, marginTop: 10 }}>{s.skill_name}</div>
                    <div style={{ background: "#faf8f5", border: "1px solid #f0ece2", borderRadius: 6, padding: "5px 7px", fontSize: 11, marginTop: 8, color: "#6b7280" }}>🎯 Professional • {displayName}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginTop: 10, marginBottom: 6 }}><span>Proficiency</span><b style={{ color: "#111" }}>{getProgress(s.skill_level)}%</b></div>
                    <div style={{ height: 5, background: "#f5f1e8", borderRadius: 999, overflow: "hidden" }}><div style={{ height: "100%", width: getProgress(s.skill_level) + "%", background: "linear-gradient(90deg, #C9A86A, #E8D5A3)", borderRadius: 999 }} /></div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <button onClick={() => setView(s)} style={{ flex: 1, background: "#111827", color: "#fff", border: 0, borderRadius: 7, padding: "8px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>View Details</button>
                      <button onClick={() => setView(s)} style={{ flex: 1, background: "#fff", border: "1px solid #111827", borderRadius: 7, padding: "8px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Practice ↗</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 99, padding: 20 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, width: 380, display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Add Skill for {displayName}</h3>
            <input required value={form.skill_name} onChange={(e) => setForm({...form, skill_name: e.target.value })} placeholder="e.g. React, Python" style={{ padding: 10, borderRadius: 8, border: "1px solid #e7e0d2" }} />
            <select value={form.skill_level} onChange={(e) => setForm({...form, skill_level: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #e7e0d2" }}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select>
            <button onClick={handleAdd} style={{ background: "#111827", color: "#fff", border: 0, padding: 11, borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Add Skill</button>
          </div>
        </div>
      )}

      {view && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 99, padding: 20 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setView(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, width: 360, textAlign: "center" }}>
            <h3 style={{ margin: "0 0 8px" }}>{view.skill_name}</h3>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Level: {view.skill_level} • Owner: {displayName}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => handleDelete(view.id)} style={{ flex: 1, height: 36, borderRadius: 8, border: "1px solid #fecdd3", background: "#fff1f2", color: "#e11d48", fontWeight: 700, cursor: "pointer" }}>Delete</button>
              <button onClick={() => setView(null)} style={{ flex: 1, height: 36, borderRadius: 8, border: 0, background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}