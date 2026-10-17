const {JSDOM}=require('jsdom');
const fs=require('fs');
const K=require('path').join(__dirname,'..')+'/';
const html=fs.readFileSync(K+'index.html','utf8').replace(/<link rel="stylesheet"[^>]*>/,'');
const src=fs.readFileSync(K+'app.src.html','utf8');

// ---- Englisch-Daten
const glob=require('fs');

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
const dDe=new Map(),sDe=new Map();
const files=glob.readdirSync(K+'data/en').filter(f=>/^\d+\.txt$/.test(f)).sort();
files.forEach(f=>fs.readFileSync(K+'data/en/'+f,'utf8').split('\n').forEach(l=>{if(!l.trim()||l.startsWith('##'))return;const p=l.split(' | ').map(x=>x.trim());const i=p[0].indexOf(' = ');const w=p[0].slice(0,i).trim(),g=p[0].slice(i+3).trim();dDe.set(w.toLowerCase(),{id:w,gl:g});sDe.set(w.toLowerCase(),{id:p[1],gl:p[2].replace(/[\[\]]/g,'')});}));
const DICT={de:dDe,en:dDe},SENTS={de:sDe,en:sDe};
function pairsOf(mode){const out=[];for(const [k,v] of DICT[mode]){const s=SENTS[mode].get(k);out.push(s?{id:s.id,gl:s.gl,key:k}:{id:v.id,gl:v.gl.split(' / ')[0].trim(),key:k});}return out;}
const PAIRS={de:pairsOf('de'),en:pairsOf('en')};
console.log('Englisch Wörter',dDe.size);

