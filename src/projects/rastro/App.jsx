import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./theme.css";
import Dashboard from "./screens/Dashboard.jsx";
import RegistroOperacao from "./screens/RegistroOperacao.jsx";
import Toast from "./components/Toast.jsx";
import { RastroProvider } from "./state/RastroContext.jsx";

export default function App() {
  const [tela, setTela] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = "green") => {
    const id = Date.now();
    setToast({ id, message, tone });
    window.setTimeout(() => {
      setToast((t) => (t && t.id === id ? null : t));
    }, 3600);
  }, []);

  return (
    <RastroProvider>
      <div className="rastro-root" style={{ position: "relative" }}>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <AnimatePresence mode="wait">
          {tela === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Dashboard onNovoRegistro={() => setTela("registro")} notify={notify} />
            </motion.div>
          ) : (
            <motion.div
              key="registro"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <RegistroOperacao onVoltar={() => setTela("dashboard")} notify={notify} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RastroProvider>
  );
}
