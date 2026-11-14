import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="rastro-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,11,12,0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 90,
            padding: 20,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--panel-raised)",
              border: "1px solid var(--line)",
              borderRadius: 7,
              padding: "20px 22px 22px",
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className="display" style={{ fontSize: 15.5, fontWeight: 600 }}>{title}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="focus-ring"
                style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", display: "flex", padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
