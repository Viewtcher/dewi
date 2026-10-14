p='/home/claude/kata/app.src.html'
s=open(p,encoding='utf8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,(s.count(old),old[:70])
    s=s.replace(old,new)

# ---- CSS
rep('/* ---- Maskottchen Tokek ---- */','''/* ---- Leben und Lückensatz ---- */
.lives{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--faint)}
.lives svg{width:21px;height:21px;fill:var(--c-pink);filter:drop-shadow(0 0 5px rgba(255,92,157,.45))}
.lives svg.x{fill:var(--line);filter:none;animation:heartpop .4s}
.lives span{margin-left:4px}
@keyframes heartpop{0%{transform:scale(1.5)}100%{transform:scale(1)}}
.sentbox.tr{font:500 18px/1.4 var(--body);color:var(--muted)}
.gapbox{line-height:1.9}
.gap{display:inline-block;min-width:92px;min-height:40px;vertical-align:middle;padding:0 12px;margin:0 2px;border-radius:12px;border:2px dashed var(--c-yellow);color:var(--c-yellow);text-align:center;line-height:36px;font-weight:700}
.gap.bad{border-style:solid;border-color:var(--bad);background:var(--bad-soft);color:var(--text);animation:shake .35s}
.gap.good{border-style:solid;border-color:var(--good);background:var(--good-soft);color:var(--text)}
.tile.wrong{opacity:.35;text-decoration:line-through}
.tile.ok{border-color:var(--good);background:var(--good-soft)}
/* ---- Maskottchen Tokek ---- */''')

# ---- Leben (Herzen)
rep("function dots(n){return [0,1,2].map(i=>`<i class=\"${i<n?'':'x'}\"></i>`).join('')}",
"""const HEART='<path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.4 3.2 5 6.6 5c2 0 3.4 1.1 5.4 3 2-1.9 3.4-3 5.4-3 3.4 0 5.4 3.4 4.1 6.8C19.5 16.4 12 21 12 21z"/>';
const hearts=n=>[0,1,2].map(i=>`<svg viewBox="0 0 24 24" class="${i<n?'':'x'}" aria-hidden="true">${HEART}</svg>`).join('');
const livesHtml=n=>`<div class="lives" id="tries" role="status" aria-label="${n} ${t('Leben')}">${hearts(n)}<span>${t('Leben')}</span></div>`;
const setLives=n=>{const e=$('#tries');if(e){e.innerHTML=hearts(n)+'<span>'+t('Leben')+'</span>';e.setAttribute('aria-label',n+' '+t('Leben'));}};""")
rep("""    <div class="tries" id="tries">${dots(3)}<span>${t('Versuche übrig')}</span></div>""","""    ${livesHtml(3)}""")
rep("""    $('#tries').innerHTML=dots(left)+'<span>'+t('Versuche übrig')+'</span>';""","""    setLives(left);""")

# ---- Auswahl mit 3 Leben
rep("""  sheetBody(`<div class="smain">${kicker(c,'sent')}
    <p class="hint">${t('Was bedeutet das markierte Wort?')}</p>""","""  let lives=3;
  sheetBody(`<div class="smain">${kicker(c,'sent')}${livesHtml(3)}
    <p class="hint">${t('Was bedeutet das markierte Wort?')}</p>""")
rep("""    const i=+b.dataset.i,good=i===right;
    $$('.opt',sheet).forEach(x=>x.disabled=true);
    b.classList.add(good?'ok':'no');
    if(!good)$$('.opt',sheet)[right].classList.add('ok');
    c.ok=c.ok&&good;""","""    const i=+b.dataset.i,good=i===right;
    if(!good){
      lives--;setLives(lives);b.classList.add('no');b.disabled=true;
      if(lives>0){$('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;return;}
    }
    $$('.opt',sheet).forEach(x=>x.disabled=true);
    if(good)b.classList.add('ok');else $$('.opt',sheet)[right].classList.add('ok');
    c.ok=c.ok&&good;""")

# ---- Auswahl: Lückensatz statt Bausteine für Wörter mit Beispielsatz
rep("""function showSentence(){
  const c=S.cur,w=c.w,pair=buildPair(w),s=sentOf(w);
  if(s&&(!pair||Math.random()<.5))return showChoice();
  if(pair)return showBuild(pair);
  nextStep();
}""","""function gapParts(s,w){
  const text=s.id,lt=text.toLowerCase(),lw=w.id.toLowerCase(),isL=ch=>!!ch&&/[a-zäöüß]/i.test(ch);
  let i=lt.indexOf(lw);
  while(i>-1&&(isL(lt[i-1])||isL(lt[i+lw.length])))i=lt.indexOf(lw,i+1);
  return i<0?null:{a:text.slice(0,i),b:text.slice(i+lw.length)};
}
function gapTiles(w){
  const L=curLang(),bad=new Set(gl(w).split(' / ').map(normG)),n=w.id.split(' ').length,out=[w.id];
  const pool=shuffle(L.words.filter(x=>x.k!==w.k&&x.id!==w.id&&!/^[A-Z]/.test(x.id)&&x.id.split(' ').length===n));
  const pri=pool.filter(x=>x.cat===w.cat).concat(pool.filter(x=>x.cat!==w.cat));
  for(const x of pri){
    const g=normG(glFirst(x));
    if(!g||bad.has(g))continue;
    bad.add(g);out.push(x.id);if(out.length>=4)break;
  }
  return shuffle(out);
}
/* Wörter mit Beispielsatz: Lückensatz (nur das Lernwort einsetzen) oder Bedeutungs-Auswahl. Alltagssätze: Bausteine. */
function showSentence(){
  const c=S.cur,w=c.w,s=sentOf(w);
  if(s){
    const gp=gapParts(s,w);
    if(gp&&Math.random()<.5)return showGap(w,s,gp);
    return showChoice();
  }
  const pair=buildPair(w);
  if(pair)return showBuild(pair);
  nextStep();
}
function showGap(w,s,gp){
  const c=S.cur,L=curLang(),tiles=gapTiles(w),lang=L.code.toLowerCase();
  let lives=3,done=false;
  sheetBody(`<div class="smain">${X}${livesHtml(3)}
    <p class="hint">${t('Setze das fehlende Wort ein.')}</p>
    <div class="sentbox tr" lang="${state.ui}">${esc(s.plain)}</div>
    <div class="sentbox gapbox" lang="${lang}">${esc(gp.a)}<span class="gap" id="gap"></span>${esc(gp.b)}</div>
    <div class="bank" id="bank" lang="${lang}">${tiles.map(x=>`<button class="tile" data-r="${x===w.id?1:0}">${esc(x)}</button>`).join('')}</div>
    <div id="exfb"></div></div>`);
  const gap=$('#gap'),B=$('#bank');
  function reveal(good){
    done=true;
    $$('.tile',B).forEach(x=>{x.disabled=true;if(x.dataset.r==='1')x.classList.add('ok');});
    gap.textContent=w.id;gap.className='gap '+(good?'good':'bad');
    c.ok=c.ok&&good;
    $('#exfb').innerHTML=`<div class="res ${good?'good':'bad'}" role="status"><div class="rl">${good?t('Richtig'):t('Nicht ganz')}</div>
      <div class="pair"><span lang="${lang}">${esc(w.id)}</span><em>=</em><span lang="${state.ui}">${esc(gl(w))}</span></div>
      <p class="hint" style="margin-top:8px" lang="${lang}">${hlId(s.id,w.id)}</p></div>
      <button class="btn primary block" id="nx" style="margin-top:12px">${t('Weiter')}</button>`;
    $('#nx').onclick=nextStep;
    try{$('#nx').focus({preventScroll:true});}catch(e){}
    if(good)burst($('.res'),18);
  }
  B.onclick=e=>{
    const b=e.target.closest('button');if(!b||done||b.disabled)return;
    const good=b.dataset.r==='1';
    gap.textContent=b.textContent;
    if(good)return reveal(true);
    lives--;setLives(lives);b.disabled=true;b.classList.add('wrong');
    gap.className='gap bad';
    if(lives<=0)return reveal(false);
    $('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;
    setTimeout(()=>{if(!done){gap.textContent='';gap.className='gap';}},650);
  };
}""")

# ---- Bausteine (nur Alltagssätze): 3 Leben
rep("t('Setze den Satz aus den Bausteinen zusammen. Du hast einen Versuch.')","t('Setze den Satz aus den Bausteinen zusammen. Du hast 3 Leben.')")
rep("""  let ans=[],done=false;
  sheetBody(`<div class="smain">${kicker(c,'sent',t('Bausteine')+' · '+(dir==='id2gl'?toGl():toIdl()))}""","""  let ans=[],done=false,lives=3;
  sheetBody(`<div class="smain">${kicker(c,'sent',t('Bausteine')+' · '+(dir==='id2gl'?toGl():toIdl()))}${livesHtml(3)}""")
rep("""  function paint(){
    A.innerHTML=""","""  function paint(){
    A.classList.remove('bad');if(!done)$('#exfb').innerHTML='';
    A.innerHTML=""")
rep("""    if(done){nextStep();return;}
    done=true;
    const good=ans.map(i=>normId(tiles[i])).join('|')===want;
    c.ok=c.ok&&good;""","""    if(done){nextStep();return;}
    const good=ans.map(i=>normId(tiles[i])).join('|')===want;
    if(!good){
      lives--;setLives(lives);
      if(lives>0){A.classList.add('bad');$('#exfb').innerHTML=`<p class="fb bad" role="status">${t('Nicht ganz. Versuch es nochmal.')}</p>`;return;}
    }
    done=true;
    c.ok=c.ok&&good;""")

# ---- Wörterbuch
rep("const EN={","const EN={\"Leben\": \"Lives\", \"Lückensatz\": \"Fill the gap\", \"Setze das fehlende Wort ein.\": \"Fill in the missing word.\", \"Nicht ganz. Versuch es nochmal.\": \"Not quite. Try again.\", \"Setze den Satz aus den Bausteinen zusammen. Du hast 3 Leben.\": \"Put the sentence together from the blocks. You have 3 lives.\", ")
open(p,'w',encoding='utf8').write(s)
print('ok')
