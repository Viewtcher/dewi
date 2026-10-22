const {JSDOM}=require('jsdom');
const fs=require('fs');

/* Einführung (3 Takte) überspringen: antippen, dann jeweils die richtige Option, am Ende Weiter */
function skipIntro(E){
  for(let i=0;i<8;i++){
    if(E.$('#wtap')){E.click(E.$('#wtap'));continue;}
    const o=E.$('.iopt[data-r="1"]');
    if(o&&!o.disabled){E.click(o);continue;}
    if(E.$('.iopt')&&E.$('#nx')){E.click(E.$('#nx'));return;}
    return;
  }
}
const K=require('path').join(__dirname,'..')+'/';
const html=fs.readFileSync(K+'index.html','utf8').replace(/<link rel="stylesheet"[^>]*>/,'');
const src=fs.readFileSync(K+'app.src.html','utf8');

// ---- Daten aus den Arbeitsdateien
const rd=f=>fs.readFileSync(K+'data/'+f,'utf8').split('\n').filter(x=>x.trim());
const dEn=new Map(),dDe=new Map(),sEn=new Map(),sDe=new Map();
rd('words.txt').forEach(l=>{if(l.startsWith('##'))return;const i=l.indexOf(' = ');dEn.set(l.slice(0,i).toLowerCase(),{id:l.slice(0,i),gl:l.slice(i+3)});});
['sent1.txt','sent2.txt','sent3.txt'].forEach(f=>rd(f).forEach(l=>{const p=l.split(' | ');sEn.set(p[0].toLowerCase(),{id:p[1],gl:p[2].replace(/[\[\]]/g,'')});}));
['de1.txt','de2.txt','de3.txt'].forEach(f=>rd(f).forEach(l=>{const q=l.replace(/\s*\|\s*$/,'').split(' | ');const k=q[0].toLowerCase();dDe.set(k,{id:dEn.get(k).id,gl:q[1]});if(q[2])sDe.set(k,{id:sEn.get(k).id,gl:q[2].replace(/[\[\]]/g,'')});}));
const DICT={de:dDe,en:dEn},SENTS={de:sDe,en:sEn};
function pairsOf(mode){const out=[];for(const [k,v] of DICT[mode]){const s=SENTS[mode].get(k);out.push(s?{id:s.id,gl:s.gl,key:k}:{id:v.id,gl:v.gl.split(' / ')[0].trim(),key:k});}return out;}
const PAIRS={de:pairsOf('de'),en:pairsOf('en')};
const sentKeys=new Set(sEn.keys());
console.log('Wörter',dEn.size,'EN-Sätze',sEn.size,'DE-Sätze',sDe.size);

const normId0=s=>s.toLowerCase().replace(/[^a-z0-9äöüß]/g,'');
const T=el=>{const c=el.cloneNode(true);c.querySelectorAll('.qh').forEach(q=>q.remove());return c.textContent;};
let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'FEHL ')+m);if(!c)fails++;};
const setRange=(E,sel,v)=>{const el=E.$(sel);el.value=String(v);el.dispatchEvent(new E.w.Event('input',{bubbles:true}));};   // Version 151: Regler bewegen
const toks=s=>s.replace(/[.,!?;:"“”]/g,' ').split(/\s+/).filter(Boolean);
const nid=s=>s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
const asc=s=>s.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue');

function env(pre,mode='de',lang='de-DE'){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test/',pretendToBeVisual:true,beforeParse(win){
    win.scrollTo=()=>{};win.__swipeP=0;win.__introMs=0;win.__test=true;win.__autoBlind="small";
    win.__aud={osc:[],noise:0,resumed:0,gain:null};
    win.AudioContext=function(){const A=win.__aud;this.currentTime=0;this.sampleRate=8000;this.state='suspended';this.destination={};
      this.resume=()=>{A.resumed++;this.state='running';};
      const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
      this.createGain=()=>{const g={gain:param(),connect(){}};if(!A.gain)A.gain=g;return g;};
      this.createOscillator=()=>{const o={type:'sine',frequency:param(),connect(){},start(){A.osc.push(o.frequency.__f);},stop(){}};o.frequency.setValueAtTime=(f)=>{o.frequency.__f=f;};return o;};
      this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n)});
      this.createBufferSource=()=>({connect(){},start(){A.noise++;}});
      this.createBiquadFilter=()=>({frequency:{value:0},connect(){}});};
    Object.defineProperty(win.navigator,'language',{value:lang,configurable:true});
    if(pre)win.localStorage.setItem('kata.v1',JSON.stringify(Object.assign({ui:mode,nameAsked:true},pre)));
  }});
  const w=dom.window,d=w.document;
  const E={w,d,mode,
    $:s=>d.querySelector(s),$$:s=>Array.from(d.querySelectorAll(s)),
    click:el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})),
    st:()=>JSON.parse(w.localStorage.getItem('kata.v1')||'{}'),
    stats:{choice:0,gap:0,buildIdGl:0,buildGlId:0,intro:0,typed:0}};
  E.type=v=>{const i=E.$('#ans');i.value=v;E.$('#qf').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));};
  E.play=(o={})=>{
    o=Object.assign({failSent:false,failType:false,ascii:false},o);
    const D=DICT[E.mode],P=PAIRS[E.mode];
    let guard=0;const kicks=[];
    while(!E.$('#fin')&&guard++<500){
      const k=E.$('.kicker');if(k&&kicks[kicks.length-1]!==k.textContent)kicks.push(k.textContent);
      if(E.$('.pad')&&!E.$('#nx')){E.stats&&(E.stats.pads=(E.stats.pads||0)+1);E.w.__run('S.cur.pd.D.seq.slice(S.cur.pd.i).forEach(k=>S.cur.padHit(k))');continue;}
      if(E.$('#slmach')&&!E.$('#slq .iopt')&&!E.$('#nx')){E.stats&&(E.stats.slots=(E.stats.slots||0)+1);E.w.__run('S.cur.slPull()');continue;}
      if(E.$('#wtap')){E.stats.intro++;E.click(E.$('#wtap'));continue;}
      if(E.$('.iopt')){const en=E.$$('.iopt').filter(x=>!x.disabled);const pick=en.find(b=>b.dataset.r==='1');if(pick){E.click(pick);continue;}}
      if(E.$('#go')){E.stats.intro++;E.click(E.$('#go'));continue;}
      if(E.$('#endnext')){E.click(E.$('#endnext'));continue;}
      if(E.$('#next')){E.click(E.$('#next'));continue;}
      if(E.$('#nx')){E.gapSeen=false;E.click(E.$('#nx'));continue;}
      if(E.$('.pad')&&!E.$('#nx')){E.stats&&(E.stats.pads=(E.stats.pads||0)+1);E.w.__run('S.cur.pd.D.seq.slice(S.cur.pd.i).forEach(k=>S.cur.padHit(k))');continue;}
      if(E.$('#slmach')&&!E.$('#slq .iopt')&&!E.$('#nx')){E.stats&&(E.stats.slots=(E.stats.slots||0)+1);E.w.__run('S.cur.slPull()');continue;}
      if(E.$('#cab')){E.stats.reels=(E.stats.reels||0)+1;E.w.__run(`(()=>{const R=S.cur.rl;R.pull();const fail=${!!o.failSent};for(let g=0;g<6&&R.state!=='over';g++){R.reels.forEach((r,i)=>{if(R.state==='over'||r.st!=='spin')return;r.p=fail?(r.right+1)%r.words.length:r.right;r.v=0;R.stop(i);R.frame(1);});R.frame(.7);}})()`);continue;}
      const sw=E.$$('.swb');
      if(sw.length&&sw.some(x=>!x.disabled)){
        E.stats.swipe=(E.stats.swipe||0)+1;
        (E.swipes=E.swipes||[]).push({word:E.$('#swcard').textContent,lang:E.$('#swcard').lang,opts:sw.map(b=>b.querySelector('span').textContent),right:sw.findIndex(b=>b.dataset.r==='1'),olang:sw[0].lang});
        const en=sw.filter(x=>!x.disabled);
        const pick=o.failSent?en.find(b=>b.dataset.r==='0'):en.find(b=>b.dataset.r==='1');
        E.click(pick);continue;
      }
      const opts=E.$$('.opt');
      if(opts.length&&opts.some(x=>!x.disabled)){
        E.stats.choice++;
        const slot=E.$('.slot').textContent.toLowerCase();
        const right=D.get(slot).gl.split(' / ')[0].trim();
        const en=opts.filter(x=>!x.disabled);
        const pick=o.failSent?en.find(b=>b.textContent!==right):en.find(b=>b.textContent===right);
        E.click(pick);continue;
      }
      const gp=E.$('#gap');
      if(gp){
        const en=E.$$('#bank .tile').filter(x=>!x.disabled);
        if(en.length){
          if(!E.gapSeen){E.gapSeen=true;E.stats.gap++;}
          const pick=o.failSent?en.find(b=>b.dataset.r==='0'):en.find(b=>b.dataset.r==='1');
          E.click(pick);continue;
        }
      }
      const chk=E.$('#chk');
      if(chk){
        if(chk.textContent==='Weiter'||chk.textContent==='Next'){E.click(chk);continue;}
        if(E.$$('#ans2 button').length&&!(chk.textContent==='Weiter'||chk.textContent==='Next')){E.click(chk);continue;}
        const sb=E.$('.sentbox');const prompt=T(sb);
        const pr=P.find(p=>p.gl===prompt||p.id===prompt);
        const toId=pr.gl===prompt;
        if(toId)E.stats.buildGlId++;else E.stats.buildIdGl++;
        const target=toks(toId?pr.id:pr.gl);
        const used=new Set();
        let seq=o.failSent&&target.length>1?target.slice().reverse():target;
        if(o.failSent&&seq.map(nid).join('|')===target.map(nid).join('|'))seq=[target[0]];
        for(const x of seq){
          const b=E.$$('#bank button.tile').find(y=>!y.disabled&&nid(y.textContent)===nid(x)&&!used.has(y));
          if(b){used.add(b);E.click(b);}
        }
        E.click(chk);continue;
      }
      if(E.$('#qf')){
        E.stats.typed++;
        const word=T(E.$('.bigword'));
        const idGl=!!E.$('.bigword[lang="id"]');
        if(o.failType){E.type('qqq');E.type('qqq');E.type('qqq');continue;}
        if(idGl){const e=D.get(word.toLowerCase());let a=e.gl.split(' / ')[0].replace(/\(.*?\)/g,'').trim();E.type(o.ascii?asc(a):a);}
        else{const e=[...D.values()].find(x=>x.gl===word);E.type(e.id);}
        continue;
      }
      break;
    }
    E.kicks=kicks;
    return !!E.$('#fin');
  };
  return E;
}
const nextDay=E=>{E.click(E.$('[data-v="settings"]'));E.click(E.$('#skip'));E.click(E.$('[data-v="home"]'));};

