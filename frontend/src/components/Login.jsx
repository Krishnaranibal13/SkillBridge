import { useState } from "react";

function Login({ onLogin, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data.detail || "Invalid email or password.");
        return;
      }

      localStorage.setItem("skillbridge_token", data.access_token);
      localStorage.setItem("skillbridge_role", data.user.role);

      setMessage("Login successful!");

      onLogin(data.access_token, data.user);
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to SkillBridge server.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSuccess = message.toLowerCase().includes("successful");

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlowOne}></div>
      <div style={styles.backgroundGlowTwo}></div>

      <div style={styles.wrapper}>
        {/* LEFT SIDE */}
        <section style={styles.left}>
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85"
            alt="Students collaborating"
            style={styles.leftImage}
          />

          <div style={styles.imageOverlay}></div>

          <div style={styles.leftContent}>
            <div style={styles.trustBadge}>
              <span style={styles.trustDot}></span>
              Student Career Platform
            </div>

            <div>
              <div style={styles.leftTitle}>
                Build your skills.
                <br />
                Find your opportunity.
              </div>

              <p style={styles.leftDescription}>
                Discover internships, manage your career profile,
                track applications and showcase your achievements
                — all in one place.
              </p>

              <div style={styles.featureRow}>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>🎯</span>
                  <div>
                    <strong>Internships</strong>
                    <span>Find opportunities</span>
                  </div>
                </div>

                <div style={styles.feature}>
                  <span style={styles.featureIcon}>🏆</span>
                  <div>
                    <strong>Achievements</strong>
                    <span>Showcase your skills</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.leftFooter}>
              <span>SkillBridge</span>
              <span style={styles.footerDot}>•</span>
              <span>Connect. Grow. Succeed.</span>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section style={styles.right}>
          <div style={styles.formBox}>
            {/* BRAND */}
            <div style={styles.brand}>
              <div style={styles.logo}>
                <span>S</span>
              </div>

              <div>
                <div style={styles.brandName}>SkillBridge</div>
                <div style={styles.brandTagline}>
                  STUDENT CAREER PLATFORM
                </div>
              </div>
            </div>

            {/* HEADING */}
            <div style={styles.headingArea}>
              <h1 style={styles.heading}>Welcome back</h1>

              <p style={styles.subtitle}>
                Sign in to continue your career journey.
              </p>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={handleLogin}>
              <div style={styles.field}>
                <label style={styles.label}>Email address</label>

                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>✉️</span>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.field}>
                <div style={styles.passwordHeader}>
                  <label style={styles.label}>Password</label>
                </div>

                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔒</span>

                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      ...styles.input,
                      paddingRight: "42px",
                    }}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={styles.eyeButton}
                    aria-label={
                      showPass ? "Hide password" : "Show password"
                    }
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...styles.loginButton,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? (
                  <>
                    <span style={styles.spinner}></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span style={styles.arrow}>→</span>
                  </>
                )}
              </button>

              {message && (
                <div
                  style={
                    isSuccess
                      ? styles.successMessage
                      : styles.errorMessage
                  }
                >
                  <span>{isSuccess ? "✓" : "!"}</span>
                  {message}
                </div>
              )}
            </form>

            {/* REGISTER */}
            <div style={styles.registerCard}>
              <div>
                <div style={styles.registerTitle}>
                  New to SkillBridge?
                </div>

                <div style={styles.registerSubtitle}>
                  Create your student account and get started.
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate?.("Register")}
                style={styles.registerButton}
              >
                Create account
                <span>→</span>
              </button>
            </div>

            <div style={styles.bottomText}>
              Secure student career management
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #f6f8ff 0%, #f4f1ff 50%, #f8fafc 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif',
    position: "relative",
    overflow: "hidden",
  },

  backgroundGlowOne: {
    position: "fixed",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.08)",
    top: "-180px",
    right: "-120px",
    filter: "blur(20px)",
  },

  backgroundGlowTwo: {
    position: "fixed",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(37, 99, 235, 0.06)",
    bottom: "-170px",
    left: "-120px",
    filter: "blur(20px)",
  },

  wrapper: {
    width: "100%",
    maxWidth: "1120px",
    minHeight: "650px",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    background: "#ffffff",
    borderRadius: "30px",
    overflow: "hidden",
    boxShadow: "0 30px 90px rgba(30, 41, 59, 0.14)",
    border: "1px solid rgba(255,255,255,0.8)",
    position: "relative",
    zIndex: 1,
  },

  left: {
    position: "relative",
    minHeight: "650px",
    overflow: "hidden",
    background: "#172554",
  },

  leftImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  imageOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.25) 0%, rgba(30,41,90,0.72) 55%, rgba(49,46,129,0.94) 100%)",
  },

  leftContent: {
    position: "relative",
    zIndex: 2,
    minHeight: "650px",
    boxSizing: "border-box",
    padding: "38px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#ffffff",
  },

  trustBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    width: "fit-content",
    padding: "8px 13px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(12px)",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.2px",
  },

  trustDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 0 4px rgba(74,222,128,0.14)",
  },

  leftTitle: {
    fontSize: "clamp(32px, 4vw, 48px)",
    lineHeight: "1.08",
    fontWeight: "900",
    letterSpacing: "-1.8px",
    marginBottom: "18px",
  },

  leftDescription: {
    maxWidth: "500px",
    margin: 0,
    color: "#dbeafe",
    fontSize: "14px",
    lineHeight: "1.75",
  },

  featureRow: {
    display: "flex",
    gap: "12px",
    marginTop: "28px",
    flexWrap: "wrap",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 13px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.13)",
    backdropFilter: "blur(10px)",
  },

  featureIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "15px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 13px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.13)",
    backdropFilter: "blur(10px)",
  },

  leftFooter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
    fontSize: "10px",
    fontWeight: "600",
  },

  footerDot: {
    color: "#818cf8",
  },

  right: {
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "42px 48px",
  },

  formBox: {
    width: "100%",
    maxWidth: "390px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    marginBottom: "42px",
  },

  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "900",
    boxShadow: "0 8px 20px rgba(79,70,229,0.25)",
  },

  brandName: {
    fontSize: "17px",
    fontWeight: "900",
    color: "#172033",
    letterSpacing: "-0.3px",
  },

  brandTagline: {
    fontSize: "8px",
    color: "#94a3b8",
    fontWeight: "800",
    letterSpacing: "1.5px",
    marginTop: "2px",
  },

  headingArea: {
    marginBottom: "28px",
  },

  heading: {
    margin: 0,
    color: "#172033",
    fontSize: "32px",
    fontWeight: "900",
    letterSpacing: "-1.2px",
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "1.6",
  },

  field: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "11px",
    fontWeight: "800",
  },

  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    borderRadius: "13px",
    transition: "all 0.2s ease",
  },

  inputIcon: {
    width: "42px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#94a3b8",
    fontSize: "13px",
    flexShrink: 0,
  },

  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "13px 12px 13px 0",
    color: "#172033",
    fontSize: "13px",
  },

  eyeButton: {
    position: "absolute",
    right: "8px",
    border: "none",
    background: "transparent",
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "14px",
  },

  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "13px",
    padding: "14px 17px",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    boxShadow: "0 10px 22px rgba(79,70,229,0.22)",
    marginTop: "5px",
  },

  arrow: {
    fontSize: "17px",
    lineHeight: 1,
  },

  spinner: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#ffffff",
    display: "inline-block",
  },

  successMessage: {
    marginTop: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 13px",
    borderRadius: "11px",
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#047857",
    fontSize: "11px",
    fontWeight: "700",
  },

  errorMessage: {
    marginTop: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 13px",
    borderRadius: "11px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "11px",
    fontWeight: "700",
  },

  registerCard: {
    marginTop: "24px",
    padding: "15px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #f8fafc, #f5f3ff)",
    border: "1px solid #e9e7f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  registerTitle: {
    color: "#334155",
    fontSize: "11px",
    fontWeight: "800",
  },

  registerSubtitle: {
    color: "#94a3b8",
    fontSize: "9px",
    marginTop: "3px",
  },

  registerButton: {
    flexShrink: 0,
    border: "none",
    borderRadius: "10px",
    padding: "10px 13px",
    background: "#172033",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  bottomText: {
    textAlign: "center",
    marginTop: "20px",
    color: "#a1a1aa",
    fontSize: "9px",
  },
};

export default Login;
