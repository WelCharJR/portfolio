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
    const steel = new THREE.MeshStandardMaterial({ color: "#879194", metalness: .72, roughness: .42 });
    const yellow = new THREE.MeshStandardMaterial({ color: "#e5b52e", metalness: .35, roughness: .48 });
    const paleWall = new THREE.MeshStandardMaterial({ color: "#c1c8c5", roughness: .9 });
    const addBox=(w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;};
    // Open industrial walls, high roof trusses, steel columns and yellow bridge cranes.
    addBox(30,4.7,.18,0,2.35,-11,paleWall);
    for(let x=-14;x<=14;x+=7){
      addBox(.28,8,.28,x,4, -10.6,steel); addBox(.28,8,.28,x,4,10.6,steel);
      addBox(30,.22,.22,0,7.9,-10.6,steel);
      addBox(.2,.9,21.2,x,7.45,0,steel);
    }
    for(let z of [-8,-4,0,4,8]){
      addBox(.12,.12,30,0,7.7,z,steel);
      addBox(30,.11,.12,0,8.1,z,steel);
    }
    addBox(30,.22,.3,0,5.9,-5,yellow); addBox(.3,.8,.3,0,5.45,-5,yellow);
    addBox(.3,.8,.3,-10,5.45,-5,yellow); addBox(.3,.8,.3,10,5.45,-5,yellow);
    addBox(21,.22,.3,0,5.9,-5,yellow);
    for(let x=-13;x<=13;x+=6.5) addBox(.3,7.7,.3,x,3.85,10.4,steel);
    // Overhead fixtures and floor aisle markings.
    for(let x=-10;x<=10;x+=5){const lamp=new THREE.PointLight(0xfff3d3,36,12);lamp.position.set(x,7.3,2);scene.add(lamp);}
    for(let x=-12;x<=12;x+=1.5) addBox(.09,.018,18,x,.03,2,new THREE.MeshStandardMaterial({color:"#a8b0a2"}));
    const wallMat = steel;
    const kanbanMeshes = new Map();
    layout.kanbans.forEach((k, i) => {
      const group = new THREE.Group(); group.position.set(k.x,0,k.z); group.userData.id = k.id;
      const wood = new THREE.MeshStandardMaterial({ color:"#9a7042", roughness:.8 });
      const frame = new THREE.MeshStandardMaterial({ color:"#d8ded7", metalness:.45, roughness:.5 });
      const trayMats = ["#e0a441","#57928d","#c86a4a","#6e91a0","#d5bd81","#8a9a70"];
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(2.5,.2,1.8),wood); pallet.position.y=.12; pallet.castShadow=true; group.add(pallet);
      for(const x of [-1.18,1.18]) for(const z of [-.78,.78]){
        const post=new THREE.Mesh(new THREE.BoxGeometry(.1,1.9,.1),frame);post.position.set(x,1,z);group.add(post);
      }
      for(const y of [.5,1.15,1.8]){
        const shelf=new THREE.Mesh(new THREE.BoxGeometry(2.45,.08,1.65),frame);shelf.position.y=y;group.add(shelf);
      }
      let n=0;
      for(const y of [.78,1.43]) for(const x of [-.72,0,.72]){
        const bin=new THREE.Mesh(new THREE.BoxGeometry(.66,.48,.68),new THREE.MeshStandardMaterial({color:trayMats[(i+n)%trayMats.length],roughness:.62}));
        bin.position.set(x,y,.12);bin.castShadow=true;group.add(bin);
        const label=new THREE.Mesh(new THREE.BoxGeometry(.36,.14,.025),new THREE.MeshStandardMaterial({color:"#f0eadb"}));label.position.set(x,y,.47);group.add(label);n++;
      }
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
