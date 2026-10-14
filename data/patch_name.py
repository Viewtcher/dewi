import re
p='app.src.html'
s=open(p,encoding='utf-8').read()

# ---------- Zustand
s=s.replace("done:{},quips:true,form:[],stamps:{}});","done:{},quips:true,form:[],stamps:{},name:'',nameAsked:false});",1)
s=s.replace("  if(!state.stamps||typeof state.stamps!=='object')state.stamps={};\n","  if(!state.stamps||typeof state.stamps!=='object')state.stamps={};\n  if(typeof state.name!=='string')state.name='';\n  if(state.nameAsked===undefined)state.nameAsked=false;\n",1)
s=s.replace("quips:state.quips,form:state.form,stamps:state.stamps}});","quips:state.quips,form:state.form,stamps:state.stamps,name:state.name,nameAsked:state.nameAsked}});",1)
assert "name:state.name" in s and "nameAsked:false" in s

# ---------- Sprüche mit {who}
who=r'''
/* Anrede: Name (wenn gesetzt, meist) oder Spitzname; Sprüche mit {who} kommen zusätzlich in jede Kategorie */
const NICKS={de:['Choom','Chief','Digga','Boss','Bestie','Meister'],en:['Choom','Chief','Bro','Boss','Bestie','Champ']};
const WHO_QUIPS={
de:{
name:["Okay, wie soll ich dich nennen? Ich merk's mir. Vielleicht.","Dein Name? Dann kann ich dich endlich richtig ansprechen. Oder anbrüllen."],
pick:["Hi {who}. Such dir eine Sprache aus, ich seh alles.","{who}, auf geht's. Und bitte nicht random klicken."],
lang:["{who}, such dir was aus. Ich bewerte deinen Geschmack sowieso."],
home_new:["{who}, dein erstes Wort wartet. Zeig mal, ob du Bock hast."],
home_due:{hi:["{who}, schon wieder da? Okay, du lieferst."],mid:["Na, {who}? Deine Vokabeln warten.","Los, {who}, ein paar Minuten reichen."],lo:["{who}, die Wörter weinen schon. Hilf ihnen."]},
home_done:{hi:["Hm, not bad, {who}. Du kannst ja doch was."],mid:["Fertig, {who}. Mid, aber fertig."],lo:["{who}, du hast das echt durchgezogen? Plot Twist."]},
home_sleep:["{who}, dein Streak ist tot. Ich fast auch, vor Langeweile."],
home_list:["{who}, {n} Wörter auf der Fehlerliste. Ich sag nix. Ich starre nur."],
home_streak:["{s} Tage, {who}! Okay, sheesh. Kurz beeindruckt."],
settings:["{who}, fass nur an, was du verstehst."],
intro:["Merk dir das, {who}. Ich frage gleich."],
ok:{hi:["Wie erwartet, {who}.","Clean, {who}."],mid:["Richtig, {who}. Geht doch."],lo:["Wait, richtig, {who}?! Okay, ich nehm's zurück."]},
ok_try2:["Beim zweiten Mal, {who}. Zählt trotzdem."],
ok_run:["{n} in Folge, {who}. Okay, du bist kurz kein NPC."],
bad:{hi:["Ey {who}, was war das? Du kannst das besser."],mid:["Falsch, {who}. Skill Issue, aber heilbar."],lo:["{who}, das war so mid, dass es wehgetan hat."]},
bad_rare:["{who}, das hattest du auf Stufe {lv}! Dein Ernst?"],
bad_again:["Zum {n}. Mal, {who}. Ich nehm's persönlich."],
lvl_up:["Level up, {who}! Respekt. Kurz."],
lvl_new:["Neues Wort, {who}. Bau keinen Mist damit."],
lvl_saved:["Gerettet, {who}! Redemption Arc."],
lvl_hold:["Gehalten, {who}. Solide. Langweilig."],
end_perfect:["Alles richtig, {who}. Okay, das war schon slay."],
end_good:["Ganz ordentlich, {who}."],
end_bad:["Naja, {who}. Morgen nochmal, aber mit Gehirn."]
},
en:{
name:["Okay, what should I call you? I'll remember it. Maybe.","Your name? Then I can finally address you properly. Or yell at you."],
pick:["Hi {who}. Pick a language, I see everything.","{who}, let's go. And please don't click randomly."],
lang:["{who}, pick something. I'll judge your taste anyway."],
home_new:["{who}, your first word is waiting. Show me if you're even motivated."],
home_due:{hi:["{who}, back already? Okay, you deliver."],mid:["Well, {who}? Your words are waiting.","Come on, {who}, a few minutes are enough."],lo:["{who}, the words are already crying. Help them."]},
home_done:{hi:["Hm, not bad, {who}. You actually can do something."],mid:["Done, {who}. Mid, but done."],lo:["{who}, you actually pulled it off? Plot twist."]},
home_sleep:["{who}, your streak is dead. I almost am too, from boredom."],
home_list:["{who}, {n} words on the error list. I'm not saying anything. I'm just staring."],
home_streak:["{s} days, {who}! Okay, sheesh. Briefly impressed."],
settings:["{who}, only touch what you understand."],
intro:["Remember this, {who}. I'll ask in a second."],
ok:{hi:["As expected, {who}.","Clean, {who}."],mid:["Correct, {who}. See, it works."],lo:["Wait, correct, {who}?! Okay, I take it back."]},
ok_try2:["On the second go, {who}. Still counts."],
ok_run:["{n} in a row, {who}. Okay, you're briefly not an NPC."],
bad:{hi:["Hey {who}, what was that? You can do better."],mid:["Wrong, {who}. Skill issue, but curable."],lo:["{who}, that was so mid it hurt."]},
bad_rare:["{who}, you had that on level {lv}! Seriously?"],
bad_again:["For the {n}th time, {who}. I'm taking it personally."],
lvl_up:["Level up, {who}! Respect. Briefly."],
lvl_new:["New word, {who}. Don't do anything dumb with it."],
lvl_saved:["Saved, {who}! Redemption arc."],
lvl_hold:["Held, {who}. Solid. Boring."],
end_perfect:["All correct, {who}. Okay, that was kind of slay."],
end_good:["Pretty decent, {who}."],
end_bad:["Well, {who}. Again tomorrow, but with a brain."]
}};
(function(){
  for(const l in WHO_QUIPS)for(const k in WHO_QUIPS[l]){
    const add=WHO_QUIPS[l][k];
    if(Array.isArray(add)){(QUIPS[l][k]=QUIPS[l][k]||[]).push(...add);}
    else for(const tier in add)QUIPS[l][k][tier].push(...add[tier]);
  }
})();
const cleanName=v=>String(v||'').replace(/[\u0000-\u001f<>{}]/g,'').replace(/\s+/g,' ').trim().slice(0,20);
function whoName(){
  const lang=state.ui==='en'?'en':'de',nn=NICKS[lang];
  if(state.name&&Math.random()<.65)return state.name;
  return nn[Math.floor(Math.random()*nn.length)];
}
window.sayQuip=(...a)=>sayQuip(...a); // für Tests
'''
i=s.index("const quipLast={};")
s=s[:i]+who.lstrip('\n')+s[i:]
s=s.replace("  ctx=ctx||{};\n  const ms=MOODS[kind]","  ctx=Object.assign({who:whoName()},ctx||{});\n  const ms=MOODS[kind]",1)
assert "who:whoName()" in s
s=s.replace("  pick:['haughty'],lang:['superior'],","  name:['sly','haughty'],pick:['haughty'],lang:['superior'],",1)
assert "name:['sly'" in s

