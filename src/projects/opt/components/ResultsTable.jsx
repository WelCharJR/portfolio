import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ResultsTable({ results, recommended, allInsufficient }) {
  return (
    <>
      <table className="opt-table">
        <thead><tr><th>FLAP</th><th>V1</th><th>VR</th><th>V2</th><th>TOD</th><th>MAX WT</th><th></th></tr></thead>
        <tbody>
          {results.map((r) => {
            const isRec = r.id === recommended.id;
            return (
              <tr key={r.id} style={{ background: isRec ? "rgba(79,214,107,0.08)" : "none" }}>
                <td style={{ color: isRec ? "var(--green)" : "var(--white)", fontWeight: isRec ? 700 : 400 }}>{r.id}</td>
                <td>{r.V1.toFixed(0)}</td>
                <td>{r.VR.toFixed(0)}</td>
                <td>{r.V2.toFixed(0)}</td>
                <td style={{ color: r.ok ? "var(--white)" : "var(--red)" }}>{r.distance.toFixed(0)}M</td>
                <td style={{ color: "var(--cyan)" }}>{(r.limitWeight / 1000).toFixed(1)}T</td>
                <td>{r.ok ? <CheckCircle2 size={13} color="var(--green)" /> : <AlertTriangle size={13} color="var(--red)" />}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: 12, padding: "9px 12px", borderRadius: 4, background: allInsufficient ? "rgba(224,92,80,0.1)" : "rgba(79,214,107,0.08)", border: `1px solid ${allInsufficient ? "#5a2f2b" : "#255a34"}` }}>
        {allInsufficient ? (
          <span className="mono" style={{ fontSize: 11.5, color: "var(--red)" }}>
            ⚠ NENHUM FLAP ATENDE A PISTA COM ESSE PESO — MAX WT do menos penalizante: {(results[results.length - 1].limitWeight / 1000).toFixed(1)}T
          </span>
        ) : (
          <span className="mono" style={{ fontSize: 11.5, color: "var(--green)" }}>
            FLAP RECOMENDADO: {recommended.id} — menor flap que atende a pista (melhor gradiente de subida)
          </span>
        )}
      </div>
    </>
  );
}
