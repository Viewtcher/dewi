p='app.src.html'
s=open(p,encoding='utf-8').read()

# ---- JS: Simulation + neue openStamp-Interaktion
a=s.index('/* Große Ansicht: zentriert')
b=s.index('/* ---------- Oberfläche ---------- */')
js=r'''/* Große Ansicht: zentriert, per Ziehen (Maus oder Finger) anheben und neigen.
   Physik: Federn (Position, Neigung, Größe). Beim Halten folgt die Marke dem Finger fast 1:1 und schnell (steife, fast kritisch gedämpfte Feder),
   weiche Begrenzung statt hartem Anschlag; die Neigung folgt zusätzlich der Geschwindigkeit. Beim Loslassen federt sie federnd zurück (unterdämpft). */
function makeStampSim(idle){
  const MX=120,MY=150,rub=(v,m)=>m*Math.tanh(v/m),clamp=(v,m)=>Math.max(-m,Math.min(m,v));
  const S={x:0,y:0,vx:0,vy:0,rx:0,ry:0,vrx:0,vry:0,s:1,vs:0,tx:0,ty:0,held:false,t:0,lift:0};
  const sp=(p,v,target,k,c,h)=>{v+=(k*(target-p)-c*v)*h;return [p+v*h,v];};
  S.press=()=>{S.held=true;S.tx=S.x;S.ty=S.y;};
  S.drag=(dx,dy)=>{S.tx=rub(dx,MX);S.ty=rub(dy,MY);};
  S.release=()=>{S.held=false;S.tx=0;S.ty=0;};
  S.step=dt=>{
    dt=Math.min(Math.max(dt,0),.05);
    const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
    for(let i=0;i<n;i++){
      S.t+=h;
      const k=S.held?900:230,c=S.held?2*Math.sqrt(900)*.9:2*Math.sqrt(230)*.3;
      [S.x,S.vx]=sp(S.x,S.vx,S.tx,k,c,h);[S.y,S.vy]=sp(S.y,S.vy,S.ty,k,c,h);
      const sw=(idle&&!S.held)?1:0;
      const try_=clamp(S.x/MX*16+S.vx*.014,-26)+Math.sin(S.t*1.3)*7*sw;
      const trx=clamp(-S.y/MY*16-S.vy*.014,-26)+Math.cos(S.t*1.3)*4*sw;
      [S.ry,S.vry]=sp(S.ry,S.vry,try_,420,2*Math.sqrt(420)*.55,h);
      [S.rx,S.vrx]=sp(S.rx,S.vrx,trx,420,2*Math.sqrt(420)*.55,h);
      [S.s,S.vs]=sp(S.s,S.vs,S.held?1.08:1,520,2*Math.sqrt(520)*.7,h);
    }
    S.lift=Math.min(1,Math.hypot(S.x,S.y)/110*.7+Math.max(0,(S.s-1)/.08)*.3);
    return S;
  };
  return S;
}
let svReturn=null,svRaf=0;
function closeStamp(){
  const o=$('.stampview');if(!o)return;
  cancelAnimationFrame(svRaf);svRaf=0;
  o.remove();document.documentElement.classList.remove('sv-open');
  document.removeEventListener('keydown',svKey);
  if(svReturn&&document.contains(svReturn))try{svReturn.focus();}catch(e){}
  svReturn=null;
}
function svKey(e){if(e.key==='Escape')closeStamp();}
function openStamp(d,from){
  closeStamp();svReturn=from||null;
  const mood=stampFor(d);
  const o=document.createElement('div');o.className='stampview';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');
  o.setAttribute('aria-label',t('Marke ansehen'));
  o.innerHTML=`<div class="sv-back"></div><button class="sv-x" aria-label="${t('Schließen')}">×</button>
  <div class="sv-stage"><div class="sv-wrap"><div class="sv-shadow" id="svsh"></div><div class="sv-card" id="svcard">${stampSvg(mood,0)}</div></div>
  <p class="sv-cap"><b>${esc(dayName(d,{weekday:'long',day:'numeric',month:'long'}))}</b><span>${esc(STAMP_NAME[mood]())}</span></p>
  <p class="sv-hint">${t('Ziehen, um die Marke anzuheben und zu neigen.')}</p></div>`;
  document.body.appendChild(o);document.documentElement.classList.add('sv-open');
  document.addEventListener('keydown',svKey);
  $('.sv-back',o).onclick=closeStamp;$('.sv-x',o).onclick=closeStamp;
  try{$('.sv-x',o).focus();}catch(e){}
  const card=$('#svcard',o),sh=$('#svsh',o),sim=makeStampSim(!reduceMotion());let sx=0,sy=0,last=0;
  const apply=()=>{
    card.style.transform=`translate3d(${sim.x.toFixed(2)}px,${sim.y.toFixed(2)}px,0) perspective(700px) rotateX(${sim.rx.toFixed(2)}deg) rotateY(${sim.ry.toFixed(2)}deg) scale(${sim.s.toFixed(4)})`;
    sh.style.transform=`translate3d(${(sim.x*.25).toFixed(1)}px,${(sim.lift*16).toFixed(1)}px,0) scale(${(1+sim.lift*.22).toFixed(3)})`;
    sh.style.opacity=(.85-sim.lift*.35).toFixed(2);
  };
  const loop=ts=>{sim.step(last?(ts-last)/1000:.016);last=ts;apply();svRaf=requestAnimationFrame(loop);};
  apply();svRaf=requestAnimationFrame(loop);
  const down=e=>{
    sim.press();sx=e.clientX;sy=e.clientY;card.classList.add('held');
    try{card.setPointerCapture(e.pointerId);}catch(x){}
    e.preventDefault();
  };
  const move=e=>{if(sim.held)sim.drag(e.clientX-sx,e.clientY-sy);};
  const up=()=>{if(!sim.held)return;sim.release();card.classList.remove('held');};
  card.addEventListener('pointerdown',down);card.addEventListener('pointermove',move);
  card.addEventListener('pointerup',up);card.addEventListener('pointercancel',up);card.addEventListener('lostpointercapture',up);
}

'''
s=s[:a]+js+s[b:]

# ---- CSS
a=s.index('.sv-card{width:min(74vw,320px)')
b=s.index('.sv-cap{display:grid')
css='''.sv-wrap{position:relative;width:min(74vw,320px);aspect-ratio:1}
.sv-card{position:absolute;inset:0;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab;will-change:transform;
  filter:drop-shadow(0 0 16px rgba(120,220,255,.28))}
.sv-card.held{cursor:grabbing}
.sv-card svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
.sv-shadow{position:absolute;left:6%;right:6%;bottom:-6%;height:16%;border-radius:50%;pointer-events:none;will-change:transform,opacity;
  background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,.65),rgba(0,0,0,0) 70%)}
'''
s=s[:a]+css+s[b:]
# alte svfloat-Keyframes entfernen
import re
s=re.sub(r'@keyframes svfloat\{[^\n]*\}\n','',s)
open(p,'w',encoding='utf-8').write(s)
print('ok')
