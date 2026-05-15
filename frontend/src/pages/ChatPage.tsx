import React, { useState } from "react";
import { sendChat } from "../api";

interface Message { role: "user" | "assistant"; content: string; }

export default function ChatPage({ activeDocs }: { activeDocs: string[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ audience_level: "intermediate", tone: "neutral", creativity: 0.7 });

  const send = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    const res = await sendChat(newMessages, activeDocs, settings);
    setMessages([...newMessages, { role: "assistant", content: res.data.response }]);
    setLoading(false);
  };

  return (
    <div>
      <h2>Chat with Corpus</h2>
      {activeDocs.length === 0 && <p style={{ color: "orange" }}>No documents selected. Go to Corpus tab to select documents.</p>}
      <div style={{ display: "flex", gap: 16, margin: "12px 0" }}>
        <select value={settings.audience_level} onChange={e => setSettings({ ...settings, audience_level: e.target.value })} style={{ width: "auto" }}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>
        <select value={settings.tone} onChange={e => setSettings({ ...settings, tone: e.target.value })} style={{ width: "auto" }}>
          <option value="neutral">Neutral</option>
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
        </select>
        <input type="range" min={0} max={1} step={0.1} value={settings.creativity}
          onChange={e => setSettings({ ...settings, creativity: parseFloat(e.target.value) })}
          style={{ width: 100 }} title={`Creativity: ${settings.creativity}`} />
        <span>Creativity: {settings.creativity}</span>
      </div>
      <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: 12, minHeight: 300, marginBottom: 12, background: "#fff" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, textAlign: m.role === "user" ? "right" : "left" }}>
            <span style={{ background: m.role === "user" ? "#0066cc" : "#eee", color: m.role === "user" ? "#fff" : "#222",
              padding: "6px 12px", borderRadius: 16, display: "inline-block", maxWidth: "80%", whiteSpace: "pre-wrap" }}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: "#999" }}>Thinking...</p>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask something about your documents..." />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
