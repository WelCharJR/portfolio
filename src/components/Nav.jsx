import { Link } from "react-router-dom";

export default function Nav() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px 0" }}>
      <Link to="/" className="site-link" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 30, height: 30, borderRadius: 4, border: "1.5px solid var(--ink)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>W</span>
        </div>
        <span className="display" style={{ fontSize: 16, fontWeight: 700 }}>Wel — projetos</span>
      </Link>
    </div>
  );
}
