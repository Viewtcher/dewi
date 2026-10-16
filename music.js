/* ===== Musik: zwei Loops, live per Web Audio erzeugt (keine Dateien) =====
   lofi   = sanfter Basis-Soundtrack der ganzen App
   synth  = Synthwave nur im Modul Reels; wird mit jeder gelockten Walze voller
   holo   = „Indie“ (früher „Holo-Aufstieg“, Claudio, dewi-music.js): dritter Soundtrack, siehe Verbindungsstück unten
   Schalter: state.mvol (Regler, 0 = aus; state.music folgt ihm, Version 151) und der Sound-Schalter state.sound, der alles stumm macht.
   Ein Timer plant die Noten ein kleines Stück voraus (Lookahead), dadurch bleibt der Takt stabil. */
const MUS={mode:null,bus:null,next:0,step:0,timer:0,duck:1,since:0,holo:false};
const musicOn=()=>state.sound!==false&&state.music===true&&(+state.mvol||0)>0;   // Version 151: Sound aus = auch Musik aus
const mtof=m=>440*Math.pow(2,(m-69)/12);
function musCtx(){
  try{
    if(SND.ctx&&SND.ctx.state==='closed'){SND.ctx=null;SND.master=null;SND.mgain=null;SND.dgain=null;MUS.bus=null;MUS.mode=null;}   // iOS kann den Kontext beenden: neu aufbauen
    if(!SND.ctx){
      const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
      SND.ctx=new C();SND.master=SND.ctx.createGain();SND.master.connect(SND.ctx.destination);
      try{SND.ctx.onstatechange=()=>{if(SND.ctx&&SND.ctx.state!=='running'&&musicOn()&&SND.ctx.resume)SND.ctx.resume().catch(()=>{});};}catch(e){}
    }
    /* iOS meldet nach Anruf, App-Wechsel oder Sperre „interrupted“ (nicht nur „suspended“): immer wieder anstoßen, wenn nicht „running“ */
    if(SND.ctx.state!=='running'&&SND.ctx.resume){try{SND.ctx.resume().catch(()=>{});}catch(e){}}
    if(!SND.mgain){SND.mgain=SND.ctx.createGain();SND.mgain.connect(SND.ctx.destination);}
    SND.mgain.gain.value=Math.min(1,Math.max(0,(+state.mvol||0)/100))*.6;
    return SND.ctx;
  }catch(e){return null;}
}
const BPM={lofi:76,synth:118,arcade:124};
const stepDur=m=>60/BPM[m]/4;
/* Lo-Fi: vier Akkorde (Fmaj7, Em7, Dm7, Cmaj7), je ein Takt à 16 Schritte */
const LF_CH=[[53,57,60,64],[52,55,59,62],[50,53,57,60],[48,52,55,59]];
const LF_ME=[[9,0,7,0,4],[7,0,4,0,2],[5,0,9,0,7],[4,0,7,0,0]];   // lockere Melodie-Töne (Halbtöne über Wurzel, 0 = Pause)
function lofiStep(c,st,at,o){
  const bar=Math.floor(st/16)%4,i=st%16,ch=LF_CH[bar],sw=(i%4===2)?.03:0,hu=Math.random()*.012;
  if(i===0||i===10){
    ch.forEach((m,k)=>{const f=mtof(m+12);tone(c,f,at+hu+k*.014,i===0?1.1:.7,{v:.034,dest:o});tone(c,f*2,at+hu+k*.014,.35,{type:'triangle',v:.01,dest:o});});
  }
  if(i===0||i===7||i===10)tone(c,mtof(ch[0]-12),at,.5,{v:.13,dest:o});
  if(i===0||i===10)tone(c,130,at,.2,{v:.2,to:44,dest:o});
  if(i===4||i===12){noise(c,at,.13,.05,3200,{dest:o});tone(c,185,at,.09,{type:'triangle',v:.03,to:140,dest:o});}
  if(i%2===0)noise(c,at+sw,.035,.016,9000,{type:'highpass',dest:o});
  const me=LF_ME[bar][Math.floor(i/4)];
  if(i%4===1&&me&&(bar+i)%3!==0)tone(c,mtof(ch[0]+24+me-(me>8?12:0)),at+sw,.5,{v:.028,dest:o});
}
/* Synthwave: Am, F, C, G; Schichten je nach gelockten Walzen (0 bis 3) */
const SY_CH=[[57,60,64],[53,57,60],[55,60,64],[55,59,62]],SY_RT=[33,29,36,31];
const SY_LEAD=[[0,0,12,0,10,0,7,0],[5,0,9,0,7,0,5,0],[7,0,12,0,11,0,7,0],[7,0,10,0,7,0,2,0]];
function synthStep(c,st,at,o,L){
  const bar=Math.floor(st/16)%4,i=st%16,ch=SY_CH[bar],rt=SY_RT[bar];
  if(i%4===0){tone(c,150,at,.2,{v:.3,to:40,dest:o});noise(c,at,.03,.05,2000,{dest:o});}
  if(i%2===0){const up=(i/2)%4===3;tone(c,mtof(rt+(up?12:0)),at,.15,{type:'sawtooth',v:.075,dest:o});}
  if(L>=1){
    if(i%4===2)noise(c,at,.04,.03,9000,{type:'highpass',dest:o});
    const a=[0,1,2,1][(i>>0)%4],n=ch[a]+24;tone(c,mtof(n),at,.1,{type:'square',v:.026,dest:o});
  }
  if(L>=2){
    if(i===4||i===12){noise(c,at,.16,.1,3500,{dest:o});tone(c,210,at,.12,{type:'triangle',v:.07,to:160,dest:o});}
    if(i%2===1)noise(c,at,.02,.02,9500,{type:'highpass',dest:o});
    if(i===0)ch.forEach(m=>tone(c,mtof(m),at,stepDur('synth')*15,{type:'triangle',v:.032,dest:o}));
  }
  if(L>=3){
    const l=SY_LEAD[bar][Math.floor(i/2)];
    if(i%2===0&&l)tone(c,mtof(ch[0]+24+l-12),at,.24,{type:'sawtooth',v:.04,dest:o});
    if(i===0)tone(c,mtof(rt+24),at,.5,{type:'square',v:.02,dest:o});
  }
}
/* Casino-Arcade: C, Am, F, G in Dur. Stufe L (0 bis 3): 0 = Bass, Drums, Akkordstöße; 1 = + Hi-Hat, Glitzer-Arpeggio; 2 = + Glockenmelodie; 3 = + Oktav-Doppelung, 16tel-Hi-Hat */
const AR_CH=[[60,64,67],[57,60,64],[57,60,65],[59,62,67]],AR_RT=[36,33,29,31];
const AR_ME=[[76,0,79,0,76,74,72,0],[76,0,72,0,69,0,72,0],[77,0,81,0,77,76,72,0],[74,0,77,0,74,71,67,0]];
function arcadeStep(c,st,at,o,L){
  const bar=Math.floor(st/16)%4,i=st%16,ch=AR_CH[bar],rt=AR_RT[bar];
  if(i===0||i===8||(L>=2&&i===6)){tone(c,160,at,.16,{v:.26,to:42,dest:o});}
  if(i===4||i===12){noise(c,at,.09,.05,4200,{dest:o});tone(c,220,at,.06,{type:'triangle',v:.03,to:150,dest:o});}
  if(i%8===0)tone(c,mtof(rt),at,.2,{type:'square',v:.07,dest:o});
  if(i%8===4)tone(c,mtof(rt+7),at,.16,{type:'triangle',v:.12,dest:o});
  if(L>=2&&i%8===6)tone(c,mtof(rt+12),at,.1,{type:'square',v:.04,dest:o});
  if(i===2||i===6||i===10||i===14)ch.forEach(m=>{tone(c,mtof(m),at,.09,{type:'square',v:.016,dest:o});tone(c,mtof(m+12),at,.07,{type:'triangle',v:.012,dest:o});});
  if(L>=1){
    if(i%2===1||L>=3)noise(c,at,.025,.017,9500,{type:'highpass',dest:o});
    if(i%2===0){const n=ch[[0,1,2,1][(i>>1)%4]]+24;tone(c,mtof(n),at,.2,{v:.022,dest:o});}
  }
  if(L>=2){
    const n=AR_ME[bar][i>>1];
    if(i%2===0&&n){
      tone(c,mtof(n),at,.32,{v:.05,dest:o});
      tone(c,mtof(n)*3.01,at,.12,{v:.012,dest:o});
      if(L>=3)tone(c,mtof(n+12),at,.2,{type:'triangle',v:.016,dest:o});
    }
  }
  if(L>=3&&i===15)tone(c,mtof(ch[2]+24),at,.16,{type:'square',v:.012,to:mtof(ch[2]+36),dest:o});
}
/* ===== Verbindungsstück zu „Indie“ (früher „Holo-Aufstieg“, dewi-music.js, Version 129) =====
   Claudios Modul bleibt klanglich unverändert. Hier wird nur gesteuert:
   - gleicher AudioContext wie die Effekt-Sounds (SND.ctx), nur ein Kontext
   - Schalter und Lautstärke kommen aus state (music, mvol, mtrack), nicht aus eigenem Speicher
   - Arpeggio nur im Modul Reels: wird am Bildschirm erkannt (.smain.rl), deshalb schaltet es sich bei JEDEM
     Verlassen (Abbruch, Zurück, Ende) von selbst wieder aus, ohne dass jede Ausstiegsstelle daran denken muss
   - Hintergrund/Vordergrund regelt das Modul selbst (pausiert und läuft an derselben Stelle weiter)
   Fällt der AudioContext weg (iOS schließt ihn selten), kann das Modul sich nicht neu aufbauen:
   dann läuft bis zum nächsten Öffnen der Lo-Fi-Loop (HOLO.failed). */
