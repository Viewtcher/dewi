/* Modul Reels: Spielautomat. Drei Walzen tragen Wörter des Beispielsatzes (bei längeren Sätzen: das gelernte Wort und seine zwei Nachbarn).
   Hebel ziehen, dann jede Walze antippen, wenn das richtige Wort auf der Linie steht.
   Richtig: Walze rastet grün ein. Falsch: Walze zuckt rot und dreht wieder an (ein Fehler ist frei, im Survival nicht).
   Jackpot (alles beim ersten Stopp) ist nur Show und ändert nichts an Stufen oder Punkten. */
const RL_ROW=44,RL_FAST=10,RL_SLOW=2.2;   // Wörter pro Sekunde: alle rasen, nur die aktive Walze wird langsam
/* Kurzer Diamantenregen über den ganzen Bildschirm */
function diamondRain(n){
  if(reduceMotion())return;
  const box=document.createElement('div');box.className='drain';box.setAttribute('aria-hidden','true');
  const cols=[['#ff7ac6','#ffc2e6','#c93a96'],['#7ae7ff','#d3f6ff','#35a8c9'],['#ffffff','#f1e6ff','#b9a2e6'],['#c9a6ff','#eadcff','#8a63d4'],['#ffe27a','#fff3b8','#d9a520']];
  for(let i=0;i<n;i++){
    const c=cols[i%cols.length],sz=16+Math.random()*20,g=document.createElement('i');
    g.style.cssText=`left:${(Math.random()*100).toFixed(1)}%;width:${sz.toFixed(0)}px;height:${sz.toFixed(0)}px;--dx:${(Math.random()*80-40).toFixed(0)}px;--r:${(Math.random()*540-270).toFixed(0)}deg;animation-duration:${(1.1+Math.random()*.9).toFixed(2)}s;animation-delay:${(Math.random()*.7).toFixed(2)}s`;
    g.innerHTML=`<svg viewBox="0 0 24 24"><path d="M5 3h14l5 6-12 13L0 9z" fill="${c[0]}" stroke="#2a1630" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 3L8 9h8l3-6z" fill="${c[1]}"/><path d="M0 9h8l4 13zM24 9h-8l-4 13z" fill="${c[2]}" opacity=".85"/><path d="M8 9l4 13 4-13z" fill="${c[0]}"/><path d="M6 5l2 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    box.appendChild(g);
  }
  document.body.appendChild(box);setTimeout(()=>box.remove(),2900);
}
/* Noch nicht gelernte Wörter werden nicht abgefragt: Das Fenster aus drei Walzen weicht ihnen aus, und was sich nicht vermeiden lässt,
   steht schon fest eingerastet („voreingestellt“). Mindestens RL_MIN_OWN Walzen stoppt man selbst, das Zielwort immer. */
const RL_MIN_OWN=2;
function reelsPlan(w,s,dir){
  const idT=tilesOf(s.id),glT=tilesOf(s.plain);
  if(idT.length<3||glT.length<3)return null;
  const from=dir==='gl2id'?s.plain:s.id,toks=dir==='gl2id'?idT:glT,toLang=dir==='gl2id'?'id':state.ui;
  let idx;
  if(dir==='gl2id'){
    const f=normId(tokensOf(w.id)[0]||'');idx=toks.findIndex(x=>normId(x)===f);
  }else{
    const m=s.tpl.match(/\[([^\]]+)\]/);idx=m?tokensOf(s.tpl.slice(0,m.index)).length:-1;
  }
  const found=idx>=0&&idx<toks.length;   // Zielwort im Satz gefunden? (z. B. „dua belas“ steht als „kedua belas“ im Satz: nicht gefunden)
  if(!found)idx=Math.floor(toks.length/2);
  const known=knownTokens(w),unk=new Set();   // Positionen unbekannter Wörter in toks
  const idUnknown=idT.filter(tk=>!isName(tk)&&!known.has(normId(tk)));
  if(dir==='gl2id'){idT.forEach((tk,i)=>{if(!isName(tk)&&!known.has(normId(tk)))unk.add(i);});}
  else for(const u of idUnknown){const eq=blockEquiv(u,glT);if(!eq)return null;eq.forEach(i=>unk.add(i));}
  if(found)unk.delete(idx);
  if(window.__rlAll)unk.clear();   // nur für Tests: alle Walzen selbst stoppen
  let best=null;
  for(let st=Math.max(0,idx-2);st<=Math.min(idx,toks.length-3);st++){
    const n=[0,1,2].filter(i=>unk.has(st+i)).length;
    if(!best||n<best.n||(n===best.n&&Math.random()<.5))best={st,n};
  }
  if(!best||3-best.n<RL_MIN_OWN)return null;
  const st=best.st,right=toks.slice(st,st+3);
  const reels=right.map((r,i)=>{
    const words=[r].concat(distractors(toks,toLang,9).filter(x=>x.length<=9).slice(0,2));
    const ws=shuffle(words);
    return {words:ws,right:ws.indexOf(r),given:unk.has(st+i)};
  });
  return {dir,toLang,from,toks,st,right,reels,before:toks.slice(0,st).join(' '),after:toks.slice(st+3).join(' '),full:toks.join(' '),
    fullFrom:from};
}
function reelsData(w){
  const s=sentOf(w);if(!s)return null;
  const dirs=Math.random()<.5?['gl2id','id2gl']:['id2gl','gl2id'];
  for(const d of dirs){const p=reelsPlan(w,s,d);if(p)return p;}
  return null;
}
const rlMod=(a,n)=>((a%n)+n)%n;
const rlEase=k=>{const c=1.4;return 1+(c+1)*Math.pow(k-1,3)+c*Math.pow(k-1,2);};

function showReels(w){
  const c=S.cur,L=curLang(),D=reelsData(w);
  const tries=triesFor('reels'),list=reduceMotion();
  const R={D,tries,miss:0,locked:D.reels.filter(r=>r.given).length,state:'idle',reels:D.reels.map((r,i)=>r.given?{words:r.words,right:r.right,p:r.right,v:0,st:'ok',t:0,p0:0,tgt:0,given:true}:({words:r.words,right:r.right,p:Math.random()*6,v:RL_FAST*(.9+Math.random()*.2),st:'fast',t:0,p0:0,tgt:0})),tick:0};
  c.rl=R;
  const maxLen=Math.max(...D.reels.map(r=>Math.max(...r.words.map(x=>x.length))));
  const fs=maxLen>8?'rw-s':maxLen>6?'rw-m':'';
  const ctx=(D.before||D.after)?`<p class="rl-ctx" lang="${D.toLang==='id'?L.code.toLowerCase():state.ui}">${esc(D.before)} <i>▮ ▮ ▮</i> ${esc(D.after)}</p>`:'';
  const bulbs=n=>'<i></i>'.repeat(n);
  const reelHtml=list?
    D.reels.map((r,i)=>`<div class="rl-pick" data-i="${i}" role="group" aria-label="${t('Walze {0}',i+1)}">${r.words.map((x,k)=>`<button class="opt" data-k="${k}" lang="${D.toLang==='id'?L.code.toLowerCase():state.ui}">${esc(x)}</button>`).join('')}</div>`).join(''):
    D.reels.map((r,i)=>`<div class="reel ${fs}" data-i="${i}" aria-label="${t('Walze {0}',i+1)}" lang="${D.toLang==='id'?L.code.toLowerCase():state.ui}">${[0,1,2,3,4].map(()=>'<div class="rw"><span></span></div>').join('')}</div>`).join('');
  sheetBody(`<div class="smain rl">${kicker(c,'reels',D.dir==='gl2id'?toIdl():toGl())}${roundLives()}
    <div id="rlm" class="rl-m">${mascot('reels_ready',null,'sm')}</div>
    <div class="sentbox hq" lang="${D.dir==='gl2id'?state.ui:L.code.toLowerCase()}">${esc(D.from)}${helpBtn('reels')}</div>${ctx}
    ${list?`<div class="rl-list">${reelHtml}</div>`:`<div class="cab" id="cab" data-st="idle">
      <div class="bl bt">${bulbs(11)}</div><div class="bl bb">${bulbs(11)}</div><div class="bl bl2">${bulbs(5)}</div><div class="bl br2">${bulbs(5)}</div>
      <div class="sign" id="sign">DEWI REELS</div>
      <div class="cbody"><div class="win" id="win" role="button" tabindex="0" aria-label="${t('Walzen stoppen')}">${reelHtml}</div>
        <div class="lev"><div class="track"></div><div class="knob" id="knob" role="button" tabindex="0" aria-label="${t('Hebel ziehen')}"></div></div></div>
    </div>`}
    <div id="exfb"></div></div>`);
  const cab=$('#cab'),sign=$('#sign');
  D.reels.forEach((r,i)=>{if(!r.given)return;   // voreingestellte Walzen sind schon eingerastet
    const e=$$('.reel',sheet)[i];if(e)e.classList.add('ok');
    const pk=$$('.rl-pick',sheet)[i];if(pk){pk.classList.add('ok');$$('.opt',pk).forEach((b,x)=>{b.disabled=true;if(x===r.right)b.classList.add('ok');});}});
  const say=k=>{const m=$('#rlm');if(m)m.innerHTML=mascot(k,null,'sm');};
  const alive=()=>!!$('#rlm');
  const el=i=>$$('.reel',sheet)[i];

  function paint(i){
    const r=R.reels[i],e=el(i);if(!e)return;
    const base=Math.round(r.p),d=r.p-base,n=r.words.length;
    e.querySelectorAll('.rw').forEach((row,k)=>{
      const off=k-2,txt=r.words[rlMod(base+off,n)],sp=row.firstChild;
      if(sp.textContent!==txt)sp.textContent=txt;
      row.style.transform=`translateY(${((off-d)*RL_ROW+RL_ROW).toFixed(1)}px)`;
      row.classList.toggle('mid',off===0);
    });
    e.classList.toggle('blur',r.v>5&&(r.st==='fast'||r.st==='slow'));
    if(R.last[i]!==base){R.last[i]=base;if(r.st==='slow'){const now=performance.now();if(now-R.tick>55){R.tick=now;sfx('tick');}}}
  }
  R.last=[];
  const curIdx=()=>R.reels.findIndex(r=>r.st!=='ok');
  function paintAll(){R.reels.forEach((_,i)=>paint(i));const a=R.state==='over'?-1:curIdx();$$('.reel',sheet).forEach((e,i)=>e.classList.toggle('act',i===a&&R.state==='spin'&&(R.reels[i].st==='slow'||R.reels[i].st==='snap')));}

  const root=$('.smain.rl');if(root&&R.locked)root.dataset.lk=String(R.locked);
  function finish(win){
    R.state='over';
    const jack=win&&R.miss===0;
    R.jack=jack;
    c.ok=c.ok&&win;settleCard();
    if(cab)cab.dataset.st=jack?'jack':win?'win':'lose';
    if(sign)sign.textContent=jack?'JACKPOT':win?'YES!':'GAME OVER';
    R.reels.forEach((r,i)=>{
      if(!win&&r.st!=='ok'){r.st='rev';r.p=r.right;const e=el(i);if(e){e.classList.remove('no');e.classList.add('rev');}}
      if(jack){const e=el(i);if(e)e.classList.add('gold');}
    });
    paintAll();
    if(win)diamondRain(jack?46:28);
    if(jack){sfx('jackpot');haptic([30,40,30,40,30,40,80]);const b=cab||sheet;burst(b,46);setTimeout(()=>alive()&&burst(b,34),350);}
    else if(win){sfx('gems');haptic([20,30,20]);}
    else{sfx('end_bad');}
    say(jack?'reels_jackpot':win?'reels_win':'reels_lose');
    const L2=D.toLang==='id'?L.code.toLowerCase():state.ui;
    R.resultHtml=`<div class="res ${win?'good':'bad'}" data-snd="1" role="status"><div class="rl">${jack?t('Jackpot!'):win?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair" lang="${L2}">${esc(D.full)}</div></div>
      ${jack?`<p class="hint" style="margin-top:8px">${t('Alles beim ersten Stopp getroffen.')}</p>`:''}${resultNote(win)}
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    if(root){root.dataset.end=win?'win':'lose';root.dataset.lk=String(R.locked);}
    R.tossAt=Date.now()+(win?1200:700);
    if(cab){
      $('#exfb').innerHTML=`<p class="rl-swipe" role="status">← ${t('Wische den Automaten nach links.')}</p>`;
      cab.setAttribute('role','button');cab.setAttribute('tabindex','0');cab.setAttribute('aria-label',t('Automaten wegwerfen'));
    }else R.showResult();
  }
  R.showResult=()=>{
    $('#exfb').innerHTML=R.resultHtml;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
  };
  /* Zum Schluss fliegt der Automat nach links vom Tisch, dann erscheinen Ergebnis und „Weiter“ */
  R.toss=instant=>{
    if(R.tossed||R.state!=='over'||!cab)return;
    R.tossed=true;
    const done=()=>{cab.style.display='none';if(root)root.classList.add('done');say('reels_toss');R.showResult();};
    if(instant||reduceMotion()){done();return;}
    sfx('tossed');haptic([20,70,60]);
    cab.style.transition='transform .38s cubic-bezier(.5,0,.85,.5)';
    cab.style.transform='translate(-150%,50px) rotate(-26deg)';
    setTimeout(done,400);
  };

  /* Ein Versuch für Walze i mit Wort k (von Hand oder Liste) */
  function attempt(i,k){
    const r=R.reels[i];
    if(R.state!=='spin'&&!list)return;
    if(R.state==='over'||r.st==='ok')return;
    if(k===r.right){
      r.st='ok';R.locked++;if(root)root.dataset.lk=String(R.locked);
      const e=el(i);if(e){e.classList.remove('no');e.classList.add('ok');}
      const pk=$$('.rl-pick',sheet)[i];if(pk){pk.classList.add('ok');$$('.opt',pk).forEach((b,x)=>{b.disabled=true;if(x===k)b.classList.add('ok');});}
      sfx('rwin');haptic([22]);
      if(R.locked===3)finish(true);
      else{say('reels_ok');const nx=R.reels.find(x=>x.st==='fast');if(nx)nx.st='slow';}
    }else{
      R.miss++;r.st='no';
      const e=el(i);if(e){e.classList.add('no');}
      const pk=$$('.rl-pick',sheet)[i];if(pk){const b=$$('.opt',pk)[k];if(b){b.classList.add('no');b.disabled=true;}}
      sfx('rbad');haptic([40,30,40]);
      if(R.miss>=R.tries)finish(false);
      else{say('reels_bad');if(!list)r.t=0;else r.st='fast';}
    }
  }

  function stop(i){
    const r=R.reels[i];
    if(R.state!=='spin'||r.st!=='slow')return;
    r.st='snap';r.t=0;r.p0=r.p;r.tgt=Math.round(r.p+r.v*.07);
    sfx('thunk');haptic([8]);
  }

  R.frame=dt=>{
    if(R.state==='over')return;
    R.reels.forEach((r,i)=>{
      if(r.st==='fast'||r.st==='slow'){
        const tg=r.st==='fast'?RL_FAST:RL_SLOW;r.v+=(tg-r.v)*Math.min(1,dt*4);r.p+=r.v*dt;
      }else if(r.st==='snap'){
        r.t+=dt;const k=Math.min(1,r.t/.24);r.p=r.p0+(r.tgt-r.p0)*rlEase(k);
        if(k>=1){r.p=r.tgt;r.st='idle';attempt(i,rlMod(r.tgt,r.words.length));}
      }else if(r.st==='no'){
        r.t+=dt;
        if(r.t>=.6&&R.state==='spin'){r.st='slow';r.v=RL_SLOW*2;r.p=Math.random()*r.words.length;const e=el(i);if(e)e.classList.remove('no');}
      }
    });
    paintAll();
  };
  R.stop=stop;
  R.stopNext=()=>{const i=curIdx();if(i>=0&&R.state==='spin')stop(i);};   // immer die linkeste noch offene Walze
  R.pull=()=>{
    if(R.state!=='idle')return;
    R.state='spin';
    const f=R.reels.findIndex(r=>r.st==='fast');if(f>=0)R.reels[f].st='slow';
    if(cab)cab.dataset.st='spin';if(sign)sign.textContent='TAP!';
    paintAll();
    sfx('lever');sfx('whirr',320);haptic([14]);
    const knob=$('#knob');if(knob){knob.classList.add('pulled');knob.style.setProperty('--ly','74px');setTimeout(()=>knob.style.setProperty('--ly','0px'),170);setTimeout(()=>knob.classList.remove('pulled'),600);}
  };

  if(list){
    R.state='spin';
    $$('.rl-pick',sheet).forEach((pk,i)=>$$('.opt',pk).forEach(b=>b.onclick=()=>attempt(i,+b.dataset.k)));
    return;
  }
  paintAll();
  /* Ganzer Automat: Tippen irgendwo stoppt die nächste Walze (links nach rechts). Der Hebel hat seine eigene Bedienung. */
  let sw=null;
  cab.addEventListener('pointerdown',ev=>{
    if(R.state==='over'){
      if(R.tossed||Date.now()<R.tossAt)return;
      sw={x:ev.clientX,dx:0};try{cab.setPointerCapture(ev.pointerId);}catch(e){}cab.style.transition='none';return;
    }
    if(ev.target.closest('#knob'))return;ev.preventDefault();R.stopNext();
  });
  cab.addEventListener('pointermove',ev=>{
    if(!sw)return;sw.dx=Math.min(0,ev.clientX-sw.x);
    cab.style.transform=`translateX(${sw.dx}px) rotate(${(sw.dx/14).toFixed(1)}deg)`;
  });
  const swEnd=()=>{
    if(!sw)return;const dx=sw.dx;sw=null;
    if(dx<-70){cab.style.transition='';cab.style.transform=`translateX(${dx}px) rotate(${(dx/14).toFixed(1)}deg)`;R.toss();}
    else{cab.style.transition='transform .3s cubic-bezier(.3,1.5,.5,1)';cab.style.transform='';}
  };
  cab.addEventListener('pointerup',swEnd);cab.addEventListener('pointercancel',swEnd);
  cab.addEventListener('keydown',ev=>{if(R.state==='over'&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();if(Date.now()>=R.tossAt)R.toss();}});
  const wn=$('#win');wn.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();R.stopNext();}});
  wn.addEventListener('click',ev=>{if(ev.detail===0)R.stopNext();});   // Tastatur / Hilfsmittel
  /* Hebel: ziehen oder antippen */
  const knob=$('#knob');let drag=null;
  const setY=y=>knob.style.setProperty('--ly',y+'px');
  knob.addEventListener('pointerdown',ev=>{ev.preventDefault();if(R.state!=='idle')return;drag={y:ev.clientY};try{knob.setPointerCapture(ev.pointerId);}catch(e){}knob.classList.add('drag');});
  knob.addEventListener('pointermove',ev=>{if(!drag)return;const y=Math.max(0,Math.min(74,ev.clientY-drag.y));setY(y);if(y>=60&&R.state==='idle'){drag=null;knob.classList.remove('drag');setY(0);R.pull();}});
  const end=()=>{if(!drag)return;const moved=parseFloat(knob.style.getPropertyValue('--ly'))||0;drag=null;knob.classList.remove('drag');setY(0);if(R.state==='idle'&&moved<20)R.pull();};
  knob.addEventListener('pointerup',end);knob.addEventListener('pointercancel',()=>{drag=null;knob.classList.remove('drag');setY(0);});
  knob.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();R.pull();}});
  let last=0;
  const loop=ts=>{
    if(!alive()||R.state==='over'&&R.done)return;
    const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;
    R.frame(dt);
    if(R.state==='over'){R.done=true;return;}
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

registerModule({id:'reels',name:()=>t('Reels'),desc:()=>t('Hebel ziehen, Walzen beim richtigen Wort stoppen'),tone:'t3',solo:true,isNew:true,fallback:'choice',
  icon:'<svg width="46" height="40" viewBox="0 0 46 40" aria-hidden="true"><rect x="2" y="6" width="36" height="28" rx="6" fill="#ff4fa3" stroke="#ffcf4a" stroke-width="2.5"/><rect x="7" y="12" width="8" height="16" rx="2" fill="#fff"/><rect x="17" y="12" width="8" height="16" rx="2" fill="#fff"/><rect x="27" y="12" width="8" height="16" rx="2" fill="#fff"/><path d="M5 20h30" stroke="#e0295a" stroke-width="1.5"/><rect x="40" y="10" width="3" height="16" rx="1.5" fill="#ffcf4a"/><circle cx="41.5" cy="8" r="4" fill="#e0295a" stroke="#fff" stroke-width="1"/></svg>',
  can:w=>!!reelsData(w),show:w=>showReels(w)});
