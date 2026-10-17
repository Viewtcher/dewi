/* ===== Modul Pads (Version 161): Farben lernen auf leuchtenden Musik-Pads =====
   Oben steht das gesuchte Farbwort (nur geschrieben), darunter ein Pad-Raster wie ein Musik-Controller.
   Man tippt das Pad in der richtigen Farbe. Jedes Pad spielt einen weichen Synth-Ton aus derselben Tonleiter
   (jede Reihenfolge klingt harmonisch) und leuchtet beim Antippen auf.
   - Kommt nur, wenn das aktuelle Wort eine Farbe ist. Zählt für die Stufen wie jedes Modul.
   - Schwierigkeit nach Stufe des Wortes: Stufe 0–1: 2×2 Pads, eine Farbe; 2–3: 3×3, eine Farbe;
     Stufe 4: 3×3, zwei Farben hintereinander; Stufe 5: 3×3, drei. Die weiteren Farben der Folge
     sind andere bekannte Farbwörter (gibt es zu wenige, wird die Folge kürzer).
   - Die übrigen Pads zeigen beliebige andere Farben des Kurses (man muss nur die gesuchten kennen).
   - Fehler: Daily Round 1 frei, Survival keiner (TRIES.pads). Ein Fehler bricht die Folge nicht ab. */

const PAD_COL={red:'#ff3d55',blue:'#3a78ff',green:'#2fd16a',yellow:'#ffd52e',black:'#2b2b36',white:'#f4f4fb',
  brown:'#9c5a2c',gray:'#9a9aaa',orange:'#ff8f1f',purple:'#a15cff',pink:'#ff7cc6'};
const PAD_NOTE=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51,1567.98];   // C-Dur-Pentatonik, aufsteigend
/* Farbe eines Wortes über die englische Bedeutung. Im Indonesisch-Kurs ist „jeruk = orange“ die Frucht,
   die Farbe heißt dort „orange (color)“; in Englisch/Deutsch gibt es Orange nur als Frucht. */
function padKey(w){
  if(!w)return null;
  let e=String(state.lang==='en'?w.id:w.en).toLowerCase().trim();
  if(e==='orange (color)')return 'orange';
  if(e==='grey')e='gray';
  return e!=='orange'&&PAD_COL[e]?e:null;
}
const padKnown=w=>!!(state.progress[state.lang]||{})[w.k];

function padsData(w,lvl){
  const L=curLang(),key=padKey(w);if(!key)return null;
  const byCol={};L.words.forEach(x=>{const k=padKey(x);if(k&&!byCol[k])byCol[k]=x;});byCol[key]=w;
  const known=shuffle(Object.keys(byCol).filter(k=>k!==key&&padKnown(byCol[k])));
  lvl=lvl|0;
  const grid=lvl<=1?4:9;
  const want=lvl>=5?3:lvl>=4?2:1;
  const seq=[key].concat(known.slice(0,want-1));
  const order=window.__padSeq?window.__padSeq.slice():shuffle(seq.slice());   // das aktuelle Wort steht nicht immer vorne (__padSeq nur für Tests)
  const all=Object.keys(byCol);
  const others=shuffle(all.filter(k=>order.indexOf(k)<0));
  const pads=shuffle(order.concat(others).slice(0,Math.min(grid,all.length)));
  return {key,grid,seq:order,pads,byCol};
}

/* weicher Synth-Ton: Dreieck mit leiser Oktave darüber, schneller Anschlag, langes Ausklingen */
function padTone(i){
  if(!soundOn())return;
  const c=ac();if(!c)return;
  const f=PAD_NOTE[i%PAD_NOTE.length];
  tone(c,f,0,.55,{type:'triangle',v:.26});tone(c,f*2,0,.32,{type:'sine',v:.07});tone(c,f/2,0,.4,{type:'sine',v:.08});
}

