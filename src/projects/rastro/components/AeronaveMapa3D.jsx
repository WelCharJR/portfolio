import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useRastroDispatch, useRastroState } from "../state/RastroContext.jsx";

const ZONAS = [
  { id: "asa", nome: "Asa", pontos: /longarina|nervura|skin panel/i, posicao: [-9, 3.5, -4] },
  { id: "trem-pouso", nome: "Trem de pouso", pontos: /trem de pouso/i, posicao: [0, 1, 8] },
];

const panelStyle = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 5,
  padding: 16,
};

function formatarData(value) {
  if (!value) return "data não informada";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function formatarOperacaoDate(operacao) {
  return [operacao.data, operacao.hora].filter(Boolean).join(" · ") || "data não informada";
}

function liberarModelo(root) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material?.dispose());
  });
}

export default function AeronaveMapa3D({ operadorAtivo }) {
  const { aeronaves, operacoes, pontos, atividades = [] } = useRastroState();
  const dispatch = useRastroDispatch();
  const canvasHost = useRef(null);
  const markerMeshes = useRef([]);
  const [aeronaveSerie, setAeronaveSerie] = useState(aeronaves[0]?.serie || "");
  const [zonaId, setZonaId] = useState(ZONAS[0].id);
  const [carregando, setCarregando] = useState(true);
  const [erroModelo, setErroModelo] = useState("");

  const zonaSelecionada = ZONAS.find((zona) => zona.id === zonaId) || ZONAS[0];
  const atividadeAtiva = atividades.find((atividade) =>
    atividade.aeronaveSerie === aeronaveSerie && atividade.zonaId === zonaId && !atividade.encerradaEm
  );
  const historicoAtividades = atividades.filter((atividade) =>
    atividade.aeronaveSerie === aeronaveSerie && atividade.zonaId === zonaId
  );
  const operacoesZona = useMemo(() => {
    const pontosDaZona = new Set(pontos.filter((ponto) => zonaSelecionada.pontos.test(ponto.label)).map((ponto) => ponto.label));
    return operacoes.filter((operacao) =>
      operacao.aeronaveSerie === aeronaveSerie && pontosDaZona.has(operacao.ponto)
    );
  }, [operacoes, pontos, aeronaveSerie, zonaSelecionada]);

  useEffect(() => {
    if (!aeronaves.some((aeronave) => aeronave.serie === aeronaveSerie)) {
      setAeronaveSerie(aeronaves[0]?.serie || "");
    }
  }, [aeronaves, aeronaveSerie]);

  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return undefined;

    let disposed = false;
    let controls;
    let renderer;
    let observer;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#191c1e");
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 300);
    camera.position.set(36, 23, 42);
    scene.add(new THREE.HemisphereLight(0xe9f2ff, 0x48423a, 2));
    const directional = new THREE.DirectionalLight(0xfff2dc, 2.4);
    directional.position.set(-20, 35, 30);
    scene.add(directional);

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.domElement.setAttribute("aria-label", "Modelo tridimensional esquemático do avião; use os botões de zona para selecionar uma área");
      renderer.domElement.setAttribute("role", "img");
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 5, 0);
      controls.minDistance = 18;
      controls.maxDistance = 100;

      const resize = () => {
        if (!renderer || !host.clientWidth || !host.clientHeight) return;
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(host.clientWidth, host.clientHeight);
      };
      observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();

      const markers = ZONAS.map((zona) => {
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.8, 20, 16),
          new THREE.MeshStandardMaterial({ color: "#56b4d3", emissive: "#12333d", roughness: 0.35 })
        );
        marker.position.set(...zona.posicao);
        marker.userData.zonaId = zona.id;
        marker.userData.zonaNome = zona.nome;
        scene.add(marker);
        return marker;
      });
      markerMeshes.current = markers;

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const onClick = (event) => {
        const bounds = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const marker = raycaster.intersectObjects(markerMeshes.current)[0]?.object;
        if (marker) setZonaId(marker.userData.zonaId);
      };
      renderer.domElement.addEventListener("click", onClick);

      new GLTFLoader().load(
        `${import.meta.env.BASE_URL}models/rastro/narrow-body-airliner.glb`,
        ({ scene: model }) => {
          if (disposed) {
            liberarModelo(model);
            return;
          }
          scene.add(model);
          setCarregando(false);
          controls.target.set(0, 5, 0);
        },
        undefined,
        () => {
          if (!disposed) {
            setErroModelo("Não foi possível carregar o modelo do avião.");
            setCarregando(false);
          }
        }
      );

      renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
      });

      return () => {
        disposed = true;
        observer?.disconnect();
        renderer?.domElement.removeEventListener("click", onClick);
        renderer?.setAnimationLoop(null);
        controls?.dispose();
        liberarModelo(scene);
        renderer?.dispose();
        renderer?.domElement.remove();
        markerMeshes.current = [];
      };
    } catch {
      setErroModelo("Este navegador não conseguiu iniciar a visualização 3D.");
      setCarregando(false);
      observer?.disconnect();
      controls?.dispose();
      liberarModelo(scene);
      renderer?.dispose();
      renderer?.domElement.remove();
    }
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    markerMeshes.current.forEach((marker) => {
      const ativa = atividades.some((atividade) =>
        atividade.aeronaveSerie === aeronaveSerie && atividade.zonaId === marker.userData.zonaId && !atividade.encerradaEm
      );
      const selecionada = zonaId === marker.userData.zonaId;
      marker.material.color.set(selecionada ? "#f2a900" : ativa ? "#5fae7c" : "#56b4d3");
      marker.material.emissive.set(selecionada ? "#674400" : ativa ? "#1a432a" : "#12333d");
      marker.scale.setScalar(selecionada ? 1.25 : ativa ? 1.12 : 1);
    });
  }, [atividades, aeronaveSerie, zonaId]);

  function iniciarAtividade() {
    if (!operadorAtivo || atividadeAtiva) return;
    dispatch({ type: "INICIAR_ATIVIDADE", payload: { aeronaveSerie, zonaId, operador: operadorAtivo } });
  }

  function encerrarAtividade() {
    if (!atividadeAtiva) return;
    dispatch({ type: "ENCERRAR_ATIVIDADE", payload: { id: atividadeAtiva.id } });
  }

  return (
    <section aria-label="Mapa 3D de operações" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...panelStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="display" style={{ fontSize: 15, fontWeight: 600 }}>Localização esquemática das operações</div>
          <div style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 3 }}>Os pontos indicam áreas aproximadas, não posições reais de trabalho.</div>
        </div>
        <label style={{ color: "var(--text-dim)", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
          Aeronave
          <select className="field-input focus-ring" value={aeronaveSerie} onChange={(event) => setAeronaveSerie(event.target.value)} style={{ minWidth: 220, padding: "8px 10px", fontSize: 12 }}>
            {aeronaves.map((aeronave) => <option key={aeronave.serie} value={aeronave.serie}>{aeronave.serie}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 14 }}>
        <div style={{ ...panelStyle, padding: 0, overflow: "hidden" }}>
          <div ref={canvasHost} style={{ height: 420, position: "relative", cursor: "grab" }}>
            {carregando && !erroModelo && <div style={{ position: "absolute", zIndex: 1, inset: 0, display: "grid", placeItems: "center", color: "var(--text-dim)", background: "#191c1e" }}>Carregando avião 3D…</div>}
            {erroModelo && <div role="status" style={{ position: "absolute", zIndex: 1, inset: 0, display: "grid", placeItems: "center", padding: 24, textAlign: "center", color: "var(--red)", background: "#191c1e" }}>{erroModelo}</div>}
          </div>
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", color: "var(--text-faint)", fontSize: 11.5 }}>Arraste para girar · role para aproximar · selecione um marcador ou uma zona ao lado.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={panelStyle}>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Zonas do avião</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              {ZONAS.map((zona) => {
                const ativa = atividades.some((atividade) => atividade.aeronaveSerie === aeronaveSerie && atividade.zonaId === zona.id && !atividade.encerradaEm);
                return <button key={zona.id} type="button" className="ghost-btn focus-ring" onClick={() => setZonaId(zona.id)} aria-pressed={zonaId === zona.id} style={{ padding: "10px 8px", borderColor: zonaId === zona.id ? "var(--amber)" : undefined, color: zonaId === zona.id ? "var(--text)" : undefined, fontSize: 12 }}>
                  {zona.nome}{ativa ? " · em andamento" : ""}
                </button>;
              })}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <div className="display" style={{ fontSize: 14, fontWeight: 600 }}>{zonaSelecionada.nome}</div>
                  {atividadeAtiva
                    ? <div style={{ color: "var(--green)", fontSize: 12, marginTop: 3 }}>Em andamento desde {formatarData(atividadeAtiva.iniciadaEm)} · {atividadeAtiva.operador}</div>
                    : <div style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 3 }}>Sem atividade em andamento nesta zona.</div>}
                </div>
                {atividadeAtiva
                  ? <button type="button" className="ghost-btn focus-ring" onClick={encerrarAtividade} style={{ padding: "8px 11px", fontSize: 12 }}>Encerrar atividade</button>
                  : <button type="button" className="primary-btn focus-ring" onClick={iniciarAtividade} disabled={!operadorAtivo} style={{ padding: "8px 11px", fontSize: 12 }}>Iniciar atividade</button>}
              </div>
            </div>
          </div>

          <div style={panelStyle}>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Operações registradas</div>
            {operacoesZona.length ? operacoesZona.map((operacao, index) => <div key={`${operacao.ponto}-${operacao.hora}-${index}`} style={{ borderTop: "1px solid var(--line)", padding: "9px 0 2px", marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}><strong>{operacao.ponto}</strong><span style={{ color: operacao.ok ? "var(--green)" : "var(--red)", whiteSpace: "nowrap" }}>{operacao.ok ? "Conforme" : "Não conforme"}</span></div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 4 }}>{formatarOperacaoDate(operacao)} · {operacao.ferramenta} · {operacao.operador}</div>
            </div>) : <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Ainda não há registros para esta aeronave e zona.</div>}
          </div>

          {historicoAtividades.length > 0 && <div style={panelStyle}>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Histórico de atividades</div>
            {historicoAtividades.map((atividade) => <div key={atividade.id} style={{ borderTop: "1px solid var(--line)", padding: "8px 0 2px", marginTop: 7, fontSize: 11.5, color: atividade.encerradaEm ? "var(--text-dim)" : "var(--green)" }}>
              {atividade.encerradaEm ? "Encerrada" : "Em andamento"} · {atividade.operador}<br />
              início: {formatarData(atividade.iniciadaEm)}{atividade.encerradaEm ? ` · fim: ${formatarData(atividade.encerradaEm)}` : ""}
            </div>)}
          </div>}
        </div>
      </div>
    </section>
  );
}

