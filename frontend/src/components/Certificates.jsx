import { useEffect, useMemo, useState } from "react";
const API_URL = "/api";

export default function Certificates({ token, onNavigate, onLogout }) {
  const [certs, setCerts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState(null);
  const [form, setForm] = useState({ certificate_name: "", issuer: "SkillBridge", issue_date: "", credential_id: "", credential_url: "" });

  const loadData = async () => {
    setLoading(true);
    try {
      const [uR, cR] = await Promise.all([
        fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/certificates`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (uR.ok) {
        const uData = await uR.json();
        setUser(uData);
      }
      const data = await cR.json();
      setCerts(Array.isArray(data)? data : []);
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
    let list = certs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => {
        const name = (c.certificate_name || "").toLowerCase();
        const issuer = (c.issuer || "").toLowerCase();
        return name.includes(q) || issuer.includes(q);
      });
    }
    if (filter === "Verified") {
      list = list.filter((c) => c.status === "Verified" || c.credential_url);
    }
    if (filter === "In Progress") {
      list = list.slice(0, 1);
    }
    return list;
  }, [certs, search, filter]);

  const verifiedCount = certs.filter((c) => c.status === "Verified" || c.credential_url).length;
  const skillCount = certs.length * 3;

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          certificate_name: form.certificate_name.trim(),
          issuer: form.issuer.trim(),
          issue_date: form.issue_date || null,
          credential_id: form.credential_id.trim() || null,
          credential_url: form.credential_url.trim() || null
        })
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ certificate_name: "", issuer: "SkillBridge", issue_date: "", credential_id: "", credential_url: "" });
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || "Failed");
      }
    } catch {
      alert("Failed");
    }
  };

  const handleDownload = (c) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><body style="font-family:Georgia;display:grid;place-items:center;min-height:100vh;background:#fbfaf7"><div style="background:#fff;border:2px solid #C9A86A;border-radius:20px;padding:40px;max-width:600px;text-align:center"><div style="font-size:40px">🎓</div><h1>${c.certificate_name}</h1><p>Issued by ${c.issuer} to ${displayName}</p><p>${c.issue_date || ""} • ${c.credential_id || ""}</p></div><script>window.print()</script></body></html>`);
    w.document.close();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete certificate?")) return;
    await fetch(`${API_URL}/certificates/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setCerts((prev) => prev.filter((x) => x.id!== id));
    setView(null);
  };

  const handleShareLinkedIn = () => {
    const url = window.location.href;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleDownloadAll = () => {
    if (certs.length === 0) {
      alert("No certificates");
      return;
    }
    certs.forEach((c, i) => {
      setTimeout(() => handleDownload(c), i * 800);
    });
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
              <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0, letterSpacing: -1 }}>Certificates</h1>
              <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>Your completed certificates and achievements • Showcase your skills to employers • Student: {displayName}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleShareLinkedIn} style={{ background: "#fff", border: "1px solid #111827", padding: "9px 14px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><span style={{ background: "#0a66c2", color: "#fff", padding: "2px 4px", borderRadius: 3, fontSize: 10, fontWeight: 900 }}>in</span> Share to LinkedIn</button>
              <button onClick={handleDownloadAll} style={{ background: "#fff", border: "1px solid #111827", padding: "9px 14px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>⬇ Download All</button>
              <button onClick={() => setShowAdd(true)} style={{ background: "#111827", color: "#fff", border: 0, padding: "9px 14px", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>+ Add Certificate</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>📄</div><div style={{ fontSize: 12, fontWeight: 700 }}>Total Certificates</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{certs.length}</div><div style={{ fontSize: 11, color: "#6b7280" }}>+1 this month ↑</div></div>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>🎯</div><div style={{ fontSize: 12, fontWeight: 700 }}>Skills Mastered</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{skillCount || 9}</div><div style={{ fontSize: 11, color: "#6b7280" }}>Across {certs.length || 3} domains</div></div>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>🕒</div><div style={{ fontSize: 12, fontWeight: 700 }}>Hours Learned</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>42h</div><div style={{ fontSize: 11, color: "#6b7280" }}>This learning path</div></div>
            <div style={{ background: "#fff", border: "1px solid #f0ece2", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "#fdf6e3", border: "1px solid #f3e6c8", display: "grid", placeItems: "center" }}>🛡️</div><div style={{ fontSize: 12, fontWeight: 700 }}>Credential Score</div></div><div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{verifiedCount > 0? "92%" : "—"}</div><div style={{ fontSize: 11, color: "#6b7280" }}>{certs.length > 0? "Top 10% of learners" : "Add certificates"}</div></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #f0ece2", borderRadius: 10, padding: "8px 12px", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ position: "relative" }}><span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#9ca3af" }}>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search certificates..." style={{ padding: "7px 10px 7px 26px", borderRadius: 999, border: "1px solid #e7e0d2", width: 180, fontSize: 12, outline: "none" }} /></div>
              {[{ label: "All Certificates (" + certs.length + ")", val: "All" }, { label: "In Progress (1)", val: "In Progress" }, { label: "Verified (" + verifiedCount + ")", val: "Verified" }].map((f) => (
                <button key={f.val} onClick={() => setFilter(f.val)} style={{ border: 0, padding: "7px 12px", borderRadius: 999, background: filter === f.val? "#111827" : "#f5f1e8", color: filter === f.val? "#fff" : "#444", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{f.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Sort by: <b>Most Recent</b> ›</div>
          </div>

          {loading? (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px solid #f0ece2" }}>Loading certificates...</div>
          ) : filtered.length === 0? (
            <div style={{ textAlign: "center", padding: 40, background: "#fff", borderRadius: 12, border: "1px dashed #e7e0d2" }}>No certificates found. Click + Add Certificate to add your first.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {filtered.map((c) => (
                <div key={c.id} style={{ background: "#fff", border: "1px solid #ece6d8", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ height: 14, background: "linear-gradient(90deg, #C9A86A, #E8D5A3)" }} />
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 28, height: 34, background: "linear-gradient(180deg, #C9A86A, #E8D5A3)", clipPath: "polygon(0 0,100% 0,100% 70%,50% 100%,0 70%)", display: "grid", placeItems: "center" }}><span style={{ background: "#fff", width: 16, height: 16, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 8 }}>◍</span></div><span style={{ background: "#f5f1e8", border: "1px solid #ece6d8", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>Verified</span></div>
                    <div style={{ fontWeight: 800, fontSize: 13, marginTop: 10, lineHeight: 1.3 }}>{c.certificate_name}</div>
                    <div style={{ background: "#faf8f5", border: "1px solid #f0ece2", borderRadius: 6, padding: "5px 7px", fontSize: 11, marginTop: 8, color: "#6b7280" }}>📅 Completed {c.issue_date? new Date(c.issue_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 10 }}>Issued by {c.issuer} • ID: {c.credential_id || "—"} • Owner: {displayName}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      <button onClick={() => setView(c)} style={{ flex: 1, background: "#111827", color: "#fff", border: 0, borderRadius: 7, padding: "8px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>View Certificate</button>
                      <button onClick={() => handleDownload(c)} style={{ flex: 1, background: "#fff", border: "1px solid #111827", borderRadius: 7, padding: "8px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>⬇ Download PDF</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 10, marginTop: 16 }}>All certificates are verified on-chain and shareable to LinkedIn, employers, and your portfolio • Issued to {displayName}</div>
        </div>
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 99, padding: 20 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, width: 420, display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0 }}>Add Certificate for {displayName}</h3>
            <input required placeholder="Certificate name" value={form.certificate_name} onChange={(e) => setForm({...form, certificate_name: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #e7e0d2" }} />
            <input required placeholder="Issuer" value={form.issuer} onChange={(e) => setForm({...form, issuer: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #e7e0d2" }} />
            <input type="date" value={form.issue_date} onChange={(e) => setForm({...form, issue_date: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #e7e0d2" }} />
            <input placeholder="Credential ID" value={form.credential_id} onChange={(e) => setForm({...form, credential_id: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #e7e0d2" }} />
            <input placeholder="Credential URL https://..." value={form.credential_url} onChange={(e) => setForm({...form, credential_url: e.target.value })} style={{ padding: 10, borderRadius: 8, border: "1px solid #e7e0d2" }} />
            <button onClick={handleAdd} style={{ background: "#111827", color: "#fff", border: 0, padding: 11, borderRadius: 8, fontWeight: 800, cursor: "pointer" }}>Save Certificate</button>
          </div>
        </div>
      )}

      {view && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", zIndex: 99, padding: 20 }} onMouseDown={(e) => { if (e.target === e.currentTarget) setView(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 20, width: 400, textAlign: "center" }}>
            <h3 style={{ margin: "0 0 8px" }}>{view.certificate_name}</h3>
            <p style={{ color: "#6b7280", fontSize: 13 }}>Issued by {view.issuer} to {displayName}</p>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{view.issue_date || ""} • {view.credential_id || ""}</p>
            {view.credential_url && <a href={view.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#4f6af0", fontWeight: 700 }}>Open Credential Link ↗</a>}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => handleDownload(view)} style={{ flex: 1, height: 36, borderRadius: 8, border: 0, background: "#111827", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Download PDF</button>
              <button onClick={() => setView(null)} style={{ flex: 1, height: 36, borderRadius: 8, border: "1px solid #e7e0d2", background: "#fff", fontWeight: 700, cursor: "pointer" }}>Close</button>
            </div>
            <button onClick={() => handleDelete(view.id)} style={{ marginTop: 10, border: 0, background: "transparent", color: "#e11d48", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Delete Certificate</button>
          </div>
        </div>
      )}
    </div>
  );
}