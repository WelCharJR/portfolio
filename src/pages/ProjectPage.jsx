import { lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getProject } from "../data/projects.js";

// Explicit registry (rather than a template-literal dynamic import) keeps the
// bundler's code-splitting predictable — each project only loads when its page opens.
const registry = {
  rastro: lazy(() => import("../projects/rastro/App.jsx")),
  "glass-cockpit": lazy(() => import("../projects/glass-cockpit/App.jsx")),
  dmaic: lazy(() => import("../projects/dmaic/App.jsx")),
  "weapons-display": lazy(() => import("../projects/weapons-display/App.jsx")),
  opt: lazy(() => import("../projects/opt/App.jsx")),\n  logistica: lazy(() => import("../projects/logistica/App.jsx")),
};

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProject(slug);
  const Demo = registry[slug];

  if (!project || !Demo) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "60px 20px" }}>
        <p>Projeto não encontrado.</p>
        <Link to="/" className="site-link" style={{ color: "var(--accent)" }}>← voltar</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "40px 20px 20px" }}>
      <Link
        to="/"
        className="site-link focus-ring"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-dim)", marginBottom: 24 }}
      >
        <ArrowLeft size={14} /> todos os projetos
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <h1 className="display" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{project.title}</h1>
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>{project.year}</span>
      </div>

      <p style={{ fontSize: 15, color: "var(--ink-dim)", maxWidth: 640, lineHeight: 1.6, marginBottom: 18 }}>
        {project.summary}
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 30 }}>
        {project.tags.map((t) => (
          <span key={t} className="site-tag">{t}</span>
        ))}
      </div>

      <div className="demo-frame" style={{ marginBottom: 34 }}>
        <div className="demo-frame-bar">
          <span className="demo-frame-dot" />
          <span className="demo-frame-dot" />
          <span className="demo-frame-dot" />
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", marginLeft: 6 }}>demo ao vivo</span>
        </div>
        <Suspense fallback={<div style={{ padding: 60, textAlign: "center", color: "#7d8489" }}>carregando demo...</div>}>
          <Demo />
        </Suspense>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30, marginBottom: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Destaques técnicos
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "var(--ink-dim)", lineHeight: 1.7 }}>
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Stack
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {project.stack.map((s) => (
              <span key={s} className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
