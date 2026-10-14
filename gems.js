/* ===== Diamanten (Version 91) =====
   Währung für den späteren Shop. state.gems = Kontostand, state.gemShown = was der Zähler zuletzt gezeigt hat.
   Gutschriften landen sofort in state.gems (nichts geht verloren, wenn man eine Round abbricht);
   auf dem Startscreen fliegen dann die Diamanten in die Pille und die Zahl tickt bis zum Kontostand hoch.
   Mittel großzügig: ein normales Cosmetic (ca. 150–200) kostet etwa eine Woche tägliches Spielen. */
const GEMV={daily:10,perfect:5,word:1,survRec:10,survCap:30};
const GEM_MILES={3:10,7:25,14:50,30:100,50:150,100:300,365:1000};
const GEMIC='<svg class="gemic" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10l4 6-9 12L3 9z" fill="#b48cff"/><path d="M3 9h18L12 21z" fill="#7d4dff"/><path d="M7 3l2.5 6L12 3l2.5 6L17 3" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1"/><path d="M3 9h18" stroke="#fff" stroke-opacity=".55" stroke-width="1"/><path d="M9.5 9L12 21l2.5-12" fill="#a77bff"/></svg>';
function gemAdd(n){n=Math.max(0,Math.round(n)||0);if(!n)return 0;state.gems=(state.gems|0)+n;save();return n;}
/* Survival: halb so viele Diamanten wie geschaffte Wörter, +10 für einen neuen Rekord; höchstens 30 pro Tag */
function gemSurvival(words,rec){
  const t0=today(),g=state.gemSurv&&state.gemSurv.d===t0?state.gemSurv:(state.gemSurv={d:t0,n:0});
  const want=Math.floor(words/2)+(rec?GEMV.survRec:0),n=Math.max(0,Math.min(want,GEMV.survCap-g.n));
  g.n+=n;return gemAdd(n);
}
function gemPill(){
  const v=Math.min(state.gemShown|0,state.gems|0);
  return `<button class="gempill" id="gempill" type="button" aria-label="${t('{0} Diamanten',state.gems|0)}"><canvas class="gem" width="44" height="44" aria-hidden="true"></canvas><b>${fmtGem(v)}</b></button>`;
}
function fmtGem(n){return String(n|0).replace(/\B(?=(\d{3})+(?!\d))/g,state.ui==='de'?'.':',');}
/* Zeile auf dem Endscreen: „+18“ mit Aufschlüsselung */
function gemLine(total,parts){
  if(!total)return '';
  const p=parts.filter(x=>x[1]>0).map(x=>`${x[0]} +${x[1]}`).join(' · ');
  return `<div class="gemline">${GEMIC}<b>+${total}</b>${p?`<small>${p}</small>`:''}</div>`;
}
/* Startscreen: Diamanten fliegen in die Pille, die Zahl tickt hoch */
function gemFly(){
  const pill=$('#gempill');if(!pill)return;
  const from=state.gemShown|0,to=state.gems|0;
  if(to<=from){if(to<from){state.gemShown=to;save();}return;}
  state.gemShown=to;save();
  const num=$('b',pill);
  if(reduceMotion()||typeof requestAnimationFrame!=='function'||!document.body.animate){num.textContent=fmtGem(to);return;}
  const pr=pill.getBoundingClientRect(),tx=pr.left+16,ty=pr.top+pr.height/2;
  const src=$('.plan')||$('.mascot'),sr=src?src.getBoundingClientRect():{left:innerWidth/2-20,top:innerHeight/2,width:40,height:40};
  const cx=sr.left+sr.width/2,cy=Math.min(innerHeight*.6,sr.top+sr.height/2);
  const k=Math.min(12,Math.max(3,to-from));let landed=0;
  sfx('gems',150);
  for(let i=0;i<k;i++){
    const el=document.createElement('div');el.className='gemfly';el.innerHTML=GEMIC;
    const a=i/k*Math.PI*2,r=40+((i*37)%30);
    const sx=cx+Math.cos(a)*r,sy=cy+Math.sin(a)*r*.6;
    el.style.left=sx+'px';el.style.top=sy+'px';
    document.body.appendChild(el);
    const d=380+i*70;
    el.animate([
      {transform:'translate(-50%,-50%) scale(.2)',opacity:0},
      {transform:'translate(-50%,-50%) scale(1.15)',opacity:1,offset:.25},
      {transform:`translate(calc(-50% + ${tx-sx}px),calc(-50% + ${ty-sy}px)) scale(.55)`,opacity:.9}
    ],{duration:d+260,delay:i*55,easing:'cubic-bezier(.55,0,.75,.4)',fill:'forwards'}).onfinish=()=>{
      el.remove();landed++;
      const v=Math.round(from+(to-from)*landed/k);num.textContent=fmtGem(v);
      pill.classList.remove('bump');void pill.offsetWidth;pill.classList.add('bump');
      sfx('tick');
    };
  }
}
window.__gem={add:gemAdd,surv:gemSurvival};
