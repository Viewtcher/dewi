p='app.src.html'
s=open(p,encoding='utf-8').read()
blk=open('data/sound_block.js',encoding='utf-8').read()
def rep(old,new,cnt=1):
    global s
    assert old in s,old[:60]
    s=s.replace(old,new,cnt)
# state
rep("name:'',nameAsked:false});","name:'',nameAsked:false,sound:true,vol:40});")
rep("  if(state.nameAsked===undefined)state.nameAsked=false;\n","  if(state.nameAsked===undefined)state.nameAsked=false;\n  if(state.sound===undefined)state.sound=true;\n  if(typeof state.vol!=='number')state.vol=40;\n")
rep("name:state.name,nameAsked:state.nameAsked}});","name:state.name,nameAsked:state.nameAsked,sound:state.sound,vol:state.vol}});")
# EN
rep('"Fertig": "Done",','"Fertig": "Done", "Sound": "Sound", "An": "On", "Aus": "Off", "Lautstärke": "Volume", "Dewi quatscht, klickt und stempelt. Hier schaltest du alle Töne ein oder aus.": "Dewi chats, clicks and stamps. Switch all sounds on or off here.",')
# Audio-Block vor mascot
rep("function mascot(kind,ctx,cls){",blk+"\nfunction mascot(kind,ctx,cls){")
# Blips im Tippen + Plop
rep("  b.addEventListener('click',all,{once:true});",
"""  b.addEventListener('click',all,{once:true});
  const dwEl=b.parentElement&&b.parentElement.querySelector('.dw'),mm=dwEl&&dwEl.className.match(/m-(\\w+)/),mood=mm?mm[1]:'haughty';
  sfx('pop');let bn=0;""")
rep("    const ch=c.textContent;\n","    const ch=c.textContent;\n    if(/[\\p{L}\\p{N}]/u.test(ch)&&(bn++%2===0))blip(mood,ch);\n")
# Einstellungen
rep("  <section class=\"card set\"><div class=\"eyebrow\">${t('Neue Vokabeln pro Tag')}</div>".replace('<div class="eyebrow">','<div><div class="eyebrow">'),"X") if False else None
card='''  <section class="card set"><div class="eyebrow">${t('Sound')}</div>
    <div class="seg two" role="radiogroup" aria-label="${t('Sound')}">${[[true,t('An')],[false,t('Aus')]].map(u=>`<button role="radio" data-snd="${u[0]}" aria-checked="${(state.sound!==false)===u[0]}">${u[1]}</button>`).join('')}</div>
    <label class="vol"><span>${t('Lautstärke')}</span><input type="range" id="vol" min="0" max="100" step="5" value="${+state.vol||0}" aria-label="${t('Lautstärke')}"></label>
    <p class="hint">${t('Dewi quatscht, klickt und stempelt. Hier schaltest du alle Töne ein oder aus.')}</p></section>
'''
anchor="  <section class=\"card set\"><div><div class=\"eyebrow\">${t('Neue Vokabeln pro Tag')}</div>"
rep(anchor,card+anchor)
rep("  $$('.seg button[data-n]',app).forEach(b=>b.onclick=",
"""  $$('.seg button[data-snd]',app).forEach(b=>b.onclick=()=>{state.sound=b.dataset.snd==='true';save();$$('.seg button[data-snd]',app).forEach(x=>x.setAttribute('aria-checked',String(x===b)));if(state.sound)sfx('pop');});
  $('#vol',app).oninput=e=>{state.vol=+e.target.value;save();const n=Date.now();if(n-SND.last>140){SND.last=n;sfx('pop');}};
  $$('.seg button[data-n]',app).forEach(b=>b.onclick=""")
rep(".seg{display:grid;",".vol{display:flex;align-items:center;gap:12px;margin-top:14px;font-weight:600}.vol input{flex:1;accent-color:#f566b9;min-height:32px}\n.seg{display:grid;")
# Session-Ende + Stempel
rep("  if(grew)burst($('.endstreak'),44);","  sfx(S.right===total?'end_perfect':S.right/total>=.6?'end_good':'end_bad',120);\n  if(grew)sfx('stamp',900);\n  if(grew)burst($('.endstreak'),44);")
# Stempel-Ansicht: Glitzer
rep("  document.body.appendChild(o);document.documentElement.classList.add('sv-open');","  document.body.appendChild(o);document.documentElement.classList.add('sv-open');sfx('glitter',80);")
open(p,'w',encoding='utf-8').write(s)
print('ok')
