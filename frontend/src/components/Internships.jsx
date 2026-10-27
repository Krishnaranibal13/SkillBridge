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
        const text = await response.text();
        throw new Error(text || "Failed to load internships");
      }
      const data = await response.json();
      console.log("Internships data:", data);
      const list = Array.isArray(data) ? data : data.internships || data.data || [];
      setInternships(list);
    } catch (error) {
      console.error("Internship loading error:", error);
      setLoadError(error.message || "Could not load internships. Please make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (token) loadInternships(); }, [token]);

  const formattedInternships = useMemo(() => {
    return internships.map((internship) => {
      const skills = internship.requirements ? internship.requirements.split(",").map((s) => s.trim()).filter(Boolean) : [];
      return {
        ...internship,
        title: internship.job_title || "Internship Opportunity",
        company: internship.company_name || "Company",
        location: internship.location || "Not specified",
        type: internship.work_type || "Not specified",
        duration: internship.duration || "Not specified",
        status: internship.status || "Open",
        skills,
        description: internship.description || "This internship allows students to gain practical experience.",
        deadline: internship.application_deadline || null,
        posted: internship.created_at ? new Date(internship.created_at).toLocaleDateString() : "Recently",
      };
    });
  }, [internships]);

  const filteredInternships = useMemo(() => {
    return formattedInternships.filter((job) => {
      const searchText = search.toLowerCase().trim();
      const matchesSearch = !searchText || job.title.toLowerCase().includes(searchText) || job.company.toLowerCase().includes(searchText) || job.location.toLowerCase().includes(searchText) || job.skills.some((s) => s.toLowerCase().includes(searchText));
      const matchesLocation = location === "All" || job.location === location;
      const matchesType = type === "All" || job.type === type;
      const matchesDuration = duration === "All" || job.duration.toLowerCase().includes(duration.toLowerCase());
      const matchesStatus = status === "All" || job.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesLocation && matchesType && matchesDuration && matchesStatus;
    });
  }, [formattedInternships, search, location, type, duration, status]);

  const locations = useMemo(() => ["All", ...new Set(formattedInternships.map((j) => j.location).filter(Boolean))], [formattedInternships]);
  const types = useMemo(() => ["All", ...new Set(formattedInternships.map((j) => j.type).filter(Boolean))], [formattedInternships]);
  const durations = useMemo(() => ["All", ...new Set(formattedInternships.map((j) => j.duration).filter(Boolean))], [formattedInternships]);

  const toggleSave = (id) => setSavedJobs((current) => current.includes(id) ? current.filter((jobId) => jobId !== id) : [...current, id]);
  const clearFilters = () => { setSearch(""); setLocation("All"); setType("All"); setDuration("All"); setStatus("Open"); };
  const hasActiveFilters = search.trim() !== "" || location !== "All" || type !== "All" || duration !== "All" || status !== "Open";

  const handleApply = async () => {
    if (!selectedInternship || !token) { setApplicationMessage("Please log in to apply."); return; }
    setIsApplying(true); setApplicationMessage("");
    try {
      const response = await fetch(`${API_URL}/applications`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ internship_id: selectedInternship.id }) });
      const data = await response.json();
      if (!response.ok) { setApplicationMessage(data.detail || "Could not submit application."); return; }
      setApplicationMessage("Application submitted successfully! ✓");
      setTimeout(() => { setSelectedInternship(null); setApplicationMessage(""); }, 1200);
    } catch (error) { setApplicationMessage("Could not connect to the backend."); } finally { setIsApplying(false); }
  };

  const formatDeadline = (date) => { if (!date) return "Not specified"; const parsed = new Date(date); if (Number.isNaN(parsed.getTime())) return date; return parsed.toLocaleDateString("en-GB"); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f4f7ff 0%, #eef2ff 45%, #faf7ff 100%)", fontFamily: "Inter, Arial, sans-serif", color: "#172033", padding: "22px" }}>
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        {/* header same as yours */}
        <header style={{ background: "#fff", border: "1px solid #e4e9f2", borderRadius: "22px", padding: "13px 18px", marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}><div style={{ width: "45px", height: "45px", borderRadius: "14px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "23px" }}>S</div><div><h1 style={{ margin: 0, fontSize: "21px", fontWeight: "900" }}>SkillBridge</h1><p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "10px" }}>Student Career Platform</p></div></div>
          <nav style={{ display: "flex", gap: "6px" }}>{["Dashboard", "Internships", "Applications", "Certificates", "Skills"].map((item) => (<button key={item} onClick={() => onNavigate?.(item)} style={{ border: "none", borderRadius: "10px", padding: "9px 13px", background: item === "Internships" ? "linear-gradient(135deg,#2563eb,#4f46e5)" : "#f8fafc", color: item === "Internships" ? "#fff" : "#475569", fontWeight: "800", fontSize: "11px", cursor: "pointer" }}>{item}</button>))}<button onClick={onLogout} style={{ border: "none", borderRadius: "10px", padding: "9px 14px", background: "#fee2e2", color: "#dc2626", fontWeight: "800", fontSize: "11px", cursor: "pointer", marginLeft: "5px" }}>Logout</button></nav>
        </header>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", flexWrap: "wrap", marginBottom: "22px" }}>
          <div><p style={{ margin: "0 0 6px", color: "#2563eb", fontSize: "12px", fontWeight: "800", letterSpacing: "0.8px", textTransform: "uppercase" }}>Discover opportunities</p><h2 style={{ margin: 0, fontSize: "27px" }}>Find Your Internship</h2><p style={{ margin: "7px 0 0", color: "#718096", fontSize: "14px" }}>Discover internships that match your skills and career goals.</p></div>
          <div style={{ padding: "9px 14px", borderRadius: "999px", backgroundColor: "#eff6ff", color: "#2563eb", fontSize: "12px", fontWeight: "700" }}>{filteredInternships.length} opportunities</div>
        </div>

        {/* filters same */}
        <div style={{ background: "#fff", border: "1px solid #e3e8f0", borderRadius: "18px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 1.7fr) repeat(4, minmax(130px, 1fr)) auto", gap: "10px" }}>
            <div style={{ position: "relative" }}><span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}>🔎</span><input type="text" placeholder="Search jobs, companies or skills..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 40px", border: "1px solid #dfe5ee", borderRadius: "11px", backgroundColor: "#f8fafc" }} /></div>
            <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: "12px", border: "1px solid #dfe5ee", borderRadius: "11px", backgroundColor: "#f8fafc" }}>{locations.map((item) => <option key={item} value={item}>{item === "All" ? "📍 All Locations" : item}</option>)}</select>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "12px", border: "1px solid #dfe5ee", borderRadius: "11px", backgroundColor: "#f8fafc" }}>{types.map((item) => <option key={item} value={item}>{item === "All" ? "💼 All Types" : item}</option>)}</select>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ padding: "12px", border: "1px solid #dfe5ee", borderRadius: "11px", backgroundColor: "#f8fafc" }}>{durations.map((item) => <option key={item} value={item}>{item === "All" ? "⏱️ All Durations" : item}</option>)}</select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "12px", border: "1px solid #dfe5ee", borderRadius: "11px", backgroundColor: "#f8fafc" }}><option value="Open">🟢 Open Only</option><option value="All">📋 All Statuses</option></select>
            <button onClick={clearFilters} disabled={!hasActiveFilters} style={{ border: "none", borderRadius: "11px", padding: "12px 13px", background: hasActiveFilters ? "#eef2ff" : "#f1f5f9", color: hasActiveFilters ? "#4f46e5" : "#94a3b8", fontWeight: "800", cursor: hasActiveFilters ? "pointer" : "not-allowed" }}>Clear</button>
          </div>
        </div>

        {isLoading && <div style={{ textAlign: "center", padding: "55px 20px", background: "#fff", border: "1px solid #e5eaf1", borderRadius: "20px" }}><div style={{ fontSize: "30px", marginBottom: "12px" }}>⏳</div><h3>Loading internships...</h3></div>}
        {!isLoading && loadError && <div style={{ textAlign: "center", padding: "45px 20px", background: "#fff", border: "1px solid #fecaca", borderRadius: "20px" }}><div style={{ fontSize: "32px" }}>⚠️</div><h3>Could not load internships</h3><p style={{ color: "#718096", fontSize: "13px", margin: "0 0 18px" }}>{loadError}</p><button onClick={loadInternships} style={{ border: "none", borderRadius: "10px", padding: "10px 17px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: "700" }}>Try Again</button></div>}
        {!isLoading && !loadError && filteredInternships.length === 0 && <div style={{ textAlign: "center", padding: "50px 20px", background: "#fff", border: "1px solid #e5eaf1", borderRadius: "20px" }}><div style={{ fontSize: "35px" }}>🔍</div><h3>No internships found</h3><p style={{ color: "#718096", fontSize: "13px" }}>No data in database. Please ask admin to add internships.</p><button onClick={clearFilters} style={{ border: "none", borderRadius: "10px", padding: "10px 17px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: "700" }}>Clear Filters</button></div>}

        {!isLoading && !loadError && filteredInternships.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {filteredInternships.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              const isOpen = job.status.toLowerCase() === "open";
              return (
                <div key={job.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "21px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ display: "flex", gap: "12px" }}><div style={{ width: "46px", height: "46px", borderRadius: "13px", background: "linear-gradient(135deg,#dbeafe,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#4f46e5" }}>{job.company.charAt(0).toUpperCase()}</div><div><h3 style={{ margin: 0, fontSize: "16px" }}>{job.title}</h3><p style={{ margin: "5px 0 0", color: "#4f46e5", fontSize: "13px", fontWeight: "700" }}>{job.company}</p></div></div><button onClick={() => toggleSave(job.id)} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "19px" }}>{isSaved ? "★" : "☆"}</button></div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "18px" }}><span style={{ padding: "6px 9px", borderRadius: "8px", background: "#f1f5f9", fontSize: "11px", fontWeight: "700" }}>📍 {job.location}</span><span style={{ padding: "6px 9px", borderRadius: "8px", background: "#ecfdf5", fontSize: "11px", fontWeight: "700" }}>⏱️ {job.duration}</span><span style={{ padding: "6px 9px", borderRadius: "8px", background: "#eff6ff", fontSize: "11px", fontWeight: "700" }}>💼 {job.type}</span><span style={{ padding: "6px 9px", borderRadius: "8px", background: isOpen ? "#ecfdf5" : "#fef2f2", fontSize: "11px", fontWeight: "700" }}>{isOpen ? "🟢 Open" : "🔴 Closed"}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "19px", paddingTop: "15px", borderTop: "1px solid #eef1f5" }}><span style={{ color: "#94a3b8", fontSize: "11px" }}>{job.deadline ? `Deadline: ${formatDeadline(job.deadline)}` : "Recently added"}</span><button onClick={() => { setSelectedInternship(job); setApplicationMessage(""); }} style={{ border: "none", borderRadius: "9px", padding: "9px 14px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>View & Apply →</button></div>
                </div>
              );
            })}
          </div>
        )}

        {selectedInternship && (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 9999 }} onClick={() => setSelectedInternship(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "650px", maxHeight: "90vh", overflowY: "auto", background: "#fff", borderRadius: "24px", padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ display: "flex", gap: "14px" }}><div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg,#dbeafe,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" }}>{selectedInternship.company.charAt(0).toUpperCase()}</div><div><h2 style={{ margin: 0 }}>{selectedInternship.title}</h2><p style={{ margin: "5px 0 0", color: "#4f46e5", fontWeight: "700" }}>{selectedInternship.company}</p></div></div><button onClick={() => setSelectedInternship(null)} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", cursor: "pointer" }}>×</button></div>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "20px" }}>{selectedInternship.description}</p>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "10px" }}><b>Requirements:</b> {selectedInternship.requirements || "None"}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "28px" }}><button onClick={handleApply} disabled={isApplying || selectedInternship.status.toLowerCase() !== "open"} style={{ flex: 1, border: "none", borderRadius: "11px", padding: "13px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", fontWeight: "700", opacity: isApplying ? 0.6 : 1 }}>{isApplying ? "Applying..." : selectedInternship.status.toLowerCase() !== "open" ? "Closed" : "Apply Now →"}</button><button onClick={() => setSelectedInternship(null)} style={{ padding: "13px 18px", border: "1px solid #dbe3f0", borderRadius: "11px", background: "#fff" }}>Close</button></div>
              {applicationMessage && <p style={{ textAlign: "center", marginTop: "12px", color: applicationMessage.includes("successfully") ? "#047857" : "#dc2626", fontWeight: "700", fontSize: "13px" }}>{applicationMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Internships;