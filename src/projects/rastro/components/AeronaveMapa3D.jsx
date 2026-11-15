import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useRastroDispatch, useRastroState } from "../state/RastroContext.jsx";

const ZONAS = [
  {
    id: "asa",
    nome: "Asa",
    pontos: /longarina|nervura|skin panel/i,
    partes: [
      { id: "asa:flaps", nome: "Flaps", mesh: /^flap-/ },
      { id: "asa:aileron", nome: "Ailerons", mesh: /^aileron-/ },
      { id: "asa:spoilers", nome: "Spoilers", mesh: /^spoiler-/ },
    ],
  },
  { id: "trem-pouso", nome: "Trem de pouso", pontos: /trem de pouso/i, mesh: /^gear-/ },
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

function activeIdsForAeronave(atividades, aeronaveSerie) {
  return new Set(atividades
    .filter((atividade) => atividade.aeronaveSerie === aeronaveSerie && !atividade.encerradaEm)
    .map((atividade) => atividade.zonaId));
}

function liberarModelo(root) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material?.dispose());
  });
}

function restaurarMateriais(savedMaterials) {
  savedMaterials.forEach((original, mesh) => {
    const current = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    current.forEach((material) => material.dispose());
    mesh.material = original;
  });
  savedMaterials.clear();
}