# ---------- Ansichten
nv='''function nameView(){
  return `<div class="top">${BRAND}</div>
  ${mascot('name',null,'')}
  <h1>${t('Wie heißt du?')}</h1>
  <p class="hint" style="margin:8px 0 18px">${t('Dewi spricht dich damit an. Der Name bleibt nur auf diesem Gerät.')}</p>
  <form id="nmf"><input class="field" id="nm" type="text" maxlength="20" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="${t('Name eingeben')}" aria-label="${t('Dein Name')}" value="${esc(state.name||'')}">
  <p class="hint" style="margin:8px 2px 16px">${t('Leer lassen: Dewi nennt dich dann „Choom“ und Co.')}</p>
  <button class="btn primary block" type="submit">${t('Weiter')}</button>
  <button class="btn block" type="button" id="nmskip" style="margin-top:10px">${t('Überspringen')}</button></form>`;
}
function bindName(){
  const f=$('#nmf',app);
  f.onsubmit=e=>{e.preventDefault();state.name=cleanName($('#nm',app).value);state.nameAsked=true;save();render();};
  $('#nmskip',app).onclick=()=>{state.nameAsked=true;save();render();};
  try{$('#nm',app).focus();}catch(e){}
}
'''
s=s.replace("function langView(){",nv+"function langView(){",1)
# Ablauf: nach App-Sprache, vor Lernsprache
old="  if(!state.lang||!LANGS[state.lang]){tabs.hidden=true;"
assert old in s
s=s.replace(old,"  if(!state.nameAsked){tabs.hidden=true;app.innerHTML=nameView();bindName();return;}\n"+old,1)

# Einstellungen
card='''  <section class="card set"><div class="eyebrow">${t('Dein Name')}</div>
    <form id="nmsf" class="nmrow"><input class="field" id="nmin" type="text" maxlength="20" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="${t('Name eingeben')}" aria-label="${t('Dein Name')}" value="${esc(state.name||'')}"><button class="btn" type="submit">${t('Speichern')}</button></form>
    <p class="hint" id="nmflash">${t('Leer lassen: Dewi nennt dich dann „Choom“ und Co.')}</p></section>
'''
mark="  <section class=\"card set\"><div><div class=\"eyebrow\">${t('Neue Vokabeln pro Tag')}</div>"
assert mark in s
s=s.replace(mark,card+mark,1)
s=s.replace("function bindSettings(){\n","function bindSettings(){\n  $('#nmsf',app).onsubmit=e=>{e.preventDefault();state.name=cleanName($('#nmin',app).value);state.nameAsked=true;save();$('#nmin',app).value=state.name;const f=$('#nmflash',app);f.textContent=t('Gespeichert.');f.style.color='var(--good)';};\n",1)

# CSS
s=s.replace(".field::placeholder{color:var(--faint)}",".field::placeholder{color:var(--faint)}\n.nmrow{display:flex;gap:8px;margin-top:10px}.nmrow .field{flex:1;min-width:0}.nmrow .btn{flex:none}",1)

# Englisch
add={'Wie heißt du?':'What’s your name?','Dewi spricht dich damit an. Der Name bleibt nur auf diesem Gerät.':'Dewi will call you this. The name stays on this device only.','Dein Name':'Your name','Name eingeben':'Enter your name','Leer lassen: Dewi nennt dich dann „Choom“ und Co.':'Leave empty: Dewi will call you “Choom” and the like.','Überspringen':'Skip','Speichern':'Save','Gespeichert.':'Saved.'}
ins=''.join(f', "{k}": "{v}"' for k,v in add.items() if f'"{k}":' not in s)
s=s.replace('"Fertig": "Done"','"Fertig": "Done"'+ins,1) if '"Fertig": "Done"' in s else s
open(p,'w',encoding='utf-8').write(s)
print('ok')
