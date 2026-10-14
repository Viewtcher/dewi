/* ---------- Oberfläche ---------- */
let view='home',bookQ='',bookQraw='',bookF='all';
const openCats=new Set();
const app=$('#app'),tabs=$('#tabs'),sheet=$('#sheet');

function applyStatic(){
  document.documentElement.lang=state.ui==='en'?'en':'de';
  $$('.tab',tabs).forEach(b=>{const s=$('.tl',b);if(s)s.textContent=t(s.dataset.k);});
  tabs.setAttribute('aria-label',t('Hauptmenü'));
  sheet.setAttribute('aria-label',t('Abfrage'));
}
function render(){
  applyStatic();
  if(!state.ui){tabs.hidden=true;app.innerHTML=uiView();$$('[data-ui]',app).forEach(b=>b.onclick=()=>{state.ui=b.dataset.ui;save();render();});return;}
  if(!state.lang||!LANGS[state.lang]){tabs.hidden=true;app.innerHTML=langView();$$('[data-lang]',app).forEach(b=>b.onclick=()=>{state.lang=b.dataset.lang;save();view='home';render();});return;}
  tabs.hidden=false;
  $$('.tab',tabs).forEach(b=>{if(b.dataset.v===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(view==='home'){app.innerHTML=homeView();bindHome();}
  else if(view==='book'){app.innerHTML=bookView();bindBook();}
  else{app.innerHTML=settingsView();bindSettings();}
}
function go(v){view=v;render();try{window.scrollTo(0,0);}catch(e){}}
$$('.tab',tabs).forEach(b=>b.onclick=()=>go(b.dataset.v));

const BRAND='<div class="brand"><i></i><span>kata<b>.</b><em>vito</em></span></div>';
function uiView(){
  const sug=detectUi();
  const row=(c,name,sub)=>`<button class="langrow${sug===c?' sug':''}" data-ui="${c}"><span class="code">${c.toUpperCase()}</span><span><b>${name}</b><span class="hint">${sub}</span></span></button>`;
  return `<div class="top">${BRAND}</div>
  <h1>Sprache / Language</h1>
  <p class="hint" style="margin:8px 0 18px">Wähle die Sprache der App. · Choose the app language.</p>
  ${row('de','Deutsch','Oberfläche und Bedeutungen auf Deutsch')}
  ${row('en','English','Interface and meanings in English')}
  <p class="hint" style="margin-top:16px">Du kannst das später in den Einstellungen ändern. · You can change this later in Settings.</p>`;
}
function langView(){
  return `<div class="top">${BRAND}</div>
  <h1>${t('Welche Sprache lernst du?')}</h1>
  <p class="hint" style="margin:8px 0 18px">${t('„Kata“ heißt auf Indonesisch „Wort“. Dein Fortschritt bleibt auf diesem Gerät.')}</p>
  ${Object.values(LANGS).map(L=>`<button class="langrow" data-lang="${L.id}"><span class="code">${L.code}</span><span><b>${esc(t(L.name))}</b><span class="hint">${esc(L.native)} · ${t('{0} Wörter',L.words.length)}</span></span></button>`).join('')}
  <p class="hint" style="margin-top:16px">${t('Weitere Sprachen lassen sich später ergänzen.')}</p>`;
}

function homeView(){
  const L=curLang(),t0=today(),p=plan(),prog=state.progress[L.id]||{};
  const n1=p.due.length,n2=p.fresh.length,n3=p.mand?1:0,total=n1+n2+n3,doneToday=!!state.done[t0],st=streak();
  let week='';
  for(let i=6;i>=0;i--){
    const d=addDays(t0,-i),on=!!state.done[d];
    week+=`<div class="day${on?' on':''}${i===0?' now':''}" style="--dc:${WDCOL[parse(d).getDay()]}" aria-label="${esc(dayName(d,{weekday:'long',day:'numeric',month:'long'}))}: ${on?t('erledigt'):t('offen')}"><i></i><span>${dayName(d,{weekday:'narrow'})}</span></div>`;
  }
  const tomorrow=addDays(t0,1);
  const nTomorrow=L.words.filter(w=>prog[w.k]&&prog[w.k].d===tomorrow).length;
  const unseen=L.words.filter(w=>!prog[w.k]).length;
  let planHtml;
  if(total>0){
    planHtml=`<div class="eyebrow">${t('Heute dran')}</div>
      <div class="nums"><div class="num"><b>${n1}</b><span>${n1===1?t('Wiederholung'):t('Wiederholungen')}</span></div><div class="num"><b>${n2}</b><span>${n2===1?t('neue Vokabel'):t('neue Vokabeln')}</span></div>${n3?'<div class="num"><b>1</b><span>'+t('aus der Fehlerliste')+'</span></div>':''}</div>
      <button class="btn primary block pulse" id="start">${t('Abfrage starten')}</button>`;
  }else{
    planHtml=`<div class="eyebrow">${t('Heute')}</div>
      <h2>${doneToday?t('Für heute geschafft.'):t('Heute ist nichts fällig.')}</h2>
      <p class="hint">${nTomorrow>0?(nTomorrow===1?t('Morgen kommt 1 Wiederholung dran.'):t('Morgen kommen {0} Wiederholungen dran.',nTomorrow)):t('Morgen steht noch keine Wiederholung an.')}</p>
      ${unseen>0?'<div class="btns" style="margin-top:14px"><button class="btn block light" id="extra">'+t('Noch eine neue Vokabel')+'</button></div>':''}`;
  }
  const lw=listWords(),lm=listOf(),dq=daily();
  const listHtml=lw.length?`<section class="card"><div class="eyebrow">${t('Fehlerliste')}</div>
    <p style="margin-top:6px"><b>${lw.length}</b> ${lw.length===1?t('Wort'):t('Wörter')} ${t('zum Wiederholen.')} ${p.mand?t('Eins davon ist heute Pflicht.'):dq.lt.length?t('Die Pflicht für heute ist erledigt.'):t('Ab morgen ist täglich ein Wort daraus Pflicht.')}</p>
    <div class="missed" style="margin-top:12px">${lw.slice(0,8).map(w=>`<span>${esc(w.id)}<em>×${lm[w.k].n}</em></span>`).join('')}${lw.length>8?`<span>+${lw.length-8}</span>`:''}</div>
    ${!p.mand&&p.vol.length?'<div class="btns" style="margin-top:14px"><button class="btn block" id="vol">'+t('Freiwillig weiter üben')+'</button></div>':''}</section>`:'';
  const lv=[0,0,0,0,0,0];let nNew=0;
  L.words.forEach(w=>{const q=prog[w.k];if(!q)nNew++;else lv[q.l]++;});
  const N=L.words.length;
  const parts=[5,4,3,2,1,0].map(n=>({c:LVCOL[n],n:lv[n],l:n===0?t('Fehlerliste'):t('Stufe {0}',n)})).concat([{c:'var(--raised)',n:nNew,l:t('Noch neu'),isNew:true}]);
  const seg=parts.filter(p=>p.n>0).map(p=>`<i style="width:${(p.n/N*100).toFixed(2)}%;background:${p.c}"></i>`).join('');
  const legend=parts.map(p=>`<span><em style="background:${p.c}${p.isNew?';border:1px solid var(--line)':''}"></em>${p.l}<b>${p.n}</b></span>`).join('');
  return `<div class="top">${BRAND}<button class="chip" id="chlang" aria-label="${t('Sprache wechseln')}">${esc(t(L.name))}</button></div>
  <h1>${esc(dayName(t0,{weekday:'long',day:'numeric',month:'long'}))}</h1>
  <section class="card plan">${planHtml}</section>
  ${listHtml}
  <section class="card streakcard${st>0?' on':''}"><div class="streak"><div class="sl">${flameSvg(st,false)}<div><b>${st}</b><small>${st===1?t('Tag'):t('Tage')} ${t('in Folge')}</small></div></div><div class="week">${week}</div></div></section>
  <section class="card"><div class="eyebrow">${t('Fortschritt')}</div>
    <p style="margin-top:6px">${t('{0} von {1} Wörtern begonnen','<b>'+(N-nNew)+'</b>',N)}</p>
    <div class="stack" role="img" aria-label="${parts.map(p=>p.n+' '+p.l).join(', ')}">${seg}</div>
    <div class="legend">${legend}</div></section>`;
}
function bindHome(){
  const s=$('#start');if(s)s.onclick=()=>startSession();
  const v=$('#vol');if(v)v.onclick=()=>startSession('vol');
  const e=$('#extra');if(e)e.onclick=()=>{daily().extra++;save();startSession();};
  $('#chlang').onclick=()=>{state.lang=null;save();render();};
}

function bookView(){
  const L=curLang();
  return `<div class="top"><h1>${t('Vokabelheft')}</h1><span class="hint">${t('{0} Wörter',L.words.length)}</span></div>
  <input id="q" class="field" type="search" placeholder="${t(state.ui==='de'?'Suchen auf Indonesisch oder Deutsch':'Suchen auf Indonesisch oder Englisch')}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" aria-label="${t('Suchen')}" value="${esc(bookQraw)}">
  <div class="chips" role="group" aria-label="${t('Filter')}">${[['all','Alle'],['due','Fällig'],['learned','Gelernt'],['new','Neu'],['err','Fehlerliste']].map(f=>`<button class="pill" data-f="${f[0]}" aria-pressed="${bookF===f[0]}">${t(f[1])}</button>`).join('')}</div>
  <div id="vlist"></div>`;
}
function bindBook(){
  $('#q').oninput=e=>{bookQraw=e.target.value;bookQ=fold(bookQraw.trim());renderList();};
  $$('.pill',app).forEach(b=>b.onclick=()=>{bookF=b.dataset.f;$$('.pill',app).forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.f===bookF)));renderList();});
  $('#vlist').addEventListener('toggle',e=>{
    if(bookQ||bookF!=='all')return;
    const d=e.target;if(!d.dataset||d.dataset.c===undefined)return;
    if(d.open)openCats.add(d.dataset.c);else openCats.delete(d.dataset.c);
  },true);
  renderList();
}
function renderList(){
  const L=curLang(),t0=today(),prog=state.progress[L.id]||{},lm=listOf();
  const groups=L.cats.map(()=>[]);
  L.words.forEach(w=>{
    const pr=prog[w.k];
    if(bookF==='due'&&!(pr&&pr.d<=t0&&!lm[w.k]))return;
    if(bookF==='learned'&&!(pr&&pr.l>=1))return;
    if(bookF==='new'&&pr)return;
    if(bookF==='err'&&!lm[w.k])return;
    if(bookQ&&!(fold(w.id).includes(bookQ)||fold(w.en).includes(bookQ)||fold(w.de).includes(bookQ)))return;
    groups[w.cat].push(w);
  });
  const force=!!bookQ||bookF!=='all';
  let html='';
  groups.forEach((items,ci)=>{
    if(!items.length)return;
    const learned=L.words.filter(w=>w.cat===ci&&prog[w.k]&&prog[w.k].l>=1).length;
    html+=`<details class="cat" style="--cc:${CATCOL[ci%CATCOL.length]}" data-c="${ci}"${force||openCats.has(String(ci))?' open':''}><summary>${esc(t(L.cats[ci][0]))}<span class="cnt">${force?items.length+' '+t('Treffer'):learned+' / '+L.catCount[ci]}</span></summary><ul class="rows">${items.map(w=>{
      const pr=prog[w.k],due=pr&&pr.d<=t0&&!lm[w.k],err=lm[w.k];
      return `<li class="row"><div class="w"><span class="id" lang="${L.code.toLowerCase()}">${esc(w.id)}</span><span class="en" lang="${state.ui}">${esc(gl(w))}</span></div><div class="meta"><div class="pips" style="--pc:${LVCOL[pr?pr.l:0]}" role="img" aria-label="${t('Stufe {0} von 5',pr?pr.l:0)}">${[1,2,3,4,5].map(n=>`<i${pr&&pr.l>=n?' class="f"':''}></i>`).join('')}</div>${err?'<span class="tag err">'+t('Fehlerliste ×{0}',err.n)+'</span>':due?'<span class="tag">'+t('fällig')+'</span>':''}</div></li>`;
    }).join('')}</ul></details>`;
  });
  $('#vlist').innerHTML=html||'<div class="empty">'+t('Nichts gefunden.')+'</div>';
}

