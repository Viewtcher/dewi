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
      if(E.$('#wtap')){E.stats.intro++;E.click(E.$('#wtap'));continue;}
      if(E.$('.iopt')){const en=E.$$('.iopt').filter(x=>!x.disabled);const pick=en.find(b=>b.dataset.r==='1');if(pick){E.click(pick);continue;}}
      if(E.$('#go')){E.stats.intro++;E.click(E.$('#go'));continue;}
      if(E.$('#endnext')){E.click(E.$('#endnext'));continue;}
      if(E.$('#next')){E.click(E.$('#next'));continue;}
      if(E.$('#nx')){E.gapSeen=false;E.click(E.$('#nx'));continue;}
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
const reelWords=E=>ev(E,"LANGS.id.words.filter(w=>MOD.reels.can(w)).map(w=>w.k)");
function knownReels(E,n){
  const ks=reelWords(E).slice(0,n);
  ev(E,`(()=>{state.progress.id=state.progress.id||{};${JSON.stringify(ks)}.forEach(k=>{state.progress.id[k]={l:1,d:'2000-01-01'}});save();render();})()`);
  return ks;
}
const RL=E=>ev(E,'S.cur.rl');
// aktive (linkeste offene) Walze auf Wortindex k stoppen; k=null: richtiges Wort; Hebel wird bei Bedarf gezogen
function act(E,k){
  ev(E,`(()=>{const R=S.cur.rl;if(R.state==='idle')R.pull();const r=R.reels.find(x=>x.st!=='ok');r.p=${k===null?'r.right':k};r.v=0;R.stopNext();R.frame(1);})()`);
}
const tapCab=E=>E.$('#cab').dispatchEvent(new E.w.Event('pointerdown',{bubbles:true,cancelable:true}));
const states=E=>ev(E,'S.cur.rl.reels.map(r=>r.st).join()');
function toReels(E,force=true){
  if(force)ev(E,"window.__force='reels'");
  E.click(E.$('#start'));
  let g=0;while(!E.$('#cab')&&g++<30){if(E.$('#wtap')||E.$('.iopt')){skipIntro(E);continue;}if(E.$('#go')){E.click(E.$('#go'));continue;}if(E.$('#nx')){E.click(E.$('#nx'));continue;}if(E.$('#next')){E.click(E.$('#next'));continue;}if(E.$('#qf')){E.type('x');continue;}if(E.$('#chk')){E.click(E.$('#chk'));continue;}break;}
}
(async()=>{
{
  const E=fresh();
  const ks=reelWords(E);
  ok(ks.length>20,'R1 Viele Wörter mit Satz ab 3 Wörtern ('+ks.length+')');
  ok(ev(E,"LANGS.id.words.some(w=>!MOD.reels.can(w))&&MOD.reels.fallback==='choice'"),'R2 Wörter ohne langen Satz fallen zurück');
  ok(ev(E,"(()=>{let bad=0;LANGS.id.words.filter(x=>MOD.reels.can(x)).forEach(w=>{for(let i=0;i<4;i++){const D=reelsData(w);if(!D||D.reels.length!==3||D.reels.some((r,j)=>r.words.length!==3||r.words[r.right]!==D.right[j]||new Set(r.words.map(normId)).size!==3))bad++;}});return bad;})()")===0,'R3 Jede Walze: genau 3 Wörter, richtiges enthalten, keine Dopplungen');
  ok(ev(E,"MODULES.filter(m=>m.solo).some(m=>m.id==='reels')"),'R5 Solo-Kachel vorhanden');
}
// --- Survival Solo: Ablauf Hebel / langsam / links nach rechts
{
  const E=fresh();knownReels(E,8);
  ev(E,'state.done[today()]=true;save();render()');
  E.w.navigator.vibrate=function(p){(E.vib=E.vib||[]).push(p);return true;};
  E.click(E.$('#gm'));E.click(E.$('#surv'));
  ok(!!E.$('[data-playmode="reels"]'),'S1 Playmode Reels als Solo-Kachel');
  E.click(E.$('[data-playmode="reels"]'));
  ok(!!E.$('#cab')&&E.$$('.reel').length===3&&/Reels/.test(E.$('.kicker').textContent),'S2 Automat mit 3 Walzen');
  ok(!!E.$('#rlm .dw.m-cash'),'S3 Dewi mit Dollar-Augen unter dem Automat');
  ok(ev(E,'QUIPS.de.reels_ready').includes(E.$('#rlm .bubble').getAttribute('aria-label')),'S4 Spruch „bereit“');
  ok(states(E)==='fast,fast,fast'&&ev(E,'S.cur.rl.reels.every(r=>r.v>=8)'),'S5 Alle drei rasen von Anfang an');
  E.w.__run('S.cur.rl.frame(.3)');
  ok(ev(E,'S.cur.rl.reels.every(r=>r.p!==undefined)')&&E.$$('.reel.blur').length===3,'S5b Walzen verschwommen beim Rasen');
  tapCab(E);ok(states(E)==='fast,fast,fast','S6 Vor dem Hebel bewirkt Tippen nichts');
  ev(E,'S.cur.rl.pull()');
  ok(states(E)==='slow,fast,fast','S7 Hebel macht nur die linke Walze langsam');
  ev(E,'S.cur.rl.frame(1.5)');
  ok(ev(E,'S.cur.rl.reels[0].v')<3.2&&ev(E,'S.cur.rl.reels[1].v')>8,'S8 Links langsam (<3,2), Rest bleibt schnell');
  ok(E.$$('.reel')[0].classList.contains('act')&&!E.$$('.reel')[0].classList.contains('blur')&&E.$('#cab').dataset.st==='spin','S8b Aktive Walze markiert und scharf');
  ok((E.vib||[]).length>0,'S9 Haptik beim Hebel');
  act(E,null);
  ok(states(E)==='ok,slow,fast'&&E.$$('.reel')[0].classList.contains('ok'),'S11 Richtig: Walze 1 grün, Walze 2 wird automatisch langsam');
  ok(ev(E,'QUIPS.de.reels_ok').includes(E.$('#rlm .bubble').getAttribute('aria-label')),'S12 Spruch wechselt');
  act(E,null);ok(states(E)==='ok,ok,slow','S13 Dann Walze 3');
  act(E,null);
  ok(ev(E,'S.cur.rl.state')==='over'&&E.$('#cab').dataset.st==='jack'&&E.$('#sign').textContent==='JACKPOT','S14 Alles beim ersten Stopp: Jackpot');
  ok(E.$$('.reel.gold').length===3,'S15 Walzen golden');
  ok(!!E.$('.rl-swipe')&&!E.$('#nx')&&!E.$('.res')&&E.$('#cab').getAttribute('role')==='button','S15b Nach dem Ende: Wisch-Hinweis, noch kein Weiter-Knopf');
  ok(E.$('.smain.rl').dataset.end==='win'&&E.$('.smain.rl').dataset.lk==='3','S15c Zustand für die Musik');
  {const pd=new E.w.Event('pointerdown',{bubbles:true,cancelable:true});pd.clientX=200;E.$('#cab').dispatchEvent(pd);const pm=new E.w.Event('pointermove',{bubbles:true});pm.clientX=0;E.$('#cab').dispatchEvent(pm);E.$('#cab').dispatchEvent(new E.w.Event('pointerup',{bubbles:true}));}
  ok(!E.$('.res'),'S15d Zu früh gewischt (Sperre nach dem Ende) ignoriert');
  ev(E,'S.cur.rl.tossAt=0');
  {const pd=new E.w.Event('pointerdown',{bubbles:true,cancelable:true});pd.clientX=200;E.$('#cab').dispatchEvent(pd);const pm=new E.w.Event('pointermove',{bubbles:true});pm.clientX=100;E.$('#cab').dispatchEvent(pm);E.$('#cab').dispatchEvent(new E.w.Event('pointerup',{bubbles:true}));}
  ok(!E.$('.res')&&E.$('#cab').style.display!=='none','S15e Zu kurz gewischt: Automat federt zurück');
  {const pd=new E.w.Event('pointerdown',{bubbles:true,cancelable:true});pd.clientX=300;E.$('#cab').dispatchEvent(pd);const pm=new E.w.Event('pointermove',{bubbles:true});pm.clientX=100;E.$('#cab').dispatchEvent(pm);E.$('#cab').dispatchEvent(new E.w.Event('pointerup',{bubbles:true}));}
  ok(/translate\(-150%/.test(E.$('#cab').style.transform),'S15f Nach links gewischt: Automat fliegt weg');
  await sleep(600);
  ok(E.$('#cab').style.display==='none'&&!!E.$('#nx')&&!!E.$('.res.good')&&!E.$('.rl-swipe')&&E.$('.smain.rl').classList.contains('done'),'S15g Danach Ergebnis und Weiter-Knopf, Hinweis weg');
  ok(ev(E,'QUIPS.de.reels_toss').includes(E.$('#rlm .bubble').getAttribute('aria-label')),'S15h Spruch zum Wurf');
  ok(!!E.$('.res.good')&&E.$('.res').getAttribute('data-snd')==='1','S16 Ergebnis richtig, kein doppelter Auto-Sound');
  ok(!!E.d.querySelector('.drain')&&E.d.querySelectorAll('.drain i').length>=40,'S16b Diamantenregen');
  ok(ev(E,'QUIPS.de.reels_jackpot').length>=2,'S17 Jackpot-Sprüche vorhanden');
  ok(ev(E,'S.score')===ev(E,'survPoints("reels",1,true)')&&ev(E,'S.right')===1,'S18 Jackpot ändert nichts am Score');
  ok(E.vib.some(p=>Array.isArray(p)&&p.length>=5),'S19 Haptik-Salve beim Jackpot');
  E.click(E.$('#nx'));
  ok(!!E.$('#cab'),'S20 Nächste Karte wieder Reels (Solo)');
  act(E,'(r.right+1)%3');ev(E,'S.cur.rl.toss(true)');
  ok(ev(E,'S.cur.rl.state')==='over'&&!!E.$('.res.bad')&&ev(E,'S.lives')===2,'S21 Survival: erster Fehler verliert das Modul und ein Leben');
  ok(!E.$('.pay')&&!E.$('.arr'),'S21b Keine rote Linie mehr');
  ok(E.$$('.reel.rev').length>=2&&E.$('#cab').dataset.st==='lose','S22 Lösung wird auf den Walzen gezeigt');
  ok(ev(E,'QUIPS.de.reels_lose').length>=2&&ev(E,'QUIPS.en.reels_toss').length>=2,'S23 Verlierer- und Wurf-Sprüche (de/en)');
}
// --- Fehler: grau, rütteln, nochmal; Reihenfolge links nach rechts
{
  const E=fresh();knownReels(E,8);
  toReels(E);
  ok(!!E.$('#cab'),'D1 Reels erscheinen in der Daily Round');
  ev(E,'S.cur.rl.pull()');
  act(E,'(r.right+1)%3');
  ok(ev(E,'S.cur.rl.miss')===1&&ev(E,'S.cur.rl.state')==='spin'&&states(E)==='no,fast,fast','D2 Fehler: Walze 1 grau und rüttelt, Rest unverändert');
  ok(E.$$('.reel')[0].classList.contains('no'),'D2b Klasse „no“ (grau)');
  tapCab(E);ok(states(E)==='no,fast,fast','D2c Tippen während des Rüttelns ignoriert');
  ok(ev(E,'QUIPS.de.reels_bad').includes(E.$('#rlm .bubble').getAttribute('aria-label')),'D3 Fehler-Spruch');
  ev(E,'S.cur.rl.frame(.7)');
  ok(states(E)==='slow,fast,fast'&&!E.$$('.reel')[0].classList.contains('no'),'D4 Danach ist Walze 1 wieder die aktive langsame');
  act(E,null);act(E,null);act(E,null);ev(E,'S.cur.rl.toss(true)');
  ok(E.$('#cab').dataset.st==='win'&&!!E.$('.res.good')&&ev(E,'S.cur.ok')===true,'D5 Gewonnen, aber kein Jackpot');
  ok(!E.$$('.reel.gold').length,'D6 Keine goldenen Walzen ohne Jackpot');
  ok(E.d.querySelectorAll('.drain i').length>=20,'D6b Diamantenregen auch ohne Jackpot');
}
{
  const E=fresh();knownReels(E,8);toReels(E);
  ev(E,'S.cur.rl.pull()');
  act(E,'(r.right+1)%3');ev(E,'S.cur.rl.frame(.7)');
  act(E,'(r.right+2)%3');ev(E,'S.cur.rl.toss(true)');
  ok(ev(E,'S.cur.rl.state')==='over'&&!!E.$('.res.bad')&&ev(E,'S.cur.ok')===false,'D7 Zweiter Fehler: Modul verloren');
  ok(ev(E,'S.wrong')>=1,'D8 Als Fehler gezählt');
  ok(/fällt auf Stufe 0 und kommt morgen wieder/.test(E.$('.smain').textContent)&&!/Fehlerliste/.test(E.$('.smain').textContent),'D9 Wort fällt auf Stufe 0 und kommt morgen wieder, ohne Fehlerliste');
}
// --- Reduzierte Bewegung: Liste
{
  const E=fresh();knownReels(E,8);
  ev(E,'state.done[today()]=true;save();render()');
  E.w.matchMedia=()=>({matches:true,addEventListener(){},addListener(){}});
  E.click(E.$('#gm'));E.click(E.$('#surv'));E.click(E.$('[data-playmode="reels"]'));
  ok(E.$$('.rl-pick').length===3&&!E.$('#cab'),'L1 Bei reduzierter Bewegung eine Auswahlliste statt Automat');
  ev(E,"(()=>{const R=S.cur.rl;R.reels.forEach((r,i)=>{document.querySelectorAll('.rl-pick')[i].querySelectorAll('.opt')[r.right].click();});})()");
  ok(!!E.$('.res.good')&&ev(E,'S.cur.rl.state')==='over','L2 Liste: alle richtig gewinnt');
}
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
  ok(E.$('#mvol').disabled===true,'H14 Regler ist bei ausgeschalteter Musik inaktiv');
  E.click(E.$('[data-mus="true"]'));
  ok(E.$('#mvol').disabled===false,'H15 Regler wird mit der Musik aktiv');
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
  E.click(E.$('[data-v="settings"]'));E.click(E.$('[data-mus="true"]'));
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
  // Reels: Synthwave
  knownReels(E,8);ev(E,'state.done[today()]=true;save();render()');
  E.click(E.$('#gm'));E.click(E.$('#surv'));E.click(E.$('[data-playmode="reels"]'));
  ok(!!E.$('.sin .musbtn'),'M10 Lautsprecher auch im Modul');
  ev(E,'musTick()');ok(ev(E,'MUS.mode')==='synth','M11 In Reels spielt der Synthwave-Soundtrack');
  E.click(E.$('#quit'));ev(E,'musTick()');ok(ev(E,'MUS.mode')==='lofi','M12 Zurück in der App wieder Lo-Fi');
  E.click(E.$('[data-v="settings"]'));
  ok(!!E.$('[data-mus="true"]')&&!!E.$('#mvol'),'M13 Einstellungen: Musik An/Aus und Lautstärke');
  E.click(E.$('[data-mus="false"]'));ok(ev(E,'state.music')===false,'M14 Aus in den Einstellungen');
  ev(E,'musTick()');ok(ev(E,'MUS.mode')===null,'M15 Musik stoppt');
}
// --- Hilfe-Fragezeichen
{
  const E=fresh();knownReels(E,8);
  ev(E,"window.__helpAuto=true");
  for(const id of ['blocks','typing','swipe','gap','choice','reels']){
    const F=fresh();knownReels(F,id==='blocks'?300:8);
    ev(F,`window.__force='${id}'`);
    F.click(F.$('#start'));
    let g=0;while(!F.$('.qh')&&g++<40){if(F.$('#wtap')||F.$('.iopt')){skipIntro(F);continue;}if(F.$('#go')){F.click(F.$('#go'));continue;}if(F.$('#nx')){F.click(F.$('#nx'));continue;}if(F.$('#endnext')){F.click(F.$('#endnext'));continue;}if(F.$('#next')){F.click(F.$('#next'));continue;}if(F.$('#qf')){F.type('x');continue;}if(F.$('#chk')){F.click(F.$('#chk'));continue;}break;}
    const b=F.$('.qh');
    ok(!!b&&b.dataset.help===id&&b.textContent==='?','H1 '+id+': Fragezeichen an der Aufgabe');
    ok(!F.$$('.hint').some(h=>/Setze|Wische die Karte|Was bedeutet|Die Walzen rasen/.test(h.textContent)),'H2 '+id+': keine Beschreibung mehr im Modul');
    const pre=id==='reels'?F.$('#rlm .bubble'):F.$('.helpm .bubble');
    ok(!!pre&&!F.$('.helpm .dw.m-sigh'),'H3a '+id+': Dewi ist von Anfang an da und hat einen Spruch');
    F.click(b);
    const bub=id==='reels'?F.$('#rlm .bubble'):F.$('.helpm .bubble');
    const box=id==='reels'?F.$('#rlm'):F.$('.helpm');
    const txt=bub.getAttribute('aria-label'),d=ev(F,`MOD.${id}.desc()`);
    ok(!!bub&&!F.$('.helppop')&&!F.$('.helpbg')&&!!box.querySelector('.dw.m-sigh'),'H3 '+id+': Dewi seufzt in der normalen Sprechblase');
    ok(txt.includes(d)&&/seufz/.test(txt)&&!/Fragezeichen/.test(txt),'H4 '+id+': Kurzbeschreibung + Seufzer, ohne Fragezeichen-Hinweis');
    F.click(b);
    ok(!!(id==='reels'?F.$('#rlm .bubble'):F.$('.helpm .bubble')),'H5 '+id+': Dewi bleibt nach erneutem Tippen');
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
  for(const pm of ['blocks','gap','choice','reels']){
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
  }else ok(false,'P3 kein Beispiel mit geschenktem Wort gefunden');
}
// --- Reels: nur mit bekannten Wörtern
{
  const E=fresh();ev(E,'window.__rlAll=false');
  // Ohne Gelerntes darf Reels nur dort möglich sein, wo der Satz ausschließlich aus dem Zielwort selbst (und Namen) besteht
  const bad0=ev(E,`(()=>{const L=curLang();state.progress.id={};return L.words.filter(w=>MOD.reels.can(w)).filter(w=>{const s=sentOf(w);const own=new Set(tokensOf(w.id).map(normId));return !tokensOf(s.id).every(tk=>own.has(normId(tk))||isName(tk));}).length;})()`);
  ok(bad0===0,'R1 Ohne gelernte Wörter keine Reels mit fremden Wörtern ('+bad0+')');
  const bad1=ev(E,`(()=>{const L=curLang();state.progress.id={};const w=L.words.find(x=>x.id==='selamat pagi');state.progress.id[w.k]={l:1,d:'2999-01-01'};
    return L.words.filter(x=>MOD.reels.can(x)).filter(x=>{const s=sentOf(x);const kn=knownTokens(x);return !tokensOf(s.id).every(tk=>kn.has(normId(tk))||isName(tk));}).length;})()`);
  ok(bad1===0,'R2 Ein einzelnes gelerntes Wort schaltet keine Sätze mit Unbekanntem frei ('+bad1+')');
  // 3 Wörter, die zusammen im Satz stehen: Reels wird möglich
  const r=ev(E,`(()=>{const L=curLang();state.progress.id={};
    const s=Object.keys(SENT).map(k=>({k,s:SENT[k]})).find(x=>tokensOf(x.s.id).length===3&&tokensOf(x.s.id).every(tk=>L.words.some(w=>w.id.split(' ').length===1&&normId(w.id)===normId(tk)))&&L.words.some(w=>w.k===x.k));
    if(!s)return {skip:true};
    tokensOf(s.s.id).forEach(tk=>{const w=L.words.find(w=>w.id.split(' ').length===1&&normId(w.id)===normId(tk));state.progress.id[w.k]={l:1,d:'2999-01-01'};});
    const w0=L.words.find(w=>w.k===s.k),D=reelsData(w0);
    return {id:s.s.id,can:MOD.reels.can(w0),given:D?D.reels.filter(x=>x.given).length:-1};})()`);
  ok(r.skip||(r.can===true&&r.given===0),'R3 Satz mit 3 gelernten Wörtern: Reels möglich, nichts vorgesetzt ('+JSON.stringify(r)+')');
  // Stichprobe: nie eine Walze mit unbekanntem Wort, nie vorgesetzt
  const E2=fresh();ev(E2,'window.__rlAll=false');knownReels(E2,300);
  const q=ev(E2,`(()=>{const L=curLang();let n=0,bad=0,given=0;
    for(const w of L.words){for(let k=0;k<3;k++){const D=reelsData(w);if(!D)continue;n++;const kn=knownTokens(w);
      if(D.reels.some(x=>x.given))given++;
      if(D.dir==='gl2id')D.reels.forEach((x,i)=>{if(!isName(D.right[i])&&!kn.has(normId(D.right[i])))bad++;});}}
    return {n,bad,given};})()`);
  ok(q.bad===0&&q.given===0,'R4 Nie ein unbekanntes Wort auf einer Walze, nie eine vorgesetzte Walze ('+q.n+' Durchläufe)');
  // Solo-Kachel gesperrt, solange nichts passt
  const F=fresh();ev(F,'window.__rlAll=false');ev(F,"state.progress.id={};save();render()");
  const w0=ev(F,`(()=>{const L=curLang();state.progress.id={};L.words.slice(0,3).forEach(w=>{state.progress.id[w.k]={l:1,d:'2999-01-01'}});save();render();state.done[today()]=true;save();render();return 1;})()`);
  F.click(F.$('#gm'));F.click(F.$('#surv'));
  const bt=F.$('[data-playmode="reels"]');
  ok(!!bt&&bt.disabled&&/Noch zu wenige/.test(bt.textContent),'R5 Reels-Solo bleibt gesperrt, bis genug passende Wörter gelernt sind');
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
  const F=fresh();knownReels(F,300);toReels(F);
  ok(!!F.$('#cab')&&!F.$('.rl-ctx'),'K3 Reels: kein grauer Rest des Satzes mehr');
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
{
  const E=fresh();
  ev(E,"state.lang='id';state.name='Vito';state.nameAsked=true;state.progress.id={};state.progress.id[LANGS.id.words[0].k]={l:2,d:today()};save()");
  ev(E,"view='settings';render()");
  ok(!ev(E,"!!document.querySelector('#devcard')"),'V1 Testbereich anfangs versteckt');
  for(let i=0;i<7;i++)ev(E,"document.querySelector('#sethead').click()");
  ok(ev(E,"!!document.querySelector('#devcard')"),'V2 nach 7 Tipps sichtbar');
  const tw=sel=>{ev(E,"document.querySelector('"+sel+"').click()");ev(E,"document.querySelector('"+sel+"').click()");};
  const N=ev(E,"LANGS.id.words.length");
  tw('[data-dev=p10]');
  ok(ev(E,"Object.keys(state.progress.id).length")===Math.round(N*.1),'V3 10 % = '+Math.round(N*.1));
  ok(ev(E,"fallenWords().length")>0&&ev(E,"fallenWords().length")<=3&&ev(E,"fallenWords().every(w=>state.progress.id[w.k].d<=today()&&state.progress.id[w.k].n>=1)")&&ev(E,"JSON.stringify(state.list)")==='{}','V4 Einige Wörter auf Stufe 0, fällig, mit Fehlerzähler');
  ok(ev(E,"new Set(Object.values(state.progress.id).map(p=>p.l)).size")>=4,'V5 gemischte Stufen');
  ok(ev(E,"state.name")==='Vito','V6 Name bleibt');
  ev(E,"view='settings';render()");tw('[data-dev=all]');
  ok(ev(E,"Object.keys(state.progress.id).length")===N,'V7 alle Wörter');
  ev(E,"view='settings';render()");tw('[data-dev=first]');
  ok(ev(E,"state.lang")===null&&ev(E,"state.name")==='','V8 Erster Start leer');
  ev(E,"state.lang='id';state.ui='de';state.nameAsked=true;view='settings';render()");tw('#devrestore');
  ok(ev(E,"Object.keys(state.progress.id).length")===1&&ev(E,"state.name")==='Vito'&&!ev(E,"state.devTest"),'V9 Wiederherstellen = echter Stand');
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
  ev(E,"state.chips=10000;state.chipShown=10000;state.shields=0;state.owned=[];state.equip={};save();render()");
  const cards=E.$$('#app .gmcard');
  ok(cards.length===1&&!!cards[0].querySelector('#gm')&&!E.$('.shopcard')&&!!E.$('.bookcard'),'SP1 Hauptmenü: nur Gamemodes als Kachel, kein Shop-Kachel mehr (Version 140)');
  E.click(E.$('#chippill'));ok(!!E.$('#shop.sin.shop'),'SP2 Chip-Pille öffnet den Shop');
  ok(E.$$('.shit').length===4&&/FELL/.test(E.$('.shlist').textContent)&&/KOPF/.test(E.$('.shlist').textContent)&&E.$('#shact').getAttribute('aria-disabled')==='true','SP3 Cosmetics: Fell und Kopf, Aktion erst nach Antippen');
  E.click(E.$('[data-shop="fur:mitternacht"]'));
  ok(/Kaufen · 6\.000/.test(E.$('#shact').textContent)&&E.$('.shdewi').innerHTML.includes('#5b4bb0')&&/Anprobe/.test(E.$('.shinfo').textContent),'SP4 Anprobe: Dewi trägt Mitternacht, Kaufen 6.000');
  E.click(E.$('#shact'));
  ok(ev(E,'state.chips')===4000&&ev(E,"state.owned.indexOf('fur:mitternacht')>=0")&&ev(E,'state.equip.fur')==='mitternacht'&&/Ausgerüstet/.test(E.$('#shact').textContent),'SP5 Gekauft und ausgerüstet, 6.000 abgezogen');
  E.click(E.$('[data-shop="head:schleife"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.chips')===1500&&ev(E,'state.equip.head')==='schleife'&&E.$('.shdewi').innerHTML.includes('translate(132 40) rotate(18)'),'SP6 Schleife gekauft (2.500) und auf dem Kopf');
  E.click(E.$('[data-shop="fur:classic"]'));
  ok(/Ausrüsten/.test(E.$('#shact').textContent),'SP7 Gratis-Fell: Ausrüsten');
  E.click(E.$('#shact'));ok(ev(E,'state.equip.fur')==='classic','SP7b Zurück auf Classic');
  E.click(E.$('.shtab[data-tab="ext"]'));E.click(E.$('[data-shop="theme:neon"]'));
  ok(E.d.documentElement.dataset.theme==='neon'&&/Noch 4\.500 Chips/.test(E.$('#shact').textContent)&&E.$('#shact').getAttribute('aria-disabled')==='true','SP8 Theme als Vorschau, zu wenig Chips');
  E.click(E.$('#shmine'));ok(!E.$('[data-shop="theme:neon"]')&&!!E.$('[data-shop="theme:classic"]'),'SP9 „Nur meine“ zeigt nur Gekauftes');
  E.click(E.$('#shmine'));
  E.click(E.$('.shtab[data-tab="con"]'));E.click(E.$('[data-shop="shield"]'));E.click(E.$('#shact'));
  ok(ev(E,'state.shields')===1&&ev(E,'state.chips')===500&&/Vorrat 1\/2/.test(E.$('.shlist').textContent),'SP10 Streak-Schutz gekauft (1.000), Vorrat 1/2');
  E.click(E.$('#quit'));
  ok(!E.d.documentElement.dataset.theme&&!E.$('#shop')&&E.$('#app .mascot .dw').outerHTML.includes('translate(132 40)'),'SP11 Schließen: Theme-Vorschau weg, Dewi trägt die Schleife auch auf dem Startscreen');
  ok(ev(E,"Object.keys(DWM).every(m=>dwSvg(m).includes('translate(132 40) rotate(18)'))")&&ev(E,"Object.keys(DWM).every(m=>{const s=dwSvg(m),r=s.indexOf('rotate('),i=s.indexOf('translate(132 40)');return r>=0&&i>r;})"),'SP12 Schleife in allen Stimmungen in der gedrehten Kopf-Gruppe');
  ok(!ev(E,"dwSvg('haughty',DW_PLAIN)").includes('translate(132 40)')&&!ev(E,"stampSvg0('sly',0)").includes('#ff4f6d'),'SP13 Stempel zeigen Dewi im Original');
  ev(E,"state.chips=7000;state.equip.theme='classic';save()");E.click(E.$('#chippill'));E.click(E.$('.shtab[data-tab="ext"]'));E.click(E.$('[data-shop="theme:neon"]'));E.click(E.$('#shact'));E.click(E.$('#quit'));
  ok(E.d.documentElement.dataset.theme==='neon'&&ev(E,'state.equip.theme')==='neon','SP14 Gekauftes Theme bleibt nach dem Schließen');
  const B=JSON.parse(ev(E,'JSON.stringify(backupData())'));
  ok(B.owned.length===3&&B.equip.theme==='neon'&&B.shields===1,'SP15 Sicherung enthält Käufe und Auswahl');
}
// --- Startscreen ohne Tab-Leiste (Version 139)
{
  const E=fresh();ev(E,'render()');
  ok(!E.$('#tabs')&&!E.$('.stpill')&&!!E.$('.status #chippill')&&!!E.$('.status #gear'),'NV1 Keine Tab-Leiste, keine Streak-Pille, oben Chips und Zahnrad');
  ok(!E.$('.plan .dstack'),'NV2 Daily Round ohne Chip-Stapel (Version 141, zu unruhig)');
  ok(!!E.$('.bookcard.card.prog')&&!!E.$('.bookcard .stack')&&!E.$('.bookcard .legend')&&!!E.$('.bookcard .bookgo'),'NV3 Vokabelheft-Kachel wie die alte Fortschritt-Karte, mit Pfeil wie Gamemodes');
  E.click(E.$('#gear'));
  ok(!!E.$('#sethead')&&!!E.$('.backbtn[data-v="home"]'),'NV4 Zahnrad öffnet die Einstellungen mit Zurück-Pfeil');
  E.click(E.$('.backbtn'));
  ok(!!E.$('.plan')&&!!E.$('#gear'),'NV5 Zurück führt auf den Startscreen');
  E.click(E.$('#bookbtn'));
  ok(!!E.$('#q')&&!!E.$('.bookprog .stack')&&!!E.$('.bookprog .legend'),'NV6 Vokabelheft-Kachel öffnet das Heft, Fortschritt steht dort oben');
  E.click(E.$('.backbtn'));
  ok(!!E.$('.plan'),'NV7 Zurück aus dem Vokabelheft');
}
console.log(fails?('\n'+fails+' FEHLER'):'\nALLES OK');
setTimeout(()=>process.exit(fails?1:0),400);
})();
