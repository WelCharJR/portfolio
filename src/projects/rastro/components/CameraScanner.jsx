import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera } from "lucide-react";
import Modal from "./Modal.jsx";

export default function CameraScanner({ open, onClose, onDetected }) {
  const videoRef = useRef(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    let ativo = true;
    let stream;
    let frame;
    let lendo = false;
    let encontrou = false;
    setErro("");

    async function iniciar() {
      if (!navigator.mediaDevices?.getUserMedia || !("BarcodeDetector" in window)) {
        setErro("Leitura pela câmera indisponível neste navegador. Feche esta janela e digite o código manualmente.");
        return;
      }
      try {
        const formatos = await window.BarcodeDetector.getSupportedFormats();
        const detector = new window.BarcodeDetector({ formats: formatos });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (!ativo) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        async function procurar() {
          if (!ativo) return;
          frame = requestAnimationFrame(procurar);
          if (lendo || videoRef.current.readyState < 2) return;
          lendo = true;
          try {
            const codigos = await detector.detect(videoRef.current);
            if (codigos.length && ativo && !encontrou) {
              encontrou = true;
              onDetected(codigos[0].rawValue);
            }
          } catch {
            setErro("Não foi possível ler o código. Tente aproximar a câmera ou digite o código manualmente.");
          } finally {
            lendo = false;
          }
        }
        procurar();
      } catch {
        setErro("Não foi possível acessar a câmera. Verifique a permissão do navegador ou digite o código manualmente.");
      }
    }

    iniciar();
    return () => {
      ativo = false;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [open, onDetected]);

  return (
    <Modal open={open} onClose={onClose} title="Escanear ferramenta">
      <div style={{ display: "grid", gap: 12 }}>
        {erro ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, color: "var(--amber)", fontSize: 13 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} /> {erro}
          </div>
        ) : (
          <>
            <video ref={videoRef} muted playsInline style={{ width: "100%", maxHeight: 280, background: "#080909", borderRadius: 5 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-dim)", fontSize: 13 }}>
              <Camera size={15} color="var(--amber)" /> Aponte para o código de barras ou QR code.
            </div>
          </>
        )}
        <button type="button" className="ghost-btn focus-ring" onClick={onClose}>Fechar</button>
      </div>
    </Modal>
  );
}
