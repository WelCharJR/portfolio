import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./logistica.css";

const KEY = "logistica-hangar-v1";
const ROWS = ["A", "B", "C", "D", "E", "F"];
const COLS = 10;
const pathTypes = { pedestrian: { label: "Estrada · circulação de pessoas", width: 2.4, color: "#78848a" }, logistics: { label: "Rota logística", width: .8, color: "#e2b644" } };
const emptySlots = () => ROWS.flatMap(row => Array.from({length:COLS},(_,i)=>({id:`${row}-${i+1}`,code:"",name:"",qty:0,unit:"un"})));
function makeSlots(items=[]) {
  const slots=emptySlots();let next=0;
  items.forEach(item=>{
    let remaining=Number(item.qty)||10;
    while(remaining>0&&next<slots.length){
      const qty=Math.min(10,remaining);
      slots[next]={...slots[next],code:item.code||"",name:item.name||"",qty,unit:item.unit||"un"};
      remaining-=qty;next++;
    }
  });
  return slots;
}
const initial = { kanbans: [
  { id:"K-01",name:"Fixadores asa",x:-12,z:-5,items:[{code:"NAS1097",name:"Rebite escareado",qty:240,unit:"un"},{code:"MS21042",name:"Porca autofrenante",qty:80,unit:"un"}] },
  { id:"K-02",name:"Montagem fuselagem",x:0,z:4,items:[{code:"NAS660",name:"Parafuso estrutural",qty:120,unit:"un"}] },
  { id:"K-03",name:"Ferramentas",x:12,z:-5,items:[{code:"DR-48",name:"Broca 4.8 mm",qty:12,unit:"un"}] },
].map(k=>({...k,slots:makeSlots(k.items)})),areas:[],paths:[]};

function loadLayout() {
  try {
    const saved=JSON.parse(localStorage.getItem(KEY));
    if(!saved)return initial;
    return {...saved,kanbans:(saved.kanbans||[]).map(k=>({...k,slots:Array.isArray(k.slots)?emptySlots().map(empty=>k.slots.find(slot=>slot.id===empty.id)||empty):makeSlots(k.items||[])})),areas:saved.areas||[],paths:saved.paths||[]};
  } catch { return initial; }
}