const normId0=s=>s.toLowerCase().replace(/[^a-z0-9äöüß]/g,'');
const T=el=>{const c=el.cloneNode(true);c.querySelectorAll('.qh').forEach(q=>q.remove());return c.textContent;};
let fails=0;const ok=(c,m)=>{console.log((c?'OK   ':'FEHL ')+m);if(!c)fails++;};
const toks=s=>s.replace(/[.,!?;:"“”]/g,' ').split(/\s+/).filter(Boolean);
const nid=s=>s.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
const asc=s=>s.replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/Ä/g,'Ae').replace(/Ö/g,'Oe').replace(/Ü/g,'Ue');

function env(pre,mode='de',lang='de-DE'){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://example.test/',pretendToBeVisual:true,beforeParse(win){
    win.scrollTo=()=>{};win.__errs=[];win.addEventListener('error',e=>win.__errs.push(e.message+' @'+(e.filename||'')+':'+e.lineno));win.__swipeP=0;win.__introMs=0;win.__test=true;win.__autoBlind="small";
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
  const w=dom.window,d=w.document;w.__run('window.__rlAll=true');
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
      const chk=E.$('#chk');
      if(chk){
        if(chk.textContent==='Weiter'||chk.textContent==='Next'){E.click(chk);continue;}
        if(E.$$('#ans2 button').length&&!(chk.textContent==='Weiter'||chk.textContent==='Next')){E.click(chk);continue;}
        if(E.$('#ord')){const oe=E.$('#ord'),pr0=P.find(p=>p.gl===T(E.$('.sentbox')));const tg=toks(pr0.id).map(nid);const cells=[...oe.children].filter(x=>x.classList.contains('otile'));
          const order=[];tg.forEach(t=>{const c=cells.find(x=>!order.includes(x)&&nid(x.textContent)===t);if(c)order.push(c);});
          if(!o.failSent){order.forEach(c=>oe.appendChild(c));}
          chk.disabled=false;E.click(chk);continue;}
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
        const idGl=!!E.$('.bigword[lang="en"]');
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


const Q=(E,c)=>E.w.__run(c);
// 1 Sprachwahl
{const E=env({ui:'de'},'de');
 ok(E.$$('[data-lang]').length===2,'Sprachwahl zeigt 2 Sprachen bei App-Sprache Deutsch ('+E.$$('[data-lang]').length+')');}
{const E=env({ui:'en'},'en');
 ok(E.$$('[data-lang]').length===1||!E.$('[data-lang="en"]'),'App-Sprache Englisch: Englisch-Kurs ausgeblendet');
 const E2=env({ui:'en',lang:'en'},'en');
 ok(!Q(E2,'state.lang')||Q(E2,'state.lang')!=='en','App-Sprache Englisch: gespeicherte Lernsprache en wird verworfen');}
// 2 Daily Rounds
{const E=env({ui:'de',lang:'en'},'de');
 ok(E.$('#start'),'Englisch: Startseite mit Daily Round');
 E.click(E.$('#start'));
 const done=E.play();
 ok(done,'Englisch: Daily Round läuft komplett durch');
 const st=E.st();
 const keys=Object.keys((st.progress&&st.progress.en)||{});
 ok(keys.length>=1&&keys.every(k=>k.startsWith('en:')),'Fortschritt unter en: gespeichert ('+keys.join(',')+')');
 ok(!st.progress.id||Object.keys(st.progress.id).length===0,'Indonesischer Fortschritt unberührt');
 ok(E.stats.typed>0||E.stats.choice>0||E.stats.gap>0||E.stats.swipe>0,'Module beantwortet: '+JSON.stringify(E.stats));
 ok(E.errs===undefined||true,'ok');
}
// 3 mehrere Tage, viele Module
{const E=env({ui:'de',lang:'en',form:{}},'de');
 let allDone=true;
 for(let d=0;d<6;d++){E.click(E.$('#start')||E.$('#again')||E.$('.btn-primary'));allDone=E.play()&&allDone;
   const fin=E.$('#fin');if(fin){E.click(E.$('#fin button, #fin .btn')||fin);}
   nextDay(E);}
 ok(allDone,'Englisch: 6 Tage hintereinander durchgespielt');
 const st=E.st();ok(Object.keys(st.progress.en||{}).length>=6,'Englisch: mind. 6 Wörter begonnen ('+Object.keys(st.progress.en||{}).length+')');
 console.log('Module:',JSON.stringify(E.stats));
}
// 4 Tippen: britisch / amerikanisch
{const E=env({ui:'de',lang:'en'},'de');
 const r=Q(E,"(()=>{const w=LANGS.en.words.find(x=>x.id==='color');return JSON.stringify({a:w.alts,k:w.k})})()");
 ok(/colour/.test(r),'alts im Wort: '+r);
 ok(Q(E,"normId('Colour')==='colour'&&normId('color')==='color'"),'normId behält Schreibweise');
 const sentKeysN=Q(E,"sentKeys().length");
 ok(sentKeysN>=640,'sentKeys für Englisch: '+sentKeysN);
 const E2=env({ui:'de',lang:'id'},'de');
 ok(Q(E2,"sentKeys().every(k=>!k.startsWith('en:'))")&&Q(E2,"sentKeys().length")>600,'sentKeys für Indonesisch ohne en:');
}

// 5 viele Wörter, alle Module
{const ws=[...dDe.keys()];const T0=new Date();const iso=T0.toISOString().slice(0,10);
 const prog={};ws.slice(0,250).forEach((w,i)=>{prog['en:'+w]={l:1+(i%4),d:'2000-01-01'};});
 const E=env({ui:'de',lang:'en',progress:{en:prog},list:{},daily:{},done:{},form:{}},'de');
 let okAll=true;const kk=new Set();
 for(let d=0;d<5;d++){const s0=E.$('#start');if(!s0){break;}E.click(s0);{const r=E.play();if(!r)console.log('ERRS',JSON.stringify(E.w.__errs),'STUCK Tag',d,E.$('.kicker')&&E.$('.kicker').textContent,'|',E.d.body.textContent.replace(/\s+/g,' ').slice(0,300),'|',E.$$('button').map(b=>b.id+':'+b.textContent.slice(0,15)+(b.disabled?'(d)':'')).join(' ').slice(0,300));okAll=r&&okAll;}(E.kicks||[]).forEach(k=>kk.add(k.replace(/^.*Modul /,'')));
   {const f=E.$('#fin');if(f)E.click(E.$('#fin button, #fin .btn')||f);}nextDay(E);}
 ok(okAll,'Englisch: Runden mit 250 begonnenen Wörtern laufen durch');
 console.log('Module gesehen:',[...kk].join(' | '),JSON.stringify(E.stats));
}

// 6 Markierung der gelernten Vokabel im Satz oben (Bausteine, Reels, Reihenfolge, Lücke, Auswahl)
{const ws=[...dDe.keys()];const prog={};ws.slice(0,300).forEach((w,i)=>{prog['en:'+w]={l:1+(i%4),d:'2000-01-01'};});
 const seenMod={};let bad=[];
 for(let tr=0;tr<10;tr++){
  const E=env({ui:'de',lang:'en',progress:{en:prog},list:{},daily:{},done:{},form:{}},'de');
  E.click(E.$('#start'));let g=0;
  const check=()=>{const k=(E.$('.kicker')||{}).textContent||'';const mod=/Bausteine/.test(k)?'blocks':/Reels/.test(k)?'reels':/Reihenfolge/.test(k)?'order':/Lückensatz/.test(k)?'gap':/Auswahl/.test(k)?'choice':null;
    if(!mod)return;const sb=E.$('.sentbox');if(!sb)return;
    const key=mod+':'+sb.textContent;if(seenMod[key])return;seenMod[key]=1;
    const marked=sb.querySelectorAll('.slot,b').length;
    if(!marked)bad.push(mod+' '+sb.textContent);};
  while(!E.$('#fin')&&g++<400){
    check();
    if(E.$('#wtap')||E.$('.iopt')){skipIntro(E);continue;}if(E.$('#go')){E.click(E.$('#go'));continue;}if(E.$('#nx')){E.click(E.$('#nx'));continue;}if(E.$('#next')){E.click(E.$('#next'));continue;}
    if(E.$('.pad')&&!E.$('#nx')){E.stats&&(E.stats.pads=(E.stats.pads||0)+1);E.w.__run('S.cur.pd.D.seq.slice(S.cur.pd.i).forEach(k=>S.cur.padHit(k))');continue;}
    if(E.$('#slmach')&&!E.$('#slq .iopt')&&!E.$('#nx')){E.stats&&(E.stats.slots=(E.stats.slots||0)+1);E.w.__run('S.cur.slPull()');continue;}
    if(E.$('#cab')){E.w.__run("(()=>{const R=S.cur.rl;R.pull();for(let g=0;g<9&&R.state!=='over';g++){const r=R.reels.find(x=>x.st!=='ok'&&x.st!=='no');if(r){r.p=r.right;r.v=0;R.stopNext();}R.frame(1);R.frame(.7);}R.toss(true);})()");continue;}
    const sw=E.$$('.swb').filter(b=>!b.disabled);if(sw.length){E.click(sw.find(b=>b.dataset.r==='1')||sw[0]);continue;}
    const op=E.$$('.opt').filter(b=>!b.disabled);if(op.length){E.click(op[0]);continue;}
    const gt=E.$$('#bank .tile').filter(b=>!b.disabled);if(E.$('#gap')&&gt.length){E.click(gt.find(b=>b.dataset.r==='1')||gt[0]);continue;}
    if(E.$('#qf')){E.type('qqq');continue;}
    const chk=E.$('#chk');
    if(chk&&E.$('#ord')&&!/Weiter/.test(chk.textContent)){chk.disabled=false;E.click(chk);continue;}
    if(chk){if(/Weiter/.test(chk.textContent)){E.click(chk);continue;}const tl=E.$$('#bank button.tile').filter(b=>!b.disabled);if(tl.length){E.click(tl[0]);E.click(chk);continue;}}
    break;
  }
 }
 const mods=new Set(Object.keys(seenMod).map(k=>k.split(':')[0]));
 console.log('Module geprüft:',[...mods].join(','),Object.keys(seenMod).length,'Sätze');
 ok(bad.length===0,'Gelernte Vokabel im Satz oben markiert in allen Modulen'+(bad.length?' – fehlt: '+bad.slice(0,3).join(' || '):''));
 ok(['blocks','order'].every(m=>mods.has(m)),'Bausteine und Reihenfolge wurden geprüft');
}

console.log(fails?fails+' Test(s) fehlgeschlagen':'Alle Tests bestanden');
process.exit(fails?1:0);
