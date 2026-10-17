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

let E=env(null,'de','de-DE');
try{
// ===== 0) Erster Start: Sprachwahl der App

ok(/^Language$/.test(E.$('h1').textContent.trim())&&!/Sprache/.test(E.$('#app').textContent),'Erster Start: nur Englisch sichtbar (Version 152)');
ok(E.$('[data-ui="en"]').getAttribute('aria-pressed')==='true'&&E.$('[data-ui="de"]').getAttribute('aria-pressed')==='false','Englisch ist vorgewählt, auch bei deutschem Handy');
ok(/🇬🇧/.test(E.$('[data-ui="en"]').textContent)&&/🇩🇪/.test(E.$('[data-ui="de"]').textContent),'Sprachzeilen mit Flaggen');
E.click(E.$('[data-ui="de"]'));
ok(/^Sprache$/.test(E.$('h1').textContent.trim())&&/Weiter/.test(E.$('#uigo').textContent)&&!/Language/.test(E.$('#app').textContent),'Tipp auf Deutsch schaltet den Screen komplett auf Deutsch');
E.click(E.$('[data-ui="en"]'));
ok(/^Language$/.test(E.$('h1').textContent.trim()),'Zurück auf Englisch tippbar');
E.click(E.$('[data-ui="de"]'));E.click(E.$('#uigo'));
ok(!!E.$('#nmf')&&/heißt/.test(E.$('h1').textContent),'Weiter übernimmt Deutsch, Namensfrage deutsch');
const E0=env(null,'de','en-US');
E0.click(E0.$('[data-ui="en"]'));if(E0.$('#uigo'))E0.click(E0.$('#uigo'));
ok(/your name/i.test(E0.$('h1').textContent)&&/Skip/.test(E0.$('#nmskip').textContent),'Englisch: Namensfrage englisch');
E0.click(E0.$('#nmskip'));
ok(/Which language are you learning/.test(E0.$('h1').textContent)&&E0.d.documentElement.lang==='en','Englisch gewählt: Oberfläche englisch');
E0.click(E0.$('[data-lang="id"]'));if(E0.$('#langgo'))E0.click(E0.$('#langgo'));
ok(/Daily Round/.test(E0.$('#app').textContent)&&!!E0.$('#tabs')&&E0.$('.bookcard').getAttribute('aria-label')==='Open wordbook'&&E0.$('#gear').getAttribute('aria-label')==='Open settings','Englisch: Startseite, Vokabelheft-Kachel und Zahnrad');
ok(/Home/.test(E0.$('.tab[data-v="home"]').textContent)&&/Wordbook/.test(E0.$('.tab[data-v="book"]').textContent)&&/Shop/.test(E0.$('#shoptab').textContent)&&!E0.$('.tab[data-v="settings"]'),'Englisch: Tab-Leiste zeigt Home, Wordbook, Shop (Version 145)');

}catch(e){ok(false,'Abschnitt 0 abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12) Übersetzungs-Vollständigkeit
const keys=new Set();
let m;const re=/\bt\('((?:[^'\\]|\\.)*)'/g;
const tail=src.slice(src.indexOf('/* ---------- Oberfläche'));
while((m=re.exec(tail)))keys.add(m[1].replace(/\\'/g,"'"));
const re2=/'((?:Suchen auf [^']*|ins [A-Za-z]+))'/g;while((m=re2.exec(tail)))keys.add(m[1]);
const enObj=JSON.parse(src.match(/const EN=(\{[\s\S]*?\});\nfunction t\(/)[1]);
const missing=[...keys].filter(k=>!(k in enObj));
ok(missing.length===0,'Alle t()-Texte haben eine englische Übersetzung'+(missing.length?': '+missing.join(' | '):''));
const cats=[...src.matchAll(/^\['([^']+)',`$/gm)].map(x=>x[1]);
ok(cats.length===20&&cats.every(c=>c in enObj),'Alle 20 Kategorien übersetzt');
ok(dDe.size===678&&[...dDe.values()].every(v=>v.gl),'Alle 678 deutschen Bedeutungen vorhanden');

}catch(e){ok(false,'Abschnitt 12 abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12b) Maskottchen Dewi
{
  const M=env({v:2,lang:'id',newPerDay:2,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},'de');
  ok(!!M.$('.mascot .dw svg')&&M.$('.mascot .bubble').textContent.length>10,'Startseite: Dewi mit Spruch');
  M.click(M.$('#start'));
  ok(!!M.$('#wtap'),'Einführung: zentriertes Wort');ok(!M.$('.intro1 .mascot'),'Einführung ohne Dewi');
  ok(M.play({failType:true}),'Sitzung mit Fehlern läuft');
  ok(M.$$('.dw').length>=1&&M.$$('.dw').every(g=>/m-(haughty|bored|annoyed|sly|shades|sleep|mean|superior|uninterested|surprised|cash)/.test(g.className)),'Ende: Dewi mit Stimmung');
  M.click(M.$('#fin'));
  M.click(M.$('[data-v="settings"]'));
  ok(!!M.$('.mascot'),'Einstellungen: Dewi');
  ok(!M.$('[data-q]'),'Kein Maskottchen-Schalter mehr');
  const old=env({v:2,lang:'id',quips:false,newPerDay:1,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},'de');
  ok(!!old.$('.mascot'),'Altes Setting quips:false wird ignoriert, Dewi immer an');
  const Z=env({v:2,lang:'id',newPerDay:1,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},'en');
  ok(/[A-Za-z]/.test(Z.$('.bubble').textContent)&&!/[äöüß]/.test(Z.$('.bubble').textContent),'Englisch: Spruch ist englisch');
  const f=env({v:2,lang:'id',newPerDay:1,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},'de');
  f.click(f.$('#start'));f.play();f.click(f.$('#fin'));
  ok(f.st().form.length>=1&&f.st().form.every(x=>x===1),'Antwort-Form wird gespeichert');
  f.click(f.$('[data-v="settings"]'));f.click(f.$('#exp'));
  ok(JSON.parse(f.$('#expbox').value).data.quips===true,'Sicherung enthält weiterhin quips-Feld');
}

}catch(e){ok(false,'Abschnitt 12b abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12f) Stempel-Marken in der Serie
{
  const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const mk=n=>{const done={};const t=new Date();for(let i=0;i<n;i++){const d=new Date(t);d.setDate(t.getDate()-i);done[ymd(d)]=1;}return done;};
  const base=n=>({v:2,lang:'id',newPerDay:1,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:mk(n)});
  let bad=0,runs=25;
  for(let r=0;r<runs;r++){
    const X=env(base(7),'de');
    const ms=X.$$('[data-stamp]').map(b=>b.dataset.mood);
    if(ms.length!==7)bad++;
    for(let i=1;i<ms.length;i++)if(ms[i]===ms[i-1])bad++;
  }
  ok(bad===0,'Marken: 7 erledigte Tage, nie dieselbe Miene hintereinander ('+runs+' Läufe)');
  const S=env(base(3),'de');
  ok(S.$$('[data-stamp]').length===3&&S.$$('.wd i').length===4,'Marken nur für erledigte Tage, Tage vor dem Start bleiben Kästchen');
  S.click(S.$('[data-stamp]'));ok(S.$$('.sv-card svg mask').length===1,'Marke ist Briefmarke mit Zackenrand (Maske)');
  const st1=S.st();ok(Object.keys(st1.stamps||{}).length===3,'Mienen werden gespeichert');
  const before=S.$$('[data-stamp]').map(b=>b.dataset.mood).join();
  S.click(S.$('[data-v="settings"]'));S.click(S.$('[data-v="home"]'));
  ok(S.$$('[data-stamp]').map(b=>b.dataset.mood).join()===before,'Mienen bleiben nach Neuaufbau gleich');
  // Große Ansicht
  const first=S.$('[data-stamp]');S.click(first);
  ok(!!S.$('.stampview')&&!!S.$('.stampview svg mask')&&S.$('.sv-cap').textContent.length>5,'Klick öffnet große Marke mit Datum und Miene');
  const card=S.$('#svcard');const ev=(t,x,y)=>{const e=new S.w.MouseEvent(t,{bubbles:true,clientX:x,clientY:y});e.pointerId=1;card.dispatchEvent(e);};
  ok(/rotateX\(/.test(card.style.transform)&&!!S.$('#svsh'),'Große Marke hat 3D-Neigung und eigenen Schatten');
  ok(!/translate/.test(card.style.transform),'Marke ist im Zentrum fixiert: keine Verschiebung, nur Drehung');
  ok(['.pl-bg','.pl-art','.pl-holo','.pl-glare','.pl-mark'].every(c=>!!S.$('#svcard '+c)),'Fünf Parallax-Ebenen (Hintergrund, Motiv, Holo, Glanz, Stempel)');
  ev('pointerdown',100,100);ok(card.classList.contains('held'),'Gedrückt: Marke gehalten');
  ev('pointermove',100,40);ev('pointerup',100,40);ok(!card.classList.contains('held'),'Losgelassen: nicht mehr gehalten');
  // Physik-Simulation
  const mkS=()=>S.w.makeStampSim(false);
  let m=mkS();m.press();m.drag(0,-100);
  const target=150*Math.tanh(100/150);
  for(let i=0;i<6;i++)m.step(1/60);                      // 0,1 s
  ok(-m.y>target*.55,'Responsiv: nach 0,1 s schon über 55 % der Zielposition ('+(-m.y).toFixed(0)+' von '+target.toFixed(0)+' px)');
  for(let i=0;i<60;i++)m.step(1/60);
  ok(Math.abs(-m.y-target)<2,'Folgt dem Finger fast 1:1 (100 px Zug = '+(-m.y).toFixed(0)+' px)');
  ok(m.s>1.05&&m.lift>.4,'Gehalten: größer und Schatten weiter weg');
  m=mkS();m.press();m.drag(0,5000);for(let i=0;i<120;i++)m.step(1/60);
  ok(m.y<=150.5&&m.y>130,'Weiche Begrenzung bei 150 px (extremer Zug)');
  m=mkS();m.press();m.drag(300,0);for(let i=0;i<20;i++)m.step(1/60);ok(m.ry>8&&m.ry<=33,'Zug nach rechts neigt nach rechts ('+m.ry.toFixed(1)+'°), max. 32°');
  m=mkS();m.press();m.drag(0,-100);for(let i=0;i<60;i++)m.step(1/60);m.release();
  let minY=0,maxY=-999,settled=-1;
  for(let i=0;i<180;i++){m.step(1/60);if(m.y>maxY)maxY=m.y;if(settled<0&&Math.abs(m.y)<.4&&Math.abs(m.vy)<2)settled=i/60;}
  ok(maxY>3,'Loslassen: federt über die Ruhelage hinaus (Überschwingen '+maxY.toFixed(1)+' px)');
  ok(settled>0&&settled<.9,'Marke kommt nach '+settled.toFixed(2)+' s zur Ruhe (unter 0,9 s)');
  ok(Math.abs(m.x)<.5&&Math.abs(m.y)<.5&&Math.abs(m.s-1)<.01&&Math.abs(m.rx)<.5&&Math.abs(m.ry)<.5,'Nach 3 s in Ruhelage (Position, Größe und Neigung)');
  m=mkS();m.press();m.drag(300,200);for(let i=0;i<40;i++)m.step(1/60);const tiltHeld=Math.abs(m.ry);const pxHeld=m.px;m.release();for(let i=0;i<120;i++)m.step(1/60);ok(tiltHeld>8&&Math.abs(m.ry)<.5&&Math.abs(m.rx)<.5,'Neigung geht nach dem Loslassen zurück auf 0');
  ok(pxHeld>.5&&Math.abs(m.px)<.05&&Math.abs(m.py)<.05,'Parallax folgt der Neigung und geht zurück auf 0 ('+pxHeld.toFixed(2)+' gehalten)');
  m=mkS();m.press();m.drag(60,0);for(let i=0;i<40;i++)m.step(1/60);const t1=m.ry;m.drag(-60,0);for(let i=0;i<40;i++)m.step(1/60);ok(t1>0&&m.ry<0,'Neigung wechselt mit der Zugrichtung');
  m=S.w.makeStampSim(true);for(let i=0;i<120;i++)m.step(1/60);ok(Math.abs(m.ry)>.5||Math.abs(m.rx)>.5,'Ruhezustand: leichtes Wiegen');
  m=S.w.makeStampSim(true);m.step(5);ok(isFinite(m.x)&&isFinite(m.ry),'Große Zeitsprünge bleiben stabil');
  S.d.dispatchEvent(new S.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  ok(!S.$('.stampview'),'Escape schließt die große Marke');
  S.click(S.$('[data-stamp]'));S.click(S.$('.sv-x'));ok(!S.$('.stampview'),'Schließen-Knopf funktioniert');
  S.click(S.$('[data-stamp]'));S.click(S.$('.sv-back'));ok(!S.$('.stampview'),'Klick daneben schließt');
  const EN=env(base(2),'en');EN.click(EN.$('[data-stamp]'));
  ok(/[A-Za-z]/.test(EN.$('.sv-hint').textContent)&&!/[äöüß]/.test(EN.$('.sv-hint').textContent+EN.$('.sv-cap span').textContent),'Englisch: Hinweis und Miene englisch');
  const ex=env(base(2),'de');ex.click(ex.$('[data-v="settings"]'));ex.click(ex.$('#exp'));
  ok(JSON.parse(ex.$('#expbox').value).data.stamps&&Object.keys(JSON.parse(ex.$('#expbox').value).data.stamps).length===2,'Sicherung enthält die Marken');
}

}catch(e){ok(false,'Abschnitt 12f abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12g) Name und Anrede
{
  const base=o=>Object.assign({v:2,lang:'id',newPerDay:1,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},o||{});
  const N=env(base({nameAsked:false}),'de');
  ok(!!N.$('#nmf')&&!!N.$('#nm')&&!N.$('#gear'),'Erster Start: Namensfrage statt Startseite (auch für bestehende Nutzer)');
  ok(N.$('.mascot .bubble').textContent.length>8,'Namensfrage: Dewi spricht');
  N.$('#nm').value='  Vito<b>  ';N.$('#nmf').dispatchEvent(new N.w.Event('submit',{bubbles:true,cancelable:true}));
  ok(N.st().name==='Vitob'&&N.st().nameAsked===true,'Name wird bereinigt gespeichert (Leerzeichen, <> entfernt): '+N.st().name);
  ok(!N.$('#nmf')&&!!N.$('.plan .streak'),'Danach geht es zur Startseite weiter');
  const K=env(base({nameAsked:false}),'de');K.click(K.$('#nmskip'));
  ok(K.st().name===''&&K.st().nameAsked===true&&!K.$('#nmf'),'Überspringen: kein Name, Frage kommt nicht wieder');
  const Long=env(base({nameAsked:false}),'de');Long.$('#nm').value='A'.repeat(40);Long.$('#nmf').dispatchEvent(new Long.w.Event('submit',{bubbles:true,cancelable:true}));
  ok(Long.st().name.length===20,'Name auf 20 Zeichen begrenzt');
  // Reihenfolge: erst App-Sprache, dann Name, dann Lernsprache
  const F=env({v:2,ui:null,nameAsked:false},'de');
  ok(/Language/.test(F.$('#app').textContent)&&!F.$('#nmf'),'Neu: zuerst App-Sprache');
  F.click(F.$('[data-ui="de"]'));if(F.$('#uigo'))F.click(F.$('#uigo'));ok(!!F.$('#nmf'),'Dann Namensfrage');
  F.click(F.$('#nmskip'));ok(!!F.$('[data-lang]'),'Dann Lernsprache');
  // Anrede in Sprüchen
  const Q=env(base({name:'Vito',nameAsked:true}),'de');
  const kinds=['pick','lang','home_new','home_due','home_done','home_sleep','home_fallen','home_streak','settings','intro','ok','ok_try2','ok_run','bad','bad_rare','bad_again','lvl_up','lvl_new','lvl_saved','lvl_hold','end_perfect','end_good','end_bad','name'];
  let withName=0,withNick=0,leak=0,total=0;const nickRe=/Choom|Chief|Digga|Boss|Bestie|Meister/;
  for(const k of kinds)for(let i=0;i<60;i++){const q=Q.w.sayQuip(k,{n:3,s:5,lv:4,w:'x'});total++;if(/\{\w+\}/.test(q.text))leak++;if(q.text.includes('Vito'))withName++;if(nickRe.test(q.text))withNick++;}
  ok(leak===0,'Keine unaufgelösten Platzhalter in '+total+' Sprüchen');
  ok(withName>30&&withNick>10,'Dewi nennt mal den Namen ('+withName+'×), mal Spitznamen ('+withNick+'×)');
  const share=withName/(withName+withNick);ok(share>.45&&share<.85,'Name häufiger als Spitzname, aber nicht immer (Anteil '+share.toFixed(2)+')');
  const NN=env(base(),'de');let onlyNick=true,nn=0;for(let i=0;i<200;i++){const q=NN.w.sayQuip('ok');if(/\{|undefined|null/.test(q.text))onlyNick=false;if(nickRe.test(q.text))nn++;}
  ok(onlyNick&&nn>0,'Ohne Name: nur Spitznamen, keine Fehler');
  const EN=env(base({name:'Vito',nameAsked:true}),'en');let enBad=0,enNick=0;for(const k of kinds)for(let i=0;i<40;i++){const q=EN.w.sayQuip(k,{n:3,s:5,lv:4,w:'x'});if(/[äöüß]/.test(q.text))enBad++;if(/Choom|Chief|Bro|Boss|Bestie|Champ/.test(q.text))enNick++;}
  ok(enBad===0&&enNick>0,'Englisch: Anrede englisch ohne Umlaute');
  // Sicherheit: Name wird escaped
  const X=env(base({name:'&lt;i&gt;x',nameAsked:true}),'de');X.w.sayQuip('ok');ok(!X.$('.bubble i'),'Name wird nicht als HTML interpretiert');
  // Einstellungen
  const S=env(base({name:'Vito',nameAsked:true}),'de');S.click(S.$('[data-v="settings"]'));
  ok(!!S.$('#nmin')&&S.$('#nmin').value==='Vito','Einstellungen: Name steht im Feld');
  S.$('#nmin').value='Rina';S.$('#nmsf').dispatchEvent(new S.w.Event('submit',{bubbles:true,cancelable:true}));
  ok(S.st().name==='Rina'&&/Gespeichert/.test(S.$('#nmflash').textContent),'Einstellungen: Name ändern und speichern');
  S.$('#nmin').value='';S.$('#nmsf').dispatchEvent(new S.w.Event('submit',{bubbles:true,cancelable:true}));
  ok(S.st().name==='','Name lässt sich leeren (dann Spitznamen)');
  S.click(S.$('#exp'));const ex=JSON.parse(S.$('#expbox').value).data;ok('name' in ex&&ex.nameAsked===true,'Sicherung enthält Name und Status');
  // Rücksetzen: Name weg, Frage kommt wieder
  const R=env(base({name:'Vito',nameAsked:true}),'de');R.click(R.$('[data-v="settings"]'));R.click(R.$('#reset'));R.click(R.$('#reset'));
  ok(R.st().name===''&&R.st().nameAsked===false,'Zurücksetzen löscht den Namen');
}

}catch(e){ok(false,'Abschnitt 12g abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12h) Dewi: minimale Schleifen
{
  const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const moods=['haughty','bored','annoyed','sly','shades','sleep','mean','superior','uninterested','surprised'];
  ok(moods.every(m=>new RegExp('\\.dw\\.m-'+m+' svg\\{animation:dw-'+m+' ').test(css)&&css.includes('@keyframes dw-'+m+'{')),'Jede der 10 Stimmungen hat eine eigene Schleife');
  ok(/\.mascot \.dw\{animation:dwpop/.test(css)&&css.includes('@keyframes dwpop'),'Aufpoppen bei neuem Spruch');
  const mx=[...css.matchAll(/@keyframes dw-[a-z]+\{([\s\S]*?)\}\}\n/g)].map(m=>m[1]);
  let maxRot=0,maxScale=1;for(const k of mx){for(const r of k.matchAll(/rotate\((-?[\d.]+)deg\)/g))maxRot=Math.max(maxRot,Math.abs(+r[1]));for(const r of k.matchAll(/scale\(([\d.]+)\)/g))maxScale=Math.max(maxScale,+r[1]);}
  ok(maxRot<=2.4&&maxScale<=1.036,'Schleifen bleiben minimal (max '+maxRot+'° und Größe '+maxScale+')');
  ok(/prefers-reduced-motion:reduce\)\{\*\{animation:none!important/.test(css),'Bei „Bewegung reduzieren“ stehen alle Schleifen still');
  const C=env({v:2,lang:'id',newPerDay:1,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},'de');
  ok(!!C.$('.mascot .dw svg')&&!C.$('.sv-card'),'Dewi neben der Sprechblase; große Marke bleibt eigene Animation');
}

}catch(e){ok(false,'Abschnitt 12h abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12i) Sounds
{
  const C=env({v:2,lang:'id',newPerDay:1,dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},'de');
  const A=C.w.__aud;
  ok(C.st().sound===true&&C.st().vol===40,'Sounds standardmäßig an, leise (40)');
  C.click(C.$('#gear'));
  ok(!!C.$('#vol')&&C.$$('[data-snd]').length===2,'Einstellungen: Schalter und Lautstärkeregler');
  const n0=A.osc.length;C.click(C.$('[data-snd=false]'));
  ok(C.st().sound===false,'Sound ausschaltbar');
  const n1=A.osc.length;C.w.eval("sfx('right');sfx('wrong');blip('sly','a')");
  ok(A.osc.length===n1,'Aus = absolut still');
  C.click(C.$('[data-snd=true]'));
  C.w.eval("sfx('right')");ok(A.osc.length>n1&&A.resumed>0,'An = Töne und Audio wird gestartet');
  const nb=A.osc.length;C.w.eval("blip('bored','a');blip('surprised','a')");
  const fb=A.osc.slice(nb);ok(fb.length===2&&fb[0]<fb[1],'Stimmungen klingen unterschiedlich (gelangweilt tiefer als überrascht)');
  const nz=A.noise;C.w.eval("sfx('stamp')");ok(A.noise>nz,'Stempel-Klonk mit Papier-Rauschen');
  C.w.sndSet("vol",0);const nv=A.osc.length;C.w.eval("sfx('right')");ok(A.osc.length===nv,'Lautstärke 0 = still');
  C.w.sndSet("vol",70);C.w.eval("sfx('click')");ok(Math.abs(A.gain.gain.value-.7)<1e-9,'Lautstärke 70 setzt Master auf 0,7');
  for(const nm of ['click','pop','right','wrong','retry','stamp','glitter','end_good','end_perfect','end_bad'])ok(C.w.eval("typeof SFX['"+nm+"']")==='function','SFX '+nm);
  {
    C.click(C.$('[data-snd=true]'));
    const nk=A.osc.length;const inp=C.$('#nmin');
    inp.dispatchEvent(new C.w.InputEvent('input',{bubbles:true,inputType:'insertText',data:'a'}));
    const nk2=A.osc.length;ok(nk2>nk,'Eigene Eingabe: Tastenton pro Buchstabe');
    inp.dispatchEvent(new C.w.InputEvent('input',{bubbles:true,inputType:'deleteContentBackward'}));
    ok(A.osc.length>nk2,'Löschen hat eigenen Ton');
    const nr2=A.osc.length;C.w.eval("sfx('right')");ok(A.osc.length-nr2>=12,'Gewinn-Sound ist lang und reich ('+(A.osc.length-nr2)+' Töne)');
    const nn=A.noise;C.w.eval("sfx('right')");ok(A.noise>nn,'Gewinn-Sound mit Münzregen-Rauschen');
  }
  // Antwort-Tonerkennung per Beobachter
  const nr=A.osc.length;const h=C.d.createElement('div');h.className='res good';C.d.body.appendChild(h);
  setTimeout(()=>{ok(A.osc.length>nr&&h.getAttribute('data-snd')==='1','Richtig-Ergebnis löst Ping aus (einmalig)');},150);
}

}catch(e){ok(false,'Abschnitt 12i abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12j) Swipe-Modus
{
  const mk=m=>{const pr={};[...dEn.keys()].slice(0,8).forEach(k=>{pr[k]={l:1,d:'2000-01-01'};});const X=env({v:2,lang:'id',dayOffset:0,progress:{id:pr},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[]},done:{}},m);X.w.__force='swipe';return X;};
  const allSw=[];
  for(const m of ['de','en']){
    const X=mk(m);X.click(X.$('#start'));X.play();
    const sw=X.swipes||[];allSw.push(...sw);
    if(process.env.SHOW)console.log(JSON.stringify(sw.map(s=>[s.word,s.opts[s.right],s.opts[1-s.right]])));
    ok(sw.length>=3,m+': Swipe-Karten erscheinen ('+sw.length+')');
    ok(sw.every(s=>s.opts.length===2&&s.opts[0]!==s.opts[1]&&s.right>=0),m+': immer 2 verschiedene Vorschläge, genau einer richtig');
    ok(sw.every(s=>s.olang===(s.lang==='id'?m:'id')),m+': Vorschläge in der Zielsprache');
    const D=DICT[m];
    ok(sw.filter(s=>s.lang==='id').every(s=>!!D.get(s.word.toLowerCase())),m+': Karten stammen aus dem Wortschatz');
  }
  ok(allSw.some(s=>s.right===0)&&allSw.some(s=>s.right===1),'Richtige Seite wechselt');
  ok(allSw.some(s=>s.lang==='id')&&allSw.some(s=>s.lang!=='id'),'Beide Richtungen kommen vor');
  {
    const X=mk('de');X.click(X.$('#start'));
    let g=0;while(!X.$('.swb')&&g++<40){const b=X.$('#endnext')||X.$('#wtap')||X.$('.iopt[data-r="1"]:not(:disabled)')||X.$('#go')||X.$('#next')||X.$('#nx');if(!b)break;X.click(b);}
    const bs=X.$$('.swb');
    if(bs.length===2){
      const wrong=bs.find(b=>b.dataset.r==='0');X.click(wrong);
      ok(wrong.classList.contains('no')&&bs.find(b=>b.dataset.r==='1').classList.contains('ok')&&!!X.$('.res.bad')&&!!X.$('#nx'),'Falsch: rot, richtige grün, Ergebnis mit Weiter');
      ok(bs.every(b=>b.disabled),'Nach der Wahl gesperrt');
    }else ok(false,'Swipe-Karte gefunden');
    // Geste: Ziehen nach rechts über die Schwelle wählt die rechte Option
    const Y=mk('de');Y.click(Y.$('#start'));
    g=0;while(!Y.$('.swb')&&g++<40){const b=Y.$('#endnext')||Y.$('#wtap')||Y.$('.iopt[data-r="1"]:not(:disabled)')||Y.$('#go')||Y.$('#next')||Y.$('#nx');if(!b)break;Y.click(b);}
    const card=Y.$('#swcard'),rightBtn=Y.$$('.swb')[1];
    const ev=(n,x)=>{const e=new Y.w.MouseEvent(n,{bubbles:true});Object.defineProperty(e,'clientX',{value:x});Object.defineProperty(e,'pointerId',{value:1});card.dispatchEvent(e);};
    ev('pointerdown',100);ev('pointermove',140);
    ok(rightBtn.classList.contains('lean')&&card.classList.contains('lean'),'Ziehen: rechte Option leuchtet auf');
    ev('pointermove',230);ev('pointerup',230);
    ok(rightBtn.disabled&&!!Y.$('.res'),'Weit genug gezogen = Antwort rechts gewählt');
    ok(!!Y.$('.swstage.answered .res')&&!!Y.$('.swstage #nx')&&!Y.$('.swstage.collapsed'),'Version 154: Ergebnis und Weiter stehen in der Karten-Stelle, nichts klappt zusammen');
    const Z=mk('de');Z.click(Z.$('#start'));
    g=0;while(!Z.$('.swb')&&g++<40){const b=Z.$('#endnext')||Z.$('#wtap')||Z.$('.iopt[data-r="1"]:not(:disabled)')||Z.$('#go')||Z.$('#next')||Z.$('#nx');if(!b)break;Z.click(b);}
    const c2=Z.$('#swcard');
    const ev2=(n,x)=>{const e=new Z.w.MouseEvent(n,{bubbles:true});Object.defineProperty(e,'clientX',{value:x});Object.defineProperty(e,'pointerId',{value:1});c2.dispatchEvent(e);};
    ev2('pointerdown',100);ev2('pointermove',120);ev2('pointerup',120);
    ok(!Z.$('.res')&&c2.style.transform==='','Zu kurz gezogen = Karte springt zurück');
    Z.w.dispatchEvent(new Z.w.Event('x'));Z.d.dispatchEvent(new Z.w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));
    ok(!!Z.$('.res'),'Pfeiltaste links wählt die linke Option');
  }
}

}catch(e){ok(false,'Abschnitt 12j abgebrochen: '+e.message.slice(0,150));}
try{
// ===== 12e) Kulante Rechtschreibung je nach Stufe
{
  const reach=(word,lvl)=>{
    const pre={v:2,lang:'id',dayOffset:0,progress:{id:{}},list:{id:{}},daily:{date:'',newCount:0,extra:0,lt:[],got:[]},done:{}};
    dEn.forEach((v,k)=>{pre.progress.id[k]={l:5,d:'2999-01-01'};});
    pre.progress.id[word]={l:lvl,d:'2000-01-01'};
    const X=env(pre,'de');X.w.Math.random=()=>0.9;X.w.__force='typing';   // Richtung gl→id, Tippen
    X.click(X.$('#start'));
    let g=0;
    while(g++<30){
      if(X.$('#go')){X.click(X.$('#go'));continue;}
      if(X.$('#endnext')){X.click(X.$('#endnext'));continue;}if(X.$('#next')){X.click(X.$('#next'));continue;}
      if(X.$('#qf')){const bw=T(X.$('.bigword'));if(bw===dDe.get(word).gl)break;const e=[...dDe.values()].find(x=>x.gl===bw);X.type(e.id);continue;}
      break;
    }
    return X;
  };
  const tryIt=(word,lvl,typed)=>{
    const X=reach(word,lvl);
    if(!X.$('#qf'))return null;
    const bw=X.$('.bigword');
    if(bw.getAttribute('lang')==='id'){return 'idword';}
    X.type(typed);
    return !!X.$('#next')?(X.$('.res.good')?'ok':'fail'):'retry';
  };
  // gl→id: Lösung "selamat tinggal", getippt "selamat tingal"
  const res={};
  for(const l of [1,3,4,5])res[l]=tryIt('selamat tinggal',l,'selamat tingal');
  console.log('  Tippfehler-Matrix selamat tingal:',JSON.stringify(res));
  ok(res[1]==='ok'&&res[3]==='ok'&&res[5]==='retry','Langes Wort: Tippfehler auf Stufe 1 und 3 akzeptiert, Stufe 5 exakt');
  ok(tryIt('selamat tinggal',5,'Selamat  Tinggal')==='ok','Stufe 5: Groß-/Kleinschreibung und Leerzeichen egal');
  ok(tryIt('lama',1,'sama')==='retry','Anderes echtes Wort (sama statt lama) wird nie als Tippfehler akzeptiert');
  ok(tryIt('ibu',1,'ibi')==='retry','Kurzes Wort: kein Tippfehler erlaubt');
  ok(tryIt('selamat tinggal',1,'xxxxx')==='retry','Ganz falsch bleibt falsch');
}

}catch(e){ok(false,'Abschnitt 12e abgebrochen: '+e.message.slice(0,150));}
setTimeout(()=>{console.log(fails?`\n${fails} Test(s) fehlgeschlagen`:'\nAlle Tests bestanden');process.exit(fails?1:0);},400);
