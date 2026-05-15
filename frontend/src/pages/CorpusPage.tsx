import React, { useEffect, useState } from "react";
import { getDocuments, uploadDocument, deleteDocument } from "../api";

interface Doc { id: string; filename: string; type: string; chunk_count: number; created_at: string; }

interface Props {
  activeDocs: string[];
  setActiveDocs: (ids: string[]) => void;
}

export default function CorpusPage({ activeDocs, setActiveDocs }: Props) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);

  const load = () => getDocuments().then(r => setDocs(r.data.documents));
  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadDocument(file);
    await load();
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    setActiveDocs(activeDocs.filter(d => d !== id));
    await load();
  };

  const toggleActive = (id: string) => {
    setActiveDocs(activeDocs.includes(id) ? activeDocs.filter(d => d !== id) : [...activeDocs, id]);
  };

  return (
    <div>
      <h2>Corpus Management</h2>
      <div style={{ margin: "16px 0" }}>
        <label>
          <input type="file" onChange={handleUpload} accept=".pdf,.md,.txt,.py,.js,.ts,.java,.cpp,.c" />
        </label>
        {uploading && <span style={{ marginLeft: 8 }}>Uploading...</span>}
      </div>
      {docs.length === 0 && <p>No documents yet. Upload one above.</p>}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ padding: 8, textAlign: "left" }}>Active</th>
            <th style={{ padding: 8, textAlign: "left" }}>Filename</th>
            <th style={{ padding: 8, textAlign: "left" }}>Type</th>
            <th style={{ padding: 8, textAlign: "left" }}>Chunks</th>
            <th style={{ padding: 8, textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => (
            <tr key={doc.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: 8 }}>
                <input type="checkbox" checked={activeDocs.includes(doc.id)} onChange={() => toggleActive(doc.id)} />
              </td>
              <td style={{ padding: 8 }}>{doc.filename}</td>
              <td style={{ padding: 8 }}>{doc.type}</td>
              <td style={{ padding: 8 }}>{doc.chunk_count}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => handleDelete(doc.id)} style={{ color: "red" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 12, color: "#666" }}>{activeDocs.length} document(s) selected for AI interaction.</p>
    </div>
  );
}
