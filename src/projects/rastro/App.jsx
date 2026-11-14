import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./theme.css";
import Dashboard from "./screens/Dashboard.jsx";
import RegistroOperacao from "./screens/RegistroOperacao.jsx";
import Toast from "./components/Toast.jsx";
import { RastroProvider, useRastroState } from "./state/RastroContext.jsx";
import LoginScreen from "./screens/LoginScreen.jsx";

function RastroApp() {
  const [tela, setTela] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const { operadores } = useRastroState();
  const [operadorAtivo, setOperadorAtivo] = useState(() => {
    try { return window.localStorage.getItem("rastro-demo-operador") || ""; } catch { return ""; }
  });

  const selecionarOperador = (nome) => {
    try { window.localStorage.setItem("rastro-demo-operador", nome); } catch { /* sessão segue em memória */ }
    setOperadorAtivo(nome);
  };

  const sair = () => {
    try { window.localStorage.removeItem("rastro-demo-operador"); } catch { /* sessão segue em memória */ }
    setOperadorAtivo("");
    setTela("dashboard");
  };

  const notify = useCallback((message, tone = "green") => {
    const id = Date.now();
    setToast({ id, message, tone });
    window.setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t));
    }, 3600);
  }, []);

  return (
      <div className="rastro-root" style={{ position: "relative" }}>
        <Toast toast={toast} onClose={() => setToast(null)} />
        {!operadores.some((operador) => operador.nome === operadorAtivo) ? (
          <LoginScreen operadores={operadores} onSelecionar={selecionarOperador} />
        ) : (
        <AnimatePresence mode="wait">
          {tela === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Dashboard onNovoRegistro={() => setTela("registro")} notify={notify} operadorAtivo={operadorAtivo} onSair={sair} />
            </motion.div>
          ) : (
            <motion.div
              key="registro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <RegistroOperacao onVoltar={() => setTela("dashboard")} notify={notify} operadorAtivo={operadorAtivo} />
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
  );
}

export default function App() {
  return (
    <RastroProvider>
      <RastroApp />
    </RastroProvider>
  );
}
