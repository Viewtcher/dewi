import re
p='app.src.html'
s=open(p,encoding='utf-8').read()

# 1) stampSvg: Ebenen für Parallax
a=s.index('function stampSvg(mood,phase){')
b=s.index('/* Große Ansicht')
fn=r'''function stampSvg(mood,phase){
  const id='st'+(++stId),calm=reduceMotion(),d=phase||0;
  const inner=dwSvg(mood).replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>[\s\S]*$/,'');
  let holes='';
  for(let k=0;k<8;k++){const x=3.75+k*7.5;holes+=`<circle cx="${x}" cy="0" r="2.3"/><circle cx="${x}" cy="60" r="2.3"/><circle cx="0" cy="${x}" r="2.3"/><circle cx="60" cy="${x}" r="2.3"/>`;}
  const an=(x)=>calm?'':x;
  const star=(x,y,s,tt)=>`<path transform="translate(${x} ${y})" d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1Z" fill="#fff" opacity="${calm?.7:0}">${an(`<animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.2;.45;1" dur="${tt}s" begin="${(-d-s).toFixed(1)}s" repeatCount="indefinite"/>`)}</path>`;
  return `<svg viewBox="-2 -2 66 66" aria-hidden="true" focusable="false">
  <defs>
   <mask id="${id}m"><rect width="60" height="60" fill="#fff"/><g fill="#000">${holes}</g></mask>
   <clipPath id="${id}c"><rect x="2.5" y="2.5" width="55" height="55"/></clipPath>
   <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6ee"/><stop offset="1" stop-color="#d8c4ff"/></linearGradient>
   <linearGradient id="${id}w" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="26" y2="14" spreadMethod="repeat">
     <stop offset="0" stop-color="#18e6ff"/><stop offset=".25" stop-color="#5a6bff"/><stop offset=".5" stop-color="#ff2bd6"/><stop offset=".75" stop-color="#7a5cff"/><stop offset="1" stop-color="#18e6ff"/>
     ${an(`<animateTransform attributeName="gradientTransform" type="translate" values="0 0;26 14" dur="3.2s" begin="${-d}s" repeatCount="indefinite"/>`)}
   </linearGradient>
   <linearGradient id="${id}x" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="60" y2="0" spreadMethod="repeat">
     <stop offset="0" stop-color="#ff4fd8" stop-opacity="0"/><stop offset=".5" stop-color="#7ff6ff" stop-opacity=".95"/><stop offset="1" stop-color="#ff4fd8" stop-opacity="0"/>
     ${an(`<animateTransform attributeName="gradientTransform" type="translate" values="-60 60;60 -60" dur="2.8s" begin="${-d}s" repeatCount="indefinite"/>`)}
   </linearGradient>
   <radialGradient id="${id}r"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#bff6ff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
   <pattern id="${id}g" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 .4H3M.4 0V3" stroke="#fff" stroke-width=".28"/></pattern>
  </defs>
  <g mask="url(#${id}m)">
   <rect width="60" height="60" fill="#fff6ec"/>
   <g clip-path="url(#${id}c)">
    <g class="pl pl-bg"><rect x="-8" y="-8" width="76" height="76" fill="url(#${id}b)"/></g>
    <g class="pl pl-art"><g transform="translate(-2 -2.5) scale(.32)">${inner}</g></g>
    <g class="pl pl-holo">
     <rect x="-8" y="-8" width="76" height="76" fill="url(#${id}w)" opacity=".5" style="mix-blend-mode:color"/>
     <rect x="-8" y="-8" width="76" height="76" fill="url(#${id}w)" opacity=".34" style="mix-blend-mode:overlay"/>
     <rect x="-8" y="-8" width="76" height="76" fill="url(#${id}x)" opacity=".55" style="mix-blend-mode:screen"/>
     <rect x="-8" y="-8" width="76" height="76" fill="url(#${id}g)" opacity=".22" style="mix-blend-mode:overlay"/>
     ${star(14,13,0,2.4)}${star(46,10,.9,2.9)}${star(10,36,1.6,2.2)}${star(34,26,.5,3.3)}${star(50,34,1.2,2.6)}
    </g>
    <g class="pl pl-glare"><circle cx="30" cy="30" r="30" fill="url(#${id}r)" style="mix-blend-mode:screen"/></g>
   </g>
   <rect x="1.2" y="1.2" width="57.6" height="57.6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".7"/>
  </g>
  <g class="pl pl-mark"><g transform="rotate(-14 46 47)" opacity=".94">
   <path d="M6 51 q3 -3 6 0 t6 0 t6 0 t6 0 M8 56 q3 -3 6 0 t6 0 t6 0" fill="none" stroke="#2a1630" stroke-width="1" stroke-linecap="round" opacity=".55"/>
   <circle cx="46" cy="47" r="12.5" fill="rgba(255,255,255,.28)" stroke="#2a1630" stroke-width="1.5"/>
   <circle cx="46" cy="47" r="9.6" fill="none" stroke="#2a1630" stroke-width=".6" stroke-dasharray="1.5 1.1"/>
   <path d="M40.6 47.2 L44.6 51.3 L51.8 42.4" fill="none" stroke="#1f2f1f" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M40.6 47.2 L44.6 51.3 L51.8 42.4" fill="none" stroke="#3be28b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g></g></svg>`;
}
'''
s=s[:a]+fn+s[b:]

