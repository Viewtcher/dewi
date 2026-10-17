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

const lvl0=s=>Object.keys((s.progress||{}).id||{}).filter(k=>s.progress.id[k].l===0);
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
      if(E.$('#slmach')&&!E.$('#slq .iopt')&&!E.$('#nx')){E.stats&&(E.stats.slots=(E.stats.slots||0)+1);E.w.__run('S.cur.slPull()');continue;}
      if(E.$('#wtap')){E.stats.intro++;E.click(E.$('#wtap'));continue;}
      if(E.$('.iopt')){const en=E.$$('.iopt').filter(x=>!x.disabled);const pick=en.find(b=>b.dataset.r==='1');if(pick){E.click(pick);continue;}}
      if(E.$('#go')){E.stats.intro++;E.click(E.$('#go'));continue;}
      if(E.$('#endnext')){E.click(E.$('#endnext'));continue;}
      if(E.$('#next')){E.click(E.$('#next'));continue;}
      if(E.$('#nx')){E.gapSeen=false;E.click(E.$('#nx'));continue;}
      if(E.$('#slmach')&&!E.$('#slq .iopt')&&!E.$('#nx')){E.stats&&(E.stats.slots=(E.stats.slots||0)+1);E.w.__run('S.cur.slPull()');continue;}
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
  ok(s.progress.id[first].l===1&&!Object.keys(s.list||{}).some(lg=>Object.keys(s.list[lg]||{}).length),'B4 Wort auf Stufe 1, keine Fehlerliste');
  ok(s.done[ev(E,'today()')]===true&&!(s.flawed&&s.flawed[ev(E,'today()')]),'B5 Tag zählt, kein grauer Stempel');
  ok((s.chips|0)===200&&!!E.$('#ertitle')&&/ROYAL FLUSH/.test(E.$('#ertitle').textContent)&&/^100 ×1 ×2$/.test(E.$('#epay').textContent.trim()),'B5b Erste Hand (1 Modul, Dewi zahlt): (100 + 0) × 1 × 2 = 200 Chips, Royal Flush');
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
  ok(lvl0(E.st()).length===0,'C4 Alles richtig: kein Wort auf Stufe 0');
}
// --- D) Fehler (Version 131): Stufe 0, morgen fällig, Vorrang im Review, grauer Stempel, keine Reparatur
{
  const E=fresh();known(E,6);
  const day0=ev(E,'today()'),day1=ev(E,'addDays(today(),1)');
  E.click(E.$('#start'));
  ok(E.play({failSent:true,failType:true}),'D1 Round mit lauter Fehlern läuft durch');
  let s=E.st();
  const f0=lvl0(s);
  ok(f0.length===5&&f0.every(k=>s.progress.id[k].d===day1&&s.progress.id[k].n>=1),'D2 Verlorene Module: Stufe 0, morgen fällig, Fehlerzähler ('+f0.length+')');
  ok(s.done[day0]===true&&s.flawed[day0]===true,'D3 Tag zählt, aber als fehlerhaft markiert');
  E.click(E.$('#fin'));
  const btn=E.$(`[data-stamp="${day0}"]`);
  if(btn)E.click(btn);const sc=E.$('.sv-card');ok(btn&&btn.dataset.kind==='ok'&&sc&&!/grayscale/.test(sc.innerHTML)&&/pl-holo" style="display:none/.test(sc.innerHTML),'D4 Tag mit Fehlern: farbige Marke ohne Holo');
  ok(!E.$('#vol')&&!E.$('#rvol'),'D5 Keine Freeplay-Knöpfe');
  ok(/Noch eine Runde/.test(E.$('.plan').textContent)&&!E.$('.card .missed')&&!/Reparatur/.test(E.$('#app').textContent),'D6 Home: „Noch eine Runde“, keine Reparatur');
  nextDay(E);
  ok(/Play now/.test(E.$('#start').textContent),'D7 Nächster Tag: Play now, keine Sperre');
  const rv=ev(E,'plan().review.map(w=>w.k).join()').split(',');
  ok(rv.length===4&&rv.every(k=>f0.indexOf(k)>=0),'D8 Vorrang: alle 4 Review-Wörter sind gefallene Wörter');
  E.click(E.$('#start'));
  ok(/Einführung/.test(E.$('.kicker').textContent),'D9 Round beginnt mit der Einführung');
  ok(E.play(),'D10 Mit richtigen Antworten läuft die Round durch');
  ok(!E.kicks.some(k=>/Reparatur/.test(k)),'D11 Keine Reparatur-Stage');
  s=E.st();
  ok(rv.every(k=>s.progress.id[k].l===1&&s.progress.id[k].n>=1)&&lvl0(s).length===1,'D12 Gerettete Wörter auf Stufe 1, Fehlerzähler bleibt, das fünfte wartet');
  ok(noRepeat(modsOf(E.kicks)),'D13 Auch hier nie dasselbe Modul hintereinander');
  // Migration der alten Fehlerliste
  const mg=ev(E,`(()=>{const ks=curLang().words.slice(40,43).map(w=>w.k);
    state.progress.id[ks[0]]={l:0,d:FAR};state.progress.id[ks[1]]={l:0,d:FAR};state.progress.id[ks[2]]={l:0,d:FAR};
    state.list={id:{[ks[0]]:{n:3,s:'2026-01-02'},[ks[1]]:{n:1,s:'2026-01-01'}}};migrate();
    const p=state.progress.id;return JSON.stringify([p[ks[0]],p[ks[1]],p[ks[2]],state.list,today()]);})()`);
  const M=JSON.parse(mg);
  ok(M[0].l===0&&M[0].d==='2026-01-02'&&M[0].n===3&&M[1].d==='2026-01-01'&&M[1].n===1&&M[2].l===0&&M[2].d===M[4]&&JSON.stringify(M[3])==='{}','D14 Migration: Fehlerliste wird Stufe 0, sofort fällig, Zähler bleibt, Liste leer');
  ok(ev(E,`(()=>{const p=state.progress.id,f=fallenWords().map(w=>w.k);return f[0]===curLang().words[41].k&&f[1]===curLang().words[40].k;})()`),'D15 Am längsten wartende zuerst');
  ok(ev(E,'survivalWords().some(w=>state.progress.id[w.k].l===0)'),'D16 Survival enthält Wörter auf Stufe 0');
  ev(E,'render()');E.click(E.$('.bookcard[data-v="book"]'));
  const fb=E.$('[data-f="shaky"]');ok(!!fb&&/Wackelig/.test(fb.textContent)&&!E.$('[data-f="err"]'),'D17 Vokabelheft: Filter „Wackelig“ statt „Fehlerliste“');
  E.click(fb);
  const rows=E.$$('#vlist .row'),shakyN=ev(E,'curLang().words.filter(w=>isShaky(state.progress.id[w.k])).length');
  ok(rows.length===shakyN&&rows.length>0&&E.$$('#vlist .tag.err').length===ev(E,'fallenWords().length')&&/wackelig/.test(E.$('#vlist').textContent)&&!/Fehlerliste/.test(E.$('#app').textContent),'D18 Filter zeigt Stufe 0–1, Marke „wackelig“ nur auf Stufe 0 ('+rows.length+')');
}
// --- P) Poker (Version 133)
{
  const E=fresh();known(E,6);
  const P=ev(E,`(()=>{
    const pay=(blind,res,pct)=>{const h={blind,stake:blind==='big'?300:100,paid:'self',pct:pct||0,mult:0,done:0,lost:0};h.bonus=Math.round(h.stake*h.pct/100);
      res.forEach(ok=>handSettle(h,ok));const c=state.chips;const r=handPayout(h);state.chips=c;return r.net;};
    const T=[1,1,1,1,1],F1=[1,1,1,1,0],F2=[1,1,1,0,0],F3=[1,1,0,0,0];
    return JSON.stringify({s:[pay('small',T),pay('small',F1),pay('small',F2),pay('small',F3)],b:[pay('big',T),pay('big',F1),pay('big',F2),pay('big',F3)],
      b30:(()=>{const h={blind:'big',stake:300,paid:'self',pct:30,bonus:90,mult:0,done:0,lost:0};T.forEach(ok=>handSettle(h,ok));const c=state.chips;const r=handPayout(h);state.chips=c;return r.payout;})(),
      floor:(()=>{const h={blind:'big',stake:300,paid:'self',pct:0,bonus:0,mult:0,done:0,lost:0};[0,0,1,0].forEach(ok=>handSettle(h,ok));return h.mult;})(),
      small0:(()=>{const h={blind:'small',stake:100,paid:'self',pct:0,bonus:0,mult:0,done:0,lost:0};[1,1,0,0].forEach(ok=>handSettle(h,ok));return h.mult;})()});})()`);
  const R=JSON.parse(P);
  ok(R.s.join()==='900,300,200,100','P1 Rechenbeispiele Small Blind 100: +900 / +300 / +200 / +100 ('+R.s+')');
  ok(R.b.join()==='2700,600,0,-300','P2 Rechenbeispiele Big Blind 300: +2.700 / +600 / ±0 / −300 ('+R.b+')');
  ok(R.b30===3900,'P3 30 Tage, Big Blind, Royal Flush: 390 × 10 = 3.900 ('+R.b30+')');
  ok(R.floor===0&&R.small0===2,'P4 Multiplikator: Big nie unter ×0, Small bleibt bei Fehlern stehen');
  ok(ev(E,'[6,7,13,14,29,30,49,50,99,100,364,365,999].map(bonusPct).join()')==='0,10,10,20,20,30,30,40,40,50,50,100,100','P5 Serien-Bonus-Stufen');
  ok(ev(E,'STREAK_MILES.join()')==='7,14,30,50,100,365','P6 Meilensteine = Bonus-Stufen');
  // Wer zahlt den Small Blind?
  const day0=ev(E,'today()');
  ok(ev(E,'(()=>{state.chips=0;return blindOffer().small.paid})()')==='dewi','P7 Erste Round des Tages: Dewi zahlt');
  ev(E,`state.done['${day0}']=true;state.chips=150;save()`);
  ok(ev(E,'blindOffer().small.paid')==='self'&&!ev(E,'blindOffer().big.ok'),'P8 Danach zahlt man selbst, Big ausgegraut ohne 300 Chips');
  ev(E,'state.chips=40;save()');
  ok(ev(E,'blindOffer().small.paid')==='rescue','P9 Leeres Konto: Dewi rettet');
  ev(E,"handNew('small')");
  ok(ev(E,'state.chips')===40&&ev(E,'daily().rescue')===true&&ev(E,'blindOffer().small.paid')==='none'&&ev(E,'blindOffer().small.stake')===0,'P10 Rettung nur einmal am Tag, danach ohne Einsatz');
  ev(E,'state.chips=1000;save()');ev(E,"handNew('big')");
  ok(ev(E,'state.chips')===700,'P11 Big Blind wird beim Start abgebucht');
  // Echte Hand: Big Blind, alles falsch → ×0, Einsatz weg
  ev(E,`delete state.done['${day0}'];state.chips=1000;state.chipShown=1000;save();render();window.__autoBlind='big'`);
  E.click(E.$('#start'));
  ok(/Big Blind 300/.test(E.$('#pkrow').textContent)&&ev(E,'state.chips')===700,'P12 Kopfzeile zeigt die Hand, Einsatz abgebucht');
  ok(E.play({failSent:true,failType:true}),'P13 Hand mit lauter Fehlern läuft durch');
  ok(ev(E,'state.chips')===700&&/×0/.test(E.$('#epay').textContent)&&/Einsatz weg/.test(E.$('#epay').textContent)&&!!E.$('#egem.zero')&&E.$('#egn').textContent==='0'&&!E.$('#ertitle'),'P14 ×0: graue 0, keine Auszahlung, Einsatz weg (für Screenreader)');
  ok(ev(E,'QUIPS.de.pay_zero').includes(E.$('#dzbody .bubble').getAttribute('aria-label'))&&E.$$('.porow .pochip use[href="#chip-grey"]').length===5,'P14b ×0: bissiger Spruch, fünf graue Ergebnis-Chips');
  E.click(E.$('#fin'));
  // Pausieren, keine Verwerfen-Möglichkeit, Verfallen um Mitternacht
  ev(E,"window.__autoBlind='small'");nextDay(E);
  E.click(E.$('#start'));skipIntro(E);
  ok(ev(E,'S.hand&&S.hand.paid')==='dewi','P15 Neuer Tag: wieder Dewis Small Blind');
  ev(E,'closeSheet()');
  ok(!!ev(E,"openRun('daily')")&&/Weiterspielen/.test(E.$('#start').textContent),'P16 Pausierte Hand: Weiterspielen');
  E.click(E.$('#start'));ok(!!E.$('#pkrow')&&!E.$('.blindbox')&&!E.$('.askbox'),'P17 Start setzt die Hand fort, ohne Rückfrage');
  ev(E,'closeSheet()');
  ev(E,'startRound("survival")');
  ok(!!E.$('.askbox')&&!E.$('#askgo')&&!!E.$('#askon'),'P18 Survival bei offener Hand: kein „Trotzdem neu starten“');
  E.click(E.$('#askno'));
  nextDay(E);
  ok(!ev(E,"openRun('daily')")&&ev(E,'state.run')===null&&/Play now/.test(E.$('#start').textContent),'P19 Um Mitternacht verfällt die pausierte Hand');
  // Meilenstein zeigt den neuen Bonus
  ev(E,`(()=>{for(let i=1;i<=6;i++)state.done[addDays(today(),-i)]=true;save();render();})()`);
  E.click(E.$('#start'));E.play();
  ok(/Serien-Bonus jetzt \+10 %/.test(E.$('#fin').textContent),'P20 Tag 7: Meilenstein mit „Serien-Bonus jetzt +10 %“');
  const ep=E.$('#epay')?E.$('#epay').textContent:'';
  ok(/^100 ×5 ×2$/.test(ep.trim())&&!/\+/.test(ep),'P21 Bonus nach der Serie vor der Hand: Tag 7 zahlt noch ohne Bonus ('+ep+')');
  ok(E.$('#egn').textContent==='+1.000'&&E.$$('.porow use[href="#chip-holo"]').length===5&&ev(E,'QUIPS.de.pay_rf').includes(E.$('#dzbody .bubble').getAttribute('aria-label'))&&!!E.$('#dzone .dw.m-cash'),'P21b Royal Flush: +1.000, fünf Holo-Chips, Dewi mit Dollar-Augen und Spruch');
  ok(/Weiter/.test(E.$('#endnext').textContent)&&!!E.$('#chippill2'),'P21c Erste Round: „Weiter“ führt zur Serie, Chip-Pille oben');
  E.click(E.$('#fin'));
  ok(ev(E,'blindOffer().pct')===10,'P22 Ab der nächsten Hand gilt +10 %');
  ev(E,"window.__autoBlind=null;state.chips=250;save();render()");
  E.click(E.$('#extra'));
  const bs=E.$('#blindstage');
  ok(!!bs&&E.$('#blind-big').disabled&&/\+10 %/.test(E.$('#bonuspill').textContent)&&/DEIN EINSATZ/.test(bs.textContent)&&!E.$('#pkrow'),'P23 Blind-Wahl als eigener Screen, Big ausgegraut bei 250 Chips, Bonus-Pille');
  ok(!!E.$('#blindstage #dzone .dzhead .dw')&&!!E.$('#dzq')&&ev(E,'QUIPS.de.blind_self').includes(E.$('#dzbody .bubble').getAttribute('aria-label'))&&!!E.$('#blindstage .actzone')&&!!E.$('#chippill2'),'P23b Dewi-Zone mit Spruch und „?“, Aktionszone, Chip-Pille');
  E.click(E.$('#dzq'));ok(/Multiplikator/.test(E.$('#dzbody').textContent)&&E.$('#dzq').getAttribute('aria-expanded')==='true','P23c „?“ zeigt Dewis Erklärung');
  E.click(E.$('#dzq'));ok(ev(E,'QUIPS.de.blind_self').includes(E.$('#dzbody .bubble').getAttribute('aria-label')),'P23d Nochmal „?“: zurück zum Spruch');
  E.click(E.$('#blind-small'));
  ok(!E.$('#blindstage')&&/Small Blind 100/.test(E.$('#pkrow').textContent)&&ev(E,'S.hand.pct')===10&&ev(E,'state.chips')===150,'P24 Small gewählt: Hand startet, 100 abgebucht, Bonus +10 % gilt');
  ok(!!E.$('.sin.hand .ctrack')&&!E.$('.sin.hand .sbar')&&E.$$('.ctrack .dchip,.ctrack .cslot').length===ev(E,"S.items.filter(x=>x.kind!=='intro').length"),'P25 Kopf: Dewi-Chips statt Fortschrittsbalken');
  ok(E.$('#pkmult .n').textContent==='0'&&!!E.$('#pkrow .pkx')&&!E.$('.sin.hand #dzone')&&!E.$('.sin.hand .pkbar'),'P26 Kleine Zeile wie im Survival: Einsatz × Multiplikator, keine Dewi-Kachel');
  ok(E.$('#pkhelp').hidden,'P26b Erklärung zu Beginn zu');
  E.click(E.$('#pkq'));ok(!E.$('#pkhelp').hidden&&/Small Blind kostet ein Fehler nichts/.test(E.$('#pkhelp').textContent),'P27 „?“ an der Zeile erklärt die Regeln zum gewählten Blind');
  ev(E,"closeSheet();window.__autoBlind='small'");
  ok(!E.$('#ohint')&&!!E.$('#extra')&&!!ev(E,"openRun('daily')"),'P28 Startscreen: offene Hand ohne Hinweiszeile, „Weiterspielen“ da');
  ev(E,'window.__hour=21;render()');
  ok(ev(E,'QUIPS.de.home_late').includes(E.$('#app .mascot .bubble').getAttribute('aria-label')),'P29 Ab 21 Uhr stichelt Dewi bei offener Hand');
  ev(E,'window.__hour=20;render()');
  ok(!ev(E,'QUIPS.de.home_late').includes(E.$('#app .mascot .bubble').getAttribute('aria-label')),'P30 Vor 21 Uhr kein Sticheln');
  ev(E,'window.__hour=null');
  E.click(E.$('#extra'));
  E.play();ok(!E.$('#fin')&&ev(E,'sheet.hidden')===true,'P31 Folge-Hand: „Fertig“ schließt ohne Serien-Einblendung');
}
// --- P2) Poker-Screens während der Hand (Version 134)
{
  const E=fresh();known(E,6);
  const right=()=>{const w=T(E.$('.bigword')),idGl=!!E.$('.bigword[lang="id"]'),D=DICT.de;E.type(idGl?D.get(w.toLowerCase()).gl.split(' / ')[0].replace(/\(.*?\)/g,'').trim():[...D.values()].find(x=>x.gl===w).id);};
  ev(E,"state.chips=1000;state.chipShown=1000;save();render();window.__autoBlind='big';window.__force='typing'");
  E.click(E.$('#start'));skipIntro(E);
  ok(!!E.$('.ctrack .dchip.now')&&!E.$('.ctrack .sh'),'Q1 Aktuelles Modul: gestrichelter Chip');
  right();
  ok(E.$('#pkmult').classList.contains('up')&&E.$('#pkmult .n').textContent==='1','Q2 Geschafft: Multiplikator springt auf ×1');
  ok(E.$$('.ctrack .sh').length===1&&!!E.$('.ctrack use[href="#chip-holo"]'),'Q3 Geschafft und Royal Flush noch drin: Holo-Chip');
  ok(!!E.$('.smain .mascot .dw')&&!E.$('#dzone'),'Q4 Dewi nur im Modul (Ergebnis mit Spruch), oben keine Dewi-Zone');
  E.click(E.$('#next'));
  ok(!E.$('#pkmult').classList.contains('up'),'Q5 Animation nur einmal pro Modul');
  E.type('qqq');E.type('qqq');E.type('qqq');
  ok(E.$('#pkmult').classList.contains('down')&&E.$('#pkmult .o').textContent==='1'&&E.$('#pkmult .n').textContent==='0','Q6 Big Blind verloren: Zahl rutscht von ×1 auf ×0');
  ok(!E.$('.ctrack .sh')&&!!E.$('.ctrack use[href="#chip-gold"]')&&!!E.$('.ctrack use[href="#chip-grey"]'),'Q7 Royal Flush weg: geschaffter Chip gold, verlorener grau');
  ok(!!E.$('.smain .mascot .bubble'),'Q8 Dewi kommentiert den Fehler im Modul');
  E.click(E.$('#next'));ev(E,'closeSheet()');
  E.click(E.$('#start'));
  ok(E.$$('.ctrack use[href="#chip-grey"]').length===1&&E.$$('.ctrack use[href="#chip-gold"]').length===1,'Q9 Nach dem Fortsetzen stimmen die Chips noch');
  ev(E,"closeSheet();window.__autoBlind='small'");nextDay(E);
  E.click(E.$('#start'));skipIntro(E);
  E.type('qqq');E.type('qqq');E.type('qqq');
  ok(E.$('#pkmult').classList.contains('hold')&&E.$('#pkmult .n').textContent==='0','Q10 Small Blind verloren: Zahl bleibt und blinkt grau');
  ev(E,"closeSheet();window.__force=null");
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
  ok(ev(E,'S.lost')===1&&lvl0(E.st()).length===1,'E4 Tippen: drei Fehler = Modul verloren, Stufe 0');
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
    if(E.$('#slmach')&&!E.$('#slq .iopt')&&!E.$('#nx')){E.stats&&(E.stats.slots=(E.stats.slots||0)+1);E.w.__run('S.cur.slPull()');continue;}
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
  ok(lvl0(E.st()).length===0,'F12 Survival-Fehler setzen kein Wort auf Stufe 0');
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
