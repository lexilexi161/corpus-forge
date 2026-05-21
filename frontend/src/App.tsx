import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type NavItem = "Chat" | "Flashcards" | "Quiz" | "Code Analysis" | "Cost" | "Profile";
type Doc = { id: string; name: string; type: "PDF" | "MD" | "PY"; checked: boolean };
type Message = { role: "user" | "ai"; content: string };

// ── Constants ──────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Flashcards", icon: "🃏" },
  { label: "Quiz", icon: "📝" },
  { label: "Code Review", icon: "💻" },
  { label: "Summarise", icon: "✦" },
  { label: "Q&A", icon: "💬" },
];

const NAV: { label: NavItem; icon: React.ReactNode }[] = [
  {
    label: "Chat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  { label: "Flashcards", icon: <span className="nav-emoji">🃏</span> },
  { label: "Quiz", icon: <span className="nav-emoji">📝</span> },
  { label: "Code Analysis", icon: <span className="nav-emoji">💻</span> },
  {
    label: "Cost",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Profile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const STORAGE_KEY = "corpusforge_user";

type StoredUser = { name: string; email: string };

function loadStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser;
    if (parsed?.name && parsed?.email) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function saveStoredUser(user: StoredUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Login Modal ────────────────────────────────────────────────────────────
function LoginModal({
  onLogin,
  onClose,
}: {
  onLogin: (user: StoredUser) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      const user = { name: name.trim(), email: email.trim().toLowerCase() };
      saveStoredUser(user);
      onLogin(user);
      return;
    }
    const stored = loadStoredUser();
    if (stored && stored.email === email.trim().toLowerCase()) {
      onLogin(stored);
      return;
    }
    setError("No account found for this email. Sign up first.");
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="modal-logo">
          <div className="modal-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="modal-logo-text">CorpusForge</span>
        </div>

        <h2 className="modal-title">{isSignUp ? "Create your account" : "Sign in"}</h2>
        <p className="modal-sub">
          {isSignUp
            ? "Your name will appear in chat and profile."
            : "Sign in with the email you used when signing up."}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="login-field">
              <label className="login-label">Full name</label>
              <input
                className="login-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
              />
            </div>
          )}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn">
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="login-switch">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="login-switch-btn"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
          >
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
  const [input, setInput] = useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const content = text ?? input;
    if (!content.trim()) return;
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    const userMsg: Message = { role: "user", content };
    const aiMsg: Message = {
      role: "ai",
      content: "This is a mock response. Connect the backend to get real AI answers from your documents.",
    };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const hasMessages = messages.length > 0;
  const firstName = userName.split(" ")[0];
  const greeting = isLoggedIn ? `What's new, ${firstName}?` : "What do you want to explore?";

  return (
    <div className="chat-page">
      {docs.length > 0 && (
        <div className="active-docs-bar">
          <span className="active-docs-label">Context</span>
          {docs.map((doc) => (
            <label key={doc.id} className={`doc-chip ${doc.checked ? "checked" : ""}`}>
              <input type="checkbox" checked={doc.checked} onChange={() => toggleDoc(doc.id)} style={{ display: "none" }} />
              {doc.name}
            </label>
          ))}
        </div>
      )}

      <div className="chat-scroll">
        {!hasMessages ? (
          <div className="hero">
            <div className="hero-greeting">
              <span className="hero-mark" aria-hidden>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <h1 className="hero-title">{greeting}</h1>
            </div>

            <div className="hero-input-wrap">
              <textarea
                className="hero-input"
                placeholder="How can I help you today?"
                value={input}
                rows={2}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div className="hero-input-toolbar">
                <div className="hero-toolbar-left">
                  <button type="button" className="toolbar-icon-btn" title="Add attachment" aria-label="Add">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <button type="button" className="toolbar-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Research
                  </button>
                </div>
                <div className="hero-toolbar-right">
                  <button type="button" className="model-select">
                    Corpus AI
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="hero-send"
                    onClick={() => send()}
                    disabled={!input.trim()}
                    aria-label="Send"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="hero-quick-row">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} type="button" className="hero-quick-btn" onClick={() => send(a.label)}>
                  <span className="hero-quick-icon">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>

            {!isLoggedIn && (
              <p className="hero-login-hint">
                <button type="button" className="hero-login-link" onClick={onRequireLogin}>
                  Sign in
                </button>{" "}
                to use your name and save your work.
              </p>
            )}
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                {msg.role === "ai" && (
                  <div className="avatar ai-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <div className={`bubble ${msg.role === "ai" ? "ai-bubble" : "user-bubble"}`}>{msg.content}</div>
                {msg.role === "user" && (
                  <div className="avatar user-avatar">{userName.slice(0, 2).toUpperCase()}</div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {hasMessages && (
        <div className="chat-input-bar">
          <div className="hero-quick-row compact">
            {QUICK_ACTIONS.map((a) => (
              <button key={a.label} type="button" className="hero-quick-btn" onClick={() => send(a.label)}>
                <span className="hero-quick-icon">{a.icon}</span>
                {a.label}
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
            <button type="button" className="hero-send" onClick={() => send()} aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Placeholder Page ───────────────────────────────────────────────────────
function PlaceholderPage({ label, icon, onGoChat }: { label: string; icon: string; onGoChat: () => void }) {
  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">{icon}</span>
      <h2 className="placeholder-title">{label}</h2>
      <p className="placeholder-sub">Use the Chat to generate {label.toLowerCase()} from your documents.</p>
      <button type="button" className="placeholder-cta" onClick={onGoChat}>
        Go to Chat
      </button>
    </div>
  );
}

// ── Cost Page ──────────────────────────────────────────────────────────────
function CostPage() {
  const stats = [
    { label: "Total Requests", value: "0" },
    { label: "Prompt Tokens", value: "0" },
    { label: "Completion Tokens", value: "0" },
    { label: "Estimated Cost", value: "$0.000000" },
  ];
  return (
    <div className="page-shell">
      <h2 className="page-title">Cost & Usage</h2>
      <div className="cost-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="stat-value">{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile Page ───────────────────────────────────────────────────────────
function ProfilePage({
  userName,
  userEmail,
  isLoggedIn,
  activeDocs,
  totalDocs,
  onEditName,
  onRequireLogin,
}: {
  userName: string;
  userEmail: string;
  isLoggedIn: boolean;
  activeDocs: number;
  totalDocs: number;
  onEditName: (name: string) => void;
  onRequireLogin: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(userName);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="page-shell">
      <h2 className="page-title">Profile</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{initials || "?"}</div>
          <div className="profile-info">
            {editing ? (
              <form
                className="profile-edit-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  onEditName(draft.trim() || "Guest");
                  setEditing(false);
                }}
              >
                <input
                  className="profile-name-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="profile-save-btn">
                  Save
                </button>
              </form>
            ) : (
              <>
                <p className="profile-name">{isLoggedIn ? userName : "Guest"}</p>
                <p className="profile-plan">
                  {isLoggedIn ? (userEmail || "Free plan") : "Sign in to see your account"}
                </p>
              </>
            )}
          </div>
          {isLoggedIn && !editing && (
            <button type="button" className="profile-edit-btn" onClick={() => { setDraft(userName); setEditing(true); }}>
              Edit name
            </button>
          )}
        </div>

        {!isLoggedIn && (
          <button type="button" className="profile-login-btn" onClick={onRequireLogin}>
            Sign in
          </button>
        )}
        <div className="profile-stats">
          <div className="stat-card">
            <p className="stat-value">{totalDocs}</p>
            <p className="stat-label">Documents</p>
          </div>
          <div className="stat-card">
            <p className="stat-value">{activeDocs}</p>
            <p className="stat-label">Active in context</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("Chat");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");

  React.useEffect(() => {
    const stored = loadStoredUser();
    if (stored) {
      setUserName(stored.name);
      setUserEmail(stored.email);
      setIsLoggedIn(true);
    }
  }, []);

  const checkedCount = docs.filter((d) => d.checked).length;
  const toggleDoc = (id: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, checked: !d.checked } : d)));

  const handleLogin = (user: StoredUser) => {
    setUserName(user.name);
    setUserEmail(user.email);
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    clearStoredUser();
    setIsLoggedIn(false);
    setUserName("Guest");
    setUserEmail("");
  };

  const handleEditName = (name: string) => {
    const trimmed = name.trim() || "Guest";
    setUserName(trimmed);
    if (isLoggedIn && userEmail) {
      saveStoredUser({ name: trimmed, email: userEmail });
    }
  };

  const requireLogin = () => setShowLogin(true);

  const initials = isLoggedIn
    ? userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const renderMain = () => {
    switch (activeNav) {
      case "Chat":
        return (
          <ChatPage
            docs={docs}
            toggleDoc={toggleDoc}
            userName={userName}
            isLoggedIn={isLoggedIn}
            onRequireLogin={requireLogin}
          />
        );
      case "Flashcards":
        return <PlaceholderPage label="Flashcards" icon="🃏" onGoChat={() => setActiveNav("Chat")} />;
      case "Quiz":
        return <PlaceholderPage label="Quiz" icon="📝" onGoChat={() => setActiveNav("Chat")} />;
      case "Code Analysis":
        return <PlaceholderPage label="Code Analysis" icon="💻" onGoChat={() => setActiveNav("Chat")} />;
      case "Cost":
        return <CostPage />;
      case "Profile":
        return (
          <ProfilePage
            userName={userName}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            activeDocs={checkedCount}
            totalDocs={docs.length}
            onEditName={handleEditName}
            onRequireLogin={requireLogin}
          />
        );
    }
  };

  return (
    <>
      <style>{CSS}</style>
      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="logo-text">CorpusForge</span>
            </div>
            <button type="button" className="new-chat-btn" onClick={() => setActiveNav("Chat")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New chat
            </button>
          </div>

          <nav className="sidebar-nav">
            {NAV.map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className={`nav-item ${activeNav === label ? "active" : ""}`}
                onClick={() => setActiveNav(label)}
              >
                <span className="nav-icon-wrap">{icon}</span>
                {label}
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
            <button type="button" className="add-doc-btn">
              + Add document
            </button>
          </div>

          {isLoggedIn ? (
            <div className="sidebar-footer-row">
              <button type="button" className="sidebar-user" onClick={() => setActiveNav("Profile")}>
                <div className="user-avatar-sm">{initials}</div>
                <div className="user-details">
                  <span className="user-name">{userName}</span>
                  <span className="user-plan">Free plan</span>
                </div>
              </button>
              <button type="button" className="logout-btn" onClick={handleLogout} title="Sign out" aria-label="Sign out">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <button type="button" className="signin-footer-btn" onClick={requireLogin}>
              Sign in
            </button>
          )}
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
    --bg:            #F7F4EE;
    --panel:         #EFEBE3;
    --card:          #FFFFFF;
    --border:        #E0D9CE;
    --text:          #1C1A17;
    --text-muted:    #7A7468;
    --sidebar-w:     240px;
    --radius:        14px;
    --shadow:        0 2px 20px rgba(55, 86, 171, 0.08);
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  .app { display: flex; height: 100vh; overflow: hidden; }
  .main { flex: 1; overflow-y: auto; background: var(--bg); }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-w);
    min-width: var(--sidebar-w);
    height: 100vh;
    background: var(--panel);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .sidebar-header { padding: 16px 14px 8px; }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .logo-text {
    font-family: 'Lora', Georgia, serif;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: -0.2px;
  }

  .new-chat-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--accent);
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }

  .new-chat-btn:hover { background: var(--accent-soft); }

  .sidebar-nav {
    padding: 6px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 14px;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .nav-item:hover { background: rgba(255,255,255,0.5); color: var(--text); }
  .nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 500; }

  .nav-icon-wrap {
    width: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .nav-emoji { font-size: 14px; line-height: 1; }

  .sidebar-corpus {
    padding: 14px 10px 10px;
    border-top: 1px solid var(--border);
    margin-top: 8px;
    flex: 1;
  }

  .sidebar-section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    padding: 0 6px;
    margin-bottom: 8px;
  }

  .sidebar-empty-hint { font-size: 12px; color: var(--text-muted); padding: 0 6px 8px; }

  .sidebar-doc {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 6px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
  }

  .sidebar-doc:hover { background: rgba(255,255,255,0.45); }
  .sidebar-doc-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .doc-checkbox { accent-color: var(--accent); cursor: pointer; }
  .type-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--border);
    color: var(--text-muted);
  }

  .add-doc-btn {
    width: 100%;
    margin-top: 8px;
    padding: 8px;
    border-radius: 10px;
    border: 1px dashed var(--border);
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
  }

  .add-doc-btn:hover { border-color: var(--accent); color: var(--accent); }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 10px 14px;
    padding: 10px 12px;
    border-radius: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.15s;
    width: calc(100% - 20px);
  }

  .sidebar-user:hover { background: rgba(255,255,255,0.5); }

  .sidebar-footer-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 8px 10px 14px;
    width: calc(100% - 20px);
  }

  .sidebar-footer-row .sidebar-user {
    margin: 0;
    flex: 1;
    min-width: 0;
    width: auto;
  }

  .logout-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  .logout-btn:hover { background: rgba(255,255,255,0.5); color: var(--text); }

  .signin-footer-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% - 20px);
    margin: 8px 10px 14px;
    padding: 10px 12px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }

  .signin-footer-btn:hover { background: var(--accent-hover); }

  .user-avatar-sm {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .user-details { display: flex; flex-direction: column; min-width: 0; }
  .user-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .user-plan { font-size: 11px; color: var(--text-muted); }

  /* ── Chat / Hero ── */
  .chat-page { display: flex; flex-direction: column; height: 100vh; }

  .active-docs-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    padding: 10px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
    font-size: 12px;
  }

  .active-docs-label {
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.05em;
  }

  .doc-chip {
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text-muted);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }

  .doc-chip.checked {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent);
  }

  .chat-scroll { flex: 1; overflow-y: auto; }

  .hero {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 32px 80px;
    text-align: center;
  }

  .hero-greeting {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 36px;
  }

  .hero-mark {
    color: var(--accent);
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .hero-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 36px;
    font-weight: 500;
    font-style: italic;
    letter-spacing: -0.5px;
    color: var(--text);
    line-height: 1.2;
  }

  .hero-input-wrap {
    width: 100%;
    max-width: 640px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .hero-input {
    width: 100%;
    padding: 20px 22px 8px;
    border: none;
    outline: none;
    resize: none;
    font-size: 15px;
    font-family: inherit;
    background: transparent;
    color: var(--text);
    line-height: 1.55;
  }

  .hero-input::placeholder { color: var(--text-muted); }

  .hero-input-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px 14px;
    gap: 12px;
  }

  .hero-toolbar-left,
  .hero-toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .toolbar-icon-btn:hover { background: var(--bg); color: var(--text); }

  .toolbar-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text-muted);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toolbar-chip:hover { border-color: var(--accent); color: var(--accent); }

  .model-select {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 7px 10px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .model-select:hover { border-color: var(--accent); }

  .hero-send {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, opacity 0.15s;
  }

  .hero-send:disabled { opacity: 0.35; cursor: default; }
  .hero-send:not(:disabled):hover { background: var(--accent-hover); }

  .hero-quick-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
    max-width: 640px;
  }

  .hero-quick-row.compact { margin-top: 0; margin-bottom: 10px; justify-content: flex-start; max-width: none; }

  .hero-quick-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    transition: all 0.15s;
  }

  .hero-quick-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }

  .hero-quick-icon { font-size: 15px; line-height: 1; }

  .hero-login-hint {
    margin-top: 20px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .hero-login-link {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .hero-login-link:hover { color: var(--accent-hover); }

  /* ── Messages ── */
  .chat-messages {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 720px;
    margin: 0 auto;
    padding: 32px 24px;
    width: 100%;
  }

  .msg-row { display: flex; gap: 12px; align-items: flex-start; }
  .msg-row.user { flex-direction: row-reverse; }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
  }

  .ai-avatar { background: var(--accent); color: white; }
  .user-avatar { background: var(--border); color: var(--text); }

  .bubble {
    padding: 12px 16px;
    border-radius: 16px;
    line-height: 1.65;
    font-size: 14px;
    max-width: 78%;
  }

  .ai-bubble {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 4px 16px 16px 16px;
  }

  .user-bubble {
    background: var(--accent);
    color: white;
    border-radius: 16px 4px 16px 16px;
  }

  .chat-input-bar {
    padding: 16px 24px 24px;
    border-top: 1px solid var(--border);
    background: var(--panel);
    max-width: 720px;
    margin: 0 auto;
    width: 100%;
  }

  .chat-input-row { display: flex; gap: 10px; align-items: center; }

  .chat-input {
    flex: 1;
    height: 44px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--card);
    padding: 0 16px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s;
  }

  .chat-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(55, 86, 171, 0.12); }

  /* ── Placeholder & pages ── */
  .placeholder-page,
  .page-shell {
    padding: 56px 48px;
    max-width: 800px;
    margin: 0 auto;
  }

  .placeholder-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 70vh;
    text-align: center;
    gap: 12px;
  }

  .placeholder-icon { font-size: 48px; }
  .placeholder-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 24px;
    font-weight: 500;
    font-style: italic;
  }

  .placeholder-sub { font-size: 14px; color: var(--text-muted); max-width: 320px; line-height: 1.6; }

  .placeholder-cta {
    margin-top: 12px;
    padding: 10px 22px;
    border-radius: 12px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }

  .placeholder-cta:hover { background: var(--accent-hover); }

  .page-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 28px;
    font-weight: 500;
    font-style: italic;
    margin-bottom: 28px;
    letter-spacing: -0.3px;
  }

  .cost-grid,
  .profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 14px;
  }

  .stat-card,
  .profile-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 18px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.03);
  }

  .stat-value { font-size: 26px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .stat-label { font-size: 12px; color: var(--text-muted); }

  .profile-card { max-width: 520px; padding: 24px; }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .profile-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .profile-info { flex: 1; min-width: 0; }
  .profile-name { font-size: 18px; font-weight: 600; }
  .profile-plan { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  .profile-edit-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    color: var(--text-muted);
    transition: all 0.15s;
  }

  .profile-edit-btn:hover { border-color: var(--accent); color: var(--accent); }

  .profile-edit-form { display: flex; gap: 8px; align-items: center; }

  .profile-name-input {
    flex: 1;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 0 10px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
  }

  .profile-name-input:focus { border-color: var(--accent); }

  .profile-save-btn {
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
  }

  .profile-stats { margin-top: 4px; }

  .profile-login-btn {
    margin-top: 16px;
    padding: 10px 18px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }

  .profile-login-btn:hover { background: var(--accent-hover); }

  /* ── Login modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(28, 26, 23, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .modal-card {
    position: relative;
    width: 100%;
    max-width: 400px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 8px 48px rgba(55, 86, 171, 0.15);
  }

  .modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .modal-close:hover { background: var(--border); color: var(--text); }

  .modal-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }

  .modal-logo-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-logo-text {
    font-family: 'Lora', Georgia, serif;
    font-size: 16px;
    font-weight: 600;
  }

  .modal-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .modal-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.5; }

  .login-form { display: flex; flex-direction: column; gap: 14px; }

  .login-field { display: flex; flex-direction: column; gap: 5px; }

  .login-label { font-size: 12px; font-weight: 500; }

  .login-input {
    height: 42px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    padding: 0 14px;
    font-size: 13px;
    font-family: inherit;
    outline: none;
  }

  .login-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(55, 86, 171, 0.1); }

  .login-error {
    font-size: 12px;
    color: #B91C1C;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 8px 12px;
  }

  .login-btn {
    height: 44px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    margin-top: 4px;
  }

  .login-btn:hover { background: var(--accent-hover); }

  .login-switch { text-align: center; margin-top: 18px; font-size: 12px; color: var(--text-muted); }

  .login-switch-btn {
    background: none;
    border: none;
    color: var(--accent);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    font-weight: 500;
    text-decoration: underline;
  }
`;
