import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type NavItem = "Chat" | "Flashcards" | "Quiz" | "Code Analysis" | "Cost" | "Profile";
type Doc     = { id: string; name: string; type: "PDF" | "MD" | "PY"; checked: boolean };
type Message = { role: "user" | "ai"; content: string };

// ── Constants ──────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Flashcards",  icon: "🃏" },
  { label: "Quiz",        icon: "📝" },
  { label: "Code Review", icon: "💻" },
  { label: "Summarise",   icon: "✦"  },
  { label: "Q&A",         icon: "💬" },
];

const NAV: { label: NavItem; icon: string }[] = [
  { label: "Chat",          icon: "✦"  },
  { label: "Flashcards",    icon: "🃏" },
  { label: "Quiz",          icon: "📝" },
  { label: "Code Analysis", icon: "💻" },
  { label: "Cost",          icon: "📊" },
  { label: "Profile",       icon: "👤" },
];

// ── Login Modal ────────────────────────────────────────────────────────────
function LoginModal({
  onLogin,
  onClose,
}: {
  onLogin: (name: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName]         = useState("");
  const [error, setError]       = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (isSignUp && !name.trim())          { setError("Please enter your name.");     return; }
    onLogin(isSignUp ? name.trim() : email.split("@")[0]);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        {/* Close */}
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="modal-logo">
          <div className="modal-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="modal-logo-text">CorpusForge</span>
        </div>

        <h2 className="modal-title">{isSignUp ? "Create your account" : "Sign in to continue"}</h2>
        <p className="modal-sub">
          {isSignUp ? "Start exploring your documents with AI." : "Sign in to send messages and save your work."}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="login-field">
              <label className="login-label">Full name</label>
              <input className="login-input" type="text" placeholder="Sam Lee"
                value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
            </div>
          )}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" type="submit">
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="login-divider"><span>or</span></div>

        <button className="login-google-btn" onClick={() => onLogin("User")}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="login-switch">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button className="login-switch-btn" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Chat Page ──────────────────────────────────────────────────────────────
