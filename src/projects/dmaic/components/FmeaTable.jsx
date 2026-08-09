import { fmea } from "../data/mockData.js";

export default function FmeaTable() {
  return (
    <table className="dmaic-table">
      <thead><tr><th>Modo de falha</th><th>Efeito</th><th>Causa</th><th>S</th><th>O</th><th>D</th><th>NPR</th></tr></thead>
      <tbody>
        {fmea.map((r) => (
          <tr key={r.modo}>
            <td>{r.modo}</td>
            <td style={{ color: "var(--ink-dim)" }}>{r.efeito}</td>
            <td>{r.causa}</td>
            <td className="mono">{r.s}</td>
            <td className="mono">{r.o}</td>
            <td className="mono">{r.d}</td>
            <td className="mono" style={{ fontWeight: 700, color: r.npr >= 150 ? "var(--red)" : "var(--ink)" }}>{r.npr}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
