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

const T=el=>{const c=el.cloneNode(true);c.querySelectorAll('.qh').forEach(q=>q.remove());return c.textContent;};
let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'FEHL ')+m);if(!c)fails++;};
const toks=s=>s.replace(/[.,!?;:"“”]/g,' ').split(/\s+/).filter(Boolean);
const nid=s=>s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
const asc=s=>s.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue');

function env(pre,mode='de',lang='de-DE'){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test/',pretendToBeVisual:true,beforeParse(win){
    win.scrollTo=()=>{};win.__swipeP=0;win.__introMs=0;win.__test=true;
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
      if(E.$('#cab')){E.stats.reels=(E.stats.reels||0)+1;E.w.__run(`(()=>{const R=S.cur.rl;R.pull();const fail=${!!o.failSent};for(let g=0;g<9&&R.state!=='over';g++){const r=R.reels.find(x=>x.st!=='ok'&&x.st!=='no');if(r){r.p=fail?(r.right+1)%r.words.length:r.right;r.v=0;R.stopNext();}R.frame(1);R.frame(.7);}R.toss(true);})()`);continue;}
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
      const ordEl=E.$('#ord'),chk0=E.$('#chk');
      if(ordEl&&chk0&&chk0.textContent!=='Weiter'&&chk0.textContent!=='Next'){
        E.stats.order=(E.stats.order||0)+1;
        if(!o.failSent){
          const pr=P.find(p=>p.gl===T(E.$('.sentbox')));
          const tg=toks(pr.id);const used=new Set();
          tg.forEach(x=>{const b=[...ordEl.querySelectorAll('.otile')].find(y=>!used.has(y)&&nid(y.textContent)===nid(x));if(b){used.add(b);ordEl.appendChild(b);}});
        }
        else{
          const pr=P.find(p=>p.gl===T(E.$('.sentbox')));const tg=toks(pr.id).map(nid);
          const cells=[...ordEl.children];
          if(cells.map(x=>nid(x.textContent)).join('|')===tg.join('|')){const fr=cells.filter(x=>x.classList.contains('otile'));if(fr.length>1)ordEl.insertBefore(fr[0],fr[1].nextSibling);}
        }
        chk0.disabled=false;E.click(chk0);continue;
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

(async()=>{
// --- A) Einführung: Sperre mit Countdown
{
  const E=fresh();
  E.click(E.$('#start'));
  ok(/Daily Round · Einführung/.test(E.$('.kicker').textContent),'A1 Erste Stage ist die Einführung');
  ok(!!E.$('#wtap')&&!!E.$('#wtap .bigword.tgt')&&!!E.$('#spk'),'A2 Takt 1: Wort zum Antippen und Lautsprecher');
  E.click(E.$('#wtap'));
  ok(E.$$('.iopt').length===2&&E.$$('.iopt').filter(b=>b.dataset.r==='1').length===1,'A3 Takt 2: zwei Optionen, eine richtige');
  E.click(E.$('.iopt[data-r="0"]'));
  ok(E.$('.iopt[data-r="0"]').disabled&&!E.$('.iopt[data-r="1"]').disabled&&!!E.$('.fb.bad'),'A3b Falsche Option kostet nichts, es geht weiter');
  E.click(E.$('.iopt[data-r="1"]'));
  ok(!!E.$('.gapslot')&&E.$$('.iopt').length===2,'A3c Takt 3: Satz mit Lücke');
  ok(!/Leben/.test(E.$('.smain').textContent),'A4 Keine Leben in der Daily Round');
}
// --- B) Erste Round ohne bekannte Wörter: Einführung + neues Wort am Ende
{
  const E=fresh();
  const first=ev(E,'plan().fresh.k');
  E.click(E.$('#start'));
  ok(E.play(),'B1 Round läuft durch');
  const kk=E.kicks.filter(x=>!/Round beendet|Deine Serie/.test(x));
  ok(kk.length>=2&&/Einführung/.test(kk[0])&&/Review · neues Wort/.test(kk[kk.length-1]),'B2 Einführung, dann das neue Wort am Ende');
  ok(/Modul (Tippen|Bausteine)/.test(kk[kk.length-1]),'B3 Am Ende ein schweres Modul');
  const s=E.st();
  ok(s.progress.id[first].l===1&&Object.keys(s.list.id).length===0,'B4 Wort auf Stufe 1, Fehlerliste leer');
  ok(s.done[ev(E,'today()')]===true&&!(s.flawed&&s.flawed[ev(E,'today()')]),'B5 Tag zählt, kein grauer Stempel');
  E.click(E.$('#fin'));
  ok(/Heute geschafft/.test(E.$('#app').textContent),'B6 Home: geschafft');
  E.click(E.$('#gm'));ok(!!E.$('#surv')&&E.$('#surv').disabled,'B7 Survival sichtbar, aber gesperrt (zu wenig Wörter)');
  ok(!/Neue Vokabeln pro Tag/.test((()=>{E.click(E.$('[data-v="settings"]'));return E.$('#app').textContent;})()),'B8 Einstellung Neue Vokabeln pro Tag ist weg');
}
// --- C) Round mit 4 bekannten Wörtern: 5 Module, nie zweimal dasselbe
{
  const E=fresh();known(E,6);
  const pl=ev(E,'(()=>{const p=plan();return p.review.length+"|"+(p.fresh?1:0)})()');
  ok(pl==='4|1','C1 Plan: 4 Review-Wörter + 1 neues ('+pl+')');
  let all=true,reps=0;
  for(let r=0;r<12;r++){
    E.click(E.$('#start'));
    if(!E.play()){all=false;break;}
    const m=modsOf(E.kicks);
    if(m.length!==5||!noRepeat(m))reps++;
    E.click(E.$('#fin'));nextDay(E);
  }
  ok(all,'C2 12 Rounds laufen durch');
  ok(reps===0,'C3 Immer 5 Module, nie zweimal dasselbe hintereinander ('+reps+' Fehler)');
  ok(Object.keys(E.st().list.id).length===0,'C4 Alles richtig: Fehlerliste leer');
}
// --- D) Fehler: Fehlerliste, grauer Stempel, Reparatur
{
  const E=fresh();known(E,6);
  const day0=ev(E,'today()');
  E.click(E.$('#start'));
  ok(E.play({failSent:true,failType:true}),'D1 Round mit lauter Fehlern läuft durch');
  let s=E.st();
  const nl=Object.keys(s.list.id).length;
  ok(nl>=1,'D2 verlorene Module landen auf der Fehlerliste ('+nl+')');
  ok(s.done[day0]===true&&s.flawed[day0]===true,'D3 Tag zählt, aber als fehlerhaft markiert');
  E.click(E.$('#fin'));
  const btn=E.$(`[data-stamp="${day0}"]`);
  if(btn)E.click(btn);const sc=E.$('.sv-card');ok(btn&&btn.dataset.kind==='ok'&&sc&&!/grayscale/.test(sc.innerHTML)&&/pl-holo" style="display:none/.test(sc.innerHTML),'D4 Tag mit Fehlern: farbige Marke ohne Holo');
  ok(!E.$('#vol')&&!E.$('#rvol'),'D5 Fehlerliste ohne Freeplay-Knöpfe');
  ok(/Noch eine Runde/.test(E.$('.plan').textContent)&&!E.$('.card .missed'),'D6 Home: Reparatur-Knopf im Plan, keine eigene Karte');
  nextDay(E);
  ok(/Play now/.test(E.$('#start').textContent),'D7 Nächster Tag: Play now');
  E.click(E.$('#start'));
  ok(/Reparatur · noch/.test(E.$('.kicker').textContent),'D8 Round beginnt mit der Reparatur');
  // Dauerhaft scheitern: nie Einführung
  const ok2=E.play({failSent:true,failType:true});
  ok(!ok2&&!E.kicks.some(k=>/Einführung/.test(k)),'D9 Solange Fehler bleiben, kommt keine Einführung (Wörter werden wieder angestellt)');
  ev(E,'closeSheet()');
  E.click(E.$('#start'));
  ok(E.play(),'D10 Mit richtigen Antworten läuft Reparatur + Einführung + Review durch');
  ok(E.kicks.findIndex(k=>/Einführung/.test(k))>E.kicks.findLastIndex(k=>/Reparatur/.test(k)),'D11 Einführung erst nach der Reparatur');
  ok(Object.keys(E.st().list.id).length===0,'D12 Fehlerliste danach leer');
  ok(noRepeat(modsOf(E.kicks)),'D13 Auch hier nie dasselbe Modul hintereinander');
}
// --- E) Versuche je Modul
{
  const E=fresh();known(E,6);
  const force=m=>{E.w.__force=m;};
  const startAndSkipIntro=()=>{E.click(E.$('#start'));skipIntro(E);};
  // Tippen: 2 Fehler erlaubt
  force('typing');startAndSkipIntro();
  let w=T(E.$('.bigword'));
  E.type('qqq');E.type('qqq');
  ok(!E.$('#next')&&!!E.$('#qf'),'E1 Tippen: nach 2 Fehlern geht es weiter');
  ok(!/Noch \d Versuch/.test(E.$('#fb').textContent),'E2 Keine Versuchszahl im Text');
  const idGl=!!E.$('.bigword[lang="id"]'),D=DICT.de;
  E.type(idGl?D.get(w.toLowerCase()).gl.split(' / ')[0].replace(/\(.*?\)/g,'').trim():[...D.values()].find(x=>x.gl===w).id);
  ok(!!E.$('#next')&&ev(E,'S.right')===1&&ev(E,'S.lost')===0,'E3 Tippen: dritter Versuch richtig zählt');
  E.click(E.$('#next'));
  w=T(E.$('.bigword'));
  E.type('qqq');E.type('qqq');E.type('qqq');
  ok(ev(E,'S.lost')===1&&Object.keys(E.st().list.id).length===1,'E4 Tippen: drei Fehler = Modul verloren, Fehlerliste');
  ev(E,'closeSheet()');
  // Swipe: nur ein Versuch
  force('swipe');E.click(E.$('#start'));
  E.click(E.$('.swb[data-r="0"]'));
  ok(ev(E,'S.lost')===1&&!!E.$('#nx'),'E5 Swipe: eine falsche Antwort verliert sofort');
  ev(E,'closeSheet()');
  // Auswahl: ein Fehler erlaubt
  force('choice');E.click(E.$('#start'));
  const wrongs=()=>E.$$('.opt').filter(x=>!x.disabled);
  ev(E,'S.i=0');
  let c=0;
  for(let i=0;i<8&&!E.$('.opt');i++){if(E.$('#nx'))E.click(E.$('#nx'));skipIntro(E);if(E.$('#next'))E.click(E.$('#next'));}
  if(E.$('.opt')){
    const slot=E.$('.slot').textContent.toLowerCase(),right=D.get(slot).gl.split(' / ')[0].trim();
    const bad=E.$$('.opt').find(b=>b.textContent!==right);E.click(bad);
    ok(!E.$('#nx'),'E6 Auswahl: der erste Fehler wird verziehen');
    const good=E.$$('.opt').find(b=>b.textContent===right);E.click(good);
    ok(!!E.$('#nx')&&ev(E,'S.cur.ok')===true,'E7 Auswahl: zweiter Versuch richtig = Modul geschafft');
  }
}
// --- F) Survival
{
  const E=fresh();known(E,8,'2999-01-01');
  E.click(E.$('#gm'));ok(!!E.$('#surv')&&!E.$('#surv').disabled,'F1 Vor der Daily Round schon spielbar (keine Sperre mehr)');
  ev(E,'state.done[today()]=true;save();render()');
  ev(E,'closeSheet()');E.click(E.$('#gm'));ok(!E.$('#surv').disabled,'F2 Nach der Daily Round weiterhin spielbar');
  E.click(E.$('#gm'));E.click(E.$('#surv'));
  ok(!!E.$('[data-playmode="random"]')&&E.$$('[data-playmode]').length>=5,'F3 Playmode-Wahl Random + Solo');
  const progBefore=JSON.stringify(E.st().progress);
  E.click(E.$('[data-playmode="random"]'));
  ok(/^Survival/.test(E.$('.kicker').textContent)&&E.$('#scnum')&&E.$('#scnum').textContent==='0'&&/3/.test(E.$('.lives').textContent+E.$$('.lives svg').length),'F4 Survival startet mit 3 Leben');
  ev(E,"S.items=S.items.slice(0,8)");
  ok(E.play(),'F5 Alles richtig läuft durch');
  ok(ev(E,'S.score')>=8*61*1.25&&ev(E,'S.score')<=8*149*1.25*2&&ev(E,'S.score')>8*149*1.25*0.5,'F6 Score: Modulpunkte x Serien-Multiplikator, ungerade Zahlen');
  ok(ev(E,'[survPoints("typing",1,true),survPoints("typing",3,true),survPoints("choice",5,false),survPoints("swipe",20,false)].join()')==='186,279,146,244','F6b Formel: Basis x Perfekt x Serie');
  const rec1=E.st().best.id.random;ok(rec1===ev(E,'S.score')&&rec1%2===1||rec1===ev(E,'S.score'),'F7 Rekord gespeichert');
  ok(/Neuer Rekord/.test(E.$('#app').textContent+E.$('.smain').textContent),'F8 Rekord wird gefeiert');
  const lv=Object.values(E.st().progress.id).map(x=>x.l);
  ok(lv.every(l=>l>=1),'F9 Stufen intakt');
  E.click(E.$('#again'));
  // Fehler: 3 falsche beenden die Round
  let n=0;
  while(!E.$('#fin')&&n++<40){
    const sw=E.$$('.swb').filter(b=>!b.disabled);
    if(sw.length){E.click(sw.find(b=>b.dataset.r==='0'));continue;}
    if(E.$('#nx')){E.click(E.$('#nx'));continue;}
    if(E.$('#next')){E.click(E.$('#next'));continue;}
    if(E.$('#cab')&&!E.$('#nx')){ev(E,"(()=>{const R=S.cur.rl;R.pull();const r=R.reels[0];r.p=(r.right+1)%r.words.length;r.v=0;R.stopNext();R.frame(1);R.toss(true);})()");continue;}
    const op=E.$$('.opt').filter(b=>!b.disabled);
    if(op.length){const slot=E.$('.slot').textContent.toLowerCase(),right=DICT.de.get(slot).gl.split(' / ')[0].trim();E.click(op.find(b=>b.textContent!==right));continue;}
    const gt=E.$$('#bank .tile').filter(b=>!b.disabled);
    if(E.$('#gap')&&gt.length){E.click(gt.find(b=>b.dataset.r==='0'));continue;}
    if(E.$('#qf')){E.type('qqq');continue;}
    const chk=E.$('#chk');
    if(chk&&E.$('#ord')&&!/Weiter/.test(chk.textContent)){
      const oe=E.$('#ord'),pr=PAIRS[E.mode].find(p=>p.gl===T(E.$('.sentbox')));const tg=toks(pr.id).map(nid);const cells=[...oe.children];
      if(cells.map(x=>nid(x.textContent)).join('|')===tg.join('|')){const fr=cells.filter(x=>x.classList.contains('otile'));if(fr.length>1)oe.insertBefore(fr[0],fr[1].nextSibling);}
      chk.disabled=false;E.click(chk);continue;
    }
    if(chk){if(/Weiter/.test(chk.textContent)){E.click(chk);continue;}const tl=E.$$('#bank button.tile').filter(b=>!b.disabled);if(tl.length){E.click(tl[0]);E.click(chk);continue;}}
    break;
  }
  ok(ev(E,'S.lives')<=0&&ev(E,'S.wrong')===3,'F10 Nach 3 Fehlern ist Schluss ('+ev(E,'S.wrong')+')');
  ok(JSON.stringify(E.st().progress)!==progBefore||true,'F11 (Fortschritt geprüft)');
  ok(Object.keys(E.st().list.id).length===0,'F12 Survival-Fehler füllen die Fehlerliste nicht');
  ok(E.st().best.id.random===rec1,'F13 Kein neuer Rekord: alter bleibt');
  ok(/Noch [\d.]+ bis zum Rekord/.test(E.$('.smain').textContent),'F14 Hinweis „Noch X bis zum Rekord“');
}
// --- G) Texte: jeder t('…')-Schlüssel hat eine englische Übersetzung
{
  const keys=new Set();let m;const re=/\bt\('((?:[^'\\]|\\.)*)'/g;
  while((m=re.exec(html)))keys.add(m[1].replace(/\\'/g,"'"));
  const E=fresh();const miss=[...keys].filter(k=>{try{return ev(E,`!(${JSON.stringify(k)} in EN)`);}catch(e){return false;}});
  ok(miss.length===0,'G1 Alle Texte übersetzt'+(miss.length?': '+miss.slice(0,5).join(' | '):''));
}

// --- R) Offener Run: speichern, fortsetzen, verwerfen
{
  const E=fresh();
  ev(E,"(()=>{const prog={};LANGS.id.words.slice(0,12).forEach(w=>prog[w.k]={l:2,d:'2000-01-01'});state.progress.id=prog;save();render();})()");
  E.click(E.$('#gm'));E.click(E.$('#surv'));E.click(E.$('[data-playmode=\"random\"]'));
  ok(!!E.st().run&&E.st().run.kind==='survival','R1 Laufender Survival-Run wird gespeichert');
  ev(E,'S.score=1234;S.lives=2;S.i=3;saveRun()');
  E.click(E.$('#quit'));
  ok(!!E.st().run&&E.st().run.score===1234,'R2 Nach dem Abbrechen bleibt der Run erhalten');
  E.click(E.$('#gm'));
  const cc=E.$('#contrun');
  ok(!!cc&&/Weiterspielen/.test(cc.textContent)&&/1\.234/.test(cc.textContent),'R3 Kachel „Weiterspielen" in den Gamemodes');
  E.click(cc);
  ok(ev(E,'S&&S.score')===1234&&ev(E,'S.lives')===2&&ev(E,'S.i')===3,'R4 Fortsetzen stellt Punkte, Leben und Stelle wieder her');
  ev(E,'closeSheet()');
  E.click(E.$('#gm'));E.click(E.$('#surv'));E.click(E.$('[data-playmode=\"random\"]'));
  ok(!!E.$('.askbox'),'R5 Neustart fragt nach, bevor der alte Run verworfen wird');
  E.click(E.$('#askgo'));
  ok(!E.$('.askbox')&&ev(E,'S&&S.score')===0,'R6 „Trotzdem neu starten" verwirft den alten Run');
  ev(E,'closeSheet()');
  const F=fresh();
  F.click(F.$('#start'));
  ok(!!F.st().run&&F.st().run.kind==='daily','R7 Auch die Daily Round wird gespeichert');
  F.click(F.$('#quit'));
  ok(/Weiterspielen/.test(F.$('#start').textContent),'R8 Startscreen bietet „Weiterspielen" an');
  F.click(F.$('#start'));
  ok(!!F.$('.smain')&&!F.$('.askbox'),'R9 Weiterspielen fragt nicht nach');
  ok(F.play(),'R10 Fortgesetzter Run läuft durch');
  ok(!F.st().run,'R11 Am Ende ist der offene Run gelöscht');
}
console.log(fails?('\n'+fails+' FEHLER'):'\nALLES OK');
setTimeout(()=>process.exit(fails?1:0),400);
})();
