import Sparkline from "./Sparkline.jsx";

export default function FlightRecorder({ history }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Registrador de voo — últimos 60s
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <Sparkline label="Altitude" data={history.map((h) => ({ v: h.altitude }))} unit=" ft" color="var(--cyan)" />
        <Sparkline label="Velocidade" data={history.map((h) => ({ v: h.airspeed }))} unit=" kt" color="var(--green)" />
        <Sparkline label="Razão de subida" data={history.map((h) => ({ v: h.vspeed }))} unit=" fpm" color="var(--amber)" />
      </div>
    </div>
  );
}
