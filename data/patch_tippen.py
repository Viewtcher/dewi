p='app.src.html'
s=open(p,encoding='utf-8').read()
old='''<div class="bubble" role="status">${esc(q.text)}</div></div>`;
}'''
new='''<div class="bubble" role="status" data-ty="1" aria-label="${esc(q.text)}"><span aria-hidden="true">${Array.from(q.text).map(ch=>`<span class="c">${esc(ch)}</span>`).join('')}</span></div></div>`;
}
/* Schreibmaschine à la Animal Crossing: Zeichen für Zeichen, an Satzzeichen kurze Pause, Tippen auf die Blase zeigt alles */
function typeBubble(b){
  b.removeAttribute('data-ty');
  const cs=$$('.c',b);let i=0,tm=0;
  const all=()=>{clearTimeout(tm);cs.forEach(c=>c.classList.add('on'));};
  if(reduceMotion()||typeof setTimeout!=='function'){all();return;}
  b.addEventListener('click',all,{once:true});
  (function step(){
    if(!b.isConnected){return;}
    if(i>=cs.length)return;
    const c=cs[i++];c.classList.add('on');
    const ch=c.textContent;
    tm=setTimeout(step,/[.!?…]/.test(ch)?190:/[,;:–—]/.test(ch)?110:ch===' '?18:28);
  })();
}
try{
  const scanTy=()=>$$('.bubble[data-ty]').forEach(typeBubble);
  new MutationObserver(scanTy).observe(document.body,{childList:true,subtree:true});
  scanTy();
}catch(e){}'''
assert old in s
s=s.replace(old,new,1)
a=".bubble{position:relative;"
assert a in s
s=s.replace(a,".bubble .c{visibility:hidden}.bubble .c.on{visibility:visible}\n"+a,1)
open(p,'w',encoding='utf-8').write(s)
