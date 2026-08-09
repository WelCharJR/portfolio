import RunChart from "../components/RunChart.jsx";
import Histogram from "../components/Histogram.jsx";
import Stat from "../components/Stat.jsx";

export default function MeasurePanel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div className="card">
        <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Linha de base — taxa de NC (12 semanas)</div>
        <RunChart />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Distribuição do torque aplicado</div>
          <Histogram />
        </div>
        <div className="card">
          <div className="display" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Capacidade do processo</div>
          <div style={{ display: "flex", gap: 20 }}>
            <Stat label="Cpk atual" value="0,71" tone="red" />
            <Stat label="Cpk alvo" value="≥ 1,33" />
            <Stat label="Amostra" value="n = 480" />
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-dim)", marginTop: 12, lineHeight: 1.6 }}>
            Cpk abaixo de 1,0 indica processo incapaz — o histograma mostra a distribuição
            "escorregando" pra fora do LSE mesmo sem causa especial isolada, confirmando
            que o problema é sistêmico.
          </p>
        </div>
      </div>
    </div>
  );
}