function criarRegiaoAsa(airframe) {
  const source = airframe.geometry;
  const positions = source.attributes.position;
  const normals = source.attributes.normal;
  const vertices = [];
  const normais = [];
  const indices = source.index;
  const triCount = indices ? indices.count / 3 : positions.count / 3;
  const vertexAt = (i) => indices ? indices.getX(i) : i;

  for (let tri = 0; tri < triCount; tri += 1) {
    const ids = [vertexAt(tri * 3), vertexAt(tri * 3 + 1), vertexAt(tri * 3 + 2)];
    const centro = ids.reduce((sum, id) => ({
      x: sum.x + positions.getX(id) / 3,
      y: sum.y + positions.getY(id) / 3,
      z: sum.z + positions.getZ(id) / 3,
    }), { x: 0, y: 0, z: 0 });
    if (Math.abs(centro.x) < 3.5 || centro.y < 1.1 || centro.y > 5 || centro.z < -8 || centro.z > 8) continue;
    ids.forEach((id) => {
      vertices.push(positions.getX(id), positions.getY(id), positions.getZ(id));
      normais.push(normals.getX(id), normals.getY(id), normals.getZ(id));
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normais, 3));
  return geometry;
}

export default function AeronaveMapa3D({ operadorAtivo }) {
  const { aeronaves, operacoes, pontos, atividades = [] } = useRastroState();
  const dispatch = useRastroDispatch();
  const canvasHost = useRef(null);
  const clickableMeshes = useRef([]);
  const modelRoot = useRef(null);
  const wingHighlight = useRef(null);
  const savedMaterials = useRef(new Map());
  const [aeronaveSerie, setAeronaveSerie] = useState(aeronaves[0]?.serie || "");
  const [zonaId, setZonaId] = useState(ZONAS[0].id);
  const [parteId, setParteId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modeloCarregado, setModeloCarregado] = useState(false);
  const [erroModelo, setErroModelo] = useState("");

  const zonaSelecionada = ZONAS.find((zona) => zona.id === zonaId) || ZONAS[0];
  const parteSelecionada = zonaSelecionada.partes?.find((parte) => parte.id === parteId);
  const atividadeZonaId = parteSelecionada?.id || zonaId;
  const atividadeAtiva = atividades.find((atividade) =>
    atividade.aeronaveSerie === aeronaveSerie && atividade.zonaId === atividadeZonaId && !atividade.encerradaEm
  );
  const historicoAtividades = atividades.filter((atividade) =>
    atividade.aeronaveSerie === aeronaveSerie && (atividade.zonaId === atividadeZonaId || (!parteSelecionada && atividade.zonaId.startsWith(`${zonaId}:`)))
  );
  const operacoesZona = useMemo(() => {
    if (parteSelecionada) return [];
    const pontosDaZona = new Set(pontos.filter((ponto) => zonaSelecionada.pontos.test(ponto.label)).map((ponto) => ponto.label));
    return operacoes.filter((operacao) =>
      operacao.aeronaveSerie === aeronaveSerie && pontosDaZona.has(operacao.ponto)
    );
  }, [operacoes, pontos, aeronaveSerie, zonaSelecionada, parteSelecionada]);

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

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const onClick = (event) => {
        const bounds = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const parte = raycaster.intersectObjects(clickableMeshes.current)[0]?.object;
        if (parte) {
          setZonaId(parte.userData.zonaId);
          setParteId(parte.userData.parteId || null);
        }
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
          modelRoot.current = model;
          const airframe = model.getObjectByName("airframe");
          if (airframe) {
            const highlight = new THREE.Mesh(
              criarRegiaoAsa(airframe),
              new THREE.MeshStandardMaterial({ color: "#f2a900", emissive: "#674400", transparent: true, opacity: 0.9, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 })
            );
            highlight.visible = false;
            highlight.userData.zonaId = "asa";
            airframe.add(highlight);
            wingHighlight.current = highlight;
            clickableMeshes.current = [highlight];
          }
          model.traverse((object) => {
            if (!object.isMesh) return;
            const parte = ZONAS.find((zona) => zona.partes?.some((item) => item.mesh.test(object.name)))?.partes?.find((item) => item.mesh.test(object.name));
            if (parte) {
              object.userData.zonaId = "asa";
              object.userData.parteId = parte.id;
              clickableMeshes.current.push(object);
            } else if (/^gear-/.test(object.name)) {
              object.userData.zonaId = "trem-pouso";
              clickableMeshes.current.push(object);
            }
          });
          setModeloCarregado(true);
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
        restaurarMateriais(savedMaterials.current);
        liberarModelo(scene);
        renderer?.dispose();
        renderer?.domElement.remove();
        clickableMeshes.current = [];
        modelRoot.current = null;
        wingHighlight.current = null;
      };
    } catch {
      setErroModelo("Este navegador não conseguiu iniciar a visualização 3D.");
      setCarregando(false);
      observer?.disconnect();
      controls?.dispose();
      restaurarMateriais(savedMaterials.current);
      liberarModelo(scene);
      renderer?.dispose();
      renderer?.domElement.remove();
    }
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    restaurarMateriais(savedMaterials.current);

    const activeIds = activeIdsForAeronave(atividades, aeronaveSerie);
    if (wingHighlight.current) {
      const activeWing = [...activeIds].some((id) => id === "asa" || id.startsWith("asa:"));
      wingHighlight.current.visible = (zonaId === "asa" && !parteSelecionada) || activeIds.has("asa") || (activeWing && !parteSelecionada);
      const color = zonaId === "asa" && !parteSelecionada ? "#f2a900" : "#5fae7c";
      wingHighlight.current.material.color.set(color);
      wingHighlight.current.material.emissive.set(color === "#f2a900" ? "#674400" : "#1a432a");
    }

    const destacar = (mesh, color) => {
      const original = mesh.material;
      const clones = (Array.isArray(original) ? original : [original]).map((material) => {
        const clone = material.clone();
        clone.color?.set(color);
        clone.emissive?.set(color);
        clone.emissiveIntensity = 0.8;
        return clone;
      });
      savedMaterials.current.set(mesh, original);
      mesh.material = Array.isArray(original) ? clones : clones[0];
    };

    modelRoot.current?.traverse((mesh) => {
      if (!mesh.isMesh || mesh === wingHighlight.current) return;
      const parte = ZONAS[0].partes.find((item) => item.mesh.test(mesh.name));
      if (parte && (parteSelecionada?.id === parte.id || activeIds.has(parte.id))) {
        destacar(mesh, parteSelecionada?.id === parte.id ? "#f2a900" : "#5fae7c");
      } else if (/^gear-/.test(mesh.name) && (zonaId === "trem-pouso" || activeIds.has("trem-pouso"))) {
        destacar(mesh, zonaId === "trem-pouso" ? "#f2a900" : "#5fae7c");
      }
    });
  }, [atividades, aeronaveSerie, zonaId, parteSelecionada, modeloCarregado]);

  function iniciarAtividade() {
    if (!operadorAtivo || atividadeAtiva) return;
    dispatch({ type: "INICIAR_ATIVIDADE", payload: { aeronaveSerie, zonaId: atividadeZonaId, operador: operadorAtivo } });
  }

  function encerrarAtividade() {
    if (!atividadeAtiva) return;
    dispatch({ type: "ENCERRAR_ATIVIDADE", payload: { id: atividadeAtiva.id } });
  }

  function selecionarZona(id) {
    setZonaId(id);
    setParteId(null);
  }

  return (
    <section aria-label="Mapa 3D de operações" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ ...panelStyle, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="display" style={{ fontSize: 15, fontWeight: 600 }}>Localização esquemática das operações</div>
          <div style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 3 }}>As peças destacadas são esquemáticas e não indicam posições reais de trabalho.</div>
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
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", color: "var(--text-faint)", fontSize: 11.5 }}>Arraste para girar · role para aproximar · clique numa peça destacada para selecioná-la.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={panelStyle}>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Zonas do avião</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              {ZONAS.map((zona) => {
                const ativa = [...activeIdsForAeronave(atividades, aeronaveSerie)].some((id) => id === zona.id || id.startsWith(`${zona.id}:`));
                return <button key={zona.id} type="button" className="ghost-btn focus-ring" onClick={() => selecionarZona(zona.id)} aria-pressed={zonaId === zona.id && !parteSelecionada} style={{ padding: "10px 8px", borderColor: zonaId === zona.id && !parteSelecionada ? "var(--amber)" : undefined, color: zonaId === zona.id && !parteSelecionada ? "var(--text)" : undefined, fontSize: 12 }}>
                  {zona.nome}{ativa ? " · em andamento" : ""}
                </button>;
              })}
            </div>
            {zonaSelecionada.partes && <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 7 }}>
              {zonaSelecionada.partes.map((parte) => {
                const ativa = atividades.some((atividade) => atividade.aeronaveSerie === aeronaveSerie && atividade.zonaId === parte.id && !atividade.encerradaEm);
                return <button key={parte.id} type="button" className="ghost-btn focus-ring" onClick={() => setParteId(parte.id)} aria-pressed={parteSelecionada?.id === parte.id} style={{ padding: "8px 5px", fontSize: 11, borderColor: parteSelecionada?.id === parte.id ? "var(--amber)" : undefined, color: parteSelecionada?.id === parte.id ? "var(--text)" : undefined }}>
                  {parte.nome}{ativa ? " · ativa" : ""}
                </button>;
              })}
            </div>}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <div className="display" style={{ fontSize: 14, fontWeight: 600 }}>{zonaSelecionada.nome}{parteSelecionada ? ` · ${parteSelecionada.nome}` : ""}</div>
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
            {parteSelecionada && <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Esta peça ainda não tem registros de torque próprios. Use iniciar/encerrar atividade para acompanhá-la separadamente.</div>}
            {!parteSelecionada && (operacoesZona.length ? operacoesZona.map((operacao, index) => <div key={`${operacao.ponto}-${operacao.hora}-${index}`} style={{ borderTop: "1px solid var(--line)", padding: "9px 0 2px", marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}><strong>{operacao.ponto}</strong><span style={{ color: operacao.ok ? "var(--green)" : "var(--red)", whiteSpace: "nowrap" }}>{operacao.ok ? "Conforme" : "Não conforme"}</span></div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 4 }}>{formatarOperacaoDate(operacao)} · {operacao.ferramenta} · {operacao.operador}</div>
            </div>) : <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Ainda não há registros para esta aeronave e zona.</div>)}
          </div>

          {historicoAtividades.length > 0 && <div style={panelStyle}>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Histórico de atividades</div>
            {historicoAtividades.map((atividade) => <div key={atividade.id} style={{ borderTop: "1px solid var(--line)", padding: "8px 0 2px", marginTop: 7, fontSize: 11.5, color: atividade.encerradaEm ? "var(--text-dim)" : "var(--green)" }}>
              {atividade.encerradaEm ? "Encerrada" : "Em andamento"} · {ZONAS.flatMap((zona) => zona.partes || []).find((parte) => parte.id === atividade.zonaId)?.nome || zonaSelecionada.nome} · {atividade.operador}<br />
              início: {formatarData(atividade.iniciadaEm)}{atividade.encerradaEm ? ` · fim: ${formatarData(atividade.encerradaEm)}` : ""}
            </div>)}
          </div>}
        </div>
      </div>
    </section>
  );
}

