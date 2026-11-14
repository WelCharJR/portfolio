import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 100, display: "flex", flexDirection: "column", gap: 8 }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="rastro-root"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 6,
              minWidth: 260,
              maxWidth: 340,
              background: "var(--panel-raised)",
              border: `1px solid ${toast.tone === "red" ? "#5a2f2b" : "#2e5a3a"}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            {toast.tone === "red" ? (
              <AlertTriangle size={17} color="var(--red)" style={{ flexShrink: 0 }} />
            ) : (
              <CheckCircle2 size={17} color="var(--green)" style={{ flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{toast.message}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar notificação"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 2, display: "flex" }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
