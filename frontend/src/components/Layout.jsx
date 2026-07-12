import { Bell, CheckCircle2, LogOut } from "lucide-react";

const roleTabs = [
  { id: "teacher", label: "Teacher" },
  { id: "student", label: "Student" },
  { id: "admin", label: "Admin" },
];

export function AppLayout({ role, setRole, nav, active, setActive, logout, user, token, authView, setAuthView, toast, clearToast, children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">QC</div>
          <div>
            <strong>Quran Connect</strong>
            <span>Learning Portal</span>
          </div>
        </div>
        <div className="role-tabs" aria-label="Select role">
          {roleTabs.map((item) => (
            <button key={item.id} className={role === item.id ? "active" : ""} onClick={() => setRole(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <nav>
          {nav.map(([id, Icon, label]) => (
            <button key={id} className={!authView && active === id ? "active" : ""} onClick={() => setActive(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      <main className="main">
        <Topbar role={role} user={user} token={token} authView={authView} setAuthView={setAuthView} />
        {children}
      </main>
      {toast && (
        <div className="toast" onAnimationEnd={clearToast}>
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Topbar({ role, user, token, authView, setAuthView }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{authView ? "Authentication" : `${role} workspace`}</p>
        <h1>{authView === "login" ? "Login" : authView === "register" ? "Create account" : role === "teacher" ? "Course management" : role === "admin" ? "Administration" : "Student learning"}</h1>
      </div>
      <div className="top-actions">
        <button className="icon-button" title="Notifications">
          <Bell size={18} />
        </button>
        {token ? (
          <button className="primary-button">{user.fullName || "Account"}</button>
        ) : (
          <>
            <button className={authView === "login" ? "primary-button" : "secondary-button"} onClick={() => setAuthView("login")}>Login</button>
            <button className={authView === "register" ? "primary-button" : "secondary-button"} onClick={() => setAuthView("register")}>Register</button>
          </>
        )}
      </div>
    </header>
  );
}
