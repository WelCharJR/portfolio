import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./logistica.css";

const KEY = "logistica-hangar-v1";
const initial = { kanbans: [
  { id: "K-01", name: "Fixadores asa", x: -5, z: -2, items: [{ name: "Rebite NAS1097", qty: 240, unit: "un" }, { name: "Porca MS21042", qty: 80, unit: "un" }] },
  { id: "K-02", name: "Montagem fuselagem", x: 1, z: 1, items: [{ name: "Parafuso NAS660", qty: 120, unit: "un" }] },
  { id: "K-03", name: "Ferramentas", x: 6, z: -3, items: [{ name: "Broca 4.8 mm", qty: 12, unit: "un" }] },
], areas: [], paths: [] };

function loadLayout() {
  try { return JSON.parse(localStorage.getItem(KEY)) || initial; } catch { return initial; }
}

export default function Logistica() {
  const canvas = useRef(null);
  const [layout, setLayout] = useState(loadLayout);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("Arraste os kanbans para reorganizar o hangar.");

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(layout)); }, [layout]);

  useEffect(() => {
    const host = canvas.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#10191d");
    const camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 200);
    camera.position.set(18, 22, 25);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xdaf4ff, 0x273334, 2.2));
    const sun = new THREE.DirectionalLight(0xfff1d0, 3.5);
    sun.position.set(-8, 18, 8); sun.castShadow = true; scene.add(sun);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 22), new THREE.MeshStandardMaterial({ color: "#263437", roughness: .92 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(30, 30, "#d4a84e", "#536366"); grid.position.y = .015; scene.add(grid);
    const wallMat = new THREE.MeshStandardMaterial({ color: "#526267", roughness: .8 });
    for (const [x,z,w,d] of [[0,-11,30,.22],[-15,0,.22,22],[15,0,.22,22]]) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 5, d), wallMat); wall.position.set(x,2.5,z); wall.castShadow = true; scene.add(wall);
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(30,.18,22), new THREE.MeshStandardMaterial({ color: "#39484b", roughness: .7, transparent: true, opacity: .55 }));
    roof.position.y = 5.3; scene.add(roof);

    const kanbanMeshes = new Map();
    layout.kanbans.forEach((k, i) => {
      const group = new THREE.Group(); group.position.set(k.x,0,k.z); group.userData.id = k.id;
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(2.3,.22,1.6), new THREE.MeshStandardMaterial({ color:"#b98748", roughness:.8 }));
      pallet.position.y=.12; pallet.castShadow=true; group.add(pallet);
      const bin = new THREE.Mesh(new THREE.BoxGeometry(2.05,1.05,1.35), new THREE.MeshStandardMaterial({ color:["#e0a441","#57928d","#c86a4a"][i%3], roughness:.55, metalness:.08 }));
      bin.position.y=.75; bin.castShadow=true; group.add(bin);
      const band = new THREE.Mesh(new THREE.BoxGeometry(2.08,.16,1.38), new THREE.MeshStandardMaterial({color:"#172326"})); band.position.y=1.2; group.add(band);
      const label = new THREE.Mesh(new THREE.BoxGeometry(.8,.36,.04), new THREE.MeshStandardMaterial({color:"#f2e7ce"})); label.position.set(0,.87,.7); group.add(label);
      scene.add(group); kanbanMeshes.set(k.id, group);
    });

    const controls = { down:false, lastX:0,lastY:0, angle:.63,radius:38, target:new THREE.Vector3(0,0,0), dragging:null };
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0,1,0),0), hit = new THREE.Vector3();
    function cameraUpdate(){ camera.position.set(controls.target.x+Math.sin(controls.angle)*controls.radius, controls.radius*.62, controls.target.z+Math.cos(controls.angle)*controls.radius); camera.lookAt(controls.target); }
    cameraUpdate();
    const onDown=e=>{ controls.down=true; controls.lastX=e.clientX; controls.lastY=e.clientY; pointer.set(e.offsetX/host.clientWidth*2-1,-e.offsetY/host.clientHeight*2+1); raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects([...kanbanMeshes.values()],true); if(hits.length){ let o=hits[0].object; while(o.parent && !o.userData.id)o=o.parent; controls.dragging=o.userData.id; setSelected(o.userData.id); } renderer.domElement.setPointerCapture(e.pointerId); };
    const onMove=e=>{ if(!controls.down)return; const dx=e.clientX-controls.lastX,dy=e.clientY-controls.lastY; controls.lastX=e.clientX; controls.lastY=e.clientY; if(controls.dragging){ pointer.set(e.offsetX/host.clientWidth*2-1,-e.offsetY/host.clientHeight*2+1); raycaster.setFromCamera(pointer,camera); if(raycaster.ray.intersectPlane(plane,hit)){ const m=kanbanMeshes.get(controls.dragging); m.position.x=Math.round(hit.x); m.position.z=Math.round(hit.z); } } else { controls.angle-=dx*.006; controls.radius=Math.max(18,Math.min(55,controls.radius+dy*.08)); cameraUpdate(); } };
    const onUp=()=>{ if(controls.dragging){const id=controls.dragging,m=kanbanMeshes.get(id); setLayout(prev=>({...prev,kanbans:prev.kanbans.map(k=>k.id===id?{...k,x:m.position.x,z:m.position.z}:k)})); controls.dragging=null; setNotice("Posição salva neste navegador.");} controls.down=false; };
    const onWheel=e=>{controls.radius=Math.max(18,Math.min(55,controls.radius+e.deltaY*.02));cameraUpdate();};
    renderer.domElement.addEventListener("pointerdown",onDown); renderer.domElement.addEventListener("pointermove",onMove); renderer.domElement.addEventListener("pointerup",onUp); renderer.domElement.addEventListener("wheel",onWheel);
    let frame; const draw=()=>{frame=requestAnimationFrame(draw);renderer.render(scene,camera);}; draw();
    const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);};
    window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);renderer.dispose();host.removeChild(renderer.domElement);};
  }, [layout.kanbans]);

  const addKanban=()=>{const id="K-"+String(Date.now()).slice(-4); setLayout(p=>({...p,kanbans:[...p.kanbans,{id,name:"Novo kanban",x:0,z:0,items:[{name:"Novo item",qty:0,unit:"un"}]}]}));setSelected(id);setNotice("Kanban adicionado. Arraste-o para o local desejado.");};
  const current=layout.kanbans.find(k=>k.id===selected);
  return <div className="log-app"><header className="log-top"><div><span className="log-eyebrow">HANGAR DIGITAL · LOGÍSTICA</span><h2>Layout de materiais</h2></div><button onClick={addKanban}>＋ Novo kanban</button></header><div className="log-body"><section className="log-scene"><div className="log-hint">BOTÃO ESQUERDO: MOVER · ARRASTAR: KANBAN · RODA: ZOOM</div><div className="log-canvas" ref={canvas}/><div className="log-status"><i/> {notice}</div></section><aside className="log-panel"><span className="log-eyebrow">MAPA DO HANGAR</span><strong>{layout.kanbans.length} pontos logísticos</strong><div className="log-list">{layout.kanbans.map(k=><button className={selected===k.id?"active":""} key={k.id} onClick={()=>setSelected(k.id)}><span className="log-dot"/><span><b>{k.name}</b><small>{k.id} · {k.items.length} itens</small></span></button>)}</div>{current&&<div className="log-detail"><span className="log-eyebrow">CONTEÚDO DO KANBAN</span><h3>{current.name}</h3>{current.items.map((it,i)=><div className="log-item" key={i}><span>{it.name}</span><b>{it.qty} {it.unit}</b></div>)}</div>}<small className="log-local">● Dados salvos localmente neste navegador</small></aside></div></div>;
}
