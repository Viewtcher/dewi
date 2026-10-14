p='app.src.html'
s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert old in s,old[:70]
    s=s.replace(old,new,1)
# Zustand
rep("sound:true,vol:40});","sound:true,vol:40,roundN:10});")
rep("  if(typeof state.vol!=='number')state.vol=40;\n","  if(typeof state.vol!=='number')state.vol=40;\n  if(typeof state.roundN!=='number')state.roundN=10;\n")
rep("sound:state.sound,vol:state.vol}});","sound:state.sound,vol:state.vol,roundN:state.roundN}});")
# Home-Buttons öffnen die Moduswahl
rep("const v=$('#vol');if(v)v.onclick=()=>startSession('vol');","const v=$('#vol');if(v)v.onclick=()=>openModes('vol');")
rep("const rv=$('#rvol');if(rv)rv.onclick=()=>startSession('rvol');","const rv=$('#rvol');if(rv)rv.onclick=()=>openModes('rvol');")
# startSession
old=s[s.index("function startSession(mode){"):s.index("function closeSheet()")]
new='''function startSession(mode,opt){
  const p=plan(),o=opt||{};
  let items;
  if(mode==='vol')items=p.vol.slice(0,o.n||999).map(w=>({w,type:'list'}));
  else if(mode==='rvol')items=p.revVol.slice(0,o.n||999).map(w=>({w,type:'review'}));
  else{
    items=(p.rev?[{w:p.rev,type:'review'}]:[]).concat(p.fresh.map(w=>({w,type:'new'})));
    if(p.mand)items.push({w:p.mand,type:'list'});
  }
  if(!items.length)return;
  S={items,i:0,right:0,wrong:0,missed:[],cleared:[],cur:null,streak0:streak(),mode:o.mode||'random'};
  sheet.hidden=false;document.body.style.overflow='hidden';
  showItem();
}
'''
s=s.replace(old,new,1)
# Schritte je Modus
rep("steps:stepsFor(it.type,lvl),si:0,","steps:(S.mode&&S.mode!=='random')?(S.mode==='type'?['type']:['sent']):stepsFor(it.type,lvl),si:0,")
rep("  const c=S.cur,st=c.steps[c.si++];\n  if(st==='intro')","  const c=S.cur,st=c.steps[c.si++];\n  if(st===undefined)return finish(true);   // Einzelmodus: nach der Übung ist das Wort fertig\n  if(st==='intro')")
# Kennzeile: „Nur X“
rep("  return `<div class=\"kicker\" style=\"--k:${col}\">${base} · ${extra||names[step]}</div>`;",
"  const only=(S&&S.mode&&S.mode!=='random')?` · <span class=\"only\">${t('Nur {0}',modeLabel(S.mode))}</span>`:'';\n  return `<div class=\"kicker\" style=\"--k:${col}\">${base} · ${extra||names[step]}${only}</div>`;")
# showSentence: Modus beachten
old=s[s.index("function showSentence(){"):s.index("function showGap(w,s,gp){")]
new='''function showSentence(){
  const c=S.cur,w=c.w,s=sentOf(w),m=S.mode||'random';
  if(m==='swipe')return showSwipe();
  if(m==='build'){const pr=buildPair(w);return pr?showBuild(pr):showSwipe();}
  if(m==='gap'){const gp=s&&gapParts(s,w);return gp?showGap(w,s,gp):(s?showChoice():showSwipe());}
  if(m==='choice')return s?showChoice():showSwipe();
  if(Math.random()<(window.__swipeP==null?.3:window.__swipeP))return showSwipe();   // Swipe taucht zufällig auf
  if(s){
    const gp=gapParts(s,w);
    if(gp&&Math.random()<.5)return showGap(w,s,gp);
    return showChoice();
  }
  const pair=buildPair(w);
  if(pair)return showBuild(pair);
  nextStep();
}
'''
s=s.replace(old,new,1)
# Block + CSS + EN
blk=open('data/modes_block.js',encoding='utf-8').read()
rep("function closeSheet()",blk+"\nfunction closeSheet()")
rep('"Fertig": "Done",','"Fertig": "Done", "Wie willst du üben?": "How do you want to practice?", "Zufällig": "Random", "Alle Übungen gemischt: Bausteine, Tippen, Swipe und mehr, wie bisher": "All exercises mixed: building blocks, typing, swipe and more, as before", "Standard": "Default", "Satz aus Wortkacheln zusammensetzen": "Build the sentence from word tiles", "Übersetzung selbst schreiben": "Write the translation yourself", "Zwei Vorschläge, einer stimmt": "Two options, one is right", "Fehlendes Wort im Satz einsetzen": "Fill in the missing word", "Richtige Bedeutung aus vier Optionen": "Pick the right meaning from four options", "Auswahl": "Choice", "Bald mehr": "More soon", "Hören, Paare, Puzzle …": "Listening, pairs, puzzle …", "Wörter pro Runde": "Words per round", "Alle {0}": "All {0}", "Zurück": "Back", "Nur {0}": "Only {0}", "NEU": "NEW",')
css='''.sin.modes{gap:14px}.mh{font-size:26px;font-weight:800;letter-spacing:-.02em;line-height:1.15}
.mrand{position:relative;display:flex;align-items:center;gap:16px;width:100%;text-align:left;border-radius:20px;padding:18px;min-height:96px;background:linear-gradient(120deg,#ff5c9d,#a888ff 50%,#35dcd2);color:#1b0b26;border-bottom:4px solid rgba(0,0,0,.25)}
.mrand b{font-size:22px;display:block;letter-spacing:-.01em}.mrand small{font-size:13px;font-weight:600;opacity:.8;display:block;margin-top:4px;line-height:1.3}
.mrand:active,.mtile:active{transform:translateY(2px)}
.mbadge{position:absolute;right:12px;top:10px;font-size:11px;font-weight:800;background:rgba(27,11,38,.85);color:#fff;border-radius:99px;padding:3px 9px;letter-spacing:.04em}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mtile{position:relative;text-align:left;background:var(--surface);border:1.5px solid var(--line);border-bottom-width:4px;border-radius:18px;padding:14px;min-height:146px}
.mtile svg{display:block;margin-bottom:10px}.mtile b{font-size:17px;display:block}.mtile small{font-size:12.5px;color:var(--muted);display:block;margin-top:3px;line-height:1.3}
.mtile.t1{border-bottom-color:var(--c-yellow)}.mtile.t2{border-bottom-color:var(--c-cyan)}.mtile.t3{border-bottom-color:#f566b9}.mtile.t4{border-bottom-color:#ff8a3d}.mtile.t5{border-bottom-color:var(--good)}
.mtile.soon{opacity:.5;border-style:dashed;border-bottom-style:dashed}
.mnew{position:absolute;right:10px;top:10px;font-size:10px;font-weight:800;color:#2a0c20;background:var(--c-yellow);border-radius:99px;padding:2px 8px}
.seg.three{grid-template-columns:repeat(3,1fr)}
.kicker .only{color:#f566b9}
'''
rep(".seg.two{grid-template-columns:1fr 1fr}",".seg.two{grid-template-columns:1fr 1fr}\n"+css)
open(p,'w',encoding='utf-8').write(s)
print('ok')
