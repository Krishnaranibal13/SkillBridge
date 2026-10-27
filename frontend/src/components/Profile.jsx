import { useEffect, useState } from "react";
const API_URL = "/api";

export default function Profile({ token, onNavigate, onLogout }) {
  const [user, setUser] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", university: "", bio: "" });

  const roleFromStorage = localStorage.getItem("skillbridge_role");

  useEffect(() => {
    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
     .then((r) => r.json())
     .then((d) => {
        setUser(d);
        setForm({
          name: d.name || d.full_name || "",
          university: d.university || "",
          bio: d.bio || "",
        });
      })
     .catch(() => {
        // fallback from storage if API fails
        setUser({ role: roleFromStorage, email: "admin@skillbridge.com" });
      });
  }, [token, roleFromStorage]);

  const isAdmin = user?.role === "admin" || roleFromStorage === "admin" || user?.email?.includes("admin");
  const displayName = user?.name || user?.full_name || form.name || user?.email?.split("@")[0] || "Y";
  const initials = displayName[0]?.toUpperCase() || "A";

  const save = async () => {
    await fetch(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setUser({...user,...form });
    setEdit(false);
  };

  if (!user) return <div style={{ padding: 40 }}>Loading profile...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f3ef", fontFamily: "Inter,sans-serif", display: "flex" }}>
      {/* SIDEBAR */}
      <div style={{ width: 260, background: "#111827", color: "#cbd5e1", padding: 20 }}>
        {(isAdmin
         ? ["AdminDashboard", "AdminInternships", "AdminApplications", "AdminStudents", "Profile"]
          : ["Dashboard", "Internships", "Applications", "Certificates", "Skills", "Profile"]
        ).map((it) => (
          <div
            key={it}
            onClick={() => onNavigate?.(it)}
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              marginBottom: 6,
              background: it === "Profile"? "#fff" : "transparent",
              color: it === "Profile"? "#111827" : "#94a3b8",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {it.replace("Admin", "Admin ")}
          </div>
        ))}
        <button onClick={onLogout} style={{ marginTop: 20, width:"100%", background:"#1f2937", color:"#fff", border:"none", padding:"10px", borderRadius:10 }}>Logout</button>
      </div>

      <div style={{ flex: 1, padding: 24 }}>
        {/* HEADER */}
        <div
          style={{
            background: isAdmin? "linear-gradient(135deg,#111827,#334155)" : "linear-gradient(135deg,#d8c4a1,#e8d5a3)",
            borderRadius: 16,
            padding: 22,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: isAdmin? "#C9A86A" : "#111827", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900 }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: isAdmin? "#fff" : "#111827" }}>
              {isAdmin? "Admin Profile 🛡️" : "Your Profile"}
            </h1>
            <div style={{ fontWeight: 700, color: isAdmin? "#E8D5A3" : "#57534e", marginTop: 4 }}>
              {isAdmin? "Platform Administrator • SkillBridge" : "Product Manager • Student"}
            </div>
            <div style={{ fontSize: 12, color: isAdmin? "#9ca3af" : "#78716c", marginTop: 4 }}>
              {isAdmin? `${user?.email || "admin@skillbridge.com"} • Full Access • Internships & Users Management` : `${user?.university || "University not added"} • Logged as ${user?.email}`}
            </div>
          </div>
        </div>

        {/* BODY */}
        {isAdmin? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #e7e0d2", borderRadius: 14, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Admin Info</h3>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Email: {user?.email}</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Role: {user?.role || roleFromStorage}</p>
              <div style={{ marginTop: 14, background: "#f8fafc", border: "1px solid #e2e8f0", padding: 12, borderRadius: 10, fontSize: 12, lineHeight: 1.6 }}>
                🛡️ As admin, you can: <br />• Post & Delete Internships<br />• Approve / Reject Applications<br />• Manage Students<br />• You DON'T apply for internships
              </div>
              {!edit? (
                <button onClick={() => setEdit(true)} style={{ marginTop: 12, background: "#111827", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  Edit Admin Name
                </button>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value })} placeholder="Admin Name" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e7e0d2", marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={save} style={{ flex: 1, background: "#111827", color: "#fff", padding: 10, borderRadius: 8, border: "none", fontWeight: 800 }}>Save</button>
                    <button onClick={() => setEdit(false)} style={{ flex: 1, background: "#fff", border: "1px solid #e7e0d2", padding: 10, borderRadius: 8 }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: "#fff", border: "1px solid #e7e0d2", borderRadius: 14, padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Admin Actions</h3>
              <button onClick={() => onNavigate?.("AdminInternships")} style={{ width: "100%", background: "linear-gradient(90deg,#C9A86A,#E8D5A3)", border: "none", padding: 12, borderRadius: 10, fontWeight: 800, marginBottom: 8, cursor: "pointer" }}>+ Manage Internships</button>
              <button onClick={() => onNavigate?.("AdminApplications")} style={{ width: "100%", background: "#111827", color: "#fff", border: "none", padding: 12, borderRadius: 10, fontWeight: 800, marginBottom: 8, cursor: "pointer" }}>View All Applications</button>
              <button onClick={() => onNavigate?.("AdminStudents")} style={{ width: "100%", background: "#fff", border: "1px solid #e7e0d2", padding: 12, borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>Manage Students</button>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #e7e0d2", marginTop: 20 }}>
            <h3 style={{ marginTop: 0 }}>About me</h3>
            <p style={{ fontSize: 13, color: "#6b7280" }}>Aspiring IT Student currently pursuing at {form.university || "University"}. Passionate about building user-centric products.</p>
            <h3>Experience</h3>
            <p style={{ fontSize: 13 }}><b>• Product Manager Intern</b><br /><span style={{ fontSize: 12, color: "#6b7280" }}>TechFlow - Jan 2024 — Present</span></p>
            <h3>Education</h3>
            <p style={{ fontSize: 13 }}><b>HNDIT</b><br /><span style={{ fontSize: 12, color: "#6b7280" }}>SLIATE • 2024</span></p>
          </div>
        )}
      </div>
    </div>
  );
}