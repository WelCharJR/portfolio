import { Plane, UserRound } from "lucide-react";

export default function LoginScreen({ operadores, onSelecionar }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <Plane size={22} color="var(--amber)" />
          <span className="display" style={{ fontSize: 24, fontWeight: 700 }}>RASTRO</span>
        </div>
        <p style={{ color: "var(--text-dim)", margin: "0 0 8px" }}>Acesso de demonstração</p>
        <p style={{ color: "var(--text-faint)", fontSize: 13, margin: "0 0 22px" }}>
          Escolha um perfil para continuar. Esta seleção é apenas local e não usa senha.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {operadores.map((operador) => (
            <button
              key={operador.matricula}
              type="button"
              className="ghost-btn focus-ring"
              onClick={() => onSelecionar(operador.nome)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", padding: 16 }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <UserRound size={18} color="var(--amber)" />
                <span>
                  <span style={{ display: "block", color: "var(--text)" }}>{operador.nome}</span>
                  <span className="mono" style={{ display: "block", color: "var(--text-faint)", fontSize: 11 }}>{operador.matricula}</span>
                </span>
              </span>
              <span style={{ color: "var(--amber)", fontSize: 12 }}>Entrar →</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
