/* ===== Sounds: alles per Web Audio erzeugt, keine Dateien nötig ===== */
const SND={ctx:null,master:null,last:0};
const soundOn=()=>state.sound!==false&&(+state.vol||0)>0;
function ac(){
  if(!soundOn())return null;
  try{
    if(!SND.ctx){
      const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
      SND.ctx=new C();SND.master=SND.ctx.createGain();SND.master.connect(SND.ctx.destination);
    }
    if(SND.ctx.state==='suspended'&&SND.ctx.resume)SND.ctx.resume();
    SND.master.gain.value=Math.min(1,Math.max(0,(+state.vol||0)/100));
    return SND.ctx;
  }catch(e){return null;}
}
/* Ein Ton: Hüllkurve mit weichem Einsatz und exponentiellem Ausklang */
function tone(c,f,at,dur,o){
  o=o||{};
  const osc=c.createOscillator(),g=c.createGain(),t0=c.currentTime+at,v=o.v==null?.3:o.v;
  osc.type=o.type||'sine';
  osc.frequency.setValueAtTime(f,t0);
  if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t0+dur);
  g.gain.setValueAtTime(0.0001,t0);
  g.gain.linearRampToValueAtTime(v,t0+Math.min(.008,dur/3));
  g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  osc.connect(g);g.connect(SND.master);
  osc.start(t0);osc.stop(t0+dur+.03);
}
function noise(c,at,dur,v,fc){
  const n=Math.max(1,Math.floor(c.sampleRate*dur)),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t0=c.currentTime+at;
  s.buffer=buf;f.type='lowpass';f.frequency.value=fc||1200;g.gain.value=v;
  s.connect(f);f.connect(g);g.connect(SND.master);s.start(t0);
}
/* Blip-Tonhöhe je Stimmung: [Grundton, Dauer, Glide, Wellenform] */
const BLIP={haughty:[520,.06,1.04,'sine'],bored:[300,.09,.94,'sine'],annoyed:[430,.045,.97,'triangle'],sly:[480,.07,1.08,'sine'],shades:[400,.06,1,'triangle'],sleep:[230,.11,.97,'sine'],mean:[340,.05,.9,'triangle'],superior:[610,.06,1.03,'sine'],uninterested:[280,.08,.96,'sine'],surprised:[760,.05,1.12,'sine'],content:[560,.06,1.04,'sine']};
function blip(mood,ch){
  const c=ac();if(!c)return;
  const b=BLIP[mood]||BLIP.haughty,k=((ch.codePointAt(0)||0)%7)-3;   // jeder Buchstabe leicht anders, wie bei Animal Crossing
  const f=b[0]*Math.pow(1.045,k);
  tone(c,f,0,b[1],{type:b[3],v:.22,to:f*b[2]});
}
const SFX={
  click(c){tone(c,720,0,.03,{v:.1,to:600});},
  pop(c){tone(c,300,0,.09,{v:.2,to:520});},
  right(c){tone(c,784,0,.07,{type:'triangle',v:.3});tone(c,1175,.07,.12,{type:'triangle',v:.3});},          // knapper, frecher Ping
  wrong(c){tone(c,277,0,.16,{type:'triangle',v:.3,to:262});tone(c,233,.16,.26,{type:'triangle',v:.3,to:196});},   // spöttisches „wuup wuup“
  retry(c){tone(c,262,0,.14,{type:'triangle',v:.26,to:208});},
  stamp(c){tone(c,170,0,.14,{v:.7,to:52});noise(c,0,.07,.18,1500);tone(c,92,.02,.16,{type:'triangle',v:.35,to:46});},
  glitter(c){[0,.05,.1,.17].forEach((a,i)=>tone(c,[2093,2637,3136,3951][i]*(1+Math.random()*.02),a,.09,{v:.09}));},
  end_good(c){[523,659,784].forEach((f,i)=>tone(c,f,i*.09,.16,{type:'triangle',v:.28}));},
  end_perfect(c){[523,659,784,1047,1319].forEach((f,i)=>tone(c,f,i*.08,.2,{type:'triangle',v:.28}));SFX.glitter(c);},
  end_bad(c){tone(c,392,0,.16,{type:'triangle',v:.26,to:370});tone(c,311,.17,.28,{type:'triangle',v:.26,to:277});}
};
function sfx(name,delay){
  const run=()=>{const c=ac();if(c&&SFX[name])SFX[name](c);};
  if(!soundOn())return;
  if(delay)setTimeout(run,delay);else run();
}
/* Klicks, Antworten und neue Blasen automatisch erkennen */
try{
  document.addEventListener('click',e=>{
    const el=e.target&&e.target.closest&&e.target.closest('button,.tile,.opt,summary,[role=radio]');
    if(el&&!el.closest('.bubble'))sfx('click');
  },true);
  const scanSnd=()=>{
    $$('.res:not([data-snd])').forEach(r=>{r.setAttribute('data-snd','1');sfx(r.classList.contains('good')?'right':'wrong',60);});
    $$('.fb.bad:not([data-snd])').forEach(r=>{r.setAttribute('data-snd','1');sfx('retry',60);});
  };
  new MutationObserver(scanSnd).observe(document.body,{childList:true,subtree:true});
}catch(e){}