function settingsView(){
  const L=curLang(),t0=today();
  return `<div class="top"><h1>${t('Einstellungen')}</h1></div>
  <section class="card set"><div class="eyebrow">${t('App-Sprache')}</div>
    <div class="seg two" role="radiogroup" aria-label="${t('App-Sprache')}">${[['de','Deutsch'],['en','English']].map(u=>`<button role="radio" data-ui="${u[0]}" aria-checked="${state.ui===u[0]}">${u[1]}</button>`).join('')}</div>
    <p class="hint">${t('Gilt für die Oberfläche und für die Bedeutungen der Wörter.')}</p></section>
  <section class="card set"><div><div class="eyebrow">${t('Neue Vokabeln pro Tag')}</div>
    <div class="seg" role="radiogroup" aria-label="${t('Neue Vokabeln pro Tag')}">${[1,2,3,4,5].map(n=>`<button role="radio" data-n="${n}" aria-checked="${state.newPerDay===n}">${n}</button>`).join('')}</div></div>
    <p class="hint">${t('Dazu kommen immer alle fälligen Wiederholungen und ein Wort aus der Fehlerliste.')}</p></section>
  <section class="card set"><div class="eyebrow">${t('Tägliche Erinnerung')}</div>
    <p class="hint">${t('Eine Web-App kann sich nicht selbst melden. Das übernimmt dein iPhone, die Uhrzeit stellst du dort ein.')}</p>
    <details class="how"><summary>${t('So richtest du sie ein')}</summary><ol class="steps">
      <li>${t('Kurzbefehle-App öffnen, Tab „Automation“, „+“, „Tageszeit“.')}</li>
      <li>${t('Uhrzeit wählen, „Täglich“, „Sofort ausführen“.')}</li>
      <li>${t('Aktion „URL öffnen“ mit der Adresse dieser App hinzufügen.')}</li>
      <li>${t('Je nach iOS-Version musst du die Mitteilung antippen oder das iPhone entsperren, damit sich die Seite öffnet.')}</li>
      <li>${t('Alternative: In der Erinnerungen-App eine tägliche Erinnerung mit der Adresse als Link anlegen.')}</li></ol></details></section>
  <section class="card set"><div class="eyebrow">${t('Sicherung')}</div>
    <p class="hint">${t('Kopiere den Text in eine Notiz. Zum Wiederherstellen fügst du ihn unten ein.')}</p>
    <div class="btns"><button class="btn" id="exp">${t('Sicherung erstellen')}</button><button class="btn ghost" id="copy" hidden>${t('Kopieren')}</button></div>
    <textarea class="field" id="expbox" readonly hidden aria-label="${t('Sicherung')}" rows="4"></textarea><div class="flash" id="flash1" role="status"></div>
    <textarea class="field" id="impbox" placeholder="${t('Sicherung hier einfügen')}" aria-label="${t('Sicherung hier einfügen')}" rows="3"></textarea>
    <div class="btns"><button class="btn" id="imp">${t('Sicherung einspielen')}</button></div><div class="flash" id="flash2" role="status"></div></section>
  <section class="card set"><div class="eyebrow">${t('Lernsprache')}</div>
    <div class="btns"><button class="btn" id="chlang2">${t('{0} ändern',esc(t(L.name)))}</button></div></section>
  <section class="card set"><div class="eyebrow">${t('Testen')}</div>
    <p class="hint">${t('Simuliert einen späteren Tag, damit du die Wiederholungen siehst. Aktuelles Datum in der App:')} <b>${esc(dayName(t0,{weekday:'short',day:'numeric',month:'short'}))}</b>${state.dayOffset?' (+'+state.dayOffset+')':''}</p>
    <div class="btns"><button class="btn" id="skip">${t('Einen Tag vorspulen')}</button><button class="btn ghost" id="unskip"${state.dayOffset?'':' disabled'}>${t('Zurück auf heute')}</button></div>
    <div class="btns"><button class="btn" id="reset">${t('Alles zurücksetzen')}</button></div></section>`;
}
function twoStep(btn,armed,fn){
  const orig=btn.textContent;let on=false,timer;
  btn.onclick=()=>{
    if(!on){on=true;btn.textContent=armed;btn.classList.add('danger');timer=setTimeout(()=>{on=false;btn.textContent=orig;btn.classList.remove('danger');},4000);}
    else{clearTimeout(timer);on=false;btn.textContent=orig;btn.classList.remove('danger');fn();}
  };
}
function bindSettings(){
  $$('[data-ui]',app).forEach(b=>b.onclick=()=>{state.ui=b.dataset.ui;save();render();});
  $$('.seg button[data-n]',app).forEach(b=>b.onclick=()=>{state.newPerDay=+b.dataset.n;save();$$('.seg button[data-n]',app).forEach(x=>x.setAttribute('aria-checked',String(x===b)));});
  $('#exp').onclick=()=>{
    const data=JSON.stringify({app:'kata',v:1,exported:new Date().toISOString(),data:{lang:state.lang,ui:state.ui,newPerDay:state.newPerDay,progress:state.progress,list:state.list,daily:state.daily,done:state.done}});
    const box=$('#expbox');box.value=data;box.hidden=false;$('#copy').hidden=false;box.select();$('#flash1').textContent='';
  };
  $('#copy').onclick=()=>{
    const box=$('#expbox');
    const ok=()=>{$('#flash1').textContent=t('Kopiert.');};
    const fallback=()=>{box.select();$('#flash1').textContent=t('Text ist markiert. Jetzt manuell kopieren.');};
    try{navigator.clipboard.writeText(box.value).then(ok,fallback);}catch(e){fallback();}
  };
  twoStep($('#imp'),t('Wirklich ersetzen? Nochmal tippen'),()=>{
    try{
      const o=JSON.parse($('#impbox').value);
      if(!o||o.app!=='kata'||!o.data||typeof o.data.progress!=='object')throw new Error('x');
      state=Object.assign(defaults(),o.data,{dayOffset:0});migrate();save();render();
    }catch(e){$('#flash2').style.color='var(--bad)';$('#flash2').textContent=t('Das ist keine gültige Sicherung.');render_keep();}
  });
  $('#chlang2').onclick=()=>{state.lang=null;save();render();};
  $('#skip').onclick=()=>{state.dayOffset=(state.dayOffset||0)+1;save();render();};
  $('#unskip').onclick=()=>{state.dayOffset=0;save();render();};
  twoStep($('#reset'),t('Wirklich alles löschen? Nochmal tippen'),()=>{state=defaults();migrate();save();view='home';render();});
}
function render_keep(){/* Fehlermeldung bleibt stehen, Ansicht wird nicht neu gebaut */}