const HOLO={ctx:null,on:false,vol:-1,reels:false,gover:0,rno:false,lose:false,failed:false};
const holoWant=()=>musicOn()&&state.mtrack==='holo'&&!HOLO.failed&&!!window.DewiMusic;
function holoStop(){
  const dm=window.DewiMusic;
  if(HOLO.on&&dm){try{dm.setEnabled(false);dm.setReelsMode(false);}catch(e){}}
  HOLO.on=false;HOLO.reels=false;MUS.holo=false;
}
function holoRun(){
  const dm=window.DewiMusic;if(!dm||document.hidden)return;   // im Hintergrund pausiert das Modul selbst
  const c=SND.ctx||musCtx();if(!c)return;
  if(c.state==='closed'||(HOLO.ctx&&HOLO.ctx!==c)){HOLO.failed=true;holoStop();return;}
  if(!HOLO.on){
    if(c.state!=='running'){try{c.resume().catch(()=>{});}catch(e){}return;}   // erst nach der ersten Berührung
    HOLO.ctx=c;HOLO.vol=-1;
    try{dm.unlock(c);dm.setEnabled(true);}catch(e){HOLO.failed=true;return;}
    HOLO.on=true;MUS.holo=true;
  }
  const v=Math.min(1,Math.max(0,(+state.mvol||0)/100));
  if(v!==HOLO.vol){dm.setVolume(v);HOLO.vol=v;}
  const rl=!!document.querySelector('.smain.rl');
  if(rl!==HOLO.reels){dm.setReelsMode(rl);HOLO.reels=rl;}
  /* Absenken wie bei den anderen Soundtracks: Game Over im Survival, falsche Walze, verlorene Reels-Runde */
  const go=window.__gover&&Date.now()-window.__gover<4000?window.__gover:0;
  if(go&&go!==HOLO.gover){HOLO.gover=go;dm.duck(3);}
  const rno=!!document.querySelector('.reel.no');
  if(rno&&!HOLO.rno)dm.duck(.8);
  HOLO.rno=rno;
  const rt=document.querySelector('.smain.rl'),lose=!!(rt&&rt.dataset.end==='lose');
  if(lose&&!HOLO.lose)dm.duck(2.5);
  HOLO.lose=lose;
}
function musSwitch(want){
  const c=SND.ctx;
  if(MUS.bus&&c){
    const old=MUS.bus,now=c.currentTime;
    try{old.gain.cancelScheduledValues(now);old.gain.setValueAtTime(Math.max(.0001,old.gain.value),now);old.gain.linearRampToValueAtTime(0.0001,now+.6);}catch(e){}
    setTimeout(()=>{try{old.disconnect();}catch(e){}},900);
  }
  MUS.bus=null;MUS.mode=want;MUS.step=0;
  if(!want||!c)return;
  const b=c.createGain(),now=c.currentTime;b.gain.value=.0001;
  try{b.gain.setValueAtTime(.0001,now);b.gain.linearRampToValueAtTime(1,now+.8);}catch(e){b.gain.value=1;}
  b.connect(SND.mgain);MUS.bus=b;MUS.next=now+.1;MUS.duck=1;MUS.since=now;
}
function musTick(){
  const on=musicOn()&&!document.hidden,holo=holoWant();
  let want=null;
  if(on&&!holo)want=document.querySelector('.smain.rl')?'synth':(state.mtrack==='arcade'?'arcade':'lofi');
  if(holo)holoRun();else if(HOLO.on)holoStop();
  if(holo&&HOLO.failed&&on)want=document.querySelector('.smain.rl')?'synth':'lofi';   // Holo ist ausgefallen: sofort Lo-Fi statt Stille
  if(want&&!SND.ctx&&!musCtx())want=null;
  if(want&&SND.ctx&&SND.ctx.state!=='running'){try{SND.ctx.resume().catch(()=>{});}catch(e){}}
  if(want!==MUS.mode)musSwitch(want);
  if(!MUS.mode||!SND.ctx||!MUS.bus)return;
  const c=SND.ctx;
  try{SND.mgain.gain.value=Math.min(1,Math.max(0,(+state.mvol||0)/100))*.6;}catch(e){}
  let L=0,duck=1;
  if(MUS.mode==='synth'){
    const rt=document.querySelector('.smain.rl');
    if(rt){
      L=Math.min(3,+rt.dataset.lk||0);
      if(document.querySelector('.reel.no'))duck=.3;
      if(rt.dataset.end==='lose'){L=0;duck=.25;}
    }
  }
  if(window.__gover&&Date.now()-window.__gover<4000)duck=.2;
  /* Pegel nur bei Änderung setzen (sonst häuft sich alle 90 ms ein Automations-Ereignis an und überschreibt das Einblenden) */
  if(MUS.mode==='arcade'){   // Intensität: Survival mit Serie und wenig Leben wird dichter, sonst mittlere Stufe
    L=1;
    try{if(S&&S.kind==='survival'){L=1+((S.run||0)>=4?1:0)+((S.run||0)>=10?1:0)+(S.lives===1?1:0);}}catch(e){}
    L=Math.min(3,L);
  }
  try{if(c.currentTime-(MUS.since||0)>1&&MUS.duck!==duck&&MUS.bus.gain.setTargetAtTime){MUS.bus.gain.cancelScheduledValues(c.currentTime);MUS.bus.gain.setTargetAtTime(duck,c.currentTime,.06);MUS.duck=duck;}}catch(e){}
  if(c.state!=='running')return;   // nichts einplanen, solange iOS den Ton angehalten hat (sonst läuft der Takt beim Weiterspielen durcheinander)
  if(MUS.next<c.currentTime-.5)MUS.next=c.currentTime+.05;
  const sd=stepDur(MUS.mode);let guard=0;
  while(MUS.next<c.currentTime+.3&&guard++<12){
    const at=MUS.next-c.currentTime;
    if(MUS.mode==='lofi')lofiStep(c,MUS.step,at,MUS.bus);else if(MUS.mode==='arcade')arcadeStep(c,MUS.step,at,MUS.bus,L);else synthStep(c,MUS.step,at,MUS.bus,L);
    MUS.step++;MUS.next+=sd;
  }
}
function musIcon(){
  const on=musicOn();
  return `<button class="iconbtn sm musbtn" aria-pressed="${on}" aria-label="${t('Musik')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="spk" d="M4 9v6h4l5 4V5L8 9z"/><path class="wv" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="mt" d="M16 9l5 6M21 9l-5 6"/></svg></button>`;
}
/* gewählter Soundtrack: lofi (Standard), arcade oder holo */
const trackOf=()=>state.mtrack==='arcade'||state.mtrack==='holo'?state.mtrack:'lofi';
function musRefresh(){
  $$('.musbtn').forEach(b=>b.setAttribute('aria-pressed',String(musicOn())));
  $$('[data-trk]').forEach(b=>b.setAttribute('aria-checked',String(trackOf()===b.dataset.trk)));
  $$('#mvol').forEach(mv=>{const v=state.music===true?(+state.mvol||0):0;if(+mv.value!==v)mv.value=v;});   // Version 151: Regler statt An/Aus, die Soundtrack-Wahl bleibt immer sichtbar
}
function musSet(on){
  state.music=!!on;save();
  if(state.music&&!(+state.mvol>0))state.mvol=35;
  if(state.music)musCtx();
  musRefresh();musTick();
}
try{
  document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('.musbtn');if(b){musSet(!musicOn());if(musicOn())sfx('pop');}});
  // Nach dem Neuladen darf iOS erst nach der ersten Berührung Ton abspielen
  const wake=()=>{if(musicOn()){musCtx();musTick();}};
  document.addEventListener('pointerdown',wake,{capture:true,passive:true});
  document.addEventListener('visibilitychange',musTick);
  window.addEventListener('pageshow',wake);window.addEventListener('focus',wake);
  MUS.timer=setInterval(musTick,90);
}catch(e){}
window.MUS=MUS;
