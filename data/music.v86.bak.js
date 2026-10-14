/* ===== Musik: zwei Loops, live per Web Audio erzeugt (keine Dateien) =====
   lofi   = sanfter Basis-Soundtrack der ganzen App
   synth  = Synthwave nur im Modul Reels; wird mit jeder gelockten Walze voller
   Schalter: state.music (Standard aus) und state.mvol; läuft unabhängig von den Effekt-Sounds.
   Ein Timer plant die Noten ein kleines Stück voraus (Lookahead), dadurch bleibt der Takt stabil. */
const MUS={mode:null,bus:null,next:0,step:0,timer:0,duck:1,since:0};
const musicOn=()=>state.music===true&&(+state.mvol||0)>0;
const mtof=m=>440*Math.pow(2,(m-69)/12);
function musCtx(){
  try{
    if(SND.ctx&&SND.ctx.state==='closed'){SND.ctx=null;SND.master=null;SND.mgain=null;MUS.bus=null;MUS.mode=null;}   // iOS kann den Kontext beenden: neu aufbauen
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
const BPM={lofi:76,synth:118};
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
  const on=musicOn()&&!document.hidden;
  let want=null;
  if(on)want=document.querySelector('.smain.rl')?'synth':'lofi';
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
  /* Pegel nur bei Änderung setzen (sonst häuft sich alle 90 ms ein Automations-Ereignis an und überschreibt das Einblenden) */
  try{if(c.currentTime-(MUS.since||0)>1&&MUS.duck!==duck&&MUS.bus.gain.setTargetAtTime){MUS.bus.gain.cancelScheduledValues(c.currentTime);MUS.bus.gain.setTargetAtTime(duck,c.currentTime,.06);MUS.duck=duck;}}catch(e){}
  if(c.state!=='running')return;   // nichts einplanen, solange iOS den Ton angehalten hat (sonst läuft der Takt beim Weiterspielen durcheinander)
  if(MUS.next<c.currentTime-.5)MUS.next=c.currentTime+.05;
  const sd=stepDur(MUS.mode);let guard=0;
  while(MUS.next<c.currentTime+.3&&guard++<12){
    const at=MUS.next-c.currentTime;
    if(MUS.mode==='lofi')lofiStep(c,MUS.step,at,MUS.bus);else synthStep(c,MUS.step,at,MUS.bus,L);
    MUS.step++;MUS.next+=sd;
  }
}
function musIcon(){
  const on=musicOn();
  return `<button class="iconbtn sm musbtn" aria-pressed="${on}" aria-label="${t('Musik')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="spk" d="M4 9v6h4l5 4V5L8 9z"/><path class="wv" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/><path class="mt" d="M16 9l5 6M21 9l-5 6"/></svg></button>`;
}
function musRefresh(){
  $$('.musbtn').forEach(b=>b.setAttribute('aria-pressed',String(musicOn())));
  $$('[data-mus]').forEach(b=>b.setAttribute('aria-checked',String((state.music===true)===(b.dataset.mus==='true'))));
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