/* ---------- Abfrage ---------- */
let S=null;
function startSession(mode){
  const p=plan();
  let items;
  if(mode==='vol')items=p.vol.slice(0,5).map(w=>({w,type:'list'}));
  else{
    items=p.due.map(w=>({w,type:'review'})).concat(p.fresh.map(w=>({w,type:'new'})));
    if(p.mand)items.push({w:p.mand,type:'list'});
  }
  if(!items.length)return;
  S={items,i:0,right:0,wrong:0,missed:[],cleared:[],cur:null,streak0:streak()};
  sheet.hidden=false;document.body.style.overflow='hidden';
  showItem();
}
function closeSheet(){sheet.hidden=true;sheet.innerHTML='';document.body.style.overflow='';S=null;render();}
function sheetBody(inner){
  const pct=S.items.length?Math.round(S.i/S.items.length*100):0;
  sheet.innerHTML=`<div class="sin"><div class="shead"><button class="iconbtn" id="quit" aria-label="${t('Abfrage beenden')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="${S.items.length}" aria-valuenow="${S.i}"><i style="width:${pct}%;--p:${Math.max(pct/100,0.05)}"></i></div><div class="scount">${Math.min(S.i+1,S.items.length)} / ${S.items.length}</div></div>${inner}</div>`;
  $('#quit').onclick=closeSheet;
  sheet.scrollTop=0;
}

