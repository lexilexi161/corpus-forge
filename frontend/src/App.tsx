import React, { useEffect, useState } from "react";

import {
  generateFlashcards,
  generateCodeAnalysis,
  generateQuiz,
  getCost,
  sendChatMessage,
  uploadDocument,
} from "./api";

// ── Types ──────────────────────────────────────────────────────────────────
type NavItem = "Chat" | "Flashcards" | "Quiz" | "Code Analysis" | "Cost" | "Profile";
type Doc = {
  id: string;
  name: string;
  type: string;
  checked: boolean;
  chunkCount?: number;
  extractedTextLength?: number;
};
type Message = { role: "user" | "ai"; content: string };
type ChatApiResponse = {
  status?: string;
  answer?: string;
  message?: string;
};
type ArtifactApiResponse = {
  status?: string;
  content?: string;
  message?: string;
};
type CostApiResponse = {
  request_count?: number;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  total_requests?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
};

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

// ── Login Page (full screen) ───────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (user: StoredUser) => void }) {
  const [view, setView] = useState<"providers" | "email">("providers");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
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

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogle = () => {
    setGoogleLoading(true);
    setGoogleError("");

    // Mở popup OAuth của Google
    const clientId = "YOUR_GOOGLE_CLIENT_ID"; // ← thay bằng Client ID thật từ Google Cloud Console
    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent("openid email profile");
    const state = Math.random().toString(36).slice(2);

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=token` +
      `&scope=${scope}` +
      `&state=${state}`;

    const popup = window.open(oauthUrl, "google-login", "width=500,height=600,left=400,top=100");

    if (!popup) {
      setGoogleError("Popup was blocked. Please allow popups for this site.");
      setGoogleLoading(false);
      return;
    }

    // Lắng nghe kết quả từ popup
    const timer = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(timer);
          setGoogleLoading(false);
          return;
        }
        const url = popup.location.href;
        if (url.includes("access_token")) {
          clearInterval(timer);
          popup.close();

          // Lấy access_token từ URL fragment
          const params = new URLSearchParams(url.split("#")[1]);
          const accessToken = params.get("access_token");

          if (!accessToken) {
            setGoogleError("Failed to get access token.");
            setGoogleLoading(false);
            return;
          }

          // Gọi Google API để lấy thông tin user
          fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
            .then((r) => r.json())
            .then((profile) => {
              const user = {
                name: profile.name || profile.email.split("@")[0],
                email: profile.email,
              };
              saveStoredUser(user);
              onLogin(user);
            })
            .catch(() => {
              setGoogleError("Could not fetch your Google profile. Please try again.");
            })
            .finally(() => setGoogleLoading(false));
        }
      } catch {
        // Cross-origin — popup chưa redirect về, bỏ qua
      }
    }, 300);
  };

  return (
    <div className="login-page">
      <div className="login-page-glow" aria-hidden />

      {view === "email" && (
        <button
          type="button"
          className="login-back-btn"
          onClick={() => { setView("providers"); setError(""); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      )}

      <div className="login-page-inner">
        <div className="login-page-brand">
          <div className="login-page-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="login-page-brand-name">CorpusForge</span>
        </div>

        {view === "providers" ? (
          <div className="login-page-actions">
            <button
              type="button"
              className="login-btn-google"
              onClick={handleGoogle}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <span className="login-spinner" aria-hidden />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>

            {googleError && (
              <p className="login-google-error">{googleError}</p>
            )}

            <button type="button" className="login-btn-email" onClick={() => { setView("email"); setError(""); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Continue with email
            </button>
          </div>
        ) : (
          <div className="login-page-email-panel">
            <h2 className="login-email-title">{isSignUp ? "Create your account" : "Sign in with email"}</h2>
            <p className="login-email-sub">Your name will appear in chat and profile.</p>

            <form className="login-email-form" onSubmit={handleEmailSubmit}>
              {isSignUp && (
                <input
                  className="login-email-input"
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                />
              )}
              <input
                className="login-email-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
              <input
                className="login-email-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="login-email-error">{error}</p>}
              <button type="submit" className="login-btn-submit">
                {isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="login-email-switch">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                className="login-email-switch-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        )}

        <p className="login-page-legal">
          By continuing, you agree to our{" "}
          <a href="#" className="login-legal-link" onClick={(e) => e.preventDefault()}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="login-legal-link" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          .
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

  const send = async (text?: string) => {
    const content = text ?? input;
    if (!content.trim()) return;
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    const userMsg: Message = { role: "user", content };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const response = (await sendChatMessage(content)) as ChatApiResponse;

      const assistantText =
        response.status === "ok"
          ? response.answer || "No answer was returned by the backend."
          : response.message || "The backend could not answer this question.";

      setMessages((prev) => [...prev, { role: "ai", content: assistantText }]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not reach the backend. Please try again.";

      setMessages((prev) => [...prev, { role: "ai", content: message }]);
    }
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

// ── Artifact Generator Page ───────────────────────────────────────────────
function ArtifactGeneratorPage({
  label,
  icon,
  defaultCount,
  onGenerate,
}: {
  label: string;
  icon: string;
  defaultCount: number;
  onGenerate: (topic: string, count?: number) => Promise<unknown>;
}) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(String(defaultCount));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Please enter a topic.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const parsedCount = Number.parseInt(count, 10);
      const safeCount = Number.isNaN(parsedCount) ? defaultCount : parsedCount;

      const response = (await onGenerate(trimmedTopic, safeCount)) as ArtifactApiResponse;

      if (response.status === "ok") {
        setContent(response.content || "No content was returned.");
        return;
      }

      setContent("");
      setError(response.message || response.content || "Could not generate content.");
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Could not generate content.";
      setContent("");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">{icon}</span>
      <h2 className="placeholder-title">{label}</h2>
      <p className="placeholder-sub">Generate {label.toLowerCase()} from your uploaded document context.</p>

      <form className="artifact-form" onSubmit={handleGenerate}>
        <input
          className="artifact-input"
          placeholder={`Enter a topic for ${label.toLowerCase()}...`}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <input
          className="artifact-count"
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          aria-label="Count"
        />

        <button type="submit" className="placeholder-cta" disabled={loading}>
          {loading ? "Generating..." : `Generate ${label}`}
        </button>
      </form>

      {error && <p className="artifact-error">{error}</p>}
      {content && <pre className="artifact-content">{content}</pre>}
    </div>
  );
}

// ── Code Analysis Page ────────────────────────────────────────────────────
function CodeAnalysisPage({
  icon,
  onGenerate,
}: {
  icon: string;
  onGenerate: (topic: string) => Promise<unknown>;
}) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError("Please enter a topic or file focus.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = (await onGenerate(trimmedTopic)) as ArtifactApiResponse;

      if (response.status === "ok") {
        setContent(response.content || "No report was returned.");
        return;
      }

      setContent(response.content || "");
      setError(response.message || response.content || "Could not generate code analysis.");
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Could not generate code analysis.";
      setContent("");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">{icon}</span>
      <h2 className="placeholder-title">Code Analysis</h2>
      <p className="placeholder-sub">Generate a code review report from your uploaded source files.</p>

      <form className="artifact-form" onSubmit={handleGenerate}>
        <input
          className="artifact-input"
          placeholder="Enter a module, feature, or repo topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <button type="submit" className="placeholder-cta" disabled={loading}>
          {loading ? "Generating..." : "Generate Code Analysis"}
        </button>
      </form>

      {error && <p className="artifact-error">{error}</p>}
      {content && <pre className="artifact-content">{content}</pre>}
    </div>
  );
}

// ── Cost Page ──────────────────────────────────────────────────────────────
function CostPage() {
  const [stats, setStats] = useState([
    { label: "Request Count", value: "0" },
    { label: "Input Tokens", value: "0" },
    { label: "Output Tokens", value: "0" },
    { label: "Total Tokens", value: "0" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCost = async () => {
      setLoading(true);
      setError("");

      try {
        const response = (await getCost()) as CostApiResponse;
        if (!isMounted) {
          return;
        }

        const requestCount = response.request_count ?? response.total_requests ?? 0;
        const inputTokens = response.input_tokens ?? response.prompt_tokens ?? 0;
        const outputTokens = response.output_tokens ?? response.completion_tokens ?? 0;
        const totalTokens = response.total_tokens ?? inputTokens + outputTokens;

        setStats([
          { label: "Request Count", value: String(requestCount) },
          { label: "Input Tokens", value: String(inputTokens) },
          { label: "Output Tokens", value: String(outputTokens) },
          { label: "Total Tokens", value: String(totalTokens) },
        ]);
      } catch (fetchError) {
        if (!isMounted) {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : "Could not load cost data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCost();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-shell">
      <h2 className="page-title">Cost & Usage</h2>
      {loading && <p className="login-email-sub">Loading usage data…</p>}
      {error && <p className="artifact-error">{error}</p>}
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
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const getDocType = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    switch (extension) {
      case "pdf":
        return "PDF";
      case "md":
        return "MD";
      case "py":
        return "PY";
      case "js":
        return "JS";
      case "txt":
        return "TXT";
      default:
        return extension.toUpperCase() || "FILE";
    }
  };

  const handleAddDocumentClick = () => {
    setUploadError("");
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus(`Uploading ${file.name}...`);
    setUploadError("");

    try {
      const result = (await uploadDocument(file)) as {
        filename?: string;
        chunk_count?: number;
        extracted_text_length?: number;
        document_Type?: string;
      };

      const uploadedName = result.filename || file.name;
      const newDoc: Doc = {
        id: `${uploadedName}-${Date.now()}`,
        name: uploadedName,
        type: result.document_Type || getDocType(uploadedName),
        checked: true,
        chunkCount: result.chunk_count,
        extractedTextLength: result.extracted_text_length,
      };

      setDocs((prev) => [...prev, newDoc]);
      setUploadStatus(
        `Uploaded ${uploadedName}${typeof result.chunk_count === "number" ? ` (${result.chunk_count} chunks)` : ""
        }.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setUploadError(message);
      setUploadStatus("");
    } finally {
      input.value = "";
    }
  };

  const handleLogin = (user: StoredUser) => {
    setUserName(user.name);
    setUserEmail(user.email);
    setIsLoggedIn(true);
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

  const requireLogin = () => { };

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
        return (
          <ArtifactGeneratorPage
            label="Flashcards"
            icon="🃏"
            defaultCount={10}
            onGenerate={(topic, count) => generateFlashcards(topic, { count })}
          />
        );
      case "Quiz":
        return (
          <ArtifactGeneratorPage
            label="Quiz"
            icon="📝"
            defaultCount={5}
            onGenerate={(topic, count) => generateQuiz(topic, { count })}
          />
        );
      case "Code Analysis":
        return <CodeAnalysisPage icon="💻" onGenerate={(topic) => generateCodeAnalysis(topic)} />;
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

  if (!isLoggedIn) {
    return (
      <>
        <style>{CSS}</style>
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
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
            <button type="button" className="add-doc-btn" onClick={handleAddDocumentClick}>
              + Add document
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.md,.py,.js,.txt"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {(uploadStatus || uploadError) && (
              <p className={`sidebar-upload-status ${uploadError ? "error" : ""}`}>
                {uploadError || uploadStatus}
              </p>
            )}
            {docs.length > 0 && (
              <p className="sidebar-upload-hint">
                {docs.length} document{docs.length === 1 ? "" : "s"} in corpus
              </p>
            )}
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
    --bg:            #FFFFFF;
    --panel:         #FFFFFF;
    --card:          #FFFFFF;
    --surface-subtle:#F3F4F6;
    --border:        #E5E7EB;
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

  .artifact-form {
    margin-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: min(520px, 100%);
  }

  .artifact-input,
  .artifact-count {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    background: #fff;
    color: var(--text);
  }

  .artifact-count {
    max-width: 140px;
  }

  .artifact-error {
    margin-top: 10px;
    color: #b91c1c;
    font-size: 13px;
  }

  .artifact-content {
    margin-top: 12px;
    width: min(760px, 100%);
    max-height: 360px;
    overflow: auto;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    font-size: 12px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }

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

  .nav-item:hover { background: var(--surface-subtle); color: var(--text); }
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

  .sidebar-doc:hover { background: var(--surface-subtle); }
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

  .sidebar-user:hover { background: var(--surface-subtle); }

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

  .logout-btn:hover { background: var(--surface-subtle); color: var(--text); }

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
    background: var(--surface-subtle);
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

  /* ── Login page (full screen) ── */
  .login-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    overflow: hidden;
  }

  .login-page-glow {
    position: absolute;
    top: -120px;
    left: -80px;
    width: 420px;
    height: 420px;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(55, 86, 171, 0.22) 0%,
      rgba(147, 197, 253, 0.15) 35%,
      rgba(251, 207, 232, 0.12) 55%,
      transparent 70%
    );
    pointer-events: none;
    filter: blur(2px);
  }

  .login-page-inner {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .login-page-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 40px;
  }

  .login-page-logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #1C1A17;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-page-brand-name {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.3px;
    color: #1C1A17;
  }

  .login-page-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
  }

  .login-btn-google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 52px;
    border-radius: 14px;
    border: none;
    background: #1C1A17;
    color: white;
    font-size: 15px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }

  .login-btn-google:hover { opacity: 0.9; transform: translateY(-1px); }

  .login-social-row {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .login-social-btn {
    flex: 1;
    height: 52px;
    border-radius: 14px;
    border: none;
    background: #F3F4F6;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
  }

  .login-social-btn:hover { background: #E5E7EB; }

  .login-btn-email {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 52px;
    border-radius: 14px;
    border: none;
    background: #F3F4F6;
    color: #1C1A17;
    font-size: 15px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }

  .login-btn-email:hover { background: #E5E7EB; }

  .login-page-email-panel {
    width: 100%;
    text-align: left;
    margin-bottom: 28px;
  }

  .login-back-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
    z-index: 10;
  }

  .login-back-btn:hover { background: #F3F4F6; color: var(--text); }

  .login-email-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.4px;
    margin-bottom: 6px;
    text-align: center;
  }

  .login-email-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 20px;
    text-align: center;
  }

  .login-email-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .login-email-input {
    height: 48px;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    background: #F9FAFB;
    padding: 0 14px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .login-email-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(55, 86, 171, 0.12);
    background: white;
  }

  .login-email-error {
    font-size: 12px;
    color: #B91C1C;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    padding: 8px 12px;
  }

  .login-btn-submit {
    height: 48px;
    margin-top: 4px;
    border-radius: 12px;
    border: none;
    background: #1C1A17;
    color: white;
    font-size: 15px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s;
  }

  .login-btn-submit:hover { background: #000000; }

  .login-email-switch {
    margin-top: 16px;
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
  }

  .login-email-switch-btn {
    background: none;
    border: none;
    color: #1C1A17;
    font-size: 13px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .login-page-legal {
    font-size: 12px;
    color: #6B7280;
    line-height: 1.5;
    max-width: 320px;
  }

  .login-legal-link {
    color: #374151;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .login-legal-link:hover { color: var(--accent); }

  .login-btn-google:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }

  .login-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .login-google-error {
    font-size: 12px;
    color: #B91C1C;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 10px;
    padding: 10px 14px;
    text-align: left;
    line-height: 1.5;
  }
`;