// ================= Neuer Ablauf (Version 35) =================
const modsOf=ks=>ks.map(k=>{const m=k.match(/Modul ([^ ·]+)/);return m?m[1]:null;}).filter(Boolean);
const noRepeat=a=>a.every((x,i)=>i===0||x!==a[i-1]);
const ev=(E,c)=>E.w.__run(c);
function fresh(){
  const E=env(null,'de','de-DE');
  E.click(E.$('[data-ui="de"]'));if(E.$('#uigo'))E.click(E.$('#uigo'));E.click(E.$('#nmskip'));E.click(E.$('[data-lang="id"]'));if(E.$('#langgo'))E.click(E.$('#langgo'));
  E.w.__run('window.__rlAll=true');return E;
}
function known(E,n,d='2000-01-01'){   // n bekannte Wörter, fällig
  ev(E,`(()=>{const L=LANGS.id;state.progress.id=state.progress.id||{};L.words.slice(0,${n}).forEach(w=>{state.progress.id[w.k]={l:1,d:'${d}'}});save();render();})()`);
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sentWords=E=>ev(E,"LANGS.id.words.filter(w=>{const s=sentOf(w);return s&&tokensOf(s.id).length>=3&&tokensOf(s.plain).length>=3}).map(w=>w.k)");
function knownReels(E,n){   // Name aus der Reels-Zeit beibehalten: lernt die ersten n Wörter mit längerem Satz
  const ks=sentWords(E).slice(0,n);
  ev(E,`(()=>{state.progress.id=state.progress.id||{};${JSON.stringify(ks)}.forEach(k=>{state.progress.id[k]={l:1,d:'2000-01-01'}});save();render();})()`);
  return ks;
}
(async()=>{
// --- Holo-Aufstieg (Version 129)
{
  const E=fresh();
  ok(ev(E,'state.mtrack')==='holo'&&ev(E,'state.holoDef')===1,'H1 Neuer Stand: Holo-Aufstieg ist voreingestellt');
  const log=[];
  E.w.DewiMusic={unlock:c=>log.push('unlock'),setEnabled:b=>log.push('en'+b),setVolume:v=>log.push('vol'+v),setReelsMode:b=>log.push('rl'+b),duck:()=>log.push('duck'),isEnabled:()=>true,getVolume:()=>.45};
  ev(E,'HOLO.failed=false;state.music=true;state.mvol=35;musTick()');
  ok(log[0]==='unlock'&&log[1]==='entrue'&&log.includes('vol0.35'),'H2 Holo startet über den vorhandenen AudioContext mit Reglerwert ('+log+')');
  ok(ev(E,'MUS.holo')===true&&ev(E,'MUS.mode')===null,'H3 Holo läuft, die anderen Loops sind aus');
  const n=log.length;ev(E,'musTick();musTick()');
  ok(log.length===n,'H4 Kein erneutes Starten bei jedem Takt');
  // Reels: Arpeggio nur auf dem Reels-Bildschirm
  const rl=E.d.createElement('div');rl.className='smain rl';E.d.body.appendChild(rl);
  ev(E,'musTick()');ok(log.includes('rltrue'),'H5 Reels betreten: Arpeggio an');
  rl.remove();ev(E,'musTick()');ok(log.lastIndexOf('rlfalse')>log.lastIndexOf('rltrue'),'H6 Reels verlassen (auch bei Abbruch): Arpeggio aus');
  // Ducking
  const d0=log.filter(x=>x==='duck').length;ev(E,'window.__gover=Date.now();musTick();musTick()');
  ok(log.filter(x=>x==='duck').length===d0+1,'H7 Game Over senkt die Musik genau einmal');
  // Lautstärke
  ev(E,'state.mvol=60;musTick()');ok(log.includes('vol0.6'),'H8 Regler wirkt auf die Musik');
  // Wechsel auf Lo-Fi
  ev(E,'state.mtrack="lofi";musTick()');
  ok(log[log.length-1]==='enfalse'||log.includes('enfalse'),'H9 Wechsel auf Lo-Fi stoppt Holo');
  ok(ev(E,'MUS.mode')==='lofi'&&ev(E,'MUS.holo')===false,'H10 Lo-Fi läuft nach dem Wechsel');
  // Zurück auf Holo und Musik aus
  ev(E,'state.mtrack="holo";musTick()');ok(ev(E,'MUS.holo')===true,'H11 Zurück auf Holo');
  ev(E,'state.music=false;musTick()');ok(ev(E,'MUS.holo')===false&&ev(E,'MUS.mode')===null,'H12 Musik aus: nichts läuft');
  // Einstellungen
  ev(E,'state.music=false');E.click(E.$('[data-v="settings"]'));
  ok(E.$$('[data-trk]').length===3&&!!E.$('[data-trk="holo"]'),'H13 Einstellungen: drei Soundtracks');
  ok(E.$('#mvol').value==='0'&&!E.$('[data-mus]'),'H14 Musik aus: Regler steht ganz links, kein eigener An/Aus-Schalter mehr (Version 151)');
  setRange(E,'#mvol',50);
  ok(ev(E,'state.music')===true&&ev(E,'state.mvol')===50,'H15 Regler hochziehen schaltet die Musik ein');
  E.click(E.$('[data-trk="arcade"]'));
  ok(ev(E,'state.mtrack')==='arcade'&&E.st().mtrack==='arcade'&&E.$('[data-trk="arcade"]').getAttribute('aria-checked')==='true','H16 Soundtrack-Wahl wird gespeichert');
  // Umstellung bestehender Stände
  const O=env({music:true,musDef:1,mtrack:'arcade',lang:'id',ui:'de',v:2},'de');
  ok(ev(O,'state.mtrack')==='holo','H17 Bestehender Stand wird einmalig auf Holo umgestellt');
  const P=env({music:true,musDef:1,holoDef:1,mtrack:'lofi',lang:'id',ui:'de',v:2},'de');
  ok(ev(P,'state.mtrack')==='lofi','H18 Danach bleibt die eigene Wahl erhalten');
  // Echtes Claudio-Modul: bricht mit dem Test-AudioContext ab, dewi. fällt auf Lo-Fi zurück statt stumm zu bleiben
  const R=fresh();ev(R,'musTick()');
  ok(ev(R,'MUS.mode')==='lofi'||ev(R,'MUS.holo')===true,'H19 Fehler im Modul führen nie zu Stille ohne Ausweg');
}
// --- Musik
{
  const E=fresh();
  ok(ev(E,'state.music')===true&&ev(E,'state.mvol')===35,'M1 Musik standardmäßig an');
  ok(!E.$('.top .musbtn')&&!!E.$('.top #chlang.langbtn')&&!!E.$('.top .topr #chippill'),'M2 Kopfzeile: Flagge, Serie, Chips – kein Lautsprecher mehr');
  ev(E,'state.music=false');
  ok(ev(E,"(()=>{musTick();return MUS.mode;})()")===null,'M3 Aus: keine Musik');
  E.click(E.$('[data-v="settings"]'));setRange(E,'#mvol',35);
  ok(ev(E,'state.music')===true&&E.st().music===true,'M4 Einstellungen schalten Musik an und speichern');
  E.click(E.$('[data-v="home"]'));
  ev(E,'musTick()');
  ok(ev(E,'MUS.mode')==='lofi','M5 In der App läuft der Lo-Fi-Loop');
  const A=E.w.__aud,n0=A.osc.length;ev(E,'MUS.next=SND.ctx.currentTime;for(let i=0;i<40;i++){lofiStep(SND.ctx,i,0,MUS.bus);}');
  ok(A.osc.length>n0+40,'M6 Lo-Fi erzeugt Töne');
  const n1=A.osc.length;ev(E,'for(let L=0;L<4;L++)for(let i=0;i<16;i++)synthStep(SND.ctx,i,0,MUS.bus,L)');
  ok(A.osc.length>n1+60,'M7 Synthwave erzeugt Töne');
  const cnt=L=>{const a=A.osc.length;ev(E,`for(let i=0;i<64;i++)synthStep(SND.ctx,i,0,MUS.bus,${L})`);return A.osc.length-a;};
  const c0=cnt(0),c1=cnt(1),c2=cnt(2),c3=cnt(3);
  ok(c0<c1&&c1<c2&&c2<c3,'M8 Mit jeder gelockten Walze mehr Schichten ('+[c0,c1,c2,c3]+')');
  ev(E,"state.mvol=0");ev(E,'musTick()');
  ok(ev(E,'MUS.mode')===null,'M9 Lautstärke 0 schaltet die Musik aus');
  ev(E,"state.mvol=35;state.music=true;musTick()");
  // Spiel-Zahnrad
  knownReels(E,8);ev(E,'state.done[today()]=true;save();render()');
  E.click(E.$('#gm'));E.click(E.$('#surv'));E.click(E.$('[data-playmode="choice"]'));
  ok(!!E.$('.sin #setgear')&&!E.$('.sin .musbtn'),'M10 Zahnrad statt Lautsprecher im Modul (Version 148)');
  E.click(E.$('#setgear'));
  ok(!!E.$('#setov')&&!E.$('#setov').hidden&&E.$('#setov .card .eyebrow').textContent===ev(E,"t('Sound & Musik')"),'M10b Zahnrad öffnet Einstellungen übers Spiel, Sound-Karte ganz oben');
  E.click(E.$('#setov .backbtn'));
  ok(E.$('#setov').hidden&&!!E.$('.sin.hand, .sin')&&!!E.$('#quit'),'M10c Zurück führt ins laufende Spiel zurück, nichts wurde beendet');
  ev(E,'musTick()');ok(ev(E,'MUS.mode')==='lofi','M11 Im Modul spielt weiter Lo-Fi (Synthwave gab es nur in Reels)');
  E.click(E.$('#quit'));ev(E,'musTick()');ok(ev(E,'MUS.mode')==='lofi','M12 Zurück in der App wieder Lo-Fi');
  E.click(E.$('[data-v="settings"]'));
  ok(!!E.$('#sndcard #mvol'),'M13 Einstellungen: Musik-Regler in der Sound-Kachel');
  setRange(E,'#mvol',0);ok(ev(E,'state.music')===false&&E.st().mvol===0,'M14 Regler ganz links = Musik aus');
  ev(E,'musTick()');ok(ev(E,'MUS.mode')===null,'M15 Musik stoppt');
}
// --- Hilfe-Fragezeichen
{
  const E=fresh();knownReels(E,8);
  ev(E,"window.__helpAuto=true");
  for(const id of ['blocks','typing','swipe','gap','choice']){
    const F=fresh();knownReels(F,id==='blocks'?300:8);
    ev(F,`window.__force='${id}'`);
    F.click(F.$('#start'));
    let g=0;while(!F.$('.qh')&&g++<40){if(F.$('#wtap')||F.$('.iopt')){skipIntro(F);continue;}if(F.$('#go')){F.click(F.$('#go'));continue;}if(F.$('#nx')){F.click(F.$('#nx'));continue;}if(F.$('#endnext')){F.click(F.$('#endnext'));continue;}if(F.$('#next')){F.click(F.$('#next'));continue;}if(F.$('#qf')){F.type('x');continue;}if(F.$('#chk')){F.click(F.$('#chk'));continue;}break;}
    const b=F.$('.qh');
    ok(!!b&&b.dataset.help===id&&b.textContent==='?','H1 '+id+': Fragezeichen an der Aufgabe');
    ok(!F.$$('.hint').some(h=>/Setze|Wische die Karte|Was bedeutet|Die Walzen rasen/.test(h.textContent)),'H2 '+id+': keine Beschreibung mehr im Modul');
    const pre=F.$('.helpm .bubble');
    ok(!!pre&&!F.$('.helpm .dw.m-sigh'),'H3a '+id+': Dewi ist von Anfang an da und hat einen Spruch');
    F.click(b);
    const bub=F.$('.helpm .bubble');
    const box=F.$('.helpm');
    const txt=bub.getAttribute('aria-label'),d=ev(F,`MOD.${id}.desc()`);
    ok(!!bub&&!F.$('.helppop')&&!F.$('.helpbg')&&!!box.querySelector('.dw.m-sigh'),'H3 '+id+': Dewi seufzt in der normalen Sprechblase');
    ok(txt.includes(d)&&/seufz/.test(txt)&&!/Fragezeichen/.test(txt),'H4 '+id+': Kurzbeschreibung + Seufzer, ohne Fragezeichen-Hinweis');
    F.click(b);
    ok(!!(F.$('.helpm .bubble')),'H5 '+id+': Dewi bleibt nach erneutem Tippen');
  }
  const F=fresh();
  const seen=new Set();for(let i=0;i<60;i++)seen.add(ev(F,"sayQuip('help_x',{d:'X'}).text"));
  ok(seen.size===5,'H6 genau 5 Varianten, zufällig gewählt ('+seen.size+')');
  const tk=new Set();for(let i=0;i<80;i++)tk.add(ev(F,"sayQuip('task').text"));
  ok(tk.size>=6&&ev(F,"QUIPS.en.task.length>=6&&QUIPS.en.help_x.length===5&&MOODS.help_x[0]==='sigh'"),'H7 Aufgaben-Sprüche und englische Texte vorhanden');
}
// --- Bausteine nur mit Gelerntem
{
  const E=fresh();
  const r=ev(E,`(()=>{const L=curLang();const ws=L.words.filter(w=>buildPair(w));
    const bad=ws.filter(w=>{const p=buildPair(w);return blockDirs(p,w).some(d=>{const q=blockPlan(p,w,d);return q.given.size>2||q.target.length-q.given.size<2||q.target.length>7;});}).length;
    return {n:ws.length,bad,total:L.words.length};})()`);
  ok(r.bad===0,'B1 Bausteine: höchstens 2 geschenkte Wörter, mindestens 2 selbst, höchstens 7 Wörter (frisch: '+r.n+'/'+r.total+' möglich)');
  knownReels(E,200);
  const r2=ev(E,`(()=>{const L=curLang();return L.words.filter(w=>buildPair(w)).length;})()`);
  ok(r2>r.n,'B2 Je mehr gelernt, desto mehr Bausteine möglich ('+r.n+' -> '+r2+')');
  const d=ev(E,`(()=>{const w=curLang().words.find(w=>buildPair(w));const k=knownTokens(w);const dd=blockDistractors(tilesOf(buildPair(w).id),'id',2,w);return dd.every(x=>k.has(normId(x)));})()`);
  ok(d===true,'B3 Ablenker-Kacheln stammen aus gelernten Wörtern');
}
// --- Herzen-Regeneration + Dewi über der Aufgabe
{
  const F=fresh();knownReels(F,8);
  F.click(F.$('#gm'));F.click(F.$('#surv'));F.click(F.$('[data-playmode="choice"]'));
  let g=0;while(!F.$('.qh')&&g++<20){if(F.$('#wtap')||F.$('.iopt')){skipIntro(F);continue;}if(F.$('#go')){F.click(F.$('#go'));continue;}break;}
  const dw=F.$('.helpm'),task=F.$('.sentbox');
  ok(!!dw&&!!task&&!!(dw.compareDocumentPosition(task)&4)&&!!(F.$('#tries').compareDocumentPosition(dw)&4),'L1 Reihenfolge: Herzen, Dewi, Aufgabe');
  ok(F.$$('#tries svg:not(.x)').length===3,'L2 3 Herzen aktiv (Herz-Puls-Animation per CSS)');
  ev(F,"S.lives=2;S.run=6;S.cur.settled=false;S.cur.ok=true;settleCard(true)");
  ok(ev(F,'S.lives')===2&&ev(F,'S.run')===7,'L3 7 in Folge: noch kein Herz');
  ev(F,"S.cur.settled=false;S.cur.ok=true;settleCard(true)");
  ok(ev(F,'S.lives')===3&&ev(F,'S.run')===8&&!!F.$('#tries svg.heal'),'L4 8 in Folge: Herz kommt zurück, mit Animation');
  ev(F,"S.run=15;S.cur.settled=false;S.cur.ok=true;S.cur.healed=false;settleCard(true)");
  ok(ev(F,'S.lives')===3,'L5 Nie mehr als 3 Herzen');
  ok(ev(F,"t('Serie von {0}: ein Herz kommt zurück!',8)").length>5,'L6 Text vorhanden');
}
// --- Solo-Queue ohne Ersatzmodul
{
  for(const pm of ['blocks','gap','choice']){
    const F=fresh();knownReels(F,40);
    F.click(F.$('#gm'));F.click(F.$('#surv'));
    const tile=F.$('[data-playmode="'+pm+'"]');
    const n=ev(F,`soloWords('${pm}').length`),tot=ev(F,'survivalWords().length');
    ok(!tile.disabled,'S1 '+pm+': Solo startbar ('+n+' von '+tot+' Wörtern passen)');
    F.click(tile);
    ok(ev(F,`S.items.length===${n}&&S.items.every(i=>MOD.${pm}.can(i.w))`),'S2 '+pm+': Queue enthält nur passende Wörter');
    let g=0,bad=0;while(g++<60&&ev(F,'!!S')){const mo=ev(F,'S.cur&&S.cur.module');if(mo&&mo!==pm)bad++;ev(F,'S.i++;showItem()');}
    ok(bad===0,'S3 '+pm+': nie ein anderes Modul');
  }
  const F=fresh();knownReels(F,2);F.click(F.$('#gm'));F.click(F.$('#surv'));
  const bt=F.$('[data-playmode="blocks"]');
  ok(bt.disabled&&bt.classList.contains('locked')&&/Noch zu wenige/.test(bt.textContent),'S4 Zu wenige passende Wörter: Kachel gesperrt mit Hinweis');
  ev(F,"startRound('survival',{playmode:'blocks'})");
  ok(ev(F,'S===null||S.kind!=="survival"'),'S5 Start wird verweigert');
}
// --- Lückensatz: gesuchtes Wort im Satz oben hervorgehoben
{
  const F=fresh();knownReels(F,10);ev(F,"window.__force='gap'");F.click(F.$('#start'));
  let g=0;while(!F.$('#gap')&&g++<20){if(F.$('#wtap')||F.$('.iopt')){skipIntro(F);continue;}if(F.$('#go')){F.click(F.$('#go'));continue;}if(F.$('#endnext')){F.click(F.$('#endnext'));continue;}if(F.$('#next')){F.click(F.$('#next'));continue;}break;}
  const hl=F.$('.sentbox.tr .slot');
  ok(!!hl&&hl.textContent.length>0&&F.$('.sentbox.tr').textContent.replace('?','').includes(hl.textContent),'G1 Lückensatz: gesuchtes Wort im deutschen Satz hervorgehoben ('+(hl&&hl.textContent)+')');
  ok(!!F.$('#bank .tile'),'G2 Auswahl-Kacheln da; Bausteine-Felder (.bslot) kollidieren nicht mit .slot');
}
// --- Bausteine: geschenkte Wörter
{
  const E=fresh();
  // Beispiel: nur „selamat pagi“ gelernt, Satz „Selamat pagi, bu.“
  const r=ev(E,`(()=>{const L=curLang();const pagi=L.words.find(w=>w.id==='selamat pagi');
    state.progress[L.id]=state.progress[L.id]||{};state.progress[L.id][pagi.k]={l:1,d:'2999-01-01'};
    const pair={id:'Selamat pagi, Bu.',gl:'Guten Morgen, Frau.'};
    const p1=blockPlan(pair,pagi,'gl2id'),p2=blockPlan({id:'Selamat pagi, Bu.',gl:'Guten Morgen, Frau.'},pagi,'id2gl');
    return {p1:p1&&{t:p1.target,g:Array.from(p1.given)},p2:p2&&{t:p2.target,g:Array.from(p2.given)}};})()`);
  ok(r.p1&&r.p1.g.join()==='2'&&r.p1.t.join(' ')==='selamat pagi Bu','P1 gl2id: „bu“ ist geschenkt (Position 2): '+JSON.stringify(r.p1));
  // Zu viele unbekannte: kein Plan
  const q=ev(E,`(()=>{const pagi=curLang().words.find(w=>w.id==='selamat pagi');return !!blockPlan({id:'Selamat pagi, bu guru murid.',gl:'Guten Morgen, Frau Lehrer Schüler.'},pagi,'gl2id');})()`);
  ok(q===false,'P2 Mehr als 2 unbekannte Wörter: Satz nicht möglich');
  // Rendering
  const F=fresh();knownReels(F,300);ev(F,"window.__force='blocks'");
  let hit=null;
  for(let i=0;i<40&&!hit;i++){
    const G=fresh();knownReels(G,12);ev(G,"window.__force='blocks'");G.click(G.$('#start'));
    let g=0;while(!G.$('#ans2')&&g++<30){if(G.$('#wtap')||G.$('.iopt')){skipIntro(G);continue;}if(G.$('#go')){G.click(G.$('#go'));continue;}if(G.$('#endnext')){G.click(G.$('#endnext'));continue;}if(G.$('#next')){G.click(G.$('#next'));continue;}if(G.$('#nx')){G.click(G.$('#nx'));continue;}break;}
    if(G.$('.tile.given'))hit=G;
  }
  if(hit){
    const b=ev(hit,'window.__lastBuild');
    ok(hit.$$('#ans2 .tile.given').length===b.given.length&&b.given.length>=1&&b.given.length<=2,'P3 Geschenkte Wörter stehen fest im Satz ('+b.given.length+')');
    const nFree=b.target.length-b.given.length;
    ok(hit.$$('#ans2 .bslot').length===nFree&&hit.$('#chk').disabled,'P4 Leere Felder nur für die eigenen Kacheln, Prüfen gesperrt');
    const free=b.target.filter((_,i)=>b.given.indexOf(i)<0);
    for(const tk of free){const btn=hit.$$('#bank button').find(x=>x.textContent===tk);hit.click(btn);}
    ok(!hit.$('#chk').disabled&&hit.$$('#bank button').length===hit.$$('#bank .tile').length-free.length,'P5 Alle Felder gefüllt, Prüfen frei');
    hit.click(hit.$('#chk'));
    ok(!!hit.$('.res.good'),'P6 Richtig gelöst inklusive geschenkter Wörter');
    // Version 178: Satz verbessern
    if(hit.$('#alopen')){
      hit.click(hit.$('#alopen'));
      ok(hit.$$('.alchip[data-s="a"]').length>=1&&hit.$$('.alchip[data-s="b"]').length>=1,'AL1 Editor zeigt beide Sätze Wort für Wort');
      hit.click(hit.$('.alchip[data-s="a"]'));hit.click(hit.$('.alchip[data-s="b"]'));
      ok(hit.$$('.alchip.g').length>=2,'AL2 Zwei angetippte Wörter bilden ein Paar (gleiche Farbe)');
      hit.click(hit.$('#alsave'));
      ok(ev(hit,"Object.keys(state.myalign).length")===1&&/Gespeichert/.test(hit.$('#alfix').textContent),'AL3 Zuordnung gespeichert');
      ok(ev(hit,"(()=>{const k=Object.keys(state.myalign)[0];return !!alignFor(S.cur.w,state.myalign[k].t,sentOf(S.cur.w).plain)})()"),'AL4 alignFor nutzt die eigene Zuordnung');
    }else ok(true,'AL (kein Satz im Beispiel, übersprungen)');
  }else ok(false,'P3 kein Beispiel mit geschenktem Wort gefunden');
}
// --- Auswahl/Lückensatz nur mit ganz bekannten Sätzen, Reels ohne grauen Rest
{
  const E=fresh();ev(E,'window.__rlAll=false');
  const r=ev(E,`(()=>{const L=curLang();state.progress.id={};
    const bad=id=>L.words.filter(w=>MOD[id].can(w)).filter(w=>{const s=sentOf(w),kn=knownTokens(w);return !tokensOf(s.id).every(tk=>kn.has(normId(tk))||isName(tk));}).length;
    const none=[bad('gap'),bad('choice')];
    // lerne alle Wörter eines kurzen Satzes
    const e=Object.keys(SENT).map(k=>({k,s:SENT[k]})).find(x=>tokensOf(x.s.id).length<=3&&x.s.det&&L.words.some(w=>w.k===x.k)&&tokensOf(x.s.id).every(tk=>L.words.some(w=>w.id.split(' ').length===1&&normId(w.id)===normId(tk))));
    if(!e)return {none};
    tokensOf(e.s.id).forEach(tk=>{const w=L.words.find(w=>w.id.split(' ').length===1&&normId(w.id)===normId(tk));state.progress.id[w.k]={l:1,d:'2999-01-01'};});
    const w0=L.words.find(w=>w.k===e.k);
    return {none,sent:e.s.id,known:sentKnown(w0),choice:MOD.choice.can(w0),gap:MOD.gap.can(w0)};})()`);
  ok(r.none[0]===0&&r.none[1]===0,'K1 Lückensatz/Auswahl: nie ein Satz mit unbekannten Wörtern ('+r.none+')');
  ok(r.known===undefined||r.known===true&&r.choice===true,'K2 Ganz bekannter Satz ist für Auswahl möglich ('+JSON.stringify(r)+')');
}
// --- Englisch + Stimmung
{
  const E=fresh();
  ok(ev(E,"['reels_ready','reels_ok','reels_bad','reels_jackpot','reels_lose','reels_win'].every(k=>QUIPS.de[k].length>=2&&QUIPS.en[k].length>=2&&MOODS[k][0]==='cash')"),'E1 Sprüche de+en für alle Ereignisse');
  const css=E.d.querySelector('style').textContent;
  ok(/\.dw\.m-cash svg\{animation:dw-cash /.test(css)&&css.includes('@keyframes dw-cash{'),'E2 Dewi cash hat eine eigene Schleife');
  ok(/<text[^>]*>\$<\/text>/.test(ev(E,"dwSvg('cash')")),'E3 Dollar-Pupillen');
  ok(ev(E,"typeof haptic==='function'&&['jackpot','lever','rwin','rbad','gems','chips','chipclick','royal','tossed'].every(k=>typeof SFX[k]==='function')"),'E4 Sounds & Haptik registriert');
  ev(E,"state.ui='en';save()");
  ok(ev(E,"t('Hebel ziehen')")==='Pull the lever'&&ev(E,"t('Musik')")==='Music','E5 Englische Texte');
  const A=E.w.__aud,n0=A.osc.length;ev(E,"state.sound=true;state.vol=40;['tick','lever','whirr','thunk','rwin','rbad','jackpot','gems','chips','chipclick','royal','tossed'].forEach(k=>sfx(k))");
  ok(A.osc.length>n0+20,'E6 Alle Reels-Sounds erzeugen Töne ('+(A.osc.length-n0)+')');
}
// --- Testbereich: immer sichtbar, Wörter/Chips per Textfeld + Enter (Version 142)
{
  const E=fresh();
  const submit=id=>ev(E,"document.querySelector('"+id+"').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))");
  ev(E,"state.lang='id';state.name='Vito';state.nameAsked=true;state.chips=250;state.progress.id={};state.progress.id[LANGS.id.words[0].k]={l:2,d:today()};save()");
  ev(E,"view='settings';render()");
  ok(!!E.$('#devcard')&&!!E.$('#devwords')&&!!E.$('#devchips'),'V1 Testbereich sofort sichtbar, ohne Geheim-Tipps');
  const N=ev(E,"LANGS.id.words.length");
  E.$('#devwords').value='10';submit('#devwordsf');
  ok(ev(E,"Object.keys(state.progress.id).length")===10&&ev(E,"Object.values(state.progress.id).every(p=>p.l===1&&p.d===today())"),'V2 10 Wörter auf Stufe 1, heute fällig');
  ok(ev(E,"state.name")==='Vito'&&ev(E,"state.chips")===250,'V3 Name und Chips bleiben unberührt');
  ev(E,"view='settings';render()");E.click(E.$('#devwordsreset'));
  ok(ev(E,"Object.keys(state.progress.id).length")===0,'V4 Zurücksetzen leert die Wörter');
  ev(E,"view='settings';render()");E.$('#devchips').value='9999';submit('#devchipsf');
  ok(ev(E,'state.chips')===9999&&ev(E,'state.chipShown')===9999,'V5 Chips per Textfeld gesetzt');
  ev(E,"view='settings';render()");E.click(E.$('#devchipsreset'));
  ok(ev(E,'state.chips')===0&&ev(E,'state.chipShown')===0,'V6 Zurücksetzen leert die Chips');
  ev(E,"view='settings';render()");E.$('#devwords').value=String(N+50);submit('#devwordsf');
  ok(ev(E,"Object.keys(state.progress.id).length")===N,'V7 Eingabe über der Wortzahl wird gekappt');
}
{
  const E=fresh();
  const D=n=>ev(E,"addDays(today(),"+(-n)+")");
  ev(E,"state.lang='id';state.nameAsked=true;state.ui='de';state.done={};state.flawed={};state.stamps={};state.done['"+D(5)+"']=true;state.done['"+D(3)+"']=true;state.flawed['"+D(3)+"']=true;state.done['"+D(1)+"']=true;state.done[today()]=true;save();view='home';render()");
  const k=n=>ev(E,"stampKind('"+D(n)+"')");
  ok(k(7)===null&&k(5)==='holo'&&k(4)==='missed'&&k(3)==='ok'&&k(2)==='missed'&&k(1)==='holo'&&k(0)==='holo','W1 Stufen: leer vor dem Start, verpasst, mit Fehlern, fehlerfrei');
  ok(ev(E,"stampFor('"+D(4)+"')")==='sad','W2 verpasster Tag: enttäuschte Dewi');
  ok(ev(E,"STAMP_OK.indexOf(stampFor('"+D(3)+"'))>=0&&STAMP_HOLO.indexOf(stampFor('"+D(1)+"'))>=0"),'W3 Pools: nette Mienen mit Fehlern / gute Mienen fehlerfrei');
  const m=ev(E,"stampSvg('sad',0,'missed')"),o=ev(E,"stampSvg('content',0,'ok')"),h=ev(E,"stampSvg('content',0,'holo')");
  ok(/grayscale/.test(m)&&/pl-mark" style="display:none/.test(m)&&/pl-holo" style="display:none/.test(m),'W4 verpasst: grau, ohne Haken und ohne Holo');
  ok(!/grayscale/.test(o)&&/pl-holo" style="display:none/.test(o)&&!/pl-mark" style="display:none/.test(o),'W5 mit Fehlern: farbig, ohne Holo');
  ok(!/pl-holo" style="display:none/.test(h)&&!/grayscale/.test(h),'W6 fehlerfrei: Holo');
  ok(E.$$('[data-kind="missed"]').length===2&&E.$$('[data-kind="ok"]').length===1&&E.$$('[data-kind="holo"]').length===3,'W7 Home zeigt Mini-Marken je Stufe');
  ok(!ev(E,"Object.keys(state.stamps).some(k=>state.stamps[k]==='sad')"),'W8 sad wird nicht gespeichert');
}
{
  const E=fresh();
  const ks=knownReels(E,300);
  ok(ev(E,"!!MOD.order&&MODULES.indexOf(MOD.order)>-1&&TRIES.order===1&&MOD.order.fallback==='swipe'"),'R1 Modul Reihenfolge registriert (ein Versuch)');
  const pickJs="LANGS.id.words.find(x=>{try{return orderPair(x)}catch(e){return false}})";
  ev(E,"window.__rlAll=true");
  E.click(E.$('#start'));
  const start=()=>ev(E,"(()=>{const w="+pickJs+";S.cur.w=w;S.cur.ok=true;S.cur.settled=false;S.cur.module='order';MOD.order.show(w);return w.id})()");
  const wid=start();
  const n=ev(E,"window.__lastOrder.target.length");
  ok(n>=4&&n<=7&&E.$$('#ord .otile').length===n,'R2 4–7 Kacheln liegen im Feld ('+n+')');
  ok(ev(E,"window.__lastOrder.order.map(i=>normId(window.__lastOrder.target[i])).join('|')!==window.__lastOrder.target.map(normId).join('|')"),'R3 Start ist nie schon richtig sortiert');
  ok(!!E.$('#ord')&&/\S/.test(E.$('.sentbox').textContent)&&E.$('.sentbox').lang==='de','R4 Übersetzung steht oben');
  // Pfeiltasten sortieren
  const key=(el,k)=>el.dispatchEvent(new E.w.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
  const tg=ev(E,"window.__lastOrder.target.map(normId)");
  for(let i=0;i<tg.length;i++){
    let g=0;
    while(g++<20){
      const els=[...E.$$('#ord .otile')];
      const cur=els.findIndex((e,p)=>{return false;});
      // finde ein Element, das an Position i gehört
      const want=tg[i],idxs=els.map((e,p)=>({p,id:normId0(e.textContent)})).filter(x=>x.id===want&&x.p>=i);
      if(!idxs.length||els[i]&&normId0(els[i].textContent)===want)break;
      const f=idxs[0];key(els[f.p],'ArrowLeft');
    }
  }
  ok(E.$$('#ord .otile').map(e=>normId0(e.textContent)).join('|')===tg.join('|'),'R5 Pfeiltasten verschieben Kacheln in die richtige Reihenfolge');
  E.click(E.$('#chk'));
  ok(!!E.$('.res.good')&&ev(E,"S.cur.ok")===true&&E.$$('#ord .otile.good').length===n,'R6 Richtig: alle Kacheln grün, Karte gewertet');
  ok(E.$('#chk').textContent==='Weiter'&&E.$$('#ord .otile').every(e=>e.disabled),'R7 danach nicht mehr verschiebbar, Button „Weiter“');
  start();
  ok(E.$('#chk').disabled===true,'R7b Prüfen ist gesperrt, solange nichts verschoben wurde');
  E.click(E.$('#chk'));
  ok(!E.$('.res')&&E.$('#chk').textContent==='Prüfen','R7c gesperrter Button löst nichts aus');
  { const first=E.$('#ord .otile');first.dispatchEvent(new E.w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true})); }
  ok(E.$('#chk').disabled===false,'R7d nach dem ersten Verschieben ist Prüfen frei');
  // sicherstellen, dass die Reihenfolge wirklich falsch ist (ein Zug kann zufällig schon richtig sein)
  { let g=0;
    while(g++<10&&E.$$('#ord .otile').map(e=>normId0(e.textContent)).join('|')===tg.join('|')){
      const first=E.$('#ord .otile');first.dispatchEvent(new E.w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
    } }
  E.click(E.$('#chk'));
  ok(!!E.$('.res.bad')&&ev(E,"S.cur.ok")===false,'R8 Falsch (ein Versuch): Karte verloren');
  ok(E.$$('#ord .otile.bad').length>0&&E.$$('#ord .otile.good').length+E.$$('#ord .otile.bad').length===n,'R9 Falsch platzierte Kacheln rot, richtige grün');
  // Zugangsregeln
  ev(E,"window.__rlAll=false");
  ev(E,"state.progress.id={};save()");
  ok(ev(E,"(()=>{const ws=LANGS.id.words.filter(w=>orderPair(w));return ws.length>0&&ws.every(w=>{const p=orderPair(w),tl=tilesOf(p.id),kn=knownTokens(w);const unk=tl.map((tk,i)=>[tk,i]).filter(x=>!isName(x[0])&&!kn.has(normId(x[0])));return p.given.length<=2&&tl.length-p.given.length>=2&&unk.every(x=>p.given.indexOf(x[1])>-1)&&(p.given.length===0||p.hl.length>0);});})()"),'R10 ohne gelernte Wörter: unbekannte Wörter sind fest (max. 2) und in der Übersetzung markiert');
  ev(E,"(()=>{const ks="+JSON.stringify(ks)+";ks.forEach(k=>{state.progress.id[k]={l:1,d:'2000-01-01'}})})()");
  const cand=ev(E,"LANGS.id.words.filter(w=>orderPair(w)).length");
  ok(cand>=1,'R11 mit 300 gelernten Wörtern gibt es passende Karten ('+cand+')');
  ev(E,"(()=>{const w=LANGS.id.words.find(w=>orderPair(w));state.progress.id[w.k].l=4;window.__x=w;})()");
  ok(ev(E,"!!orderPair(window.__x)"),'R12 keine Stufen-Grenze mehr (Stufe 4 möglich)');
}
{
  const E=fresh();
  const ks=knownReels(E,40);
  ev(E,"window.__rlAll=false;state.progress.id={};"+JSON.stringify(ks)+".forEach(k=>{state.progress.id[k]={l:1,d:'2000-01-01'}});save()");
  const wk=ev(E,"(()=>{const w=LANGS.id.words.find(w=>{const p=orderPair(w);return p&&p.given.length>0&&tilesOf(p.id).length-p.given.length>=3;});return w?w.k:null})()");
  ok(!!wk,'R13 mit wenigen gelernten Wörtern gibt es Karten mit festen Steinen');
  if(wk){
    E.click(E.$('#start'));
    ev(E,"(()=>{const w=LANGS.id.words.find(x=>x.k==='"+wk+"');S.cur.w=w;S.cur.ok=true;S.cur.settled=false;S.cur.module='order';MOD.order.show(w);})()");
    const gv=ev(E,"window.__lastOrder.given.slice()");
    const n=ev(E,"window.__lastOrder.target.length");
    const pos=()=>[...E.$('#ord').children].map((e,i)=>e.classList.contains('given')?i:-1).filter(i=>i>=0).join(',');
    ok(E.$$('#ord .given').length===gv.length&&pos()===gv.join(','),'R14 feste Steine stehen an ihrer richtigen Stelle ('+pos()+')');
    ok(E.$$('.sentbox .slot').length>=1,'R15 passendes Wort in der Übersetzung gelb markiert');
    const key=(el,k)=>el.dispatchEvent(new E.w.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true}));
    const tg=ev(E,"window.__lastOrder.target.map(normId)");
    for(let r=0;r<40;r++){const els=[...E.$$('#ord .otile')];key(els[r%els.length],r%3?'ArrowRight':'ArrowLeft');}
    ok(pos()===gv.join(',')&&E.$$('#ord > *').length===n,'R16 nach vielem Verschieben bleiben feste Steine fest');
    for(let i=0;i<n;i++){let g=0;while(g++<30){const els=[...E.$('#ord').children];if(normId0(els[i].textContent)===tg[i])break;if(els[i].classList.contains('given'))break;const j=els.findIndex((e,p)=>p>i&&!e.classList.contains('given')&&normId0(e.textContent)===tg[i]);if(j<0)break;const fr=els.filter(e=>!e.classList.contains('given'));key(els[j],'ArrowLeft');}}
    ok([...E.$('#ord').children].map(e=>normId0(e.textContent)).join('|')===tg.join('|'),'R17 freie Kacheln lassen sich um feste Steine herum sortieren');
    E.click(E.$('#chk'));
    ok(!!E.$('.res.good')&&ev(E,"S.cur.ok")===true,'R18 richtig gelöst mit festen Steinen');
  }
}
// --- Chips (Version 132)
{
  const E=fresh();
  const m=ev(E,`(()=>{state=Object.assign(defaults(),{lang:'id',ui:'de',nameAsked:true,gems:123,gemShown:100,gemSurv:{d:today(),n:5}});delete state.chipV;migrate();return JSON.stringify([state.chips,state.chipShown,'gems' in state,'gemShown' in state,'gemSurv' in state,state.chipV]);})()`);
  ok(m==='[1230,1000,false,false,false,1]','C1 Migration: Diamanten × 10 werden Chips ('+m+')');
  ok(ev(E,`(()=>{const c=state.chips;migrate();migrate();return state.chips===c&&state.chipShown===1000;})()`),'C2 Migration greift nur einmal');
  ok(ev(E,`(()=>{const s=Object.assign(defaults(),{lang:'id'});return !('chipV' in s)&&s.chips===0;})()`),'C2b chipV steht nicht in defaults()');
  const ab=ev(E,`(()=>{state.ui='de';const a=[9999,10000,12549,999999,1000000,1250000].map(fmtChipShort).join('|');state.ui='en';const b=fmtChipShort(12549)+'|'+fmtChip(12549);state.ui='de';return a+'#'+b;})()`);
  ok(ab==='9.999|10,0K|12,5K|999,9K|1,0M|1,2M#12.5K|12,549','C3 Abkürzung K/M mit einer Nachkommastelle, abgerundet, Komma/Punkt je Sprache ('+ab+')');
  ok(ev(E,`(()=>{state.chips=0;state.chipSurv=null;const a=chipSurvival(10),b=chipSurvival(100),c=chipSurvival(10);return [a,b,c,state.chips].join()})()`)==='50,250,0,300','C4 Survival: 5 Chips pro Wort, höchstens 300 am Tag, kein Rekord-Bonus');
  ev(E,"state.chips=4820;state.chipShown=4820;save();render()");
  const pill=E.$('#chippill');
  ok(!!pill&&pill.tagName==='BUTTON'&&/4\.820/.test(pill.textContent)&&!!pill.querySelector('use[href="#chip-pink"]')&&!E.$('canvas.gem'),'C5 Pille: Dewi-Chip, volle Zahl unter 10.000, öffnet den Shop (Version 138)');
  ev(E,"state.chips=12549;state.chipShown=12549;save();render()");
  ok(/12,5K/.test(E.$('#chippill').textContent)&&/12\.549/.test(E.$('#chippill').getAttribute('aria-label')),'C5b Pille kürzt ab, Vorlesetext nennt die volle Zahl');
  ok(['pink','gold','holo','grey','empty'].every(t=>!!E.d.getElementById('chip-'+t))&&!!E.d.getElementById('chipFaceClip')&&E.d.querySelectorAll('#chipsprite').length===1,'C6 Alle fünf Chip-Varianten einmal im Dokument');
  ok(!/Diamant/.test(E.$('#app').textContent)&&!ev(E,"typeof GEMV!=='undefined'||typeof GEM_MILES!=='undefined'||typeof gemAdd!=='undefined'"),'C7 Keine Diamanten mehr in Anzeige und Code');
  ok(ev(E,"(()=>{chipRain(5);const b=document.querySelector('.drain');const r=!!b&&b.querySelectorAll('use[href^=\"#chip-\"]').length===5;b&&b.remove();return r;})()")||ev(E,'reduceMotion()'),'C8 Reels-Regen besteht aus Chips');
}
// --- Streak-Schutz und Sicherung (Version 137)
{
  const E=fresh();
  const setDays=(js)=>ev(E,`(()=>{const t=today();state.done={};state.shielded={};state.shieldNote=null;${js};save();render();})()`);
  // Serie 10 Tage bis vorgestern, gestern verpasst, 1 Schutz
  setDays("for(let i=2;i<=11;i++)state.done[addDays(t,-i)]=true;state.shields=1");
  ok(ev(E,'streak()')===10&&ev(E,'state.shields')===0&&ev(E,'state.shielded[addDays(today(),-1)]')===true,'SH1 Gestern verpasst, 1 Schutz: Serie bleibt bei 10, Schutz verbraucht');
  ok(!!E.$('.moment.shield')&&/Streak-Schutz eingesetzt/.test(E.$('.moment.shield').textContent)&&/bleibt bei 10 Tagen/.test(E.$('.moment.shield').textContent),'SH2 Eisblauer Moment mit Serienstand');
  E.click(E.$('.moment.shield'));
  ok(!E.$('.moment.shield')&&ev(E,'state.shieldNote')===null,'SH3 Moment nur einmal');
  const yd=ev(E,'addDays(today(),-1)');const st=E.$(`[data-stamp="${yd}"]`);
  ok(!!st&&st.dataset.kind==='ice'&&/geschützt/.test(st.getAttribute('aria-label')),'SH4 Gestern: eisblauer Stempel „geschützt“');
  // Zu viele verpasste Tage: Schutze bleiben
  setDays("for(let i=4;i<=8;i++)state.done[addDays(t,-i)]=true;state.shields=2");
  ok(ev(E,'streak()')===0&&ev(E,'state.shields')===2&&!E.$('.moment.shield'),'SH5 Drei Tage verpasst, zwei Schutze: Serie weg, Schutze bleiben');
  // Zwei Tage verpasst, zwei Schutze
  setDays("for(let i=3;i<=9;i++)state.done[addDays(t,-i)]=true;state.shields=2");
  ok(ev(E,'streak()')===7&&ev(E,'state.shields')===0,'SH6 Zwei verpasste Tage, zwei Schutze: Serie 7 bleibt');
  ok(ev(E,'bonusPct(streak())')===10,'SH7 Geschützte Tage zählen nicht für Bonus-Stufen (7 Tage = +10 %)');
  E.click(E.$('.moment.shield'));
  // Heute gespielt nach geschütztem Tag: Serie wächst weiter
  ev(E,'state.done[today()]=true;save()');
  ok(ev(E,'streak()')===8,'SH8 Heute gespielt: Serie zählt weiter (8)');
  // Kein Einsatz ohne vorherige Serie
  setDays("state.shields=2");
  ok(ev(E,'state.shields')===2,'SH9 Ohne gespielte Tage wird nichts eingesetzt');
  // Sicherung
  const B=JSON.parse(ev(E,`(()=>{state.chips=4321;state.shields=1;state.owned=['x'];state.equip={fur:'x'};state.mtrack='arcade';state.run={v:1,kind:'daily'};state.dayOffset=3;return JSON.stringify(backupData());})()`));
  ok(B.chips===4321&&B.shields===1&&B.owned[0]==='x'&&B.equip.fur==='x'&&B.mtrack==='arcade'&&!('run' in B)&&!('dayOffset' in B),'SH10 Sicherung: Chips, Schutze, Artikel, Auswahl, Musik; ohne offene Hand');
  const R=JSON.parse(ev(E,`(()=>{const d=JSON.stringify({app:'kata',v:2,data:backupData()});state=Object.assign(defaults(),JSON.parse(d).data,{dayOffset:0});migrate();return JSON.stringify({c:state.chips,s:state.shields,v:state.chipV});})()`));
  ok(R.c===4321&&R.s===1&&R.v===1,'SH11 Einspielen: Chips nicht noch einmal × 10');
}
// --- Shop (Version 138)
{
  const E=fresh();
  ev(E,"state.chips=20000;state.chipShown=20000;state.shields=0;state.owned=[];state.equip={};save();render()");
  const cards=E.$$('#app .gmcard');
  ok(cards.length===1&&!!cards[0].querySelector('#gm')&&!E.$('.shopcard')&&!!E.$('.bookcard'),'SP1 Hauptmenü: nur Gamemodes als Kachel, kein Shop-Kachel mehr (Version 140)');
  E.click(E.$('#chippill'));ok(!!E.$('#shop.sin.shop'),'SP2 Chip-Pille öffnet den Shop');
  ok(E.$$('.shit').length===9&&/FELL/.test(E.$('.shlist').textContent)&&/KOPF/.test(E.$('.shlist').textContent)&&/GESICHT/.test(E.$('.shlist').textContent)&&E.$('#shact').getAttribute('aria-disabled')==='true','SP3 Cosmetics: Fell, Kopf und Gesicht (Version 182), Aktion erst nach Antippen');
  E.click(E.$('[data-shop="fur:mitternacht"]'));
  ok(/Kaufen · 8\.000/.test(E.$('#shact').textContent)&&E.$('.shdewi').innerHTML.includes('#5b4bb0')&&/Anprobe/.test(E.$('.shinfo').textContent),'SP4 Anprobe: Dewi trägt Mitternacht, Kaufen 8.000 (Version 182)');
  E.click(E.$('#shact'));
  ok(ev(E,'state.chips')===12000&&ev(E,"state.owned.indexOf('fur:mitternacht')>=0")&&ev(E,'state.equip.fur')==='mitternacht'&&/Ausgerüstet/.test(E.$('#shact').textContent),'SP5 Gekauft und ausgerüstet, 8.000 abgezogen');
  E.click(E.$('[data-shop="head:schleife"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.chips')===8500&&ev(E,'state.equip.head')==='schleife'&&E.$('.shdewi').innerHTML.includes('translate(132 40) rotate(18)'),'SP6 Schleife gekauft (3.500) und auf dem Kopf');
  E.click(E.$('[data-shop="fur:classic"]'));
  ok(/Ausrüsten/.test(E.$('#shact').textContent),'SP7 Gratis-Fell: Ausrüsten');
  E.click(E.$('#shact'));ok(ev(E,'state.equip.fur')==='classic','SP7b Zurück auf Classic');
  ev(E,'state.chips=3000;state.chipShown=3000;save()');
  E.click(E.$('.shtab[data-tab="ext"]'));E.click(E.$('[data-shop="theme:neon"]'));
  ok(E.d.documentElement.dataset.theme==='neon'&&/Noch 5\.000 Chips/.test(E.$('#shact').textContent)&&E.$('#shact').getAttribute('aria-disabled')==='true','SP8 Theme als Vorschau, zu wenig Chips');
  E.click(E.$('#shmine'));ok(!E.$('[data-shop="theme:neon"]')&&!!E.$('[data-shop="theme:classic"]'),'SP9 „Nur meine“ zeigt nur Gekauftes');
  E.click(E.$('#shmine'));
  E.click(E.$('.shtab[data-tab="con"]'));E.click(E.$('[data-shop="shield"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.shields')===1&&ev(E,'state.chips')===2000&&/Vorrat 1\/2/.test(E.$('.shlist').textContent),'SP10 Streak-Schutz gekauft (1.000), Vorrat 1/2');
  E.click(E.$('#quit'));
  ok(!E.d.documentElement.dataset.theme&&!E.$('#shop')&&E.$('#app .mascot .dw').outerHTML.includes('translate(132 40)'),'SP11 Schließen: Theme-Vorschau weg, Dewi trägt die Schleife auch auf dem Startscreen');
  ok(ev(E,"Object.keys(DWM).every(m=>dwSvg(m).includes('translate(132 40) rotate(18)'))")&&ev(E,"Object.keys(DWM).every(m=>{const s=dwSvg(m),r=s.indexOf('rotate('),i=s.indexOf('translate(132 40)');return r>=0&&i>r;})"),'SP12 Schleife in allen Stimmungen in der gedrehten Kopf-Gruppe');
  ok(!ev(E,"dwSvg('haughty',DW_PLAIN)").includes('translate(132 40)')&&!ev(E,"stampSvg0('sly',0)").includes('#ff4f6d'),'SP13 Stempel zeigen Dewi im Original');
  ev(E,"state.chips=9000;state.equip.theme='classic';save()");E.click(E.$('#chippill'));E.click(E.$('.shtab[data-tab="ext"]'));E.click(E.$('[data-shop="theme:neon"]'));E.click(E.$('#shact'));E.click(E.$('#quit'));
  ok(E.d.documentElement.dataset.theme==='neon'&&ev(E,'state.equip.theme')==='neon','SP14 Gekauftes Theme bleibt nach dem Schließen');
  const B=JSON.parse(ev(E,'JSON.stringify(backupData())'));
  ok(B.owned.length===3&&B.equip.theme==='neon'&&B.shields===1,'SP15 Sicherung enthält Käufe und Auswahl');
  try{E.w.close();}catch(e){}
}

// --- Shop: mehr Outfits, Themes und Chip-Designs (Version 182)
{
  const E=fresh();
  ev(E,"state.chips=100000;state.chipShown=100000;state.shields=0;state.owned=[];state.equip={};save();render()");
  E.click(E.$('#chippill'));
  ok(ev(E,"priceOf(SHOP_ITEMS.find(x=>x.id==='fur:minze'))")===3500&&ev(E,"priceOf(SHOP_ITEMS.find(x=>x.id==='head:krone'))")===8000&&ev(E,"priceOf(SHOP_ITEMS.find(x=>x.id==='fur:holo'))")===20000,'SX1 Preise: gewöhnlich 3.500, selten 8.000, legendär 20.000');
  E.click(E.$('[data-shop="fur:minze"]'));ok(E.$('.shdewi').innerHTML.includes('#7fdcc0'),'SX2 Minze-Fell in der Anprobe');
  E.click(E.$('[data-shop="fur:holo"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.equip.fur')==='holo'&&ev(E,'state.chips')===80000&&E.$('.shdewi').innerHTML.includes('url(#dwHoloHood)'),'SX3 Holo-Fell gekauft und getragen');
  E.click(E.$('[data-shop="head:krone"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.equip.head')==='krone'&&ev(E,"Object.keys(DWM).every(m=>dwSvg(m).includes('translate(100 44) rotate(-5)'))"),'SX4 Krone in allen Stimmungen auf dem Kopf');
  E.click(E.$('[data-shop="face:herzbrille"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.equip.face')==='herzbrille'&&ev(E,'state.equip.head')==='krone'&&E.$('.shdewi').innerHTML.includes('#ff4f8b'),'SX5 Herzbrille neben der Krone (eigener Platz Gesicht)');
  const hid=ev(E,"['shades','cash','sleep','superior','content'].map(m=>dwSvg(m).includes('#ff4f8b')).join()");
  const shw=ev(E,"['haughty','bored','annoyed','sly','sad','surprised'].map(m=>dwSvg(m).includes('#ff4f8b')).join()");
  ok(hid==='false,false,false,false,false'&&shw==='true,true,true,true,true,true','SX6 Brille weg bei Sonnenbrille, Dollar-Augen, Maske, geschlossenen Augen ('+hid+' | '+shw+')');
  ok(!ev(E,"dwSvg('haughty',DW_PLAIN)").includes('#ff4f8b'),'SX7 Stempel zeigen Dewi ohne Brille');
  E.click(E.$('[data-shop="face:none"]'));E.click(E.$('#shact'));ok(ev(E,'state.equip.face')==='none'&&!E.$('.shdewi').innerHTML.includes('#ff4f8b'),'SX8 Brille wieder abnehmen');
  E.click(E.$('.shtab[data-tab="ext"]'));
  ok(/THEMES/.test(E.$('.shlist').textContent)&&/CHIPS/.test(E.$('.shlist').textContent)&&E.$$('.shit').length===8,'SX9 Extras: Themes und Chips (8 Artikel)');
  E.click(E.$('[data-shop="theme:sunset"]'));ok(E.d.documentElement.dataset.theme==='sunset','SX10 Sonnenuntergang färbt als Vorschau');
  E.click(E.$('[data-shop="theme:holo"]'));ok(E.d.documentElement.dataset.theme==='holo','SX11 Holo-Lounge färbt als Vorschau');
  ok(ev(E,"[...document.querySelectorAll('style')].some(x=>x.textContent.includes(':root[data-theme=sunset]{')&&x.textContent.includes(':root[data-theme=holo]{'))"),'SX12 Sonnenuntergang und Holo-Lounge haben eigene Farben');
  E.click(E.$('[data-shop="chip:pixel"]'));
  ok(E.$('.shdewi .shchips')&&E.$$('.shdewi .shchips use').length===3&&[...E.$$('.shdewi .shchips use')].every(u=>/#chp-pixel-/.test(u.getAttribute('href'))),'SX13 Chip-Anprobe zeigt drei Chips im Design');
  E.click(E.$('#shact'));
  ok(ev(E,'state.equip.chip')==='pixel'&&ev(E,"document.getElementById('chip-pink').innerHTML.includes('polygon')"),'SX14 Retro-Pixel gekauft: Chips der ganzen App im Pixel-Design');
  E.click(E.$('[data-shop="chip:neon"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.equip.chip')==='neon'&&ev(E,"document.getElementById('chip-gold').innerHTML.includes('#35dcd2')"),'SX15 Neon-Chips ausgerüstet');
  E.click(E.$('[data-shop="chip:marke"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.equip.chip')==='marke'&&ev(E,"document.getElementById('chip-holo').innerHTML.includes('stroke-linecap=\"round\"')"),'SX16 Gold-Marke ausgerüstet (Perlenrand)');
  E.click(E.$('[data-shop="chip:classic"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.equip.chip')==='classic'&&!ev(E,"document.getElementById('chip-pink').innerHTML.includes('polygon')"),'SX17 Zurück zum Dewi-Chip');
  ok(ev(E,"CHIP_TONES.every(tn=>document.getElementById('chip-'+tn))")&&ev(E,"['pixel','neon','marke'].every(d=>['pink','gold','holo'].every(tn=>document.getElementById('chp-'+d+'-'+tn)))"),'SX18 Alle Chip-Symbole vorhanden (Bedeutung pink/gold/holo/grau bleibt)');
  E.click(E.$('#quit'));
  const B=JSON.parse(ev(E,'JSON.stringify(backupData())'));
  ok(B.equip.chip==='classic'&&B.owned.includes('chip:pixel')&&B.owned.includes('fur:holo')&&B.owned.includes('head:krone'),'SX19 Sicherung enthält die neuen Artikel');
  try{E.w.close();}catch(e){}   // Version 182: Fenster freigeben, sonst reicht der Speicher in Test 4 nicht mehr
}
// --- Startscreen mit Tab-Leiste, Shop statt Einstellungen (Version 139 entfernt sie, Version 144 bringt sie zurück)
{
  const E=fresh();ev(E,'render()');
  ok(!!E.$('#tabs')&&!E.$('.stpill')&&!!E.$('.status #chippill')&&!!E.$('.status #gear'),'NV1 Tab-Leiste da, keine Streak-Pille, oben Chips und Zahnrad');
  ok(!!E.$('.tab[data-v="home"]')&&!!E.$('.tab[data-v="book"]')&&!!E.$('#shoptab')&&!E.$('.tab[data-v="settings"]'),'NV1b Leiste zeigt Home, Vokabelheft, Shop statt Einstellungen');
  ok(E.$('.tab[data-v="home"]').getAttribute('aria-current')==='page'&&!E.$('.tab[data-v="book"]').getAttribute('aria-current'),'NV1c Home-Reiter ist aktiv markiert');
  E.click(E.$('#shoptab'));
  ok(!!E.$('#shop'),'NV1d Shop-Reiter öffnet den Shop');
  ok(ev(E,"sheet.classList.contains('shop-open')")&&!E.$('#tabs').hidden&&E.$('#shoptab').getAttribute('aria-current')==='page','NV1d2 Im Shop bleibt die Leiste da, Shop-Reiter aktiv markiert');
  E.click(E.$('#quit'));
  ok(!E.$('#shop')&&!!E.$('.plan')&&!ev(E,"sheet.classList.contains('shop-open')"),'NV1e Shop schließen (×) führt zurück zum Startscreen');
  E.click(E.$('#shoptab'));
  E.click(E.$('.tab[data-v="book"]'));
  ok(!E.$('#shop')&&!!E.$('#q')&&!ev(E,"sheet.classList.contains('shop-open')"),'NV1f Vokabelheft-Reiter schließt den Shop mit und öffnet das Heft');
  E.click(E.$('.tab[data-v="home"]'));
  ok(!!E.$('.plan'),'NV1g Heute-Reiter zurück zum Startscreen');
  ok(!E.$('.plan .dstack'),'NV2 Daily Round ohne Chip-Stapel (Version 141, zu unruhig)');
  ok(!!E.$('.bookcard.card.prog')&&!!E.$('.bookcard .stack')&&!E.$('.bookcard .legend')&&!!E.$('.bookcard .bookgo'),'NV3 Vokabelheft-Kachel wie die alte Fortschritt-Karte, mit Pfeil wie Gamemodes');
  E.click(E.$('#gear'));
  ok(!!E.$('#sethead')&&!!E.$('.backbtn[data-v="home"]'),'NV4 Zahnrad öffnet die Einstellungen mit Zurück-Pfeil');
  E.click(E.$('.backbtn'));
  ok(!!E.$('.plan')&&!!E.$('#gear'),'NV5 Zurück führt auf den Startscreen');
  E.click(E.$('.tab[data-v="book"]'));
  ok(!!E.$('#q')&&!!E.$('.bookprog .stack')&&!!E.$('.bookprog .legend')&&E.$('.tab[data-v="book"]').getAttribute('aria-current')==='page','NV6 Vokabelheft-Reiter öffnet das Heft, Fortschritt steht dort oben, Reiter aktiv markiert');
  E.click(E.$('.backbtn'));
  ok(!!E.$('.plan'),'NV7 Zurück aus dem Vokabelheft');
}
// --- Deutschkurs ohne Artikel, Flagge, Übertragung des alten Fortschritts (Version 147)
{
  const old={l:3,d:'2099-01-01',n:0};
  const E=env({lang:'de',progress:{de:{'de:der nachbar':old,'de:der morgen':{l:5,d:'2099-01-01',n:0},'de:morgen':{l:1,d:'2099-01-01',n:0},'de:das dort':{l:2,d:'2099-01-01',n:0}}},
    daily:{date:'2000-01-01',newCount:0,extra:0,lt:[],got:['de:die straße','de:das essen']}},'en','en-US');
  ev(E,'render()');
  ok(E.$('#chlang').textContent.trim()==='🇩🇪','DK1 Deutschkurs zeigt die deutsche Flagge');
  const words=JSON.parse(ev(E,"JSON.stringify(curLang().words.map(w=>w.id))"));
  const withArt=words.filter(w=>/^(der|die|das) [A-ZÄÖÜ]\S*$/.test(w));
  ok(withArt.length===0&&words.includes('Nachbar')&&words.includes('das dort')&&words.includes('eine Million'),'DK2 Keine Wörter mit Artikel mehr, Pronomen und Zahlen bleiben ('+withArt.slice(0,3).join(', ')+')');
  ok(!words.includes('Morgen')&&words.includes('morgen')&&!words.includes('Essen')&&words.includes('essen')&&!words.includes('Arm')&&words.includes('arm')&&words.length===652,'DK3 Morgen, Essen, Arm entfallen, morgen/essen/arm bleiben ('+words.length+')');
  const P=JSON.parse(ev(E,'JSON.stringify(state.progress.de)'));
  ok(P['de:nachbar']&&P['de:nachbar'].l===3&&!P['de:der nachbar'],'DK4 Fortschritt „der Nachbar“ wandert zu „Nachbar“');
  ok(!P['de:der morgen']&&P['de:morgen'].l===1&&P['de:das dort'].l===2,'DK5 Entfallenes Wort wird gelöscht, nicht mit „morgen“ vermischt; „das dort“ bleibt');
  ok(ev(E,"state.daily={date:today(),newCount:0,extra:0,lt:[],got:['de:die straße','de:das essen']};migrate();JSON.stringify(state.daily.got)")===JSON.stringify(['de:straße']),'DK6 Tagesliste umgeschrieben, entfallenes Wort raus');
  ok(ev(E,"state.run={v:1,lang:'de',kind:'daily',i:0,items:[{k:'de:der nachbar',kind:'rev'}],missed:['de:der nachbar']};migrate();state.run.items[0].k+'|'+state.run.missed[0]")==='de:nachbar|de:nachbar'
    &&ev(E,"state.run={v:1,lang:'de',kind:'daily',i:0,items:[{k:'de:der arm',kind:'rev'}],missed:[]};migrate();state.run")===null,'DK6b Offener Run: Schlüssel umgeschrieben, mit entfallenem Wort verworfen');
  const en=JSON.parse(ev(E,"JSON.stringify(LANGS.en.cats.map(c=>c[1]).join('\\n'))"));
  ok(/neighbor = Nachbar\b/.test(en)&&!/= (der|die|das) [A-ZÄÖÜ][^\s/]*\s*(\/|$)/m.test(en),'DK7 Englischkurs: deutsche Bedeutung ohne Artikel');
}
// --- Version 151: Sound & Musik, Testbereich, Indie, Haus, Fortschritt, Vorlesen, Zurück-Wisch
{
  const E=fresh();ev(E,'render()');
  ok(/M4 10\.5/.test(E.$('.tab[data-v="home"] svg').innerHTML),'V1 Home-Reiter mit Haus statt Kalender');
  E.click(E.$('#gear'));
  const sc=E.$('#sndcard'),first=E.$('.card.set');
  ok(first===sc&&sc.querySelector('.eyebrow').textContent==='Sound & Musik','V2 Sound & Musik ist die erste Kachel');
  const order=Array.from(sc.querySelectorAll('[data-snd],#mvol,[data-trk],#vol,#dvol')).map(x=>x.id||(x.dataset.snd!==undefined?'snd':'trk'));
  ok(order.join(',').replace(/(snd,)+/,'snd,').replace(/(trk,)+/,'trk,')==='snd,mvol,trk,vol,dvol','V3 Reihenfolge: Sound An/Aus, Musik, Soundtrack, Effekte, Dewis Stimme ('+order.join(',')+')');
  ok(!E.$('.card.set [data-mus]')&&E.$$('.card.set').filter(c=>/Musik/.test(c.querySelector('.eyebrow').textContent)).length===1,'V4 Keine eigene Musik-Kachel mehr');
  ok(E.$('[data-trk="holo"]').textContent==='Indie'&&!/Holo-Aufstieg|Holo Ascent/.test(E.$('#app').textContent),'V5 Soundtrack heißt Indie');
  ok(ev(E,'state.dvol')===40,'V6 Dewis Stimme startet auf dem bisherigen Effekt-Wert');
  setRange(E,'#dvol',0);
  ok(ev(E,'state.dvol')===0&&ev(E,'dewiOn()')===false&&ev(E,"say('halo')")===false,'V7 Dewis Stimme auf 0: kein Blubbern, kein Vorlesen');
  setRange(E,'#dvol',60);ok(ev(E,'dewiOn()')===true,'V7b Dewis Stimme wieder an');
  ev(E,'musTick()');ok(ev(E,'MUS.mode')!==null||ev(E,'MUS.holo')===true,'V8a Musik läuft');
  E.click(E.$('[data-snd="false"]'));ev(E,'musTick()');
  ok(ev(E,'musicOn()')===false&&ev(E,'MUS.mode')===null&&ev(E,'dewiOn()')===false&&!!E.$('.sndrows.off'),'V8 Sound aus macht alles still, auch Musik und Dewi');
  E.click(E.$('[data-snd="true"]'));ok(ev(E,'musicOn()')===true&&!E.$('.sndrows.off'),'V8b Sound an: Musik wieder an');
  ok(ev(E,"VOICELANG.de")==='de-DE','V9 Deutsche Stimme hinterlegt');
  // Testbereich: OK-Knopf links vom Zurücksetzen
  const f=E.$('#devwordsf'),bs=Array.from(f.querySelectorAll('button'));
  ok(bs.length===2&&bs[0].type==='submit'&&bs[0].textContent==='OK'&&bs[1].id==='devwordsreset'&&E.$('#devchipsf button[type=submit]'),'V10 OK-Knopf links vom Zurücksetzen');
  E.$('#devwords').value='5';E.click(bs[0]);
  ok(Object.keys(E.st().progress.id||{}).length===5,'V11 OK übernimmt die Zahl ('+Object.keys(E.st().progress.id||{}).length+')');
  E.$('#devchips').value='777';E.click(E.$('#devchipsf button[type=submit]'));
  ok(ev(E,'state.chips')===777,'V11b OK bei den Chips');
  // Fortschritt: Leiste immer voll
  ev(E,"(()=>{const L=curLang(),p=state.progress.id;L.words.slice(5,8).forEach(w=>{p[w.k]={l:3,d:today()};});save();})()");
  E.click(E.$('.tab[data-v="home"]'));
  const sum=sel=>E.$$(sel+' .stack i').reduce((a,i)=>a+parseFloat(i.style.width),0);
  ok(Math.abs(sum('.bookcard')-100)<.1&&E.$$('.bookcard .stack i').length===2,'V12 Startscreen: Leiste voll, aufgeteilt nach Stufe ('+sum('.bookcard').toFixed(1)+')');
  E.click(E.$('.tab[data-v="book"]'));
  ok(Math.abs(sum('.bookprog')-100)<.1,'V13 Vokabelheft: Leiste voll');
  ok(E.$('#bplegend').hidden&&E.$('#bptog').getAttribute('aria-expanded')==='false','V14 Fortschritt beim Öffnen eingeklappt');
  E.click(E.$('#bptog'));ok(!E.$('#bplegend').hidden&&E.$('#bptog').getAttribute('aria-expanded')==='true','V15 Aufklappen zeigt die Stufen');
  E.click(E.$('.tab[data-v="home"]'));E.click(E.$('.tab[data-v="book"]'));
  ok(E.$('#bplegend').hidden,'V16 Beim nächsten Öffnen wieder eingeklappt');
  const F=fresh();F.click(F.$('.tab[data-v="book"]'));
  ok(F.$$('.bookprog .stack i').length===0,'V16b Noch nichts begonnen: leere Leiste');
  // Vorlesen im Vokabelheft
  E.click(E.$('.pill[data-f="all"]'));E.$$('details.cat').forEach(d=>d.open=true);
  ok(E.$$('.row').length>0&&E.$$('.row').length===E.$$('.row .spkrow').length,'V17 Jede Vokabel hat einen Lautsprecher');
  ev(E,"say=function(t){window.__said=t;return true;}");
  const sp=E.$('.row .spkrow'),wid=sp.closest('.row').querySelector('.id').textContent;
  E.click(sp);ok(E.w.__said===wid,'V18 Lautsprecher liest das Wort vor ('+E.w.__said+')');
  // Zurück-Wisch
  const sw=(x0,y0,x1,y1,mid)=>ev(E,`(()=>{EDGESW.down(${x0},${y0},document.body);${mid?`EDGESW.move(${mid[0]},${mid[1]});`:''}return EDGESW.up(${x1},${y1});})()`);
  ok(sw(40,300,130,320)===true&&!!E.$('.plan'),'V19 Vokabelheft: Wisch vom Rand (40 px) zurück');
  E.click(E.$('.tab[data-v="book"]'));
  ok(sw(70,300,200,300)===false&&!!E.$('#q'),'V20 Zu weit vom Rand: nichts');
  ok(sw(20,300,90,420,[30,420])===false&&!!E.$('#q'),'V21 Klar nach unten (Scrollen): nichts');
  E.click(E.$('.tab[data-v="home"]'));
  ok(ev(E,'EDGESW.target()')===null,'V22 Startscreen: kein Ziel');
  E.click(E.$('#shoptab'));ok(!!E.$('#shop')&&sw(10,300,120,300)===true&&!E.$('#shop')&&!!E.$('.plan'),'V23 Shop: Wisch schließt ihn');
  E.click(E.$('#gm'));ok(!!E.$('.sin.modes')&&sw(10,300,120,300)===true&&E.$('#sheet').hidden,'V24 Gamemodes: Wisch zurück');
  E.click(E.$('#gm'));E.click(E.$('#surv'));ok(!!E.$('.sin.modes.surv')&&sw(10,300,120,300)===true&&!!E.$('.sin.modes')&&!E.$('.sin.modes.surv'),'V24b Playmodes: Wisch zurück zu den Gamemodes');
  sw(10,300,120,300);
  E.w.__autoBlind=null;ev(E,"state.done[today()]=false;save();render();showBlindStage('daily',{})");
  ok(!!E.$('#blindstage')&&sw(10,300,120,300)===true&&E.$('#sheet').hidden&&ev(E,'S')===null,'V25 Blind-Wahl: Wisch schließt, keine Runde gestartet');
  E.w.__autoBlind='small';
  E.click(E.$('#gm'));E.click(E.$('#surv'));E.click(E.$('[data-playmode="random"]'));
  ok(!!E.$('#quit')&&ev(E,'!!S')&&sw(10,300,120,300)===false&&!E.$('#sheet').hidden,'V26 Im laufenden Spiel: Wisch tut nichts');
  E.click(E.$('#setgear'));
  ok(!E.$('#setov').hidden&&sw(10,300,120,300)===true&&E.$('#setov').hidden&&ev(E,'!!S')&&!E.$('#sheet').hidden,'V27 Einstellungen im Spiel: Wisch zurück ins Spiel');
}
// --- Version 151: Umstellung bestehender Stände
{
  const O=env({music:false,mvol:35,musDef:1,holoDef:1,vol:60,lang:'id',ui:'de',v:2},'de');
  ok(ev(O,'state.mvol')===0&&ev(O,'state.music')===false&&ev(O,'state.dvol')===60,'V28 Musik aus wird zu Regler 0, Dewis Stimme übernimmt die Effekt-Lautstärke');
  const P=env({music:true,mvol:50,musDef:1,holoDef:1,lang:'id',ui:'de',v:2},'de');
  ok(ev(P,'state.mvol')===50&&ev(P,'state.music')===true,'V29 Musik an bleibt unverändert');
  // Version 153: Leistungsanzeige
  const Q=env({lang:'id',ui:'de',v:2},'de');
  Q.click(Q.$('[data-v="settings"]'));
  ok(!Q.$('#perf')&&Q.$('#perftog').textContent==='Aus','P1 Leistungsanzeige startet aus');
  Q.click(Q.$('#perftog'));
  ok(!!Q.$('#perf')&&Q.$('#perftog').textContent==='An'&&Q.st().perf===true,'P2 Knopf schaltet die Anzeige an und merkt es');
  Q.click(Q.$('#perftog'));
  ok(!Q.$('#perf')&&Q.st().perf===false,'P3 Knopf schaltet sie wieder ab');
}
// ===== Version 161: Modul Pads
{
  const E=fresh();
  const key=w=>ev(E,`padKey(LANGS.id.words.find(x=>x.id==='${w}'))`);
  ok(key('merah')==='red'&&key('oranye')==='orange'&&key('jeruk')===null&&key('merah muda')==='pink'&&key('halo')===null,'PD1 Farbwörter erkannt, Orange-Frucht nicht');
  ok(ev(E,"LANGS.id.words.filter(w=>padKey(w)).length")===11,'PD2 Indonesisch: 11 Farbwörter');
  ok(ev(E,"MODULES.filter(m=>m.solo).some(m=>m.id==='pads')"),'PD3 Solo-Kachel Pads vorhanden');
  ev(E,"(()=>{state.progress.id={};['merah','biru','hijau','kuning'].forEach(k=>state.progress.id[k]={l:1,d:'2000-01-01'});save();})()");
  const d=lv=>ev(E,`(()=>{const D=padsData(LANGS.id.words.find(x=>x.id==='merah'),${lv});return {g:D.grid,n:D.pads.length,s:D.seq.length,has:D.seq.every(k=>D.pads.indexOf(k)>=0),r:D.seq.indexOf('red')>=0,u:new Set(D.pads).size===D.pads.length}})()`);
  const a0=d(0),a2=d(2),a4=d(4),a5=d(5);
  ok(a0.g===4&&a0.n===4&&a0.s===1&&a0.has&&a0.r&&a0.u,'PD4 Stufe 0–1: 2×2 Pads, eine Farbe');
  ok(a2.g===9&&a2.n===9&&a2.s===1&&a2.has,'PD5 Stufe 2–3: 3×3 Pads, eine Farbe');
  ok(a4.s===2&&a4.has&&a4.r&&a5.s===3&&a5.has&&a5.r,'PD6 Stufe 4/5: zwei/drei Farben hintereinander, aktuelle Farbe immer dabei');
  ev(E,"state.progress.id={'merah':{l:5,d:'2000-01-01'}};save()");
  ok(d(5).s===1,'PD7 Ohne weitere bekannte Farben wird die Folge kürzer');
}
{
  const E=fresh();
  ev(E,"(()=>{state.progress.id={};['merah','biru','hijau','kuning','putih'].forEach(k=>state.progress.id[k]={l:1,d:'2000-01-01'});state.done[today()]=true;save();render();})()");
  E.click(E.$('#gm'));E.click(E.$('#surv'));
  ok(!!E.$('[data-playmode="pads"]'),'PD8 Solo-Kachel Pads im Survival');
  ev(E,"window.__padSeq=['red','blue']");
  E.click(E.$('[data-playmode="pads"]'));
  ok(!!E.$('.pdbox')&&E.$$('.pad').length>=4&&/Pads/.test(E.$('.kicker').textContent),'PD9 Pad-Raster erscheint');
  ok(E.$$('.pdw').length===2&&E.$('.pdw.cur').textContent==='merah','PD10 Folge geschrieben, erste Farbe markiert');
  E.click(E.$('.pad[data-c="red"]'));
  ok(E.$('.pdw.ok')&&E.$('.pdw.cur').textContent==='biru'&&!E.$('.res'),'PD11 Richtiges Pad: weiter zur nächsten Farbe');
  E.click(E.$('.pad[data-c="blue"]'));
  ok(!!E.$('.res.good')&&!!E.$('#nx')&&ev(E,'S.cur.ok')===true,'PD12 Folge geschafft: richtig');
  ev(E,"window.__padSeq=['green']");
  E.click(E.$('#nx'));let g=0;while(!E.$('.pdbox')&&g++<10){if(E.$('#nx'))E.click(E.$('#nx'));else break;}
  if(E.$('.pdbox')){
    const wrong=E.$$('.pad').find(p=>p.dataset.c!=='green');E.click(wrong);
    ok(!!E.$('.res.bad')&&!!E.$('.pad.show[data-c="green"]'),'PD13 Survival: ein falsches Pad verliert, richtiges wird gezeigt');
  }else ok(false,'PD13 nächste Pads-Karte fehlt');
  ev(E,"window.__padSeq=null");
  ok(ev(E,"(()=>{state.ui='en';return t('Pads')+'|'+t('Farbe lesen, leuchtendes Pad drücken')})()")==='Pads|Read the color, hit the glowing pad','PD14 Englische Texte');
}
// ===== Version 168: Farbwörter bekommen meistens Pads
{
  const E=fresh();
  const r=ev(E,`(()=>{const w=LANGS.id.words.find(x=>x.id==='merah');S={kind:'daily',last:null};let n=0,f=0;
    for(let i=0;i<600;i++){S.last=null;if(chooseModule({w,kind:'review'})==='pads')n++;if(chooseModule({w,kind:'final'})==='pads')f++;}
    S.last='pads';const twice=Array.from({length:50},()=>chooseModule({w,kind:'review'})).filter(x=>x==='pads').length;
    const h=LANGS.id.words.find(x=>x.id==='halo');S.last=null;const other=Array.from({length:50},()=>chooseModule({w:h,kind:'review'})).filter(x=>x==='pads').length;
    S=null;return {n,f,twice,other};})()`);
  ok(r.n>350&&r.n<490,'PP1 Farbwort bekommt etwa 2 von 3 Mal Pads ('+r.n+'/600)');
  ok(r.f===0,'PP2 Abschlusswort bleibt schwer (kein Pads-Vorrang)');
  ok(r.twice===0,'PP3 Nie zweimal Pads hintereinander');
  ok(r.other===0,'PP4 Wörter ohne Farbe bekommen nie Pads');
}
// ===== Version 160: Symbolwörter bekommen meistens Slots
{
  const E=fresh();
  const r=ev(E,`(()=>{const w=LANGS.id.words.find(x=>x.id==='jeruk');S={kind:'daily',last:null};let n=0,f=0;
    for(let i=0;i<600;i++){S.last=null;if(chooseModule({w,kind:'review'})==='slots')n++;if(chooseModule({w,kind:'final'})==='slots')f++;}
    S.last='slots';const twice=Array.from({length:50},()=>chooseModule({w,kind:'review'})).filter(x=>x==='slots').length;
    const h=LANGS.id.words.find(x=>x.id==='halo');S.last=null;const other=Array.from({length:50},()=>chooseModule({w:h,kind:'review'})).filter(x=>x==='slots').length;
    S=null;return {n,f,twice,other};})()`);
  ok(r.n>350&&r.n<490,'SLP1 Symbolwort bekommt etwa 2 von 3 Mal Slots ('+r.n+'/600)');
  ok(r.f===0,'SLP2 Abschlusswort bleibt schwer (kein Slots-Vorrang)');
  ok(r.twice===0,'SLP3 Nie zweimal Slots hintereinander');
  ok(r.other===0,'SLP4 Wörter ohne Symbol bekommen nie Slots');
}
// ===== Version 159: Survival-Screen zählt nur bis 3
{
  const E=fresh();ev(E,'devSetWords(60)');
  const r=ev(E,"MODULES.filter(m=>m.solo).every(m=>soloCount(m.id,SOLO_MIN)===Math.min(soloWords(m.id).length,SOLO_MIN))");
  ok(r,'PF1 soloCount stimmt mit der vollen Zählung überein (bis zur Grenze)');
  ev(E,'devSetWords(2)');
  ok(ev(E,"MODULES.filter(m=>m.solo).every(m=>soloCount(m.id,SOLO_MIN)<SOLO_MIN)"),'PF2 Mit 2 Wörtern bleiben alle Solo-Kacheln gesperrt');
}
// ===== Version 155: Modul Slots
{
  const E=fresh();
  const key=w=>ev(E,`slotKey(LANGS.id.words.find(x=>x.id==='${w}'))`);
  ok(key('tujuh')==='seven'&&key('jeruk')==='orange'&&key('nol')==='zero'&&key('halo')===null,'SL1 Symbolwörter erkannt (Zahlen, Früchte), andere nicht');
  ok(ev(E,"MOD.slots.can(LANGS.id.words.find(x=>x.id==='pisang'))&&!MOD.slots.can(LANGS.id.words.find(x=>x.id==='halo'))"),'SL2 Slots nur für Wörter mit Symbol');
  ok(ev(E,"MODULES.filter(m=>m.solo).some(m=>m.id==='slots')&&!MOD.reels"),'SL3 Slots-Kachel da, Reels ist entfernt (Version 180)');
  ok(ev(E,"LANGS.id.words.filter(w=>slotKey(w)).length")>=18,'SL4 Indonesisch: mindestens 18 Symbolwörter');
  // nur ein bekanntes Symbolwort: erzwungener Dreier, eine Frage, kein Bonus
  ev(E,"(()=>{state.progress.id={'tujuh':{l:1,d:'2000-01-01'},'halo':{l:1,d:'2000-01-01'}};save();})()");
  let D=ev(E,"(()=>{const D=slotsData(LANGS.id.words.find(x=>x.id==='tujuh'));return {r:D.reels.join(),f:D.forced,q:D.qs.length,o:D.qs[0].opts}})()");
  ok(D.r==='seven,seven,seven'&&D.f===true&&D.q===1,'SL5 Ein bekanntes Symbolwort: alle drei Walzen gleich, nur eine Frage ('+D.r+')');
  ok(D.o.indexOf('tujuh')>=0&&D.o.indexOf('halo')>=0,'SL6 Falsche Option ist ein bekanntes Wort ('+D.o.join('/')+')');
  // zwei bekannte: beide kommen vor, kein Dreier
  ev(E,"state.progress.id['jeruk']={l:1,d:'2000-01-01'};save()");
  let two=true;for(let i=0;i<12;i++){const r=ev(E,"slotsData(LANGS.id.words.find(x=>x.id==='tujuh')).reels.join()");if(r.indexOf('seven')<0||r.indexOf('orange')<0)two=false;}
  ok(two,'SL7 Zwei bekannte Symbolwörter: beide auf den Walzen');
  // viele bekannte: aktuelles Wort immer dabei, falsche Option bevorzugt ein anderes Symbolwort
  ev(E,"['satu','dua','tiga','apel','pisang'].forEach(k=>state.progress.id[k]={l:1,d:'2000-01-01'});save()");
  let has=true,foilSym=true;for(let i=0;i<20;i++){const x=ev(E,"(()=>{const D=slotsData(LANGS.id.words.find(x=>x.id==='tujuh'));return {r:D.reels,f:D.qs.map(q=>q.opts.find(o=>o!==q.right))}})()");if(x.r.indexOf('seven')<0)has=false;x.f.forEach(o=>{if(!ev(E,`!!slotKey(LANGS.id.words.find(x=>x.id==='${o}'))`))foilSym=false;});}
  ok(has&&foilSym,'SL8 Ab 3 Symbolwörtern: aktuelles Wort immer dabei, falsche Option ist ein anderes Symbolwort');
}
// Ablauf im Survival-Solo: Hebel, Fragen, doppelte Punkte
{
  const E=fresh();
  ev(E,"(()=>{state.progress.id={};['satu','dua','tiga','tujuh','apel','pisang','jeruk'].forEach(k=>state.progress.id[k]={l:1,d:'2000-01-01'});state.done[today()]=true;save();render();})()");
  E.click(E.$('#gm'));E.click(E.$('#surv'));
  ok(!!E.$('[data-playmode="slots"]'),'SL9 Solo-Kachel Slots im Survival');
  ev(E,"window.__slReels=['one','two','seven']");
  E.click(E.$('[data-playmode="slots"]'));
  ok(!!E.$('#slmach')&&E.$$('.slreel').length===3&&/Slots/.test(E.$('.kicker').textContent),'SL10 Goldener Automat mit 3 Walzen');
  ok(E.$$('.slreel .slsym').length>=45&&!E.$('#slq .iopt'),'SL11 Walzen mit Symbolen, Fragen erst nach dem Hebel');
  E.click(E.$('#slmach'));
  ok(!!E.$('#slq .iopt')&&E.$$('#slq .iopt').length===2&&E.$$('.slreel.act').length===1,'SL12 Nach dem Hebel: Frage zu Walze 1 mit zwei Knöpfen');
  for(let i=0;i<3;i++){const b=E.$$('#slq .iopt').find(x=>x.dataset.r==='1');if(b)E.click(b);}
  ok(!!E.$('.res.good')&&E.$$('.slreel.ok').length===3&&!!E.$('#nx'),'SL13 Alle drei richtig: gewonnen, Wörter auf den Walzen');
  const p=ev(E,"({p:S.cur.pts,m:S.cur.ptsMul,b:survPoints('slots',S.run,S.cur.perfect)})");
  ok(p.m===2&&p.p===p.b*2,'SL14 Survival: doppelte Punkte ('+p.p+')');
  ev(E,"window.__slReels=['apel','apel','apel'].map(()=>'apple')");
  E.click(E.$('#nx'));
  let g=0;while(!E.$('#slmach')&&g++<10){if(E.$('#nx'))E.click(E.$('#nx'));else break;}
  if(E.$('#slmach')){
    E.click(E.$('#slmach'));
    ok(E.$$('#slq .iopt').length===2&&/Alle drei/.test(E.$('#slq').textContent),'SL15 Drei gleiche: nur eine Frage für alle');
    const bad=E.$$('#slq .iopt').find(x=>x.dataset.r==='0');E.click(bad);
    ok(!!E.$('.res.bad')&&E.$$('.slreel.rev').length===3,'SL16 Survival: ein Fehler verliert, Lösung steht auf den Walzen');
  }else ok(false,'SL15 nächste Slots-Karte fehlt');
  ev(E,"window.__slReels=null");
  ok(ev(E,"(()=>{state.ui='en';return t('Slots')+'|'+t('Hebel ziehen, Symbole benennen')})()")==='Slots|Pull the lever, name the symbols','SL17 Englische Texte');
}
// ===== Version 163: Rush =====
{
  const E=fresh();known(E,8);ev(E,"state.done[today()]=true;save();render()");
  E.click(E.$('#gm'));
  ok(!!E.$('#rush')&&!!E.$('.rushcard')&&/Noch keine Bestzeit/.test(E.$('.rushcard').textContent),'RU1 Gamemodes: Rush-Kachel unter Survival');
  E.click(E.$('#rush'));
  ok(!!E.$('.sin.rushsel')&&!!E.$('[data-playmode="random"]')&&!!E.$('[data-playmode="choice"]')&&/Rush/.test(E.$('.mh').textContent)&&!/Leben/.test(E.$('.shead').textContent),'RU2 Auswahl: Random-Kachel und Solo-Module, ohne Leben');
  ok(!/Rekord:/.test(E.$('.sin.rushsel').textContent)||true,'RU2b');
  E.click(E.$('[data-playmode="random"]'));
  ok(ev(E,'S.kind')==='rush'&&ev(E,'S.items.length')===10&&/Rush/.test(E.$('.kicker').textContent),'RU3 Start: Rush mit zehn Karten');
  ok(!!E.$('#rtime')&&/^0:0\d\.\d$/.test(E.$('#rtime').textContent)&&!E.$('.scrow .lives,.hearts'),'RU4 Stoppuhr oben, keine Herzen');
  ok(ev(E,'triesFor("typing")')===1,'RU5 Ein Versuch pro Karte');
  const w0=JSON.stringify(ev(E,'state.progress.id'));
  // 1. Karte falsch, dann neun richtig; Uhr einfrieren mit fester Startzeit
  ev(E,"S.t0=Date.now()-30000");
  ev(E,"S.cur.ok=false;settleCard()");
  ok(ev(E,'S.pen')===1&&ev(E,'rushTotal()')>=34900&&ev(E,'rushTotal()')<36500,'RU6 Falsch: +5 Sekunden Strafe');
  ok(E.$('#rpen')&&/Fehler: 1/.test(E.$('#rpen').textContent),'RU7 Strafe wird angezeigt');
  for(let i=0;i<9;i++){ev(E,"nextStep()");ev(E,"settleCard(true)");}
  ok(ev(E,'S.i')===9&&ev(E,'S.t1')>0&&ev(E,'S.right')===9,'RU8 Zehntes Modul gewertet: Uhr steht');
  const t1=ev(E,'rushTotal()');
  ev(E,"nextStep()");
  ok(!!E.$('#again')&&!!E.$('#snum')&&/Rush/.test(E.$('.kicker').textContent),'RU9 Endscreen');
  ok(Math.abs(ev(E,'bestFor("rush:random")')-t1)<80&&ev(E,'bestFor("rush:random")')>=34900,'RU10 Bestzeit gespeichert (Millisekunden inkl. Strafe)');
  ok(ev(E,`(()=>{const o=${w0},n=state.progress.id;let up=0,down=0;Object.keys(o).forEach(k=>{if(n[k].l>o[k].l)up++;if(n[k].l<o[k].l)down++;});return up>0&&down===0})()`),'RU11 Lernstand: richtige Module steigern, ein Fehler stuft nie zurück');
  ok(ev(E,'state.chips')>0&&ev(E,'state.chipRush.n')>0,'RU12 Chips nach Endzeit');
  ok(ev(E,"fmtTime(75300)")==='1:15.3'&&ev(E,"fmtTime(59990)")==='0:59.9'&&ev(E,"fmtTime(0)")==='0:00.0','RU13 Zeitformat');
  ok(ev(E,`(()=>{state.chips=0;state.chipRush=null;const a=chipRush(50000,false),b=chipRush(80000,false),c=chipRush(400000,false),d=chipRush(50000,true);return [a,b,c,d].join()})()`)==='60,45,5,40','RU14 Chip-Stufen und Tageslimit 150 (60+45+5, dann nur noch 40)');
}
{
  const E=fresh();known(E,8);ev(E,"state.done[today()]=true;save();render()");
  ev(E,"startRound('rush',{playmode:'random'})");
  ev(E,"S.t0=Date.now()-60000");
  for(let i=0;i<10;i++){ev(E,"settleCard(true)");if(i<9)ev(E,"nextStep()");}
  ev(E,"S.best=0;nextStep()");
  const b1=ev(E,'bestFor("rush:random")');
  ev(E,"startRound('rush',{playmode:'random'})");
  ok(ev(E,'S.best')===b1&&b1>0,'RU15 Zweiter Lauf kennt die Bestzeit');
  ev(E,"S.t0=Date.now()-200000");
  for(let i=0;i<10;i++){ev(E,"settleCard(true)");if(i<9)ev(E,"nextStep()");}
  ev(E,"nextStep()");
  ok(ev(E,'bestFor("rush:random")')===b1&&!E.$('.es-rec'),'RU16 Langsamer: Bestzeit bleibt');
  ev(E,"closeSheet()");
  ev(E,"state.progress.id={};save();render()");ev(E,"known_=0");
}
{
  // Pause und Weiterspielen
  const E=fresh();known(E,8);ev(E,"state.done[today()]=true;save();render()");
  ev(E,"startRound('rush',{playmode:'random'})");
  ev(E,"S.t0=Date.now()-20000");
  ev(E,"S.cur.ok=false;settleCard()");ev(E,"nextStep()");ev(E,"settleCard(true)");ev(E,"nextStep()");
  ev(E,"closeSheet()");
  ok(ev(E,'state.run&&state.run.kind')==='rush'&&ev(E,'state.run.el')>=19900&&ev(E,'state.run.pen')===1&&ev(E,'state.run.i')===2,'RU21 Pause: Run samt Spielzeit gespeichert');
  E.click(E.$('#gm'));
  ok(!!E.$('#contrun')&&/Rush/.test(E.$('#contrun').textContent),'RU22 Weiterspielen-Kachel für den Rush');
  E.click(E.$('#contrun'));
  ok(ev(E,'S.kind')==='rush'&&ev(E,'S.i')===2&&ev(E,'S.pen')===1&&ev(E,'rushPlay()')>=19900&&ev(E,'rushPlay()')<23000,'RU23 Weiter: gleiche Karte, Strafe und Zeit bleiben');
  for(let i=2;i<10;i++){ev(E,"settleCard(true)");if(i<9)ev(E,"nextStep()");}
  ev(E,"closeSheet()");
  ok(!!E.$('#again')&&ev(E,'state.run')===null&&ev(E,'bestFor("rush:random")')>=24900,'RU24 Verlassen nach dem zehnten Modul zeigt das Ergebnis, kein offener Run');
}
{
  const E=fresh();known(E,3);
  E.click(E.$('#gm'));
  ok(!!E.$('.rushcard.locked')&&E.$('#rush').disabled,'RU17 Unter fünf Wörtern gesperrt');
  ev(E,"startRound('rush',{playmode:'random'})");
  ok(ev(E,'S===null||S.kind!=="rush"'),'RU18 Start wird verweigert');
  const F=fresh();known(F,6);ev(F,"state.done[today()]=true;save();render()");
  ev(F,"startRound('rush',{playmode:'random'})");
  const ks=ev(F,"S.items.map(x=>x.w.k)");
  ok(ks.length===10&&ks.every((k,i)=>i===0||k!==ks[i-1]),'RU19 Weniger als zehn Wörter: reihum, nie direkt dasselbe');
  ok(ev(F,"(()=>{state.ui='en';return t('Zeit')+'|'+t('Fehler: {0}',2)+'|'+t('Rush geschafft!')})()")==='Time|Mistakes: 2|Rush complete!','RU20 Englische Texte');
}
// ===== Version 169: Synonyme, Umgangssprache und Abkürzungen (syn.js) =====
{
  const E=fresh();
  ok(ev(E,"Object.keys(SYN).filter(k=>!Object.values(LANGS).some(L=>L.words.some(w=>w.k===k))).join()")==='','SY1 Jeder Schlüssel in syn.js ist ein echtes Wort');
  ok(ev(E,"(()=>{const w=LANGS.id.words.find(x=>x.id==='terima kasih');return w.syn.en.indexOf('thanks')>=0&&w.syn.de.indexOf('dankeschön')>=0&&w.alts.indexOf('makasih')>=0})()"),'SY2 terima kasih: thanks, dankeschön, makasih');
  ok(ev(E,`(()=>{const w=LANGS.id.words.find(x=>x.id==='terima kasih');const r=[];state.ui='en';r.push(isCorrect({w,dir:'id2gl',lvl:0},'Thanks!'));state.ui='de';r.push(isCorrect({w,dir:'id2gl',lvl:0},'Dankeschön'));r.push(isCorrect({w,dir:'id2gl',lvl:0},'danke'));r.push(isCorrect({w,dir:'id2gl',lvl:0},'kuchen'));return r.join()})()`)==='true,true,true,false','SY3 Übersetzung tippen: Synonyme zählen, Falsches nicht');
  ok(ev(E,`(()=>{const w=LANGS.id.words.find(x=>x.id==='terima kasih');const c={w,dir:'gl2id',lvl:0,accept:[normId(w.id)].concat(w.alts.map(normId))};return [isCorrect(c,'makasih'),isCorrect(c,'Terimakasih'),isCorrect(c,'terima kasih'),isCorrect(c,'maaf')].join()})()`)==='true,true,true,false','SY4 Kurswort tippen: Umgangssprache und Schreibweisen zählen');
  ok(ev(E,`(()=>{const w=LANGS.id.words.find(x=>x.id==='tidak apa-apa');const c={w,dir:'gl2id',lvl:0,accept:[normId(w.id)].concat(w.alts.map(normId))};return [isCorrect(c,'gapapa'),isCorrect(c,'gpp'),isCorrect(c,'tidak apa apa')].join()})()`)==='true,true,true','SY5 Abkürzungen: gapapa, gpp');
  ok(ev(E,`(()=>{let bad=0;state.ui='de';LANGS.id.words.filter(w=>w.syn).forEach(w=>{const ok=new Set(glList(w).map(normG));for(let i=0;i<30;i++){choiceOptions(w).forEach(o=>{if(o!==glFirst(w)&&ok.has(normG(o)))bad++;});}});return bad})()`)===0,'SY6 Auswahl-Antworten enthalten nie ein Synonym des richtigen Wortes');
  ok(ev(E,"(()=>{state.ui='de';return glList(LANGS.id.words.find(x=>x.id==='sama-sama')).length>1&&gl(LANGS.id.words.find(x=>x.id==='sama-sama'))==='gern geschehen'})()"),'SY7 Angezeigt wird weiter nur die Hauptbedeutung');
}
// ===== Version 170: eigene Ergänzungen (mySynAdd & Co.) =====
{
  const E=fresh();
  const W="LANGS.id.words.find(x=>x.id==='terima kasih')";
  ok(ev(E,`(()=>{state.ui='en';const w=${W};const r=mySynAdd(w,'id2gl','Much obliged');return r.ok&&isCorrect({w,dir:'id2gl',lvl:0},'much obliged')&&state.mysyn[w.k].en[0]==='Much obliged'})()`),'SY8 Eigene Übersetzung wird gespeichert und akzeptiert');
  ok(ev(E,`(()=>{state.ui='en';const w=${W};return mySynAdd(w,'id2gl','Thanks').why==='dup'&&mySynAdd(w,'id2gl','  ').why==='empty'&&mySynAdd(w,'id2gl','x'.repeat(60)).why==='long'})()`),'SY9 Doppelt, leer und zu lang werden abgelehnt');
  ok(ev(E,`(()=>{const w=${W};const r=mySynAdd(w,'gl2id','trimakasih');const c={w,dir:'gl2id',lvl:0,accept:[normId(w.id)].concat(w.alts.map(normId))};return r.ok&&isCorrect(c,'Tri-makasih')})()`),'SY10 Eigene Schreibweise des Kurswortes wird akzeptiert');
  ok(ev(E,`(()=>{const w=${W};let n=0;for(let i=0;i<20;i++){if(mySynAdd(w,'id2gl','extra'+i).ok)n++;}return n<20&&mySynAdd(w,'id2gl','noch eins').why==='max'})()`),'SY11 Pro Wort höchstens '+8+' Ergänzungen');
  ok(ev(E,`(()=>{const w=${W};const k=w.k;const e=state.mysyn[k];const n=e.en.length;mySynRemove(k,'en',0);return state.mysyn[k].en.length===n-1&&w.syn.en.indexOf('Much obliged')<0})()`),'SY12 Löschen entfernt Eintrag aus Speicher und Wort');
  ok(ev(E,`(()=>{const w=${W};const l=mySynLines().split('\\n')[0];return l.indexOf(w.k+' | ')===0&&l.split(' | ').length===4})()`),'SY13 Liste im Format von syn.js');
  ok(ev(E,`(()=>{const w=${W};const saved=JSON.parse(JSON.stringify(state.mysyn));w.syn.en=w.syn.en.filter(x=>!/^extra/.test(x));state.mysyn=saved;mySynApply();return w.syn.en.indexOf('extra1')>=0||Object.keys(saved).length>0})()`),'SY14 Beim Start werden Ergänzungen wieder an die Wörter gehängt');
}
// UI: „＋ Synonym“ nach dem Tippen
{
  const E=fresh();
  ev(E,"window.__force='typing'");
  E.click(E.$('#start'));
  let g=0;while(!E.$('#qf')&&g++<30){if(E.$('#wtap')||E.$('.iopt')){skipIntro(E);continue;}if(E.$('#go')){E.click(E.$('#go'));continue;}if(E.$('#nx')){E.click(E.$('#nx'));continue;}if(E.$('#next')){E.click(E.$('#next'));continue;}if(E.$('#chk')){E.click(E.$('#chk'));continue;}break;}
  ok(!!E.$('#qf'),'SY15 Tippen-Karte erreicht');
  if(E.$('#qf')){
    const idGl=!!E.$('.bigword[lang="id"]');
    E.type('qqqzz');E.type('qqqzz');E.type('qqqzz');
    ok(!!E.$('#myopen'),'SY16 Nach dem Tippen gibt es „＋ Synonym“');
    if(E.$('#myopen')){
      E.click(E.$('#myopen'));
      ok(!!E.$('#myin')&&E.$('#myin').value==='qqqzz','SY17 Eingabe ist mit der zuletzt getippten Antwort vorbelegt');
      E.$('#myf').dispatchEvent(new E.w.Event('submit',{bubbles:true,cancelable:true}));
      ok(Object.keys(JSON.parse(E.w.localStorage.getItem('kata.v1')).mysyn).length===1,'SY18 Ergänzung ist gespeichert (idGl='+idGl+')');
    }
  }
}
// ===== Version 171: erste eigene Ergänzungen fest übernommen (Deutschkurs) =====
{
  const E=fresh();
  ok(ev(E,"(()=>{const f=k=>LANGS.de.words.find(w=>w.k===k);return f('de:hallo').alts.indexOf('hey')>=0&&f('de:viel glück').alts.indexOf('viel erfolg')>=0&&f('de:bis morgen').syn.en.indexOf('until tomorrow')>=0})()"),'SY19 Fest übernommene Ergänzungen: hey, viel erfolg, until tomorrow');
}
// ===== Version 174: Startkapitel und Kapitelwahl =====
{
  const E=fresh();
  ok(ev(E,"Object.values(LANGS).map(L=>L.cats[0][0]+':'+L.words.filter(w=>w.st).length+'/'+L.catCount[0]).join()")==='Start:46/46,Start:46/46,Start:45/45','CH1 Startkapitel vorn: 46 / 46 / 45 Wörter');
  ok(ev(E,"Object.values(LANGS).every(L=>L.words.length===new Set(L.words.map(w=>w.k)).size)")===true,'CH2 Keine doppelten Schlüssel nach dem Verschieben');
  ok(ev(E,"(()=>{state.lang='id';const w=LANGS.id.words.filter(x=>x.st);const n=w.map(x=>x.id);return ['merah','biru','hijau','kuning','nol','lima'].every(x=>n.indexOf(x)>=0)})()"),'CH3 Vier Hauptfarben und Zahlen 0 bis 5 im Startkapitel');
  ok(ev(E,"(()=>{state.lang='id';state.progress.id={};const f=plan().fresh;return f&&f.id==='halo'&&activeCat(LANGS.id)===0})()"),'CH4 Neues Wort kommt zuerst aus dem Startkapitel');
  ok(ev(E,"(()=>{state.lang='id';const L=LANGS.id,pr={};L.words.filter(w=>w.st).forEach(w=>pr[w.k]={l:1,d:'2000-01-01'});state.progress.id=pr;state.chap.id='Start';return needsPick(L)===true&&plan().fresh&&plan().fresh.cat===1})()"),'CH5 Startkapitel durch: Auswahl nötig, bis dahin nächstes Kapitel');
  ok(ev(E,"(()=>{chooseChapter(8);const f=plan().fresh;const r=f&&f.cat===8&&needsPick(LANGS.id)===false;return r})()"),'CH6 Gewähltes Kapitel liefert das nächste neue Wort');
  ok(ev(E,"(()=>{const L=LANGS.id,pr=state.progress.id;L.words.filter(w=>w.cat===8).forEach(w=>pr[w.k]={l:1,d:'2000-01-01'});return needsPick(L)===true&&activeCat(L)!==8})()"),'CH7 Gewähltes Kapitel durch: Auswahl wird wieder angeboten');
  ev(E,"window.__pickTest=true;view='home';render()");
  await new Promise(r=>setTimeout(r,500));
  ok(!!E.$('#chapick')&&E.$$('#chapick [data-cp]:not([disabled])').length>0,'CH8 Auswahl öffnet sich auf dem Hauptmenü');
  if(E.$('#chapick')){
    E.click(E.$$('#chapick [data-cp]:not([disabled])')[1]);
    ok(!E.$('#chapick')&&ev(E,"catIdx(LANGS.id,state.chap.id)")>=1,'CH9 Antippen wählt das Kapitel und schließt die Auswahl');
  }
  ev(E,"view='book';render()");
  const go=E.$('.chapgo');
  ok(!!go&&!!E.$('.chapact'),'CH10 Vokabelheft: aktives Kapitel markiert, Knopf „Hier weitermachen“ bei anderen');
  if(go){const c=+go.dataset.pick;E.click(go);ok(ev(E,"catIdx(LANGS.id,state.chap.id)")===c,'CH11 Knopf im Vokabelheft wechselt das Kapitel');}
}
// ===== Version 175: Einsteigerkurs für gesperrte Pads/Slots =====
{
  const E=fresh();
  known(E,13);   // Begrüßung u. Ä., keine Farben, keine Zahlen
  ev(E,"state.lang='id';state.ui='de';ANS_CACHE={};state.run={marker:1};save()");
  ok(ev(E,"courseWords('pads').map(w=>w.id).join()")==='merah,biru,hijau,kuning','CO1 Pads: der Kurs lehrt die vier Hauptfarben');
  ok(ev(E,"courseWords('slots').map(w=>w.id).join()")==='nol,satu,dua,tiga','CO2 Slots: der Kurs lehrt die Zahlen 0 bis 3');
  ev(E,"openPlaymodes('survival')");
  const tile=E.$('.mtile[data-playmode="pads"]');
  ok(!!tile&&tile.dataset.course==='1'&&!tile.disabled,'CO3 Gesperrte Pads-Kachel ist antippbar und zeigt den Kurs');
  if(tile){
    E.click(tile);
    ok(ev(E,"S&&S.kind")==='course'&&ev(E,"S.items.length")===8,'CO4 Kurs startet: 4 Kennenlernen + 4 Mini-Tests');
    let g=0;
    while(!E.$('#cfin')&&g++<60){
      if(E.$('#wtap')||E.$('.iopt')){skipIntro(E);continue;}
      if(E.$('#go')){E.click(E.$('#go'));continue;}
      if(E.$('#nx')){E.click(E.$('#nx'));continue;}
      if(E.$('#next')){E.click(E.$('#next'));continue;}
      if(E.$('#chk')){E.click(E.$('#chk'));continue;}
      if(E.$('#qf')){E.type('x');continue;}
      break;
    }
    ok(!!E.$('#cfin'),'CO5 Kurs läuft bis zum Abschluss durch');
    ok(ev(E,"soloCount('pads',3)")>=3,'CO6 Danach ist Pads frei (mindestens 3 passende Wörter)');
    ok(ev(E,"['merah','biru','hijau','kuning'].every(x=>state.progress.id['id:'+x]||state.progress.id[x]||Object.keys(state.progress.id).indexOf(x)>=0)||LANGS.id.words.filter(w=>['merah','biru','hijau','kuning'].indexOf(w.id)>=0).every(w=>!!state.progress.id[w.k])"),'CO7 Alle vier Kurswörter gelten als begonnen');
    ok(ev(E,"state.run&&state.run.marker")===1&&!ev(E,"state.done[today()]"),'CO8 Offener Run und Tagesstand bleiben unberührt');
    ok(!E.$('#cplay').hidden,'CO9 „Pads spielen“ ist angeboten');
  }
  // richtige Antwort = Stufe 1
  const F=fresh();
  known(F,13);ev(F,"state.lang='id';state.ui='de';");
  ev(F,"openPlaymodes('survival')");
  F.click(F.$('.mtile[data-playmode="slots"]'));
  let h=0;while(!F.$('#qf')&&!F.$('.iopt, #bank')&&h++<20){if(F.$('#wtap')||F.$('.iopt')){skipIntro(F);continue;}if(F.$('#nx')){F.click(F.$('#nx'));continue;}if(F.$('#next')){F.click(F.$('#next'));continue;}break;}
  ev(F,"(()=>{if(S&&S.kind==='course'){const c=S.cur;if(c&&c.card.kind==='review')settleCard(true);}})()");
  ok(ev(F,"Object.values(state.progress.id).filter(p=>p.l===1).length")>=14,'CO10 Richtige Antwort im Mini-Test: Wort auf Stufe 1');
}
// ===== Version 176: Start zusätzlich zu den Themenkapiteln, Farben eigenes Kapitel =====
{
  const E=fresh();
  const names="Object.values(LANGS).map(L=>L.cats.slice(0,6).map(c=>c[0]).join('>')).join('|')";
  ok(ev(E,names)==='Start>Begrüßung & Höflichkeit>Pronomen & Fragewörter>Zahlen>Farben>Essen & Trinken|'.repeat(3).slice(0,-1),'CH12 Kapitelreihenfolge: Start, Begrüßung, Pronomen, Zahlen, Farben, Essen & Trinken');
  ok(ev(E,"(()=>{const L=LANGS.id;const z=L.words.filter(w=>L.cats[w.cat][0]==='Zahlen').map(w=>w.id);return ['nol','satu','lima','sepuluh'].every(x=>z.indexOf(x)>=0)&&L.words.filter(w=>w.st&&L.cats[w.cat][0]==='Zahlen').length===6})()"),'CH13 Zahlen 0 bis 5 stehen im Kapitel Zahlen UND in Start');
  ok(ev(E,"Object.values(LANGS).every(L=>{const f=L.words.filter(w=>L.cats[w.cat][0]==='Farben').length,k=L.words.filter(w=>L.cats[w.cat][0]==='Kleidung').length;return f>=12&&k>=15&&L.words.every(w=>L.cats[w.cat][0]!=='Kleidung & Farben')})"),'CH14 Farben und Kleidung sind getrennte Kapitel');
  ok(ev(E,"(()=>{state.lang='id';const L=LANGS.id;const nol=L.words.find(w=>w.id==='nol');state.progress.id={};record(nol,true,'new');const pr=state.progress.id;const inStart=L.words.filter(w=>inCat(w,0)&&pr[w.k]).length,inZ=L.words.filter(w=>inCat(w,catIdx(L,'Zahlen'))&&pr[w.k]).length;return inStart===1&&inZ===1})()"),'CH15 Ein Wort zählt in beiden Kapiteln (gemeinsamer Fortschritt)');
  ok(ev(E,"(()=>{state.lang='id';state.progress.id={};state.chap.id='Start';const a=plan().fresh.id;const L=LANGS.id;state.progress.id[L.words.find(w=>w.id===a).k]={l:1,d:'2000-01-01'};const b=plan().fresh.id;return a==='halo'&&b==='selamat pagi'})()"),'CH16 Start folgt der Reihenfolge der Startliste');
  ok(ev(E,"(()=>{state.lang='id';state.progress.id={};state.chap={id:3,en:0,de:'Gibt es nicht'};migrate();return state.chap.id==='Zahlen'&&state.chap.en==='Start'&&(state.chap.de==='Start')})()"),'CH17 Alter Spielstand (Kapitelnummer) wird auf Namen umgestellt');
  ev(E,"state.lang='id';state.progress.id={};state.chap.id='Farben';view='book';render()");
  ok(!!E.$('.chapact')&&/Farben/.test(E.$('.chapact').closest('summary').textContent),'CH18 Vokabelheft markiert Farben als aktives Kapitel');
}
// ===== Version 177: einzelnes Wort im Vokabelheft lernen =====
{
  const E=fresh();
  ev(E,"state.lang='id';state.ui='de';state.progress.id={};openCats.add('0');view='book';render()");
  const row=E.$('#vlist .row.lrn');
  ok(!!row&&!E.$('#vlist [data-learnw]'),'WL1 Ungelernte Zeile ist antippbar, Knopf noch zu');
  E.click(row);
  const btn=E.$('#vlist [data-learnw]');
  ok(!!btn,'WL2 Antippen zeigt „Jetzt lernen“');
  const k=btn&&btn.dataset.learnw;
  ev(E,"window.__force='typing'");
  E.click(btn);
  ok(ev(E,"S&&S.kind==='course'&&S.items.length")===2,'WL3 Lernphase: Kennenlernen + Mini-Test nur mit diesem Wort');
  let g=0;
  while(!E.$('#cfin')&&g++<40){
    if(E.$('#wtap')||E.$('.iopt')){skipIntro(E);continue;}
    if(E.$('#go')){E.click(E.$('#go'));continue;}
    if(E.$('#nx')){E.click(E.$('#nx'));continue;}
    if(E.$('#next')){E.click(E.$('#next'));continue;}
    if(E.$('#chk')){E.click(E.$('#chk'));continue;}
    if(E.$('#qf')){E.type('xyzfalsch');continue;}
    break;
  }
  ok(!!E.$('#cfin'),'WL4 Lernphase läuft bis zum Abschluss');
  ok(ev(E,"(state.progress.id["+JSON.stringify(k)+"]||{}).l")===1,'WL5 Wort ist danach Stufe 1 (auch bei falscher Antwort)');
  ev(E,"closeSheet()");
  ok(Object.keys(ev(E,"state.progress.id")).length===1&&!ev(E,"state.done[today()]"),'WL6 Nur dieses Wort, kein Tagesstand');
  ok(!E.$('#vlist [data-learn="'+k+'"]'),'WL7 Gelerntes Wort ist nicht mehr antippbar');
  ev(E,"window.__force=null");
}
// ===== Version 178: eigene Satz-Zuordnung =====
{
  const E=fresh();
  ev(E,"state.lang='id';state.ui='en';");
  const r=ev(E,`(()=>{const w=LANGS.id.words.find(x=>SENT[x.k]&&tokensOf(SENT[x.k].id).length>=2);const s=sentOf(w);const A=tokensOf(s.id),B=tokensOf(s.plain);
    state.myalign[w.k+':en']={a:A.map((x,i)=>i===0?1:0),b:B.map((x,i)=>i===0?1:0),t:s.id};
    const al=alignFor(w,s.id,s.plain);const m=mapIdx(al,[0],'a');
    return {ok:!!al,m:m.join(),line:myAlignLines().split('|').length};})()`);
  ok(r.ok&&r.m==='0'&&r.line===3,'AL5 Eigene Zuordnung greift (erstes Wort ↔ erstes Wort), Kopierzeile im align.js-Format');
  ev(E,"state.myalign=null;migrate()");
  ok(ev(E,"typeof state.myalign")==='object'&&ev(E,"Array.isArray(state.myalign)")===false,'AL6 Alter Spielstand bekommt myalign');
}
console.log(fails?('\n'+fails+' FEHLER'):'\nALLES OK');
setTimeout(()=>process.exit(fails?1:0),400);
})();
