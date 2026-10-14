function showIntro(){
  const c=S.cur,w=c.w,L=curLang(),s=sentOf(w);
  const ex=s?`<div class="ex"><div class="xi" lang="${L.code.toLowerCase()}">${hlId(s.id,w.id)}</div><div class="xe" lang="${state.ui}">${hlSlot(s.tpl)}</div></div>`:'';
  sheetBody(`<div class="smain">${kicker(c,'intro')}
    <div class="bigword" lang="${L.code.toLowerCase()}">${esc(w.id)}</div><div class="gloss" lang="${state.ui}">${esc(gl(w))}</div>
    <div class="eyebrow" style="margin-top:4px">${esc(t(L.cats[w.cat][0]))}</div>${ex}
    <p class="hint">${t('Präg dir das Wort und den Satz ein. Gleich wendest du es an.')}</p>
    ${mascot('intro',null,'sm')}
    <button class="btn primary block" id="go">${t('Weiter')}</button></div>`);
  const go=$('#go');let left=Math.ceil((window.__introMs||0)/1000);
  const lab=()=>{go.textContent=left>0?t('Weiter in {0}',left):t('Weiter');};
  if(left>0){
    go.disabled=true;lab();
    const iv=setInterval(()=>{
      if(!go.isConnected){clearInterval(iv);return;}
      left--;lab();
      if(left<=0){clearInterval(iv);go.disabled=false;}
    },1000);
  }
  go.onclick=nextStep;
}

registerModule({id:'intro',name:()=>t('Kennenlernen'),desc:()=>'',solo:false,fallback:null,icon:'',can:()=>true,show:()=>showIntro()});
