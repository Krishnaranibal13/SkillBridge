import { useEffect, useState, useCallback } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Internships from "./components/Internships.jsx";
import Applications from "./components/Applications";
import Certificates from "./components/Certificates";
import Skills from "./components/Skills";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import AdminInternships from "./components/AdminInternships";
import AdminApplications from "./components/AdminApplications";
import AdminStudents from "./components/AdminStudents";

const API_URL = "/api";

function App() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("skillbridge_token")
  );
  const [userRole, setUserRole] = useState(() =>
    localStorage.getItem("skillbridge_role")
  );
  const [certificates, setCertificates] = useState([]);
  const [authPage, setAuthPage] = useState("Login");
  const [currentPage, setCurrentPage] = useState(() => {
    const role = localStorage.getItem("skillbridge_role");
    const t = localStorage.getItem("skillbridge_token");
    if (!t) return "Dashboard";
    return role === "admin" ? "AdminDashboard" : "Dashboard";
  });

  const handleLogout = useCallback(() => {
    localStorage.removeItem("skillbridge_token");
    localStorage.removeItem("skillbridge_role");
    setToken(null);
    setUserRole(null);
    setCertificates([]);
    setCurrentPage("Dashboard");
    setAuthPage("Login");
  }, []);

  const loadCertificates = useCallback(async () => {
    if (!token || userRole === "admin") return;
    try {
      const res = await fetch(`${API_URL}/certificates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      if (res.status === 404) { setCertificates([]); return; }
      const data = await res.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load certificates:", e);
    }
  }, [token, userRole, handleLogout]);

  useEffect(() => {
    if (token && userRole === "student") {
      loadCertificates();
    }
  }, [token, userRole, loadCertificates]);

  const handleLogin = (newToken, user) => {
    localStorage.setItem("skillbridge_token", newToken);
    localStorage.setItem("skillbridge_role", user.role);
    setToken(newToken);
    setUserRole(user.role);
    setCurrentPage(user.role === "admin" ? "AdminDashboard" : "Dashboard");
  };

  const handleAuthNavigate = (page) => {
    if (page === "Register") setAuthPage("Register");
    else if (page === "Login") setAuthPage("Login");
    else setAuthPage("Login");
  };

  if (!token) {
    if (authPage === "Register") {
      return <Register onNavigate={handleAuthNavigate} onRegisterSuccess={() => setAuthPage("Login")} />;
    }
    return <Login onLogin={handleLogin} onNavigate={handleAuthNavigate} />;
  }

  if (currentPage === "Dashboard") {
    return <Dashboard certificates={certificates} onLogout={handleLogout} token={token} onCertificatesChange={loadCertificates} onNavigate={setCurrentPage} />;
  }
  if (currentPage === "Internships") {
    return <Internships token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }
  if (currentPage === "Applications") {
    return <Applications token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }
  if (currentPage === "Certificates") {
    return <Certificates token={token} onNavigate={setCurrentPage} onLogout={handleLogout} onCertificatesChange={loadCertificates} />;
  }
  if (currentPage === "Skills") {
    return <Skills token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }
  if (currentPage === "Profile") {
    return <Profile token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }

  if (currentPage === "AdminDashboard") {
    return <AdminDashboard token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }
  if (currentPage === "AdminInternships") {
    return <AdminInternships token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }
  if (currentPage === "AdminApplications") {
    return <AdminApplications token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }
  if (currentPage === "AdminStudents") {
    return <AdminStudents token={token} onNavigate={setCurrentPage} onLogout={handleLogout} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f4f7ff 0%, #eef2ff 45%, #faf7ff 100%)", padding: "22px", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", background: "#fff", borderRadius: "22px", padding: "40px", textAlign: "center", boxShadow: "0 15px 40px rgba(30,41,59,0.08)" }}>
        <h1 style={{ margin: "0 0 8px" }}>{currentPage}</h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "25px" }}>This page will be built next.</p>
        <button onClick={() => setCurrentPage(userRole === "admin" ? "AdminDashboard" : "Dashboard")} style={{ border: "none", borderRadius: "11px", padding: "12px 20px", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", fontWeight: "800", cursor: "pointer" }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default App;