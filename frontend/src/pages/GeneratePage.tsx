import React, { useState } from "react";
import { generateFlashcards, generateQuiz, generateCodeReview } from "../api";

export default function GeneratePage({ activeDocs }: { activeDocs: string[] }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    audience_level: "intermediate",
    output_format: "markdown",
    tone: "neutral",
    creativity: 0.5,
    task_instructions: "",
  });

  const run = async (fn: Function) => {
    if (activeDocs.length === 0) return alert("Select documents first.");
    setLoading(true);
    setResult("");
    const res = await fn(activeDocs, settings);
    const data = res.data;
    setResult(JSON.stringify(data.flashcards ?? data.quiz ?? data.report, null, 2));
    setLoading(false);
  };

  return (
    <div>
      <h2>Generate Knowledge Artifacts</h2>
      {activeDocs.length === 0 && <p style={{ color: "orange" }}>No documents selected.</p>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "12px 0" }}>
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
        <input placeholder="Custom instructions (optional)" value={settings.task_instructions}
          onChange={e => setSettings({ ...settings, task_instructions: e.target.value })} style={{ width: 260 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => run(generateFlashcards)}>Flashcards</button>
        <button onClick={() => run(generateQuiz)}>Quiz</button>
        <button onClick={() => run(generateCodeReview)}>Code Review</button>
      </div>
      {loading && <p>Generating...</p>}
      {result && (
        <pre style={{ background: "#fff", border: "1px solid #ccc", padding: 16, borderRadius: 6, overflow: "auto", maxHeight: 500 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
