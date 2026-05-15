import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import CorpusPage from "./pages/CorpusPage";
import ChatPage from "./pages/ChatPage";
import GeneratePage from "./pages/GeneratePage";
import CostPage from "./pages/CostPage";

export default function App() {
  const [activeDocs, setActiveDocs] = useState<string[]>([]);

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ borderBottom: "2px solid #333", paddingBottom: 8 }}>⚒ Corpus Forge</h1>
      <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <Link to="/">Corpus</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/generate">Generate</Link>
        <Link to="/cost">Cost</Link>
      </nav>
      <Routes>
        <Route path="/" element={<CorpusPage activeDocs={activeDocs} setActiveDocs={setActiveDocs} />} />
        <Route path="/chat" element={<ChatPage activeDocs={activeDocs} />} />
        <Route path="/generate" element={<GeneratePage activeDocs={activeDocs} />} />
        <Route path="/cost" element={<CostPage />} />
      </Routes>
    </div>
  );
}