function showPads(w){
  const c=S.cur,L=curLang(),D=padsData(w,c.lvl),lc=L.code.toLowerCase();
  const tries=triesFor('pads');
  const Z={D,i:0,miss:0,state:'play'};c.pd=Z;
  const name=k=>D.byCol[k].id;
  sheetBody(`<div class="smain pdm">${kicker(c,'pads')}${roundLives()}
    <div class="pdtask">${helpBtn('pads')}<div class="pdseq" lang="${lc}">${D.seq.map((k,i)=>`<span class="pdw${i===0?' cur':''}" data-i="${i}">${esc(name(k))}</span>`).join('<i class="pdar" aria-hidden="true">→</i>')}</div></div>
    <div class="pdbox"><div class="pdgrid g${D.grid}">${D.pads.map((k,i)=>`<div class="pad" role="button" tabindex="0" data-c="${k}" data-n="${i}" style="--pc:${PAD_COL[k]}" aria-label="${t('Pad {0}',i+1)}"><i class="pdnum" aria-hidden="true">${i+1}</i></div>`).join('')}</div></div>
    <div id="exfb"></div></div>`);
  const pads=$$('.pad',sheet),words=$$('.pdw',sheet);
  const flash=(p,cls)=>{p.classList.remove('lit','no');void p.offsetWidth;p.classList.add(cls);setTimeout(()=>p.classList.remove(cls),cls==='no'?420:360);};
  function hit(p){
    if(Z.state!=='play')return;
    const k=p.dataset.c,want=D.seq[Z.i];
    padTone(+p.dataset.n);
    if(k===want){
      flash(p,'lit');haptic([12]);
      words[Z.i].classList.remove('cur');words[Z.i].classList.add('ok');
      Z.i++;
      if(Z.i>=D.seq.length)return finish(true);
      words[Z.i].classList.add('cur');
      return;
    }
    Z.miss++;flash(p,'no');sfx('rbad',90);haptic([40,30,40]);
    if(Z.miss>=tries)finish(false);
  }
  function finish(win){
    if(Z.state==='over')return;Z.state='over';
    c.ok=c.ok&&win;settleCard();
    pads.forEach(p=>{p.setAttribute('aria-disabled','true');if(!win&&D.seq.indexOf(p.dataset.c)>=0)p.classList.add('show');});
    if(!win)words.forEach(x=>{if(!x.classList.contains('ok'))x.classList.add('no');});
    if(win){setTimeout(()=>{sfx('rwin');burst($('.pdbox'),18);},120);haptic([20,30,20]);}
    else sfx('end_bad');
    $('#exfb').innerHTML=`<div class="res ${win?'good':'bad'}" role="status"><div class="rl">${win?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair pdres" lang="${lc}">${D.seq.map(k=>`<span><i style="--pc:${PAD_COL[k]}"></i>${esc(name(k))}</span>`).join('')}</div></div>${resultNote(win)}
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
  }
  pads.forEach(p=>{
    p.addEventListener('pointerdown',e=>{e.preventDefault();hit(p);});
    p.addEventListener('click',e=>{if(e.detail===0)hit(p);});   // Tastatur / Tests
    p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hit(p);}});
  });
  c.padHit=k=>{const p=pads.find(x=>x.dataset.c===k);if(p)hit(p);};   // Testhaken
}

registerModule({id:'pads',name:()=>t('Pads'),desc:()=>t('Farbe lesen, leuchtendes Pad drücken'),tone:'t4',solo:true,isNew:true,fallback:'choice',
  icon:'<svg width="44" height="40" viewBox="0 0 44 40" aria-hidden="true"><rect x="2" y="1" width="40" height="38" rx="5" fill="#141018" stroke="#c9c9d6" stroke-width="2"/><rect x="7" y="6" width="14" height="13" rx="3" fill="#a15cff"/><rect x="23" y="6" width="14" height="13" rx="3" fill="#ff7cc6"/><rect x="7" y="21" width="14" height="13" rx="3" fill="#2fd16a"/><rect x="23" y="21" width="14" height="13" rx="3" fill="#ffd52e"/><circle cx="14" cy="12" r="4" fill="#fff" opacity=".45"/></svg>',
  can:w=>!!padKey(w),show:w=>showPads(w)});
