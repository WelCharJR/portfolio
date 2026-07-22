import { projects } from "../data/projects.js";
import ProjectCard from "../components/ProjectCard.jsx";

export default function Home() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "60px 20px 20px" }}>
      <span className="mono" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: "0.05em" }}>
        PORTFÓLIO
      </span>
      <h1 className="display" style={{ fontSize: 34, fontWeight: 700, margin: "10px 0 14px", lineHeight: 1.15 }}>
        Pequenos sistemas, testados de verdade.
      </h1>
      <p style={{ fontSize: 15, color: "var(--ink-dim)", maxWidth: 560, lineHeight: 1.6, marginBottom: 40 }}>
        Cada projeto abaixo roda ao vivo — não são screenshots. Clique pra abrir a demo funcionando.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </div>
  );
}
