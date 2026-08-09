import Fishbone from "../components/Fishbone.jsx";
import ParetoChart from "../components/ParetoChart.jsx";
import TwoGroupTest from "../components/TwoGroupTest.jsx";
import { fiveWhys } from "../data/mockData.js";

export default function AnalyzePanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card">
        <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Diagrama de Ishikawa (6M)</div>
        <Fishbone />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Pareto das causas de NC</div>
          <ParetoChart />
        </div>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>5 Porquês — causa principal</div>
          {fiveWhys.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>{i + 1}</span>
              <span style={{ fontSize: 12.5, color: "var(--ink-dim)", lineHeight: 1.5 }}>{w}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, padding: "8px 10px", background: "var(--green-soft)", borderRadius: 5 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>causa raiz: </span>
            <span style={{ fontSize: 12, color: "var(--ink)" }}>ausência de plano de calibração preventiva das chaves</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Teste de hipótese — validando a causa raiz</div>
        <TwoGroupTest />
      </div>
    </div>
  );
}