function ChatPage({
  docs,
  toggleDoc,
  userName,
  isLoggedIn,
  onRequireLogin,
}: {
  docs: Doc[];
  toggleDoc: (id: string) => void;
  userName: string;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const content = text ?? input;
    if (!content.trim()) return;
    // Gate: require login before sending
    if (!isLoggedIn) { onRequireLogin(); return; }
    const userMsg: Message = { role: "user", content };
    const aiMsg: Message   = { role: "ai",   content: "This is a mock response. Connect the backend to get real AI answers from your documents." };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const hasMessages = messages.length > 0;
  const greeting    = isLoggedIn ? `What's new, ${userName.split(" ")[0]}?` : "What do you want to explore?";

  return (
    <div className="chat-page">
      {/* Context bar */}
      <div className="active-docs-bar">
        <span className="active-docs-label">Context:</span>
        {docs.length === 0 ? (
          <span className="docs-empty-hint">No documents — upload files first.</span>
        ) : (
          docs.map((doc) => (
            <label key={doc.id} className={`doc-chip ${doc.checked ? "checked" : ""}`}>
              <input type="checkbox" checked={doc.checked} onChange={() => toggleDoc(doc.id)} style={{ display: "none" }} />
              {doc.name}
            </label>
          ))
        )}
      </div>

      <div className="chat-scroll">
        {!hasMessages ? (
          <div className="hero">
            <div className="hero-greeting">
              <span className="hero-asterisk">✦</span>
              <h1 className="hero-title">{greeting}</h1>
            </div>
            <p className="hero-sub">Upload documents and ask anything — or pick a quick action below.</p>

            <div className="hero-input-wrap">
              <textarea
                className="hero-input"
                placeholder="How can I help you today?"
                value={input}
                rows={3}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
              />
              <div className="hero-input-footer">
                <div className="hero-pills">
                  {QUICK_ACTIONS.map((a) => (
                    <button key={a.label} className="hero-pill" onClick={() => send(a.label)}>
                      <span>{a.icon}</span> {a.label}
                    </button>
                  ))}
                </div>
                <button className="hero-send" onClick={() => send()} disabled={!input.trim()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {!isLoggedIn && (
              <p className="hero-login-hint">
                <button className="hero-login-link" onClick={onRequireLogin}>Sign in</button>
                {" "}to save your conversations and access all features.
              </p>
            )}
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                {msg.role === "ai" && (
                  <div className="avatar ai-avatar"><span style={{ fontSize: 12 }}>✦</span></div>
                )}
                <div className={`bubble ${msg.role === "ai" ? "ai-bubble" : "user-bubble"}`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="avatar user-avatar">
                    {userName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {hasMessages && (
        <div className="chat-input-bar">
          <div className="quick-actions">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} className="quick-pill" onClick={() => send(a.label)}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask something about your corpus…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="send-btn" onClick={() => send()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Placeholder Page ───────────────────────────────────────────────────────
function PlaceholderPage({
  label,
  icon,
  isLoggedIn,
  onRequireLogin,
}: {
  label: string;
  icon: string;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
}) {
  return (
    <div className="placeholder-page">
      <span style={{ fontSize: 44 }}>{icon}</span>
      <p className="placeholder-title">{label}</p>
      <p className="placeholder-sub">
        {isLoggedIn
          ? `Use the Chat to generate ${label.toLowerCase()} from your documents.`
          : `Sign in to generate ${label.toLowerCase()} from your documents.`}
      </p>
      {!isLoggedIn && (
        <button className="placeholder-login-btn" onClick={onRequireLogin}>
          Sign in to get started
        </button>
      )}
    </div>
  );
}

// ── Cost Page ──────────────────────────────────────────────────────────────
function CostPage() {
  const stats = [
    { label: "Total Requests",    value: "0"         },
    { label: "Prompt Tokens",     value: "0"         },
    { label: "Completion Tokens", value: "0"         },
    { label: "Estimated Cost",    value: "$0.000000" },
  ];
  return (
    <div className="cost-page">
      <h2 className="page-title">Cost & Usage</h2>
      <div className="cost-grid">
        {stats.map((s) => (
          <div key={s.label} className="cost-card">
            <p className="cost-value">{s.value}</p>
            <p className="cost-label">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile Page ───────────────────────────────────────────────────────────
function ProfilePage({
  userName,
  isLoggedIn,
  activeDocs,
  totalDocs,
  onRequireLogin,
}: {
  userName: string;
  isLoggedIn: boolean;
  activeDocs: number;
  totalDocs: number;
  onRequireLogin: () => void;
}) {
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <h2 className="page-title">Profile</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{isLoggedIn ? initials || "U" : "?"}</div>
          <div>
            <p className="profile-name">{isLoggedIn ? userName : "Guest user"}</p>
            <p className="profile-email">{isLoggedIn ? `${userName.toLowerCase().replace(/\s+/g, ".")}@example.com` : "Sign in to view your account details"}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <p className="profile-stat-value">{totalDocs}</p>
            <p className="profile-stat-label">Total documents</p>
          </div>
          <div className="profile-stat">
            <p className="profile-stat-value">{activeDocs}</p>
            <p className="profile-stat-label">Active in context</p>
          </div>
          <div className="profile-stat">
            <p className="profile-stat-value">{isLoggedIn ? "Free" : "-"}</p>
            <p className="profile-stat-label">Plan</p>
          </div>
        </div>

        {!isLoggedIn && (
          <button className="profile-login-btn" onClick={onRequireLogin}>
            Sign in to complete your profile
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [showLogin, setShowLogin]     = useState(false);
  const [userName, setUserName]       = useState("Guest");
  const [activeNav, setActiveNav]     = useState<NavItem>("Chat");
  const [docs, setDocs]               = useState<Doc[]>([]);

  const checkedCount = docs.filter((d) => d.checked).length;
  const toggleDoc    = (id: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, checked: !d.checked } : d)));

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("Guest");
  };

  const requireLogin = () => setShowLogin(true);

  const initials = isLoggedIn
    ? userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const renderMain = () => {
    switch (activeNav) {
      case "Chat":
        return <ChatPage docs={docs} toggleDoc={toggleDoc} userName={userName} isLoggedIn={isLoggedIn} onRequireLogin={requireLogin} />;
      case "Flashcards":
        return <PlaceholderPage label="Flashcards"    icon="🃏" isLoggedIn={isLoggedIn} onRequireLogin={requireLogin} />;
      case "Quiz":
        return <PlaceholderPage label="Quiz"          icon="📝" isLoggedIn={isLoggedIn} onRequireLogin={requireLogin} />;
      case "Code Analysis":
        return <PlaceholderPage label="Code Analysis" icon="💻" isLoggedIn={isLoggedIn} onRequireLogin={requireLogin} />;
      case "Cost":
        return <CostPage />;
      case "Profile":
        return (
          <ProfilePage
            userName={userName}
            isLoggedIn={isLoggedIn}
            activeDocs={checkedCount}
            totalDocs={docs.length}
            onRequireLogin={requireLogin}
          />
        );
    }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Login modal — rendered on top when needed */}
      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}

      <div className="app">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="logo-text">CorpusForge</span>
          </div>

          <div className="sidebar-top-actions">
            <button className="new-chat-btn" onClick={() => setActiveNav("Chat")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New chat
            </button>
          </div>

          <nav className="sidebar-nav">
            {NAV.map(({ label, icon }) => (
              <button
                key={label}
                className={`nav-item ${activeNav === label ? "active" : ""}`}
                onClick={() => setActiveNav(label)}
              >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-corpus">
            <p className="sidebar-section-label">Corpus</p>
            {docs.length === 0 ? (
              <p className="sidebar-empty-hint">No documents yet</p>
            ) : (
              docs.map((doc) => (
                <label key={doc.id} className="sidebar-doc">
                  <input type="checkbox" checked={doc.checked} onChange={() => toggleDoc(doc.id)} className="doc-checkbox" />
                  <span className="sidebar-doc-name">{doc.name}</span>
                  <span className="type-badge">{doc.type}</span>
                </label>
              ))
            )}
            <button className="add-doc-btn">+ Add document</button>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            {isLoggedIn ? (
              <>
                <div className="user-info">
                  <div className="user-avatar-sm">{initials}</div>
                  <div className="user-details">
                    <span className="user-name">{userName}</span>
                    <span className="user-plan">{checkedCount} doc{checkedCount !== 1 ? "s" : ""} active</span>
                  </div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Sign out">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </>
            ) : (
              <button className="signin-footer-btn" onClick={requireLogin}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign in
              </button>
            )}
          </div>
        </aside>

        <main className="main">{renderMain()}</main>
      </div>
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent:        #3756AB;
    --accent-soft:   #E8EDF8;
    --accent-hover:  #2C4490;
    --bg:            #F5F0E8;
    --panel:         #EDE8DF;
    --border:        #D8D0C4;
    --card:          #FAF7F2;
    --text:          #1C1A17;
    --text-muted:    #8A8278;
    --sidebar-w:     224px;
    --radius:        12px;
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 13px;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  /* ── Layout ── */
  .app { display: flex; height: 100vh; overflow: hidden; }
  .main { flex: 1; overflow-y: auto; background: var(--bg); }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-w); min-width: var(--sidebar-w); height: 100vh;
    background: var(--panel);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow-y: auto;
  }

  .sidebar-logo {
    display: flex; align-items: center; gap: 9px;
    padding: 18px 16px 14px;
  }
  .logo-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .logo-text {
    font-family: 'Lora', Georgia, serif;
    font-weight: 600; font-size: 15px;
    color: var(--text); letter-spacing: -0.2px;
  }

  .sidebar-top-actions { padding: 4px 10px 8px; }
  .new-chat-btn {
    display: flex; align-items: center; gap: 7px;
    width: 100%; padding: 8px 12px;
    border-radius: 8px; border: none;
    background: transparent; color: var(--accent);
    font-size: 13px; font-weight: 500;
    font-family: 'Inter', sans-serif; cursor: pointer;
    transition: background 0.15s;
  }
  .new-chat-btn:hover { background: var(--accent-soft); }

  .sidebar-nav { padding: 4px 10px; display: flex; flex-direction: column; gap: 1px; }
  .nav-item {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 8px 12px;
    border-radius: 8px; border: none; background: transparent;
    color: var(--text-muted); cursor: pointer;
    font-size: 13px; font-family: 'Inter', sans-serif; text-align: left;
    transition: background 0.15s, color 0.15s;
  }
  .nav-item:hover { background: var(--bg); color: var(--text); }
  .nav-item.active {
    background: var(--accent-soft); color: var(--accent); font-weight: 500;
  }
  .nav-icon { font-size: 13px; width: 16px; text-align: center; flex-shrink: 0; }

  .sidebar-corpus {
    padding: 12px 10px 8px;
    border-top: 1px solid var(--border); margin-top: 8px;
  }
  .sidebar-section-label {
    font-size: 10px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.7px; color: var(--text-muted);
    padding: 0 4px; margin-bottom: 6px;
  }
  .sidebar-empty-hint { font-size: 11px; color: var(--text-muted); padding: 2px 4px 6px; }
  .sidebar-doc {
    display: flex; align-items: center; gap: 6px;
    padding: 5px 4px; border-radius: 6px; cursor: pointer; font-size: 11px;
  }
  .sidebar-doc:hover { background: var(--bg); }
  .sidebar-doc-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .doc-checkbox { accent-color: var(--accent); cursor: pointer; flex-shrink: 0; }
  .type-badge {
    font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px;
    background: var(--border); color: var(--text-muted); flex-shrink: 0;
  }
  .add-doc-btn {
    width: 100%; margin-top: 6px; padding: 7px; border-radius: 8px;
    border: 1px dashed var(--border); background: transparent;
    color: var(--text-muted); font-size: 11px;
    font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.15s;
  }
  .add-doc-btn:hover { border-color: var(--accent); color: var(--accent); }

  .sidebar-footer {
    margin-top: auto; padding: 12px 12px 14px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }
  .user-info { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
  .user-avatar-sm {
    width: 30px; height: 30px; border-radius: 50%;
    background: var(--accent); color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .user-details { display: flex; flex-direction: column; min-width: 0; }
  .user-name { font-size: 12px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-plan { font-size: 10px; color: var(--text-muted); }
  .logout-btn {
    width: 28px; height: 28px; border-radius: 7px; border: none;
    background: transparent; color: var(--text-muted);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; transition: all 0.15s;
  }
  .logout-btn:hover { background: var(--bg); color: var(--text); }
  .signin-footer-btn {
    display: flex; align-items: center; gap: 7px;
    width: 100%; padding: 8px 12px; border-radius: 8px; border: none;
    background: var(--accent); color: white;
    font-size: 13px; font-weight: 500;
    font-family: 'Inter', sans-serif; cursor: pointer; transition: background 0.15s;
  }
  .signin-footer-btn:hover { background: var(--accent-hover); }

  /* ── Chat Page ── */
  .chat-page { display: flex; flex-direction: column; height: 100vh; }

  .active-docs-bar {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    padding: 8px 20px; border-bottom: 1px solid var(--border);
    background: var(--panel); font-size: 11px;
  }
  .active-docs-label { font-weight: 600; color: var(--text-muted); margin-right: 2px; }
  .docs-empty-hint { font-size: 11px; color: var(--text-muted); }
  .doc-chip {
    padding: 3px 10px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); cursor: pointer;
    font-size: 11px; transition: all 0.15s;
  }
  .doc-chip.checked { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }

  .chat-scroll { flex: 1; overflow-y: auto; }

  /* ── Hero ── */
  .hero {
    padding: 80px 40px 60px;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    min-height: 100%;
  }
  .hero-greeting { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .hero-asterisk { font-size: 30px; color: var(--accent); line-height: 1; }
  .hero-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 34px; font-weight: 500;
    letter-spacing: -0.5px; color: var(--text); font-style: italic;
  }
  .hero-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 32px; }

  .hero-input-wrap {
    width: 100%; max-width: 600px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; box-shadow: 0 2px 16px rgba(55,86,171,0.07); overflow: hidden;
  }
  .hero-input {
    width: 100%; padding: 18px 20px 10px;
    border: none; outline: none; resize: none;
    font-size: 14px; font-family: 'Inter', sans-serif;
    background: transparent; color: var(--text); line-height: 1.6;
  }
  .hero-input::placeholder { color: var(--text-muted); }
  .hero-input-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px 10px; gap: 8px;
  }
  .hero-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .hero-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted);
    font-size: 11px; font-family: 'Inter', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .hero-pill:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .hero-send {
    width: 34px; height: 34px; border-radius: 10px; border: none;
    background: var(--accent); color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; transition: background 0.15s;
  }
  .hero-send:disabled { opacity: 0.35; cursor: default; }
  .hero-send:not(:disabled):hover { background: var(--accent-hover); }

  .hero-login-hint {
    margin-top: 20px; font-size: 12px; color: var(--text-muted);
  }
  .hero-login-link {
    background: none; border: none; color: var(--accent);
    font-size: 12px; font-weight: 500; cursor: pointer;
    font-family: 'Inter', sans-serif;
    text-decoration: underline; text-underline-offset: 2px;
  }
  .hero-login-link:hover { color: var(--accent-hover); }

  /* ── Messages ── */
  .chat-messages {
    display: flex; flex-direction: column; gap: 20px;
    max-width: 740px; margin: 0 auto; padding: 28px 20px;
  }
  .msg-row { display: flex; gap: 12px; align-items: flex-start; }
  .msg-row.user { flex-direction: row-reverse; }
  .avatar {
    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
  }
  .ai-avatar { background: var(--accent); color: white; }
  .user-avatar { background: var(--border); color: var(--text); }
  .bubble { padding: 11px 16px; border-radius: 14px; line-height: 1.65; font-size: 13.5px; max-width: 80%; }
  .ai-bubble {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 4px 14px 14px 14px; color: var(--text);
  }
  .user-bubble {
    background: var(--accent); color: white;
    border-radius: 14px 4px 14px 14px;
  }

  /* ── Chat Input Bar ── */
  .chat-input-bar {
    padding: 10px 20px 16px; border-top: 1px solid var(--border); background: var(--panel);
  }
  .quick-actions { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
  .quick-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted);
    font-size: 11px; font-family: 'Inter', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .quick-pill:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
  .chat-input-row { display: flex; gap: 8px; }
  .chat-input {
    flex: 1; height: 40px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--card); color: var(--text); padding: 0 14px; font-size: 13px;
    outline: none; font-family: 'Inter', sans-serif; transition: border-color 0.15s;
  }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--text-muted); }
  .send-btn {
    width: 40px; height: 40px; border-radius: 10px; border: none;
    background: var(--accent); color: white;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s;
  }
  .send-btn:hover { background: var(--accent-hover); }

  /* ── Placeholder Page ── */
  .placeholder-page {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 12px; color: var(--text-muted); text-align: center; padding: 40px;
  }
  .placeholder-title { font-family: 'Lora', serif; font-size: 18px; font-weight: 500; color: var(--text); }
  .placeholder-sub { font-size: 13px; max-width: 300px; line-height: 1.6; }
  .placeholder-login-btn {
    margin-top: 8px; padding: 9px 22px; border-radius: 10px; border: none;
    background: var(--accent); color: white;
    font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif;
    cursor: pointer; transition: background 0.15s;
  }
  .placeholder-login-btn:hover { background: var(--accent-hover); }

  /* ── Cost Page ── */
  .cost-page { padding: 48px 40px; }
  .page-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 22px; font-weight: 500; margin-bottom: 28px; color: var(--text);
  }
  .cost-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
  .cost-card {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 22px 18px;
  }
  .cost-value { font-size: 24px; font-weight: 700; margin-bottom: 5px; color: var(--text); }
  .cost-label { font-size: 11px; color: var(--text-muted); }

  /* ── Profile Page ── */
  .profile-page { padding: 48px 40px; }
  .profile-card {
    max-width: 680px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }
  .profile-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }
  .profile-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .profile-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 2px;
  }
  .profile-email {
    font-size: 12px;
    color: var(--text-muted);
  }
  .profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }
  .profile-stat {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 12px;
  }
  .profile-stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 2px;
  }
  .profile-stat-label {
    font-size: 11px;
    color: var(--text-muted);
  }
  .profile-login-btn {
    margin-top: 6px;
    padding: 9px 16px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: background 0.15s;
  }
  .profile-login-btn:hover { background: var(--accent-hover); }

  /* ── Login Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(28, 26, 23, 0.45);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-card {
    position: relative;
    width: 100%; max-width: 400px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 8px 48px rgba(55,86,171,0.15);
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .modal-close {
    position: absolute; top: 14px; right: 14px;
    width: 28px; height: 28px; border-radius: 8px; border: none;
    background: transparent; color: var(--text-muted);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
  }
  .modal-close:hover { background: var(--border); color: var(--text); }

  .modal-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .modal-logo-icon {
    width: 30px; height: 30px; border-radius: 8px; background: var(--accent);
    display: flex; align-items: center; justify-content: center;
  }
  .modal-logo-text {
    font-family: 'Lora', Georgia, serif;
    font-size: 16px; font-weight: 600; color: var(--text);
  }
  .modal-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 22px; font-weight: 500; color: var(--text);
    margin-bottom: 6px; letter-spacing: -0.3px;
  }
  .modal-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; }

  .login-form { display: flex; flex-direction: column; gap: 14px; }
  .login-field { display: flex; flex-direction: column; gap: 5px; }
  .login-label { font-size: 12px; font-weight: 500; color: var(--text); }
  .login-input {
    height: 42px; border-radius: 10px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text); padding: 0 14px; font-size: 13px;
    font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.15s;
  }
  .login-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(55,86,171,0.1); }
  .login-input::placeholder { color: var(--text-muted); }
  .login-error {
    font-size: 12px; color: #B91C1C;
    background: #FEF2F2; border: 1px solid #FECACA;
    border-radius: 8px; padding: 8px 12px;
  }
  .login-btn {
    height: 44px; border-radius: 10px; border: none;
    background: var(--accent); color: white;
    font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif;
    cursor: pointer; margin-top: 4px; transition: background 0.15s;
  }
  .login-btn:hover { background: var(--accent-hover); }

  .login-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 18px 0; color: var(--text-muted); font-size: 12px;
  }
  .login-divider::before, .login-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  .login-google-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    height: 44px; border-radius: 10px; border: 1px solid var(--border);
    background: white; color: var(--text);
    font-size: 13px; font-weight: 500; font-family: 'Inter', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .login-google-btn:hover { border-color: var(--accent); background: var(--accent-soft); }

  .login-switch { text-align: center; margin-top: 18px; font-size: 12px; color: var(--text-muted); }
  .login-switch-btn {
    background: none; border: none; color: var(--accent);
    font-size: 12px; font-family: 'Inter', sans-serif;
    cursor: pointer; font-weight: 500;
    text-decoration: underline; text-underline-offset: 2px;
  }
  .login-switch-btn:hover { color: var(--accent-hover); }
`;
