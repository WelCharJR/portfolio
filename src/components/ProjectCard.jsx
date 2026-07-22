import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ProjectCard({ project }) {
  return (
    <Link to={`/projetos/${project.slug}`} className="site-link">
      <div className="site-card" style={{ padding: "22px 22px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <span className="display" style={{ fontSize: 18, fontWeight: 700 }}>{project.title}</span>
          <ArrowUpRight size={18} color="var(--ink-faint)" />
        </div>
        <p style={{ fontSize: 13.5, color: "var(--ink-dim)", lineHeight: 1.5, margin: "0 0 16px" }}>
          {project.tagline}
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {project.tags.map((t) => (
            <span key={t} className="site-tag">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
