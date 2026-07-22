import { useState } from "react";
import "./theme.css";
import Dashboard from "./screens/Dashboard.jsx";
import RegistroOperacao from "./screens/RegistroOperacao.jsx";

export default function App() {
  const [tela, setTela] = useState("dashboard");

  return (
    <div className="rastro-root">
      {tela === "dashboard" ? (
        <Dashboard onNovoRegistro={() => setTela("registro")} />
      ) : (
        <RegistroOperacao onVoltar={() => setTela("dashboard")} />
      )}
    </div>
  );
}