/* Schritte pro Wort: neu = Kennenlernen, Satz-Übung, Tippen. Stufe 1-2 und Fehlerliste = Satz-Übung, Tippen. Ab Stufe 3 nur Tippen. */
function stepsFor(type,lvl){
  if(type==='new')return ['intro','sent','type'];
  if(type==='list')return ['sent','type'];
  return lvl<=2?['sent','type']:['type'];
}
function showItem(){
  const it=S.items[S.i];
  if(!it)return showEnd();
  const L=curLang(),key=normG(gl(it.w));
  const same=L.words.filter(x=>normG(gl(x))===key);
  const pr=(state.progress[L.id]||{})[it.w.k];
  const lvl=pr?pr.l:0;
  S.cur={w:it.w,type:it.type,lvl,tries:0,ok:true,steps:stepsFor(it.type,lvl),si:0,dir:Math.random()<.5?'id2gl':'gl2id',accept:same.map(x=>normId(x.id)),alts:same.filter(x=>x.k!==it.w.k).map(x=>x.id)};
  nextStep();
}
function nextStep(){
  const c=S.cur,st=c.steps[c.si++];
  if(st==='intro')showIntro();else if(st==='sent')showSentence();else showQuestion();
}
function kicker(c,step,extra){
  const names={intro:t('Kennenlernen'),sent:t('Satz-Übung'),type:t('Tippen')};
  let base,col;
  if(c.type==='new'){base=t('Neue Vokabel · Phase {0} von {1}',c.steps.indexOf(step)+1,c.steps.length);col='var(--c-violet)';}
  else if(c.type==='list'){base=t('Fehlerliste');col='var(--lv0)';}
  else{base=t('Wiederholung · Stufe {0}',c.lvl);col=LVCOL[c.lvl];}
  return `<div class="kicker" style="--k:${col}">${base} · ${extra||names[step]}</div>`;
}
const toGl=()=>t(state.ui==='de'?'ins Deutsche':'ins Englische');
const toIdl=()=>t('ins Indonesische');