export default function Logistica() {
  const canvas = useRef(null);
  const [layout, setLayout] = useState(loadLayout);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("Arraste os kanbans para reorganizar o hangar.");
  const [tool, setTool] = useState("select");
  const [pathType, setPathType] = useState("pedestrian");
  const pathTypeRef = useRef("pedestrian");
  const [draft, setDraft] = useState([]);
  const [cursorWorld, setCursorWorld] = useState(null);
  const [cursorScreen, setCursorScreen] = useState(null);
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
  const focusRef = useRef(() => {});
  const [query,setQuery]=useState("");
  const [inspectedKanban,setInspectedKanban]=useState(null);
  const [selectedSlotId,setSelectedSlotId]=useState(null);
  const [focusedSlotId,setFocusedSlotId]=useState(null);
  const kanbanPositions=layout.kanbans.map(({id,x,z})=>id+":"+x+":"+z).join("|");

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
    layout.kanbans.forEach(k=>{
      const group=new THREE.Group();group.position.set(k.x,0,k.z);group.userData.id=k.id;
      const frame=new THREE.MeshStandardMaterial({color:"#d8ded7",metalness:.45,roughness:.5});
      const dark=new THREE.MeshStandardMaterial({color:"#26353a",metalness:.25,roughness:.75});
      const blue=new THREE.MeshStandardMaterial({color:"#0877b7",roughness:.72});
      const blueEmpty=new THREE.MeshStandardMaterial({color:"#155879",roughness:.82});
      const binLabel=new THREE.MeshStandardMaterial({color:"#f0eadb"});
      const beam=(w,h,d,x,y,z,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;group.add(m);};
      beam(5.35,.18,1.5,0,.1,0,dark);
      for(const x of [-2.58,2.58])for(const z of [-.62,.62])beam(.1,3.65,.1,x,1.85,z,frame);
      for(let row=0;row<ROWS.length;row++){
        const y=.28+(ROWS.length-1-row)*.52;
        beam(5.1,.08,1.25,0,y,-.02,frame);
        for(let col=0;col<COLS;col++){
          const slot=k.slots?.find(item=>item.id===`${ROWS[row]}-${col+1}`)||{id:`${ROWS[row]}-${col+1}`,code:"",name:"",qty:0};
          const x=(col-(COLS-1)/2)*.5;
          const bin=new THREE.Group();bin.position.set(x,y+.23,.25);bin.userData.slotId=slot.id;bin.userData.kanbanId=k.id;
          const crate=new THREE.Mesh(new THREE.BoxGeometry(.44,.4,.72),slot.code?blue:blueEmpty);crate.castShadow=true;bin.add(crate);
          const lip=new THREE.Mesh(new THREE.BoxGeometry(.46,.07,.08),dark);lip.position.set(0,-.11,.39);bin.add(lip);
          const tag=new THREE.Mesh(new THREE.BoxGeometry(.28,.12,.025),binLabel);tag.position.set(0,-.09,.377);bin.add(tag);
          group.add(bin);
        }
      }
      for(let i=0;i<3;i++)beam(5.2,.07,.09,0,.35+i*1.04,-.72,frame);
      scene.add(group);kanbanMeshes.set(k.id,group);
    });

    layout.areas.forEach(area => {
      const shape=new THREE.Shape();
      area.points.forEach((p,i)=>i===0?shape.moveTo(p.x,-p.z):shape.lineTo(p.x,-p.z));
      shape.closePath();
      const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:"#4aa899",transparent:true,opacity:.34,side:THREE.DoubleSide,roughness:.7}));
      mesh.rotation.x=-Math.PI/2; mesh.position.y=.05; mesh.userData.id=area.id; mesh.userData.kind="area"; scene.add(mesh); drawnMeshes.push(mesh);
    });
    const buildPathMesh=(points,width,color,isRoad=false)=>{
      const samples=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p.x,.075,p.z))).getPoints(Math.max(12,points.length*10));
      const positions=[],indices=[];
      samples.forEach((p,i)=>{
        const prev=samples[Math.max(0,i-1)],next=samples[Math.min(samples.length-1,i+1)];
        const dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz)||1;
        const sx=-dz/len*width/2,sz=dx/len*width/2;
        positions.push(p.x+sx,.075,p.z+sz,p.x-sx,.075,p.z-sz);
        if(i<samples.length-1){const a=i*2,b=a+1,d=a+2,e=a+3;indices.push(a,b,d,b,e,d);}
      });
      const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const group=new THREE.Group();group.userData.kind="path";
      group.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.88,side:THREE.DoubleSide,emissive:isRoad?"#111719":"#60430b",emissiveIntensity:.25})));
      if(isRoad){
        for(const side of [-1,1]){
          const edge=samples.map((p,i)=>{const prev=samples[Math.max(0,i-1)],next=samples[Math.min(samples.length-1,i+1)],dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz)||1;return new THREE.Vector3(p.x-dz/len*width*.46,.1,p.z+dx/len*width*.46);});
          group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(edge),new THREE.LineBasicMaterial({color:"#e5d9b5"})));
        }
        const center=new THREE.Line(new THREE.BufferGeometry().setFromPoints(samples.map(p=>new THREE.Vector3(p.x,.105,p.z))),new THREE.LineDashedMaterial({color:"#d8c58c",dashSize:.55,gapSize:.45}));
        center.computeLineDistances();group.add(center);
      }
      return group;
    };
    layout.paths.forEach(path=>{
      if(path.points.length<2)return;
      const type=pathTypes[path.type]||pathTypes.logistics;
      const group=buildPathMesh(path.points,path.width||type.width,type.color,path.type==="pedestrian");
      group.userData.id=path.id;group.userData.kind="path";scene.add(group);drawnMeshes.push(group);
    });
    const controls = { down:false, lastX:0,lastY:0, angle:.63,radius:68, target:new THREE.Vector3(0,0,0), dragging:null };
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0,1,0),0), hit = new THREE.Vector3();
    const updatePointer=(e)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);return {x:e.clientX-rect.left,y:e.clientY-rect.top};};
    function cameraUpdate(){ camera.position.set(controls.target.x+Math.sin(controls.angle)*controls.radius, controls.radius*.62, controls.target.z+Math.cos(controls.angle)*controls.radius); camera.lookAt(controls.target); }
    cameraUpdate();
    const snapPoint=(x,z)=>snapRef.current?{x:Math.round(x),z:Math.round(z)}:{x:Number(x.toFixed(1)),z:Number(z.toFixed(1))};
    const clearPreview=()=>{while(previewGroup.children.length){const obj=previewGroup.children[0];previewGroup.remove(obj);obj.geometry?.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material?.dispose();}}; clearPreviewRef.current=clearPreview;
    const refreshPreview=(points,hover)=>{clearPreview();const visible=hover?[...points,hover]:points;if(visible.length>1){const coords=visible.map(p=>new THREE.Vector3(p.x,.12,p.z));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(coords),new THREE.LineBasicMaterial({color:toolRef.current==="area"?"#5ce0c5":"#ffd15d"}));previewGroup.add(line);if(toolRef.current==="area"&&visible.length>=3){const shape=new THREE.Shape();visible.forEach((p,i)=>i===0?shape.moveTo(p.x,-p.z):shape.lineTo(p.x,-p.z));shape.closePath();const fill=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:"#4aa899",transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.08;previewGroup.add(fill);}if(toolRef.current==="path"&&visible.length>=2){const config=pathTypes[pathTypeRef.current];previewGroup.add(buildPathMesh(visible,config.width,config.color,pathTypeRef.current==="pedestrian"));}}visible.forEach((p,i)=>{const marker=new THREE.Mesh(new THREE.SphereGeometry(hover&&i===visible.length-1?.18:.14,12,10),new THREE.MeshBasicMaterial({color:hover&&i===visible.length-1?"#ffffff":toolRef.current==="area"?"#5ce0c5":"#e2b644"}));marker.position.set(p.x,.22,p.z);previewGroup.add(marker);});};
    zoomRef.current=(amount)=>{controls.radius=Math.max(28,Math.min(100,controls.radius+amount));cameraUpdate();};
    focusRef.current=(x,z,radius=10)=>{controls.target.set(x,0,z);controls.radius=radius;cameraUpdate();};
    const onDown=e=>{ controls.down=true; controls.lastX=e.clientX; controls.lastY=e.clientY; const screen=updatePointer(e); setCursorScreen(screen); raycaster.setFromCamera(pointer,camera); if(toolRef.current==="area"||toolRef.current==="path"){ if(raycaster.ray.intersectPlane(plane,hit)){ const point=snapPoint(hit.x,hit.z); const next=[...draftRef.current,point]; draftRef.current=next; setDraft(next); setCursorWorld(point); refreshPreview(next,null); } controls.down=false; return; } const hits=raycaster.intersectObjects([...kanbanMeshes.values(),...drawnMeshes],true); if(hits.length){const hitObject=hits[0].object;let slotOwner=null;let o=hitObject;while(o.parent&&!o.userData.id){if(o.userData.slotId)slotOwner=o;o=o.parent;}controls.dragging=o.userData.kind?null:o.userData.id;setSelected(o.userData.id);if(slotOwner){setSelectedSlotId(slotOwner.userData.slotId);setNotice(`${o.userData.id} · caixa ${slotOwner.userData.slotId}`);} } renderer.domElement.setPointerCapture(e.pointerId); };
    const onMove=e=>{ if(!controls.down){if(toolRef.current==="area"||toolRef.current==="path"){const screen=updatePointer(e);setCursorScreen(screen);raycaster.setFromCamera(pointer,camera);if(raycaster.ray.intersectPlane(plane,hit)){const point=snapPoint(hit.x,hit.z);setCursorWorld(prev=>!prev||prev.x!==point.x||prev.z!==point.z?point:prev);refreshPreview(draftRef.current,point);}}return;} const dx=e.clientX-controls.lastX,dy=e.clientY-controls.lastY; controls.lastX=e.clientX; controls.lastY=e.clientY; if(controls.dragging){ updatePointer(e); raycaster.setFromCamera(pointer,camera); if(raycaster.ray.intersectPlane(plane,hit)){ const m=kanbanMeshes.get(controls.dragging); const point=snapPoint(hit.x,hit.z); m.position.x=point.x; m.position.z=point.z; } } else { controls.angle-=dx*.006; controls.radius=Math.max(28,Math.min(100,controls.radius+dy*.08)); cameraUpdate(); } };
    const onUp=()=>{ if(controls.dragging){const id=controls.dragging,m=kanbanMeshes.get(id); setLayout(prev=>({...prev,kanbans:prev.kanbans.map(k=>k.id===id?{...k,x:m.position.x,z:m.position.z}:k)})); controls.dragging=null; setNotice("Posição salva neste navegador.");} controls.down=false; };
    renderer.domElement.addEventListener("pointerdown",onDown); renderer.domElement.addEventListener("pointermove",onMove); renderer.domElement.addEventListener("pointerup",onUp);
    let frame; const draw=()=>{frame=requestAnimationFrame(draw);renderer.render(scene,camera);}; draw();
    const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);};
    window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);clearPreview();clearPreviewRef.current=()=>{};previewRef.current=null;renderer.dispose();host.removeChild(renderer.domElement);};
  }, [kanbanPositions, layout.areas, layout.paths]);

  const addKanban=()=>{const id="K-"+String(Date.now()).slice(-4);setLayout(p=>({...p,kanbans:[...p.kanbans,{id,name:"Novo kanban",x:0,z:0,slots:emptySlots()}]}));setSelected(id);setNotice("Kanban adicionado. Arraste-o para o local desejado.");};
  const openKanban=(id,slotId=null)=>{const k=layout.kanbans.find(item=>item.id===id);if(!k)return;setSelected(id);setInspectedKanban(id);setSelectedSlotId(slotId||k.slots?.find(s=>s.code)?.id||k.slots?.[0]?.id||null);setFocusedSlotId(slotId);focusRef.current(k.x,k.z,9);};
  const updateSlot=(field,value)=>{setLayout(p=>({...p,kanbans:p.kanbans.map(k=>k.id!==inspectedKanban?k:{...k,slots:k.slots.map(slot=>slot.id!==selectedSlotId?slot:{...slot,[field]:field==="qty"?Math.max(0,Number(value)||0):value,...((field==="code"||field==="name")&&value&&!slot.qty?{qty:10}:{})})})}));};
  const searchResults=query.trim()?layout.kanbans.flatMap(k=>(k.slots||[]).filter(s=>s.code&&(s.code+" "+s.name).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map(s=>({kanban:k,slot:s}))):[];
  const inspected=layout.kanbans.find(k=>k.id===inspectedKanban);
  const selectedSlot=inspected?.slots?.find(s=>s.id===selectedSlotId);
  const chooseTool=(next)=>{toolRef.current=next;setTool(next);draftRef.current=[];setDraft([]);setCursorWorld(null);setCursorScreen(null);clearPreviewRef.current();setNotice(next==="area"?"Clique no piso para marcar os vértices da área.":"Clique no piso para traçar o caminho.");};
  const choosePathType=(next)=>{pathTypeRef.current=next;setPathType(next);clearPreviewRef.current();};
  const finishDrawing=()=>{const points=draftRef.current;if(toolRef.current==="area"&&points.length>=3){const id="A-"+String(Date.now()).slice(-4);setLayout(p=>({...p,areas:[...p.areas,{id,name:"Área "+(p.areas.length+1),points}]}));setSelected(id);setNotice("Área adicionada ao layout.");}else if(toolRef.current==="path"&&points.length>=2){const id="R-"+String(Date.now()).slice(-4);const config=pathTypes[pathTypeRef.current];setLayout(p=>({...p,paths:[...p.paths,{id,name:(pathTypeRef.current==="pedestrian"?"Estrada ":"Rota logística ")+(p.paths.length+1),type:pathTypeRef.current,points,width:config.width}]}));setSelected(id);setNotice("Caminho adicionado ao layout.");}draftRef.current=[];setDraft([]);setCursorWorld(null);setCursorScreen(null);clearPreviewRef.current();toolRef.current="select";setTool("select");};
  const cancelDrawing=()=>{draftRef.current=[];setDraft([]);setCursorWorld(null);setCursorScreen(null);clearPreviewRef.current();toolRef.current="select";setTool("select");};
  const removeSelected=()=>{setLayout(p=>({...p,areas:p.areas.filter(x=>x.id!==selected),paths:p.paths.filter(x=>x.id!==selected)}));setSelected(null);};
  const currentPath=layout.paths.find(x=>x.id===selected);
  const current=layout.kanbans.find(k=>k.id===selected);

  useEffect(()=>{if(focusedSlotId)document.getElementById("slot-"+focusedSlotId)?.scrollIntoView({block:"center",behavior:"smooth"});},[focusedSlotId,inspectedKanban]);
  const toggleSnap=()=>{snapRef.current=!snapRef.current;setSnapToGrid(snapRef.current);};
  const toggleLayer=(name,setter,value)=>{if(layerRefs.current[name])layerRefs.current[name].visible=!value;setter(!value);};
  return <div className="log-app"><header className="log-top"><div><span className="log-eyebrow">HANGAR DIGITAL · LOGÍSTICA</span><h2>Layout de materiais</h2></div><div className="log-actions"><button onClick={()=>zoomRef.current(-8)} aria-label="Afastar">−</button><button onClick={()=>zoomRef.current(8)} aria-label="Aproximar">＋</button><button className={showGrid?"":"muted"} onClick={()=>toggleLayer("grid",setShowGrid,showGrid)}>Grade {showGrid?"visível":"oculta"}</button><button className={showStructure?"":"muted"} onClick={()=>toggleLayer("structure",setShowStructure,showStructure)}>Estrutura {showStructure?"visível":"oculta"}</button><button onClick={addKanban}>＋ Kanban</button></div></header><div className="log-body"><section className="log-scene"><div className="log-tools"><button className={tool==="select"?"active":""} onClick={()=>chooseTool("select")}>Selecionar</button><button className={tool==="area"?"active":""} onClick={()=>chooseTool("area")}>＋ Área</button><button className={tool==="path"?"active":""} onClick={()=>chooseTool("path")}>＋ Caminho</button>{tool==="path"&&<select className="log-path-type" aria-label="Tipo de caminho" value={pathType} onChange={e=>choosePathType(e.target.value)}><option value="pedestrian">Estrada · pessoas</option><option value="logistics">Rota logística</option></select>}<button className={snapToGrid?"active":""} onClick={toggleSnap}>Malha {snapToGrid?"1 m ligada":"desligada"}</button>{tool!=="select"&&<><span>{draft.length} pontos</span><button onClick={finishDrawing} disabled={draft.length<(tool==="area"?3:2)}>Concluir</button><button onClick={cancelDrawing}>Cancelar</button></>}</div><div className="log-position">{tool!=="select"&&cursorWorld?`Cursor X ${cursorWorld.x.toFixed(1)} · Z ${cursorWorld.z.toFixed(1)} m`: "Coordenadas em metros"}</div><div className="log-draft-points">{draft.map((p,i)=><span key={i}>P{i+1} ({p.x.toFixed(1)}, {p.z.toFixed(1)})</span>)}</div><div className="log-hint">{tool==="area"?"CLIQUE NO PISO PARA DESENHAR A ÁREA":"CLIQUE NO PISO PARA DESENHAR O CAMINHO"} · ARRASTE KANBANS</div><div className="log-canvas" ref={canvas}/>{tool!=="select"&&cursorScreen&&<div className="log-crosshair" style={{left:cursorScreen.x,top:cursorScreen.y}}><i/><span>X {cursorWorld?.x.toFixed(1)} · Z {cursorWorld?.z.toFixed(1)} m</span></div>}<div className="log-status"><i/> {notice}</div></section><aside className="log-panel"><span className="log-eyebrow">LAYOUT DO HANGAR</span><div className="log-search"><label htmlFor="log-search-input">LOCALIZAR MATERIAL</label><input id="log-search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Código ou descrição"/>{query.trim()&&<div className="log-search-results">{searchResults.length?searchResults.slice(0,8).map(({kanban,slot})=><button key={kanban.id+"-"+slot.id} onClick={()=>{openKanban(kanban.id,slot.id);setNotice(slot.code+" · "+kanban.id+" · caixa "+slot.id);}}><b>{slot.code||"Sem código"}</b><span>{slot.name||"Sem descrição"}</span><small>{kanban.id} · {kanban.name} · {slot.id} · {slot.qty} {slot.unit}</small></button>):<small>Nenhum material encontrado.</small>}</div>}</div><strong>{layout.kanbans.length} kanbans · {layout.areas.length} áreas · {layout.paths.length} caminhos</strong><div className="log-list">{layout.kanbans.map(k=><button className={selected===k.id?"active":""} key={k.id} onClick={()=>setSelected(k.id)}><span className="log-dot"/><span><b>{k.name}</b><small>{k.id} · {k.slots.filter(s=>s.code).length} caixas ocupadas</small></span></button>)}{layout.areas.map(a=><button className={selected===a.id?"active":""} key={a.id} onClick={()=>setSelected(a.id)}><span className="log-dot area"/><span><b>{a.name}</b><small>{a.id} · área · {a.points.length} vértices</small></span></button>)}{layout.paths.map(a=><button className={selected===a.id?"active":""} key={a.id} onClick={()=>setSelected(a.id)}><span className="log-dot path"/><span><b>{a.name}</b><small>{a.id} · {pathTypes[a.type]?.label||"Rota logística"} · {a.width} m</small></span></button>)}</div>{current&&<div className="log-detail"><span className="log-eyebrow">KANBAN SELECIONADO</span><h3>{current.name}</h3><div className="log-item"><span>Caixas ocupadas</span><b>{current.slots.filter(s=>s.code).length}/{current.slots.length}</b></div><button className="log-inspect" onClick={()=>openKanban(current.id,selectedSlotId)}>Ampliar e ver caixas</button></div>}{currentPath&&<div className="log-detail"><span className="log-eyebrow">CAMINHO SELECIONADO</span><h3>{currentPath.name}</h3><small>{pathTypes[currentPath.type]?.label||"Rota logística"}</small><label className="log-width">Largura <input type="number" min=".2" max="4" step=".1" value={currentPath.width} onChange={e=>setLayout(p=>({...p,paths:p.paths.map(x=>x.id===currentPath.id?{...x,width:Number(e.target.value)}:x)}))}/> m</label><button className="log-delete" onClick={removeSelected}>Remover caminho</button></div>}{layout.areas.some(a=>a.id===selected)&&<div className="log-detail"><span className="log-eyebrow">ÁREA SELECIONADA</span><h3>{layout.areas.find(a=>a.id===selected)?.name}</h3><button className="log-delete" onClick={removeSelected}>Remover área</button></div>}<small className="log-local">● Dados salvos localmente neste navegador</small></aside></div>{inspected&&<div className="kanban-backdrop" onClick={()=>{setInspectedKanban(null);setFocusedSlotId(null);focusRef.current(0,0,68);}}><div className="kanban-modal" onClick={e=>e.stopPropagation()}><header><div><span className="log-eyebrow">INSPEÇÃO DE KANBAN · {inspected.id}</span><h2>{inspected.name}</h2><small>Fileiras A–F · posições 1–10 · {inspected.slots.filter(s=>s.code).length} caixas ocupadas</small></div><button onClick={()=>{setInspectedKanban(null);setFocusedSlotId(null);focusRef.current(0,0,68);}}>Fechar</button></header><div className="kanban-inspect-body"><div className="kanban-rack"><div className="kanban-columns">{inspected.slots.map(slot=><button id={"slot-"+slot.id} key={slot.id} className={"kanban-bin "+(slot.code?"filled":"empty")+" "+(selectedSlotId===slot.id?"selected":"")+" "+(focusedSlotId===slot.id?"search-hit":"")} onClick={()=>setSelectedSlotId(slot.id)}><b>{slot.id}</b><span>{slot.code||"VAZIA"}</span><small>{slot.code?slot.qty+" "+slot.unit:"—"}</small></button>)}</div></div><aside className="kanban-slot-editor">{selectedSlot?<><span className="log-eyebrow">CAIXA {selectedSlot.id}</span><h3>{selectedSlot.code||"Nova caixa"}</h3><label>Código<input value={selectedSlot.code} onChange={e=>updateSlot("code",e.target.value)} placeholder="Ex.: NAS1097"/></label><label>Descrição<input value={selectedSlot.name} onChange={e=>updateSlot("name",e.target.value)} placeholder="Ex.: Rebite escareado"/></label><label>Quantidade<input type="number" min="0" value={selectedSlot.qty} onChange={e=>updateSlot("qty",e.target.value)}/></label><label>Unidade<input value={selectedSlot.unit} onChange={e=>updateSlot("unit",e.target.value)} placeholder="un"/></label><small>Identificação no kanban: {inspected.id} · {selectedSlot.id}</small></>:<p>Selecione uma caixa.</p>}</aside></div></div></div>}</div>;
}
