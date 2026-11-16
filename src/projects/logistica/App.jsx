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
  const [tool, setTool] = useState("select");
  const [draft, setDraft] = useState([]);
  const [cursorWorld, setCursorWorld] = useState(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const snapRef = useRef(false);
  const previewRef = useRef(null);
  const clearPreviewRef = useRef(() => {});
  const toolRef = useRef("select");
  const draftRef = useRef([]);
  const [showStructure, setShowStructure] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const layerRefs = useRef({});
  const zoomRef = useRef(() => {});

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(layout)); }, [layout]);

  useEffect(() => {
    const host = canvas.current;
    const scene = new THREE.Scene();
    const previewGroup = new THREE.Group(); scene.add(previewGroup); previewRef.current=previewGroup;
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

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 44), new THREE.MeshStandardMaterial({ color: "#263437", roughness: .92 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const gridLayer = new THREE.Group(); scene.add(gridLayer);
    const grid = new THREE.GridHelper(60, 60, "#d4a84e", "#536366"); grid.position.y = .015; gridLayer.add(grid);
    const structureLayer = new THREE.Group(); structureLayer.visible=showStructure; scene.add(structureLayer);
    gridLayer.visible=showGrid;
    layerRefs.current={structure:structureLayer,grid:gridLayer};
    const steel = new THREE.MeshStandardMaterial({ color: "#879194", metalness: .72, roughness: .42 });
    const yellow = new THREE.MeshStandardMaterial({ color: "#e5b52e", metalness: .35, roughness: .48 });
    const paleWall = new THREE.MeshStandardMaterial({ color: "#c1c8c5", roughness: .9 });
    const addBox=(w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;structureLayer.add(m);return m;};
    // Larger industrial hall: 60 x 44 floor, raised steel bays and bridge crane rails.
    addBox(60,5,.18,0,2.5,-22,paleWall);
    for(let x=-28;x<=28;x+=8){
      addBox(.3,10,.3,x,5,-21.5,steel); addBox(.3,10,.3,x,5,21.5,steel);
      addBox(.2,1,43,x,8.9,0,steel);
      addBox(.18,.18,43,x,9.8,0,steel);
    }
    for(let z of [-18,-12,-6,0,6,12,18]){
      addBox(.14,.14,60,0,9.6,z,steel);
      addBox(60,.12,.14,0,10,z,steel);
    }
    addBox(60,.28,.4,0,7.4,-9,yellow); addBox(.4,1,.4,0,6.8,-9,yellow);
    addBox(.4,1,.4,-24,6.8,-9,yellow); addBox(.4,1,.4,24,6.8,-9,yellow);
    addBox(48,.28,.4,0,7.4,-9,yellow);
    for(let x=-26;x<=26;x+=13) addBox(.34,9.5,.34,x,4.75,21.2,steel);
    for(let x=-20;x<=20;x+=10){const lamp=new THREE.PointLight(0xfff3d3,44,18);lamp.position.set(x,9,1);scene.add(lamp);}
    const wallMat = steel;
    const kanbanMeshes = new Map();
    const drawnMeshes = [];
    layout.kanbans.forEach((k, i) => {
      const group = new THREE.Group(); group.position.set(k.x,0,k.z); group.userData.id = k.id;
      const wood = new THREE.MeshStandardMaterial({ color:"#9a7042", roughness:.8 });
      const frame = new THREE.MeshStandardMaterial({ color:"#d8ded7", metalness:.45, roughness:.5 });
      const trayMats = ["#e0a441","#57928d","#c86a4a","#6e91a0","#d5bd81","#8a9a70"];
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.55,.16,1.1),wood); pallet.position.y=.12; pallet.castShadow=true; group.add(pallet);
      for(const x of [-.72,.72]) for(const z of [-.5,.5]){
        const post=new THREE.Mesh(new THREE.BoxGeometry(.07,1.55,.07),frame);post.position.set(x,1,z);group.add(post);
      }
      for(const y of [.38,.92,1.46]){
        const shelf=new THREE.Mesh(new THREE.BoxGeometry(1.48,.07,1.02),frame);shelf.position.y=y;group.add(shelf);
      }
      let n=0;
      for(const y of [.63,1.17]) for(const x of [-.43,0,.43]){
        const bin=new THREE.Mesh(new THREE.BoxGeometry(.39,.38,.38),new THREE.MeshStandardMaterial({color:trayMats[(i+n)%trayMats.length],roughness:.62}));
        bin.position.set(x,y,.12);bin.castShadow=true;group.add(bin);
        const label=new THREE.Mesh(new THREE.BoxGeometry(.24,.11,.02),new THREE.MeshStandardMaterial({color:"#f0eadb"}));label.position.set(x,y,.32);group.add(label);n++;
      }
      scene.add(group); kanbanMeshes.set(k.id, group);
    });

    layout.areas.forEach(area => {
      const shape=new THREE.Shape();
      area.points.forEach((p,i)=>i===0?shape.moveTo(p.x,-p.z):shape.lineTo(p.x,-p.z));
      shape.closePath();
      const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:"#4aa899",transparent:true,opacity:.34,side:THREE.DoubleSide,roughness:.7}));
      mesh.rotation.x=-Math.PI/2; mesh.position.y=.05; mesh.userData.id=area.id; mesh.userData.kind="area"; scene.add(mesh); drawnMeshes.push(mesh);
    });
    layout.paths.forEach(path => {
      if(path.points.length<2)return;
      const curve=new THREE.CatmullRomCurve3(path.points.map(p=>new THREE.Vector3(p.x,.09,p.z)));
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,path.points.length*8),Math.max(.08,(path.width||.5)/2),8,false),new THREE.MeshStandardMaterial({color:"#e2b644",emissive:"#60430b",roughness:.58}));
      mesh.userData.id=path.id; mesh.userData.kind="path"; scene.add(mesh); drawnMeshes.push(mesh);
    });
    const controls = { down:false, lastX:0,lastY:0, angle:.63,radius:68, target:new THREE.Vector3(0,0,0), dragging:null };
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0,1,0),0), hit = new THREE.Vector3();
    function cameraUpdate(){ camera.position.set(controls.target.x+Math.sin(controls.angle)*controls.radius, controls.radius*.62, controls.target.z+Math.cos(controls.angle)*controls.radius); camera.lookAt(controls.target); }
    cameraUpdate();
    const snapPoint=(x,z)=>snapRef.current?{x:Math.round(x),z:Math.round(z)}:{x:Number(x.toFixed(1)),z:Number(z.toFixed(1))};
    const clearPreview=()=>{while(previewGroup.children.length){const obj=previewGroup.children[0];previewGroup.remove(obj);obj.geometry?.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose();}}; clearPreviewRef.current=clearPreview;
    const refreshPreview=(points,hover)=>{clearPreview();const visible=hover?[...points,hover]:points;if(visible.length>1){const coords=visible.map(p=>new THREE.Vector3(p.x,.12,p.z));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(coords),new THREE.LineBasicMaterial({color:toolRef.current==="area"?"#5ce0c5":"#ffd15d"}));previewGroup.add(line);if(toolRef.current==="area"&&visible.length>=3){const shape=new THREE.Shape();visible.forEach((p,i)=>i===0?shape.moveTo(p.x,-p.z):shape.lineTo(p.x,-p.z));shape.closePath();const fill=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:"#4aa899",transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.08;previewGroup.add(fill);}if(toolRef.current==="path"&&visible.length>=2){const curve=new THREE.CatmullRomCurve3(visible.map(p=>new THREE.Vector3(p.x,.13,p.z)));previewGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,visible.length*8),.22,8,false),new THREE.MeshBasicMaterial({color:"#e2b644"})));}}visible.forEach((p,i)=>{const marker=new THREE.Mesh(new THREE.SphereGeometry(hover&&i===visible.length-1?.18:.14,12,10),new THREE.MeshBasicMaterial({color:hover&&i===visible.length-1?"#ffffff":toolRef.current==="area"?"#5ce0c5":"#e2b644"}));marker.position.set(p.x,.22,p.z);previewGroup.add(marker);});};
    zoomRef.current=(amount)=>{controls.radius=Math.max(28,Math.min(100,controls.radius+amount));cameraUpdate();};
    const onDown=e=>{ controls.down=true; controls.lastX=e.clientX; controls.lastY=e.clientY; pointer.set(e.offsetX/host.clientWidth*2-1,-e.offsetY/host.clientHeight*2+1); raycaster.setFromCamera(pointer,camera); if(toolRef.current==="area"||toolRef.current==="path"){ if(raycaster.ray.intersectPlane(plane,hit)){ const point=snapPoint(hit.x,hit.z); const next=[...draftRef.current,point]; draftRef.current=next; setDraft(next); setCursorWorld(point); refreshPreview(next,null); } controls.down=false; return; } const hits=raycaster.intersectObjects([...kanbanMeshes.values(),...drawnMeshes],true); if(hits.length){ let o=hits[0].object; while(o.parent && !o.userData.id)o=o.parent; controls.dragging=o.userData.kind?null:o.userData.id; setSelected(o.userData.id); } renderer.domElement.setPointerCapture(e.pointerId); };
    const onMove=e=>{ if(!controls.down){if(toolRef.current==="area"||toolRef.current==="path"){pointer.set(e.offsetX/host.clientWidth*2-1,-e.offsetY/host.clientHeight*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.ray.intersectPlane(plane,hit)){const point=snapPoint(hit.x,hit.z);setCursorWorld(prev=>!prev||prev.x!==point.x||prev.z!==point.z?point:prev);refreshPreview(draftRef.current,point);}}return;} const dx=e.clientX-controls.lastX,dy=e.clientY-controls.lastY; controls.lastX=e.clientX; controls.lastY=e.clientY; if(controls.dragging){ pointer.set(e.offsetX/host.clientWidth*2-1,-e.offsetY/host.clientHeight*2+1); raycaster.setFromCamera(pointer,camera); if(raycaster.ray.intersectPlane(plane,hit)){ const m=kanbanMeshes.get(controls.dragging); const point=snapPoint(hit.x,hit.z); m.position.x=point.x; m.position.z=point.z; } } else { controls.angle-=dx*.006; controls.radius=Math.max(28,Math.min(100,controls.radius+dy*.08)); cameraUpdate(); } };
    const onUp=()=>{ if(controls.dragging){const id=controls.dragging,m=kanbanMeshes.get(id); setLayout(prev=>({...prev,kanbans:prev.kanbans.map(k=>k.id===id?{...k,x:m.position.x,z:m.position.z}:k)})); controls.dragging=null; setNotice("Posição salva neste navegador.");} controls.down=false; };
    renderer.domElement.addEventListener("pointerdown",onDown); renderer.domElement.addEventListener("pointermove",onMove); renderer.domElement.addEventListener("pointerup",onUp);
    let frame; const draw=()=>{frame=requestAnimationFrame(draw);renderer.render(scene,camera);}; draw();
    const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);};
    window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);clearPreview();clearPreviewRef.current=()=>{};previewRef.current=null;renderer.dispose();host.removeChild(renderer.domElement);};
  }, [layout.kanbans, layout.areas, layout.paths]);

  const addKanban=()=>{const id="K-"+String(Date.now()).slice(-4); setLayout(p=>({...p,kanbans:[...p.kanbans,{id,name:"Novo kanban",x:0,z:0,items:[{name:"Novo item",qty:0,unit:"un"}]}]}));setSelected(id);setNotice("Kanban adicionado. Arraste-o para o local desejado.");};
  const chooseTool=(next)=>{toolRef.current=next;setTool(next);draftRef.current=[];setDraft([]);setCursorWorld(null);clearPreviewRef.current();setNotice(next==="area"?"Clique no piso para marcar os vértices da área.":"Clique no piso para traçar o caminho.");};
  const finishDrawing=()=>{const points=draftRef.current;if(toolRef.current==="area"&&points.length>=3){const id="A-"+String(Date.now()).slice(-4);setLayout(p=>({...p,areas:[...p.areas,{id,name:"Área "+(p.areas.length+1),points}]}));setSelected(id);setNotice("Área adicionada ao layout.");}else if(toolRef.current==="path"&&points.length>=2){const id="R-"+String(Date.now()).slice(-4);setLayout(p=>({...p,paths:[...p.paths,{id,name:"Caminho "+(p.paths.length+1),points,width:.5}]}));setSelected(id);setNotice("Caminho adicionado ao layout.");}draftRef.current=[];setDraft([]);setCursorWorld(null);previewRef.current?.clear();toolRef.current="select";setTool("select");};
  const cancelDrawing=()=>{draftRef.current=[];setDraft([]);setCursorWorld(null);previewRef.current?.clear();toolRef.current="select";setTool("select");};
  const removeSelected=()=>{setLayout(p=>({...p,areas:p.areas.filter(x=>x.id!==selected),paths:p.paths.filter(x=>x.id!==selected)}));setSelected(null);};
  const currentPath=layout.paths.find(x=>x.id===selected);
  const current=layout.kanbans.find(k=>k.id===selected);

  const toggleSnap=()=>{snapRef.current=!snapRef.current;setSnapToGrid(snapRef.current);};
  const toggleLayer=(name,setter,value)=>{if(layerRefs.current[name])layerRefs.current[name].visible=!value;setter(!value);};
  return <div className="log-app"><header className="log-top"><div><span className="log-eyebrow">HANGAR DIGITAL · LOGÍSTICA</span><h2>Layout de materiais</h2></div><div className="log-actions"><button onClick={()=>zoomRef.current(-8)} aria-label="Afastar">−</button><button onClick={()=>zoomRef.current(8)} aria-label="Aproximar">＋</button><button className={showGrid?"":"muted"} onClick={()=>toggleLayer("grid",setShowGrid,showGrid)}>Grade {showGrid?"visível":"oculta"}</button><button className={showStructure?"":"muted"} onClick={()=>toggleLayer("structure",setShowStructure,showStructure)}>Estrutura {showStructure?"visível":"oculta"}</button><button onClick={addKanban}>＋ Kanban</button></div></header><div className="log-body"><section className="log-scene"><div className="log-tools"><button className={tool==="select"?"active":""} onClick={()=>chooseTool("select")}>Selecionar</button><button className={tool==="area"?"active":""} onClick={()=>chooseTool("area")}>＋ Área</button><button className={tool==="path"?"active":""} onClick={()=>chooseTool("path")}>＋ Caminho</button><button className={snapToGrid?"active":""} onClick={toggleSnap}>Malha {snapToGrid?"1 m ligada":"desligada"}</button>{tool!=="select"&&<><span>{draft.length} pontos</span><button onClick={finishDrawing} disabled={draft.length<(tool==="area"?3:2)}>Concluir</button><button onClick={cancelDrawing}>Cancelar</button></>}</div><div className="log-position">{tool!=="select"&&cursorWorld?`Cursor X ${cursorWorld.x.toFixed(1)} · Z ${cursorWorld.z.toFixed(1)} m`: "Coordenadas em metros"}</div><div className="log-draft-points">{draft.map((p,i)=><span key={i}>P{i+1} ({p.x.toFixed(1)}, {p.z.toFixed(1)})</span>)}</div><div className="log-hint">{tool==="area"?"CLIQUE NO PISO PARA DESENHAR A ÁREA":"CLIQUE NO PISO PARA DESENHAR O CAMINHO"} · ARRASTE KANBANS</div><div className="log-canvas" ref={canvas}/><div className="log-status"><i/> {notice}</div></section><aside className="log-panel"><span className="log-eyebrow">LAYOUT DO HANGAR</span><strong>{layout.kanbans.length} kanbans · {layout.areas.length} áreas · {layout.paths.length} caminhos</strong><div className="log-list">{layout.kanbans.map(k=><button className={selected===k.id?"active":""} key={k.id} onClick={()=>setSelected(k.id)}><span className="log-dot"/><span><b>{k.name}</b><small>{k.id} · {k.items.length} itens</small></span></button>)}{layout.areas.map(a=><button className={selected===a.id?"active":""} key={a.id} onClick={()=>setSelected(a.id)}><span className="log-dot area"/><span><b>{a.name}</b><small>{a.id} · área · {a.points.length} vértices</small></span></button>)}{layout.paths.map(a=><button className={selected===a.id?"active":""} key={a.id} onClick={()=>setSelected(a.id)}><span className="log-dot path"/><span><b>{a.name}</b><small>{a.id} · caminho · largura {a.width} m</small></span></button>)}</div>{current&&<div className="log-detail"><span className="log-eyebrow">CONTEÚDO DO KANBAN</span><h3>{current.name}</h3>{current.items.map((it,i)=><div className="log-item" key={i}><span>{it.name}</span><b>{it.qty} {it.unit}</b></div>)}</div>}{currentPath&&<div className="log-detail"><span className="log-eyebrow">CAMINHO SELECIONADO</span><h3>{currentPath.name}</h3><label className="log-width">Largura <input type="number" min=".2" max="4" step=".1" value={currentPath.width} onChange={e=>setLayout(p=>({...p,paths:p.paths.map(x=>x.id===currentPath.id?{...x,width:Number(e.target.value)}:x)}))}/> m</label><button className="log-delete" onClick={removeSelected}>Remover caminho</button></div>}{layout.areas.some(a=>a.id===selected)&&<div className="log-detail"><span className="log-eyebrow">ÁREA SELECIONADA</span><h3>{layout.areas.find(a=>a.id===selected)?.name}</h3><button className="log-delete" onClick={removeSelected}>Remover área</button></div>}<small className="log-local">● Dados salvos localmente neste navegador</small></aside></div></div>;
}