/* Hervorhebung: Wort im Satz finden (nur ganze Wörter) */
function hlId(text,word){
  const lt=text.toLowerCase(),lw=word.toLowerCase(),isL=ch=>!!ch&&/[a-zäöüß]/i.test(ch);
  let i=lt.indexOf(lw);
  while(i>-1&&(isL(lt[i-1])||isL(lt[i+lw.length])))i=lt.indexOf(lw,i+1);
  if(i<0)return esc(text);
  return esc(text.slice(0,i))+'<b>'+esc(text.slice(i,i+lw.length))+'</b>'+esc(text.slice(i+lw.length));
}
function hlSlot(tpl,repl,cls){
  const m=tpl.match(/\[([^\]]+)\]/);
  if(!m)return esc(tpl);
  const i=m.index;
  return esc(tpl.slice(0,i))+`<${cls?'span class="'+cls+'"':'b'}>`+esc(repl==null?m[1]:repl)+`</${cls?'span':'b'}>`+esc(tpl.slice(i+m[0].length));
}

function showIntro(){
  const c=S.cur,w=c.w,L=curLang(),s=sentOf(w);
  const ex=s?`<div class="ex"><div class="xi" lang="${L.code.toLowerCase()}">${hlId(s.id,w.id)}</div><div class="xe" lang="${state.ui}">${hlSlot(s.tpl)}</div></div>`:'';
  sheetBody(`<div class="smain">${kicker(c,'intro')}
    <div class="bigword" lang="${L.code.toLowerCase()}">${esc(w.id)}</div><div class="gloss" lang="${state.ui}">${esc(gl(w))}</div>
    <div class="eyebrow" style="margin-top:4px">${esc(t(L.cats[w.cat][0]))}</div>${ex}
    <p class="hint">${t('Präg dir das Wort und den Satz ein. Gleich wendest du es an.')}</p>
    <button class="btn primary block" id="go">${t('Weiter')}</button></div>`);
  $('#go').onclick=nextStep;
}

