import React, { useEffect, useState } from "react";
import { getCost } from "../api";

export default function CostPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { getCost().then(r => setStats(r.data)); }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>Cost & Usage</h2>
      <table style={{ borderCollapse: "collapse", marginTop: 16 }}>
        <tbody>
          {Object.entries(stats).map(([k, v]) => (
            <tr key={k} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "8px 16px 8px 0", fontWeight: "bold" }}>{k.replace(/_/g, " ")}</td>
              <td style={{ padding: 8 }}>{String(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={{ marginTop: 16 }} onClick={() => getCost().then(r => setStats(r.data))}>Refresh</button>
    </div>
  );
}