# 2) Simulation: nur Neigung; Parallax-Werte px/py
s=s.replace("const try_=clamp(S.x/MX*16+S.vx*.014,26)+Math.sin(S.t*1.3)*7*sw;","const try_=clamp(S.x/MX*30+S.vx*.012,32)+Math.sin(S.t*1.3)*6*sw;")
s=s.replace("const trx=clamp(-S.y/MY*16-S.vy*.014,26)+Math.cos(S.t*1.3)*4*sw;","const trx=clamp(-S.y/MY*30-S.vy*.012,32)+Math.cos(S.t*1.3)*4*sw;")
s=s.replace("    S.lift=Math.min(1,Math.hypot(S.x,S.y)/110*.7+Math.max(0,(S.s-1)/.08)*.3);\n    return S;","    S.px=clamp(S.ry/32,1);S.py=clamp(-S.rx/32,1);\n    S.lift=Math.min(1,Math.hypot(S.px,S.py)*.7+Math.max(0,(S.s-1)/.06)*.3);\n    return S;")
s=s.replace("held:false,t:0,lift:0};","held:false,t:0,lift:0,px:0,py:0};")
s=s.replace("S.held?1.08:1,520","S.held?1.06:1,520")

# 3) apply(): kein Translate, Parallax-Variablen
a=s.index("  const apply=()=>{")
b=s.index("  const loop=ts=>")
s=s[:a]+'''  const apply=()=>{
    card.style.transform=`perspective(700px) rotateX(${sim.rx.toFixed(2)}deg) rotateY(${sim.ry.toFixed(2)}deg) scale(${sim.s.toFixed(4)})`;
    card.style.setProperty('--px',sim.px.toFixed(3));card.style.setProperty('--py',sim.py.toFixed(3));
    card.style.setProperty('--g',Math.min(1,Math.hypot(sim.px,sim.py)).toFixed(3));
    sh.style.transform=`scale(${(1+sim.lift*.14).toFixed(3)})`;
    sh.style.opacity=(.85-sim.lift*.3).toFixed(2);
  };
'''+s[b:]

# 4) CSS Parallax-Ebenen
css='''.pl-bg{transform:translate(calc(var(--px,0)*-.9px),calc(var(--py,0)*-.9px))}
.pl-art{transform:translate(calc(var(--px,0)*-2.6px),calc(var(--py,0)*-2.6px))}
.pl-holo{transform:translate(calc(var(--px,0)*1.8px),calc(var(--py,0)*1.8px))}
.pl-glare{transform:translate(calc(var(--px,0)*20px),calc(var(--py,0)*20px));opacity:calc(.12 + var(--g,0)*.7)}
.pl-mark{transform:translate(calc(var(--px,0)*3.8px),calc(var(--py,0)*3.8px))}
'''
s=s.replace(".sv-card.held{cursor:grabbing}",css+".sv-card.held{cursor:grabbing}",1)
s=s.replace("Ziehen, um die Marke anzuheben und zu neigen.","Ziehen, um die Marke zu neigen.")
s=s.replace('"Ziehen, um die Marke anzuheben und zu neigen.": "Drag to lift and tilt the stamp."','"Ziehen, um die Marke zu neigen.": "Drag to tilt the stamp."')
open(p,'w',encoding='utf-8').write(s)
print('ok')