/* ---- Satz-Übung ---- */
const PROPER_EXTRA='Indonesia Bali Jakarta Germany Berlin Bandung Medan Vito Dewi Rina Indonesian English Independence Day Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December Indonesien Deutschland Montag Dienstag Mittwoch Donnerstag Freitag Samstag Sonntag Januar Februar März Juni Juli Oktober Dezember'.split(' ');
let PROPER=null,POOL={};
function tokensOf(text){return text.replace(/[.,!?;:"“”]/g,' ').split(/\s+/).filter(Boolean);}
function isProper(tk){
  if(!PROPER){
    PROPER=new Set(PROPER_EXTRA);
    Object.keys(SENT).forEach(k=>{[SENT[k].id,SENT[k].en,SENT[k].de].forEach(tx=>{if(tx)tokensOf(tx).forEach((x,i)=>{if(i>0&&/^[A-ZÄÖÜ]/.test(x))PROPER.add(x);});});});
    Object.values(LANGS).forEach(L=>L.words.forEach(w=>{if(/^[A-Z]/.test(w.id))w.id.split(' ').forEach(x=>PROPER.add(x));}));
  }
  return /^I($|')/.test(tk)||PROPER.has(tk);
}
const tileText=(tk,i)=>(i===0&&!isProper(tk))?tk.charAt(0).toLowerCase()+tk.slice(1):tk;
function tilesOf(text){return tokensOf(text).map(tileText);}
function poolOf(lang){
  if(!POOL[lang]){const set=new Set();Object.values(SENT).forEach(s=>{const tx=lang==='id'?s.id:s[lang];if(tx)tilesOf(tx).forEach(x=>set.add(x));});POOL[lang]=Array.from(set);}
  return POOL[lang];
}
function distractors(target,lang,n){
  const have=new Set(target.map(normId)),out=[];
  for(const x of shuffle(poolOf(lang).slice())){
    const k=normId(x);if(!k||have.has(k))continue;
    have.add(k);out.push(x);if(out.length>=n)break;
  }
  return out;
}
function choiceOptions(w){
  const L=curLang(),right=glFirst(w),bad=new Set(gl(w).split(' / ').map(normG)),out=[right];
  const pool=shuffle(L.words.filter(x=>x.k!==w.k));
  const pri=pool.filter(x=>x.cat===w.cat).concat(pool.filter(x=>x.cat!==w.cat));
  for(const x of pri){
    const g=glFirst(x),n=normG(g);
    if(!n||bad.has(n))continue;
    bad.add(n);out.push(g);if(out.length>=4)break;
  }
  return shuffle(out);
}
/* Quelle für Bausteine: Beispielsatz des Wortes, bei Alltagssätzen der Eintrag selbst */
function buildPair(w){
  const s=sentOf(w);
  const pair=s?{id:s.id,gl:s.plain}:{id:w.id,gl:glFirst(w)};
  return (tokensOf(pair.id).length>=2&&tokensOf(pair.gl).length>=2)?pair:null;
}
function showSentence(){
  const c=S.cur,w=c.w,pair=buildPair(w),s=sentOf(w);
  if(s&&(!pair||Math.random()<.5))return showChoice();
  if(pair)return showBuild(pair);
  nextStep();
}
function showChoice(){
  const c=S.cur,w=c.w,L=curLang(),s=sentOf(w),opts=choiceOptions(w),right=opts.indexOf(glFirst(w));
  sheetBody(`<div class="smain">${kicker(c,'sent')}
    <p class="hint">${t('Was bedeutet das markierte Wort?')}</p>
    <div class="sentbox" lang="${state.ui}">${hlSlot(s.tpl,w.id,'slot')}</div>
    <div class="opts" id="opts">${opts.map((o,i)=>`<button class="opt" data-i="${i}" lang="${state.ui}">${esc(o)}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  $$('.opt',sheet).forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i,good=i===right;
    $$('.opt',sheet).forEach(x=>x.disabled=true);
    b.classList.add(good?'ok':'no');
    if(!good)$$('.opt',sheet)[right].classList.add('ok');
    c.ok=c.ok&&good;
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>
      <p class="hint" style="margin-top:8px" lang="${L.code.toLowerCase()}">${hlId(s.id,w.id)}</p></div>
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  });
}
function showBuild(pair){
  const c=S.cur,w=c.w,L=curLang();
  const dir=Math.random()<.5?'id2gl':'gl2id',toLang=dir==='id2gl'?state.ui:'id';
  const from=dir==='id2gl'?pair.id:pair.gl,to=dir==='id2gl'?pair.gl:pair.id;
  const target=tilesOf(to),want=target.map(normId).join('|');
  const tiles=shuffle(target.concat(distractors(target,toLang,2)));
  let ans=[],done=false;
  sheetBody(`<div class="smain">${kicker(c,'sent',t('Bausteine')+' · '+(dir==='id2gl'?toGl():toIdl()))}
    <p class="hint">${t('Setze den Satz aus den Bausteinen zusammen. Du hast einen Versuch.')}</p>
    <div class="sentbox" lang="${dir==='id2gl'?L.code.toLowerCase():state.ui}">${esc(from)}</div>
    <div class="ans" id="ans2" aria-label="${t('Dein Satz')}" lang="${toLang==='id'?L.code.toLowerCase():toLang}"></div>
    <div class="bank" id="bank" lang="${toLang==='id'?L.code.toLowerCase():toLang}"></div>
    <div id="exfb"></div>
    <button class="btn primary block" id="chk" disabled>${t('Prüfen')}</button></div>`);
  const A=$('#ans2'),B=$('#bank'),chk=$('#chk');
  function paint(){
    A.innerHTML=ans.map(i=>`<button class="tile" data-i="${i}">${esc(tiles[i])}</button>`).join('');
    B.innerHTML=tiles.map((x,i)=>ans.indexOf(i)>-1?`<span class="tile ghost" aria-hidden="true">${esc(x)}</span>`:`<button class="tile" data-i="${i}">${esc(x)}</button>`).join('');
    chk.disabled=!ans.length;
  }
  A.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.splice(ans.indexOf(+b.dataset.i),1);paint();};
  B.onclick=e=>{const b=e.target.closest('button');if(!b||done)return;ans.push(+b.dataset.i);paint();};
  chk.onclick=()=>{
    if(done){nextStep();return;}
    done=true;
    const good=ans.map(i=>normId(tiles[i])).join('|')===want;
    c.ok=c.ok&&good;
    A.classList.add(good?'good':'bad');
    $$('.tile',sheet).forEach(x=>{if(x.tagName==='BUTTON')x.disabled=true;});
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair">${esc(to)}</div></div>`;
    chk.textContent=t('Weiter');chk.disabled=false;
    try{chk.focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  };
  paint();
}

/* ---- Tippen ---- */
function hintFor(c){
  let x=c.dir==='id2gl'?glFirst(c.w):c.w.id;
  x=x.replace(/\([^)]*\)/g,'').trim();
  if(state.ui==='en')x=x.replace(/^\s*to\s+(?=\S)/i,'');
  return x.slice(0,2);
}
function isCorrect(c,val){
  if(c.dir==='id2gl'){const a=normG(val);return !!a&&gl(c.w).split('/').map(normG).indexOf(a)>-1;}
  const a=normId(val);return !!a&&c.accept.indexOf(a)>-1;
}
function dots(n){return [0,1,2].map(i=>`<i class="${i<n?'':'x'}"></i>`).join('')}
function showQuestion(){
  const c=S.cur,w=c.w,L=curLang(),id2gl=c.dir==='id2gl';
  c.tries=0;
  sheetBody(`<div class="smain">${kicker(c,'type',t('Tippen')+' · '+(id2gl?toGl():toIdl()))}
    <div class="bigword" lang="${id2gl?L.code.toLowerCase():state.ui}">${esc(id2gl?w.id:gl(w))}</div>
    <form class="qform" id="qf" autocomplete="off"><div class="inwrap" id="iw"><input class="field" id="ans" type="text" aria-label="${t('Deine Antwort')}" placeholder="${t('Antwort tippen')}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done"></div>
    <button class="btn primary block" type="submit">${t('Prüfen')}</button></form>
    <div class="tries" id="tries">${dots(3)}<span>${t('Versuche übrig')}</span></div>
    <p class="fb" id="fb" role="status" aria-live="polite"></p></div>`);
  const inp=$('#ans'),iw=$('#iw');let keys=0;
  inp.addEventListener('input',()=>{
    const col=PAL[++keys%PAL.length];
    iw.style.setProperty('--pc',col);iw.style.setProperty('--pcs',col+'44');
    iw.classList.toggle('typing',inp.value.length>0);
    iw.classList.remove('pulse');void iw.offsetWidth;iw.classList.add('pulse');
  });
  $('#qf').onsubmit=e=>{
    e.preventDefault();
    const val=inp.value;
    if(!val.trim()){inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');return;}
    c.tries++;
    if(isCorrect(c,val))return finish(true);
    if(c.tries>=3)return finish(false);
    const left=3-c.tries,fb=$('#fb');
    fb.className='fb bad';
    fb.textContent=(left===1?t('Nicht ganz. Noch 1 Versuch.'):t('Nicht ganz. Noch {0} Versuche.',left))+(c.tries===2?t(' Tipp: beginnt mit „{0}“.',hintFor(c)):'');
    $('#tries').innerHTML=dots(left)+'<span>'+t('Versuche übrig')+'</span>';
    inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');inp.select();
  };
  try{inp.focus({preventScroll:true});}catch(e){inp.focus();}
}
function finish(typedOk){
  const c=S.cur,w=c.w,ok=c.ok&&typedOk,type=c.type,r=record(w,ok,type);
  if(ok)S.right++;else S.wrong++;
  if(!ok&&type!=='list')S.missed.push(w);
  if(ok&&type==='list')S.cleared.push(w);
  const L=curLang();
  const alts=c.dir==='gl2id'&&c.alts.length?`<p class="hint" style="margin-top:6px">${t('Auch richtig: {0}',c.alts.map(esc).join(', '))}</p>`:'';
  let when;
  if(ok&&type==='list')when=t('Geschafft. Das Wort verlässt die Fehlerliste und kommt morgen wieder (Stufe 1).');
  else if(ok)when=r.days===1?t('Stufe {0} von 5. Nächste Wiederholung morgen.',r.level):t('Stufe {0} von 5. Nächste Wiederholung in {1} Tagen.',r.level,r.days);
  else if(type==='list')when=t('Das Wort bleibt auf der Fehlerliste (Fehler: {0}).',r.n);
  else when=(typedOk?t('Eine Übung davor war falsch.')+' ':'')+t('Das Wort kommt auf die Fehlerliste.');
  sheetBody(`<div class="smain"><div class="res ${ok?'good':'bad'}" role="status"><div class="rl">${ok?t('Richtig'):t('Leider falsch')}</div>
    <div class="pair"><span lang="${L.code.toLowerCase()}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>${alts}</div>
    <p class="hint">${when}</p><button class="btn primary block" id="next">${t('Weiter')}</button></div>`);
  const n=$('#next');n.onclick=()=>{S.i++;showItem();};
  try{n.focus({preventScroll:true});}catch(e){}
  if(ok)levelUp(c,r);
}
/* Vollbild-Animation bei richtigem Wort: Strahlen, Level-Abzeichen, Stufenleiste */
function levelUp(c,r){
  if(reduceMotion())return;
  const w=c.w,type=c.type,old=$('.lvl');if(old)old.remove();
  const lab=type==='list'?t('Gerettet!'):type==='new'?t('Neues Wort!'):(r.level>c.lvl?t('Level up!'):t('Stufe gehalten'));
  const el=document.createElement('div');el.className='lvl';el.setAttribute('role','status');
  el.innerHTML=`<div class="lvl-rays"></div><div class="lvl-in"><div class="lvl-lab">${lab}</div>
    <div class="lvl-badge"><span>${r.level}</span></div>
    <div class="lvl-pips">${[1,2,3,4,5].map(i=>`<i class="${i<=r.level?'on':''}" style="--d:${300+i*110}ms;--pc:${LVCOL[i]}"></i>`).join('')}</div>
    <div class="lvl-word">${esc(w.id)} = ${esc(gl(w))}</div>
    <div class="lvl-sub">${r.days===1?t('Stufe {0} von 5 · nächste Wiederholung morgen',r.level):t('Stufe {0} von 5 · nächste Wiederholung in {1} Tagen',r.level,r.days)}</div></div>`;
  document.body.appendChild(el);
  let gone=false;
  const close=()=>{if(gone)return;gone=true;el.classList.add('out');setTimeout(()=>el.remove(),300);};
  el.onclick=close;setTimeout(close,1900);
  burst($('.lvl-badge',el),46);
}
function showEnd(){
  const t0=today();
  S.i=S.items.length;
  const p=plan();
  if(!p.due.length&&!p.fresh.length&&!p.mand)state.done[t0]=true;
  Object.keys(state.done).forEach(k=>{if(k<addDays(t0,-120))delete state.done[k];});
  save();
  const total=S.items.length,st=streak();
  const chips=(arr,txt)=>arr.length?`<div><p class="hint" style="margin-bottom:8px">${txt}</p><div class="missed">${arr.map(w=>`<span>${esc(w.id)}</span>`).join('')}</div></div>`:'';
  const grew=st>S.streak0;
  sheetBody(`<div class="smain"><div class="kicker" style="--k:var(--c-pink)">${t('Abfrage beendet')}</div>
    <div class="bigword">${t('{0} von {1}',S.right,total)}</div><p class="hint">${t('komplett richtig beantwortet')}</p>
    <div class="endstreak${grew?' grew':''}${st>0?' on':''}">${flameSvg(st,true)}<div><b>${st}</b>${st===1?t('Tag'):t('Tage')} ${t('in Folge')}<small>${grew?t('Serie verlängert!'):t('Die Serie läuft weiter.')}</small></div></div>
    ${chips(S.cleared,t('Von der Fehlerliste gestrichen:'))}${chips(S.missed,t('Neu auf der Fehlerliste:'))}
    <button class="btn primary block" id="fin">${t('Fertig')}</button></div>`);
  $('#fin').onclick=closeSheet;
  if(grew)burst($('.endstreak'),44);else if(S.right===total)burst($('.bigword'),32);
}
