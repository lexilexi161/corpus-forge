import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type NavItem = "Chat" | "Flashcards" | "Quiz" | "Code Analysis" | "Cost";
type Doc = { id: string; name: string; type: "PDF" | "MD" | "PY"; checked: boolean };
type Message = { role: "user" | "ai"; content: string };

// ── Constants ──────────────────────────────────────────────────────────────
const INITIAL_DOCS: Doc[] = [];

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "#F0F0F0", color: "#333333" },
  MD:  { bg: "#F0F0F0", color: "#333333" },
  PY:  { bg: "#F0F0F0", color: "#333333" },
};

const QUICK_ACTIONS = [
  { label: "Flashcards" },
  { label: "Quiz" },
  { label: "Code Review" },
  { label: "Summarise" },
  { label: "Q&A" },
];

const NAV: { label: NavItem }[] = [
  { label: "Chat"          },
  { label: "Flashcards"    },
  { label: "Quiz"          },
  { label: "Code Analysis" },
  { label: "Cost"          },
];

// ── Chat page (hero when empty, chat when messages exist) ─────────────────
function ChatPage({ docs, toggleDoc }: { docs: Doc[]; toggleDoc: (id: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text?: string) => {
    const content = text ?? input;
    if (!content.trim()) return;
    const userMsg: Message = { role: "user", content };
    const aiMsg: Message = { role: "ai", content: "This is a mock response. Connect the backend to get real AI answers from your documents." };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="chat-page">
      <div className="active-docs-bar">
        <span className="active-docs-label">Context:</span>
        {docs.length === 0 ? (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No documents — upload files first.</span>
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
            <h1 className="hero-title">What do you want to explore?</h1>
            <p className="hero-sub">Upload documents and ask anything — or pick a quick action below.</p>
            <div className="hero-input-wrap">
              <textarea
                className="hero-input"
                placeholder="Ask something about your corpus…"
                value={input}
                rows={3}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <div className="hero-input-footer">
                <div className="hero-pills">
                  {QUICK_ACTIONS.map((a) => (
                    <button key={a.label} className="hero-pill" onClick={() => send(a.label)}>
                      {a.label}
                    </button>
                  ))}
                </div>
                <button className="hero-send" onClick={() => send()} disabled={!input.trim()}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role}`}>
                {msg.role === "ai" && <div className="avatar ai-avatar">AI</div>}
                <div className={`bubble ${msg.role === "ai" ? "ai-bubble" : "user-bubble"}`}>{msg.content}</div>
                {msg.role === "user" && <div className="avatar user-avatar">U</div>}
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
              <button key={a.label} className="quick-pill" onClick={() => send(a.label)}>{a.label}</button>
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Placeholder page ───────────────────────────────────────────────────────
function PlaceholderPage({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="placeholder-page">
      <span style={{ fontSize: 40 }}>{icon}</span>
      <p className="placeholder-title">{label}</p>
      <p className="placeholder-sub">Use the Chat to generate {label.toLowerCase()} from your documents.</p>
    </div>
  );
}

// ── Cost page ──────────────────────────────────────────────────────────────
function CostPage() {
  const stats = [
    { label: "Total Requests", value: "0" },
    { label: "Prompt Tokens", value: "0" },
    { label: "Completion Tokens", value: "0" },
    { label: "Estimated Cost", value: "$0.000000" },
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

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("Chat");
  const [docs, setDocs] = useState<Doc[]>(INITIAL_DOCS);

  const checkedCount = docs.filter((d) => d.checked).length;
  const toggleDoc = (id: string) =>
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, checked: !d.checked } : d)));

  const renderMain = () => {
    switch (activeNav) {
      case "Chat":          return <ChatPage docs={docs} toggleDoc={toggleDoc} />;
      case "Flashcards":    return <PlaceholderPage label="Flashcards" icon="🃏" />;
      case "Quiz":          return <PlaceholderPage label="Quiz" icon="📝" />;
      case "Code Analysis": return <PlaceholderPage label="Code Analysis" icon="🔍" />;
      case "Cost":          return <CostPage />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="3" width="20" height="5" rx="1" /><rect x="2" y="10" width="20" height="5" rx="1" /><rect x="2" y="17" width="20" height="5" rx="1" />
              </svg>
            </div>
            <span className="logo-text">CorpusForge</span>
          </div>

          <div className="workspace-pill">
            <span className="workspace-dot" />
            <span className="workspace-name">My Workspace</span>
            <span className="workspace-chevron">›</span>
          </div>

          <nav className="sidebar-nav">
            {NAV.map(({ label }) => (
              <button
                key={label}
                className={`nav-item ${activeNav === label ? "active" : ""}`}
                onClick={() => setActiveNav(label)}
              >
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
                  <span className="type-badge" style={{ background: TYPE_STYLE[doc.type].bg, color: TYPE_STYLE[doc.type].color }}>
                    {doc.type}
                  </span>
                </label>
              ))
            )}
            <button className="add-doc-btn">+ Add document</button>
          </div>

          <div className="sidebar-footer">
            <span className="token-counter">
              {checkedCount} doc{checkedCount !== 1 ? "s" : ""} active
            </span>
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
    --accent: #000000;
    --accent-light: #EDE4D4;
    --bg: #FAF5ED;
    --panel: #FAF5ED;
    --border: #E5DAC8;
    --text: #111111;
    --text-muted: #999999;
    --sidebar-w: 220px;
    --hero-from: #FAF5ED;
    --hero-to: #FAF5ED;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --accent: #FFFFFF;
      --accent-light: #1A1A1A;
      --bg: #0A0A0A; --panel: #111111; --border: #222222;
      --text: #EEEEEE; --text-muted: #666666;
      --hero-from: #161616; --hero-to: #0A0A0A;
    }
  }
  body { font-family: 'Montserrat', system-ui, sans-serif; font-size: 13px; background: var(--bg); color: var(--text); }

  .app { display: flex; height: 100vh; overflow: hidden; }
  .main { flex: 1; overflow-y: auto; }

  /* Sidebar */
  .sidebar {
    width: var(--sidebar-w); min-width: var(--sidebar-w); height: 100vh;
    background: var(--panel); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow-y: auto;
  }
  .sidebar-logo {
    display: flex; align-items: center; gap: 8px;
    padding: 16px 14px 12px; border-bottom: 1px solid var(--border);
  }
  .logo-icon {
    width: 26px; height: 26px; border-radius: 7px; background: var(--text);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .logo-text { font-weight: 700; font-size: 14px; letter-spacing: -0.3px; }

  .workspace-pill {
    display: flex; align-items: center; gap: 6px;
    margin: 10px 10px 4px; padding: 7px 10px; border-radius: 8px;
    background: var(--bg); cursor: pointer; font-size: 12px; font-weight: 500;
  }
  .workspace-pill:hover { background: var(--border); }
  .workspace-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); flex-shrink: 0; }
  .workspace-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .workspace-chevron { color: var(--text-muted); font-size: 14px; }

  .sidebar-nav { padding: 8px 10px; display: flex; flex-direction: column; gap: 1px; }
  .nav-item {
    display: flex; align-items: center; width: 100%;
    padding: 7px 10px; border-radius: 7px; border: none; background: transparent;
    color: var(--text-muted); cursor: pointer; font-size: 13px; text-align: left;
  }
  .nav-item:hover { background: var(--bg); color: var(--text); }
  .nav-item.active { background: var(--accent-light); color: var(--text); font-weight: 600; }

  .sidebar-corpus { padding: 12px 10px 8px; border-top: 1px solid var(--border); margin-top: 4px; }
  .sidebar-section-label {
    font-size: 10px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.6px; color: var(--text-muted); padding: 0 4px; margin-bottom: 6px;
  }
  .sidebar-empty-hint { font-size: 11px; color: var(--text-muted); padding: 2px 4px 6px; }
  .sidebar-doc {
    display: flex; align-items: center; gap: 6px; padding: 5px 4px;
    border-radius: 6px; cursor: pointer; font-size: 11px;
  }
  .sidebar-doc:hover { background: var(--bg); }
  .sidebar-doc-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .doc-checkbox { accent-color: var(--text); cursor: pointer; flex-shrink: 0; }
  .type-badge { font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px; flex-shrink: 0; }
  .add-doc-btn {
    width: 100%; margin-top: 6px; padding: 6px; border-radius: 7px;
    border: 1px dashed var(--border); background: transparent; color: var(--text-muted);
    font-size: 11px; cursor: pointer;
  }
  .add-doc-btn:hover { border-color: var(--text); color: var(--text); }
  .sidebar-footer {
    margin-top: auto; padding: 12px 14px;
    border-top: 1px solid var(--border); font-size: 11px; color: var(--text-muted);
  }

  /* Chat page */
  .chat-page { display: flex; flex-direction: column; height: 100vh; }
  .active-docs-bar {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    padding: 8px 16px; border-bottom: 1px solid var(--border);
    background: var(--panel); font-size: 11px;
  }
  .active-docs-label { font-weight: 600; color: var(--text-muted); margin-right: 2px; }
  .doc-chip {
    padding: 3px 10px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); cursor: pointer; font-size: 11px;
  }
  .doc-chip.checked { background: var(--accent-light); color: var(--text); border-color: var(--text); }

  .chat-scroll { flex: 1; overflow-y: auto; padding: 16px; }

  /* Hero */
  .hero {
    background: linear-gradient(160deg, var(--hero-from) 0%, var(--hero-to) 55%);
    padding: 64px 40px 48px; display: flex; flex-direction: column; align-items: center; text-align: center;
    min-height: 100%;
  }
  .hero-title { font-size: 30px; font-weight: 800; letter-spacing: -0.8px; color: var(--text); margin-bottom: 10px; }
  .hero-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; }
  .hero-input-wrap {
    width: 100%; max-width: 580px; background: #FFFFFF;
    border: 1px solid var(--border); border-radius: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05); overflow: hidden;
  }
  .hero-input {
    width: 100%; padding: 16px 18px; border: none; outline: none; resize: none;
    font-size: 14px; font-family: inherit; background: transparent; color: var(--text); line-height: 1.5;
  }
  .hero-input-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; border-top: 1px solid var(--border); gap: 8px;
  }
  .hero-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .hero-pill {
    padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); font-size: 11px; cursor: pointer; font-family: inherit;
  }
  .hero-pill:hover { border-color: var(--text); color: var(--text); }
  .hero-send {
    width: 32px; height: 32px; border-radius: 8px; border: none;
    background: var(--text); color: var(--panel); display: flex; align-items: center;
    justify-content: center; cursor: pointer; flex-shrink: 0;
  }
  .hero-send:disabled { opacity: 0.3; cursor: default; }
  .hero-send:not(:disabled):hover { opacity: 0.8; }

  /* Messages */
  .chat-messages { display: flex; flex-direction: column; gap: 18px; max-width: 720px; margin: 0 auto; }
  .msg-row { display: flex; gap: 10px; align-items: flex-start; }
  .msg-row.user { flex-direction: row-reverse; }
  .avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700;
  }
  .ai-avatar { background: var(--text); color: var(--panel); }
  .user-avatar { background: var(--border); color: var(--text); }
  .bubble { padding: 10px 14px; border-radius: 12px; line-height: 1.6; font-size: 13px; max-width: 82%; }
  .ai-bubble { background: #FFFFFF; border: 1px solid var(--border); border-radius: 4px 12px 12px 12px; }
  .user-bubble { background: var(--text); color: var(--panel); border-radius: 12px 4px 12px 12px; }

  /* Input bar */
  .chat-input-bar { padding: 10px 16px 14px; border-top: 1px solid var(--border); background: var(--panel); }
  .quick-actions { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
  .quick-pill {
    padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--bg); color: var(--text-muted); font-size: 11px; cursor: pointer; font-family: inherit;
  }
  .quick-pill:hover { border-color: var(--text); color: var(--text); }
  .chat-input-row { display: flex; gap: 8px; }
  .chat-input {
    flex: 1; height: 38px; border-radius: 9px; border: 1px solid var(--border);
    background: #FFFFFF; color: var(--text); padding: 0 12px; font-size: 13px;
    outline: none; font-family: inherit;
  }
  .chat-input:focus { border-color: var(--text); }
  .send-btn {
    width: 38px; height: 38px; border-radius: 9px; border: none;
    background: var(--text); color: var(--panel); display: flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .send-btn:hover { opacity: 0.8; }

  /* Placeholder */
  .placeholder-page {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 10px; color: var(--text-muted); text-align: center; padding: 40px;
  }
  .placeholder-title { font-size: 16px; font-weight: 700; color: var(--text); }
  .placeholder-sub { font-size: 13px; max-width: 300px; }

  /* Cost */
  .cost-page { padding: 40px; }
  .page-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; }
  .cost-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  .cost-card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 20px 16px; }
  .cost-value { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .cost-label { font-size: 11px; color: var(--text-muted); }
`;
