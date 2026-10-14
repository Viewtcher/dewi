import re
p='/home/claude/kata/app.src.html'
s=open(p,encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)>=1,old[:60]
    s=s.replace(old,new,cnt)

# ---------- CSS
css=r'''
/* ---- Maskottchen Tokek ---- */
.mascot{display:flex;align-items:center;gap:10px;margin:2px 0 4px}
.mascot .gk{flex:none;width:92px}
.mascot.sm .gk{width:68px}
.mascot.col{flex-direction:column;text-align:center}
.mascot.col .gk{width:120px}
.gk svg{display:block;width:100%;height:auto;overflow:visible;animation:gbob 3.4s ease-in-out infinite}
.gk .tail{transform-origin:128px 150px;animation:gtail 2.6s ease-in-out infinite}
.gk .lid{animation:gblink 4.8s infinite;transform:translateY(var(--lid,-32px))}
.gk .arm{transition:transform .3s}
.gk .arm.l{transform-origin:62px 122px}.gk .arm.r{transform-origin:138px 122px}
.gk .x{display:none}
.gk.m-happy .x-happy,.gk.m-cheer .x-cheer,.gk.m-smug .x-smug,.gk.m-sad .x-sad,.gk.m-sleep .x-sleep{display:inline}
.gk.m-happy .x-open,.gk.m-cheer .x-open{display:inline}
.gk.m-happy{--lid:-32px}.gk.m-cheer{--lid:-32px}.gk.m-smug{--lid:-15px}.gk.m-sad{--lid:-27px}.gk.m-sleep{--lid:0px}
.gk.m-sleep .lid{animation:none}
.gk.m-smug .pup{transform:translate(4px,4px)}
.gk.m-sad .pup{transform:translate(0,4px)}
.gk.m-cheer .arm.l{transform:rotate(125deg)}.gk.m-cheer .arm.r{transform:rotate(-125deg)}
.gk.m-cheer svg{animation:gjump .55s ease-in-out infinite}
.gk.m-sleep svg{animation:gbreath 3.4s ease-in-out infinite}
.gk .zz{animation:gz 2.6s ease-in infinite;opacity:0}.gk .zz.b{animation-delay:1.3s}
.gk .sp{animation:gtw 1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.gk .sp.b{animation-delay:.35s}.gk .sp.c{animation-delay:.7s}
.gk .tear{animation:gtear 2.2s ease-in infinite}
.bubble{position:relative;flex:1;min-width:0;background:var(--raised);border:1px solid var(--line);border-radius:16px;padding:10px 14px;font-size:15px;line-height:1.4;color:var(--text)}
.bubble::before{content:"";position:absolute;left:-7px;top:22px;width:12px;height:12px;background:var(--raised);border-left:1px solid var(--line);border-bottom:1px solid var(--line);transform:rotate(45deg)}
.mascot.col .bubble::before{left:50%;top:-7px;margin-left:-6px;border:0;border-left:1px solid var(--line);border-top:1px solid var(--line)}
.lvl .mascot{margin:0}.lvl .bubble{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.25);max-width:320px}
.lvl .bubble::before{background:#3a3560;border-color:rgba(255,255,255,.25)}
@keyframes gbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes gbreath{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
@keyframes gjump{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes gtail{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(7deg)}}
@keyframes gblink{0%,90%,100%{transform:translateY(var(--lid,-32px))}94%{transform:translateY(0)}}
@keyframes gz{0%{opacity:0;transform:translate(0,0)}20%{opacity:1}100%{opacity:0;transform:translate(10px,-22px)}}
@keyframes gtw{0%,100%{opacity:.25;transform:scale(.6)}50%{opacity:1;transform:scale(1.1)}}
@keyframes gtear{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(18px)}}
'''
rep('@media (prefers-reduced-motion:reduce)',css+'@media (prefers-reduced-motion:reduce)')

# ---------- JS: Gecko + Sprüche
js=r'''
/* ---------- Maskottchen Tokek ---------- */
let gkId=0;
function geckoSvg(mood){
  const id='gkc'+(++gkId);
  const G='#5fd068',D='#3aa84a',B='#d6f6b2',K='#1b1530',ST='#2a7a3a';
  return `<div class="gk m-${mood}" aria-hidden="true"><svg viewBox="0 0 200 200" focusable="false">
  <g class="tail"><path d="M126 152C168 152 186 182 162 190C150 194 140 186 148 178" fill="none" stroke="${G}" stroke-width="15" stroke-linecap="round"/><path d="M146 160l8 -6M156 170l9 -3M156 184l7 4" stroke="${D}" stroke-width="3" stroke-linecap="round"/></g>
  <ellipse cx="68" cy="176" rx="19" ry="9" fill="${D}"/><ellipse cx="132" cy="176" rx="19" ry="9" fill="${D}"/>
  <circle cx="54" cy="179" r="4" fill="${G}"/><circle cx="68" cy="182" r="4" fill="${G}"/><circle cx="82" cy="179" r="4" fill="${G}"/>
  <circle cx="118" cy="179" r="4" fill="${G}"/><circle cx="132" cy="182" r="4" fill="${G}"/><circle cx="146" cy="179" r="4" fill="${G}"/>
  <ellipse cx="100" cy="138" rx="52" ry="46" fill="${G}"/><ellipse cx="100" cy="148" rx="33" ry="33" fill="${B}"/>
  <circle cx="70" cy="122" r="5" fill="${D}"/><circle cx="130" cy="124" r="6" fill="${D}"/><circle cx="82" cy="108" r="4" fill="${D}"/><circle cx="120" cy="110" r="4" fill="${D}"/>
  <g class="arm l"><ellipse cx="52" cy="140" rx="12" ry="22" fill="${G}" transform="rotate(14 52 140)"/><circle cx="44" cy="160" r="4.5" fill="${D}"/><circle cx="53" cy="163" r="4.5" fill="${D}"/><circle cx="62" cy="161" r="4.5" fill="${D}"/></g>
  <g class="arm r"><ellipse cx="148" cy="140" rx="12" ry="22" fill="${G}" transform="rotate(-14 148 140)"/><circle cx="138" cy="161" r="4.5" fill="${D}"/><circle cx="147" cy="163" r="4.5" fill="${D}"/><circle cx="156" cy="160" r="4.5" fill="${D}"/></g>
  <circle cx="72" cy="50" r="23" fill="${G}"/><circle cx="128" cy="50" r="23" fill="${G}"/>
  <ellipse cx="100" cy="84" rx="64" ry="47" fill="${G}"/>
  <circle cx="72" cy="52" r="17" fill="#fff"/><circle cx="128" cy="52" r="17" fill="#fff"/>
  <g class="pup"><circle cx="74" cy="54" r="8.5" fill="${K}"/><circle cx="130" cy="54" r="8.5" fill="${K}"/><circle cx="71" cy="51" r="2.8" fill="#fff"/><circle cx="127" cy="51" r="2.8" fill="#fff"/></g>
  <clipPath id="${id}"><circle cx="72" cy="52" r="17"/><circle cx="128" cy="52" r="17"/></clipPath>
  <g clip-path="url(#${id})"><rect class="lid" x="50" y="34" width="100" height="36" fill="${G}"/></g>
  <path class="x x-smug" d="M52 36q18 -2 36 3M110 28q20 -8 40 2" fill="none" stroke="${ST}" stroke-width="4" stroke-linecap="round"/>
  <path class="x x-sad" d="M54 29l32 8M146 29l-32 8" fill="none" stroke="${ST}" stroke-width="4" stroke-linecap="round"/>
  <circle cx="96" cy="84" r="2.2" fill="${ST}"/><circle cx="104" cy="84" r="2.2" fill="${ST}"/>
  <circle class="x x-open" cx="60" cy="92" r="9" fill="#ff8fb0" opacity=".5"/><circle class="x x-open" cx="140" cy="92" r="9" fill="#ff8fb0" opacity=".5"/>
  <path class="x x-smug" d="M78 100Q102 110 126 92M126 92l5 -4" fill="none" stroke="${ST}" stroke-width="4.5" stroke-linecap="round"/>
  <path class="x x-sad" d="M82 110Q100 96 118 110" fill="none" stroke="${ST}" stroke-width="4.5" stroke-linecap="round"/>
  <path class="x x-sleep" d="M92 102Q100 107 108 102" fill="none" stroke="${ST}" stroke-width="4" stroke-linecap="round"/>
  <path class="x x-happy" d="M78 94Q100 122 122 94Z" fill="#7a2038" stroke="${ST}" stroke-width="3.5" stroke-linejoin="round"/>
  <path class="x x-cheer" d="M72 92Q100 130 128 92Z" fill="#7a2038" stroke="${ST}" stroke-width="3.5" stroke-linejoin="round"/>
  <ellipse class="x x-happy" cx="100" cy="109" rx="9" ry="5" fill="#ff7a9a"/><ellipse class="x x-cheer" cx="100" cy="113" rx="11" ry="6" fill="#ff7a9a"/>
  <path class="x x-sad tear" d="M58 74q-5 8 0 11q5 -3 0 -11z" fill="#6ec3ff"/>
  <g class="x x-sleep" fill="#a888ff" font-family="Fraunces,serif" font-weight="800"><text class="zz" x="150" y="40" font-size="20">z</text><text class="zz b" x="164" y="26" font-size="15">z</text></g>
  <g class="x x-cheer" fill="#ffc23d"><path class="sp" d="M26 40l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path class="sp b" d="M176 56l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z"/><path class="sp c" d="M164 14l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/></g>
  </svg></div>`;
}
/* Sprüche: de/en, nach Kategorie; Kategorien mit hi/mid/lo hängen von der Form der letzten Antworten ab */
const QUIPS={
de:{
pick:["Hallo! Ich bin Tokek, dein Gecko. Ich bringe dir Wörter bei. Du bringst mir Respekt bei.","Willkommen. Such dir eine Sprache aus. Ich bin flexibel. Du hoffentlich auch."],
lang:["Welche Sprache darf es sein? Ich kann alle. Fast.","Such dir eine aus. Ich schaue zu und beurteile alles."],
home_new:["Ich bin Tokek. Dein erstes Wort wartet. Keine Sorge, ich beiße nicht. Meistens.","Neues Heft, neues Glück. Fang an, ich schaue sehr aufmerksam zu."],
home_due:{hi:["Wieder bereit? Von dir erwarte ich inzwischen was.","Deine Vokabeln warten. Zeig mir, wo der Hammer hängt."],mid:["Deine Vokabeln warten. Ich auch. Aber ich habe mehr Geduld als du Ausreden.","Ein paar Minuten, mehr will ich gar nicht. Du schaffst das. Wahrscheinlich."],lo:["Die Wörter laufen dir nicht weg. Aber vergessen werden sie.","Ich sage nur: Üben hilft. Soll auch bei Menschen wirken."]},
home_done:{hi:["Schon fertig? Ich bin beeindruckt. Sag das aber niemandem.","Sauber. Heute gibt es von mir ausnahmsweise ein Lob."],mid:["Fertig für heute. Du darfst stolz sein. Ein bisschen.","Geschafft. War doch gar nicht so schlimm."],lo:["Geschafft! Ich hätte nicht gedacht, dass du das durchziehst. Bravo.","Fertig. Morgen gerne wieder, aber mit weniger Fehlern. Nur so als Idee."]},
home_sleep:["Zzz… Streak null. Weck mich, wenn du bereit bist.","Ich habe ein Nickerchen gemacht. Dein Streak auch. Für immer, wenn das so weitergeht."],
home_list:["{n} Wörter auf der Fehlerliste. Ich sage nichts. Ich schaue nur sehr laut.","Deine Fehlerliste wächst. Ich mag Haustiere, aber das ist übertrieben."],
home_streak:["{s} Tage in Folge! Okay, jetzt bin ich wirklich beeindruckt. Ein bisschen.","{s} Tage am Stück. Wer bist du und was hast du mit meinem Schüler gemacht?"],
settings:["Hier drehst du an den Schrauben. Bitte nichts kaputt machen.","Ich mag Ordnung. Deinen Fortschritt übrigens auch.","Den Reset-Knopf würde ich nicht anfassen. Ich schaue zu."],
intro:["Merk dir das Wort. Ich frage gleich nach. Ohne Gnade.","Schau genau hin. Gleich musst du es können.","Ein neues Wort! Ich liebe neue Wörter. Du bald auch."],
ok:{hi:["Erwartet. Trotzdem schön.","Natürlich. Du hast ja einen guten Lehrer.","Sauber! Weiter so."],mid:["Richtig. Siehst du, geht doch.","Passt. Ich bin nicht überrascht. Fast nicht.","Na also."],lo:["Oha, richtig! Das muss ich mir merken.","Geht doch! Warum nicht immer so?","Richtig. Ich gebe zu, das war gut."]},
ok_try2:["Erst beim zweiten Versuch. Zählt trotzdem. Knapp.","Mit Anlauf geht's auch. Richtig."],
ok_run:["{n} richtig in Folge. Wer hätte das gedacht?","Läuft bei dir. Ich bleibe skeptisch, aber beeindruckt."],
bad:{hi:["Hoppla. Das passiert den Besten. Dir gerade eben.","Ein Ausrutscher. Ich zähle nicht mit. Ich zähle ein bisschen mit."],mid:["Nicht ganz. Du bist ja nicht zum Spaß hier.","Falsch. Das Wort kommt wieder, wie ein Bumerang.","Autsch. Das Wort kommt wieder. Es mag dich."],lo:["Falsch. Ich sage nichts. Doch: falsch.","Übung macht den Meister. Du übst fleißig. Das Falschsein.","Das Wort freut sich schon auf deinen nächsten Versuch."]},
bad_rare:["Das hattest du auf Stufe {lv}! Wirklich jetzt?","Moment. Das konntest du doch! Hat dein Hirn Pause gemacht?","Ausgerechnet DAS Wort? Ich bin enttäuscht. Und amüsiert."],
bad_again:["Zum {n}. Mal! Ich fange an, es persönlich zu nehmen.","Fehler Nummer {n}. Ich führe Buch.","„{w}“ und du, das ist wohl eine Fernbeziehung."],
lvl_up:["Level up! Ich applaudiere. Leise, aus Würde.","Stark! Das Wort sitzt.","Boom! Das Wort denkt sich: Mist, erwischt."],
lvl_new:["Neues Wort gelernt. Mein Stolz ist grenzenlos. Fast.","Das Wort gehört jetzt dir. Pass gut darauf auf."],
lvl_saved:["Gerettet! Von der Fehlerliste zurück ins Leben.","Na endlich. Das Wort darf nach Hause."],
lvl_hold:["Stufe gehalten. Solide. Langweilig, aber solide.","Gehalten. Mehr verlange ich gar nicht. Doch, mehr."],
end_perfect:["Alles richtig! Ich bin sprachlos. Das passiert selten.","Fehlerfrei. Wer bist du und was hast du mit meinem Schüler gemacht?"],
end_good:["Ganz ordentlich. Ich habe schon Schlimmeres gesehen.","Solide Leistung. Morgen darfst du mich gerne überraschen."],
end_bad:["Naja. Aus Fehlern lernt man. Du lernst heute sehr viel.","Das war… ein Anfang. Morgen wieder, ja?"]
},
en:{
pick:["Hi! I'm Tokek, your gecko. I teach you words. You teach me respect.","Welcome. Pick a language. I'm flexible. I hope you are too."],
lang:["Which language will it be? I know them all. Almost.","Pick one. I'll watch and judge everything."],
home_new:["I'm Tokek. Your first word is waiting. Don't worry, I don't bite. Mostly.","New notebook, new luck. Get started, I'm watching very closely."],
home_due:{hi:["Ready again? I actually expect things from you by now.","Your words are waiting. Show me what you've got."],mid:["Your words are waiting. So am I. But I have more patience than you have excuses.","A few minutes, that's all I ask. You can do it. Probably."],lo:["The words won't run away. But you'll forget them.","I'm just saying: practice helps. Apparently it works on humans too."]},
home_done:{hi:["Done already? I'm impressed. Don't tell anyone.","Clean. Today you get praise from me. Just this once."],mid:["Done for today. You may be proud. A little.","Finished. That wasn't so bad, was it?"],lo:["Done! I didn't think you'd pull it off. Bravo.","Finished. Come back tomorrow, with fewer mistakes. Just a thought."]},
home_sleep:["Zzz… streak zero. Wake me when you're ready.","I took a nap. So did your streak. Forever, if this continues."],
home_list:["{n} words on the error list. I'm not saying anything. I'm just staring loudly.","Your error list is growing. I like pets, but this is excessive."],
home_streak:["{s} days in a row! Okay, now I'm really impressed. A little.","{s} days straight. Who are you and what did you do with my student?"],
settings:["This is where you turn the screws. Please don't break anything.","I like order. So does your progress, by the way.","I wouldn't touch the reset button. I'm watching."],
intro:["Remember this word. I'll ask in a moment. No mercy.","Look closely. You'll need it in a second.","A new word! I love new words. You will too."],
ok:{hi:["Expected. Still nice.","Of course. You have a good teacher.","Clean! Keep going."],mid:["Correct. See, it works.","Fine. I'm not surprised. Almost not.","There you go."],lo:["Oh, correct! I have to remember this.","See? Why not always like this?","Correct. I admit, that was good."]},
ok_try2:["Only on the second try. Still counts. Barely.","With a run-up it works too. Correct."],
ok_run:["{n} correct in a row. Who would have thought?","You're on a roll. I remain skeptical, but impressed."],
bad:{hi:["Oops. It happens to the best. To you, just now.","A slip. I'm not counting. I'm counting a little."],mid:["Not quite. You're not here for fun.","Wrong. The word will be back, like a boomerang.","Ouch. The word will be back. It likes you."],lo:["Wrong. I'm not saying anything. Well: wrong.","Practice makes perfect. You practice a lot. Being wrong.","The word is already looking forward to your next try."]},
bad_rare:["You had that on level {lv}! Really now?","Wait. You knew that one! Did your brain take a break?","Of all words, THAT one? I'm disappointed. And amused."],
bad_again:["For the {n}th time! I'm starting to take it personally.","Mistake number {n}. I'm keeping a record.","“{w}” and you, that's a long-distance relationship."],
lvl_up:["Level up! I'm applauding. Quietly, for dignity.","Strong! The word sticks.","Boom! The word thinks: darn, caught."],
lvl_new:["New word learned. My pride is boundless. Almost.","The word is yours now. Take good care of it."],
lvl_saved:["Saved! From the error list back to life.","Finally. The word may go home."],
lvl_hold:["Level held. Solid. Boring, but solid.","Held. I ask for nothing more. Okay, I do."],
end_perfect:["All correct! I'm speechless. That's rare.","Flawless. Who are you and what did you do with my student?"],
end_good:["Pretty decent. I've seen worse.","Solid effort. Feel free to surprise me tomorrow."],
end_bad:["Well. You learn from mistakes. Today you're learning a lot.","That was… a start. Again tomorrow, okay?"]
}};
const MOODS={pick:'happy',lang:'happy',home_new:'happy',home_due:'smug',home_done:'happy',home_sleep:'sleep',home_list:'smug',home_streak:'cheer',settings:'smug',intro:'smug',ok:'happy',ok_try2:'smug',ok_run:'cheer',bad:'sad',bad_rare:'smug',bad_again:'smug',lvl_up:'cheer',lvl_new:'cheer',lvl_saved:'cheer',lvl_hold:'happy',end_perfect:'cheer',end_good:'happy',end_bad:'sad'};
const quipLast={};
function formTier(){
  const f=state.form||[];if(f.length<4)return 'mid';
  const a=f.reduce((x,y)=>x+y,0)/f.length;
  return a>=.85?'hi':a>=.6?'mid':'lo';
}
function sayQuip(kind,ctx){
  const lang=state.ui==='en'?'en':'de';
  let pool=QUIPS[lang][kind];
  if(!Array.isArray(pool))pool=pool[formTier()]||pool.mid;
  let i=Math.floor(Math.random()*pool.length);
  if(pool.length>1&&quipLast[kind]===i)i=(i+1)%pool.length;
  quipLast[kind]=i;
  ctx=ctx||{};
  let mood=MOODS[kind];
  if(kind==='bad'&&formTier()==='hi')mood='smug';
  return {mood,text:pool[i].replace(/\{(\w+)\}/g,(m,k)=>ctx[k]!==undefined?ctx[k]:m)};
}
function mascot(kind,ctx,cls){
  if(state.quips===false)return '';
  const q=sayQuip(kind,ctx);
  return `<div class="mascot${cls?' '+cls:''}">${geckoSvg(q.mood)}<div class="bubble" role="status">${esc(q.text)}</div></div>`;
}
'''
rep('/* ---------- Oberfläche ---------- */',js+'\n/* ---------- Oberfläche ---------- */')

# ---------- State
rep("list:null,daily:{date:'',newCount:0,extra:0,lt:[]},done:{}});","list:null,daily:{date:'',newCount:0,extra:0,lt:[]},done:{},quips:true,form:[]});")
rep("  state.v=2;\n  save();","  if(!Array.isArray(state.form))state.form=[];\n  if(state.quips===undefined)state.quips=true;\n  state.v=2;\n  save();")
rep("  if(!prev)dq.newCount++;","  state.form=(state.form||[]).concat(ok?1:0).slice(-12);\n  if(!prev)dq.newCount++;")

# ---------- Sprachwahl
rep("""  return `<div class="top">${BRAND}</div>
  <h1>Sprache / Language</h1>""","""  return `<div class="top">${BRAND}</div>
  ${mascot('pick',null,'')}
  <h1>Sprache / Language</h1>""")
rep("""  return `<div class="top">${BRAND}</div>
  <h1>${t('Welche Sprache lernst du?')}</h1>""","""  return `<div class="top">${BRAND}</div>
  ${mascot('lang',null,'')}
  <h1>${t('Welche Sprache lernst du?')}</h1>""")

# ---------- Startseite
rep("""  <h1>${esc(dayName(t0,{weekday:'long',day:'numeric',month:'long'}))}</h1>
  <section class="card plan">""","""  <h1>${esc(dayName(t0,{weekday:'long',day:'numeric',month:'long'}))}</h1>
  ${homeMascot(p,st,lw.length,doneToday,prog)}
  <section class="card plan">""")
rep("function bindHome(){","""function homeMascot(p,st,nList,doneToday,prog){
  const any=Object.keys(prog).length>0,total=p.due.length+p.fresh.length+(p.mand?1:0);
  let k;
  if(!any)k='home_new';
  else if(st===0&&!doneToday)k='home_sleep';
  else if(nList>=4)k='home_list';
  else if(st>=7)k='home_streak';
  else if(doneToday||total===0)k='home_done';
  else k='home_due';
  return mascot(k,{n:nList,s:st},'');
}
function bindHome(){""")

# ---------- Einstellungen
rep("""  return `<div class="top"><h1>${t('Einstellungen')}</h1></div>
""","""  return `<div class="top"><h1>${t('Einstellungen')}</h1></div>
  ${mascot('settings',null,'')}
  <section class="card set"><div class="eyebrow">${t('Maskottchen Tokek')}</div>
    <div class="seg two" role="radiogroup" aria-label="${t('Maskottchen Tokek')}">${[[1,t('An')],[0,t('Aus')]].map(u=>`<button role="radio" data-q="${u[0]}" aria-checked="${(state.quips!==false)===!!u[0]}">${u[1]}</button>`).join('')}</div>
    <p class="hint">${t('Der Gecko kommentiert deine Antworten mit kleinen Sprüchen.')}</p></section>
""")
rep("function bindSettings(){","function bindSettings(){\n  $$('[data-q]',app).forEach(b=>b.onclick=()=>{state.quips=b.dataset.q==='1';save();render();});")
rep("list:state.list,daily:state.daily,done:state.done}","list:state.list,daily:state.daily,done:state.done,quips:state.quips,form:state.form}")

# ---------- Lernen
rep("""    <div class="eyebrow" style="margin-top:4px">${esc(t(L.cats[w.cat][0]))}</div>${ex}
    <p class="hint">${t('Präg dir das Wort und den Satz ein. Gleich wendest du es an.')}</p>""","""    <div class="eyebrow" style="margin-top:4px">${esc(t(L.cats[w.cat][0]))}</div>${ex}
    <p class="hint">${t('Präg dir das Wort und den Satz ein. Gleich wendest du es an.')}</p>
    ${mascot('intro',null,'sm')}""")
rep("""  const L=curLang();
  const alts=c.dir==='gl2id'""","""  const L=curLang();
  S.run=ok?(S.run||0)+1:0;
  let qk,qc={n:ok?S.run:r.n,w:w.id,lv:c.lvl};
  if(ok)qk=c.tries>1&&typedOk?'ok_try2':S.run>=3&&S.run%3===0?'ok_run':'ok';
  else qk=type==='list'&&r.n>=2?'bad_again':c.lvl>=3?'bad_rare':'bad';
  const alts=c.dir==='gl2id'""")
rep("""    <p class="hint">${when}</p><button class="btn primary block" id="next">""","""    <p class="hint">${when}</p>${mascot(qk,qc,'sm')}<button class="btn primary block" id="next">""")

# ---------- Level-up
rep("""  el.innerHTML=`<div class="lvl-rays"></div><div class="lvl-in"><div class="lvl-lab">${lab}</div>""","""  const lk=type==='list'?'lvl_saved':type==='new'?'lvl_new':(r.level>c.lvl?'lvl_up':'lvl_hold');
  el.innerHTML=`<div class="lvl-rays"></div><div class="lvl-in"><div class="lvl-lab">${lab}</div>""")
rep("""    <div class="lvl-sub">${r.days===1?t('Stufe {0} von 5 · nächste Wiederholung morgen',r.level):t('Stufe {0} von 5 · nächste Wiederholung in {1} Tagen',r.level,r.days)}</div></div>`;""","""    <div class="lvl-sub">${r.days===1?t('Stufe {0} von 5 · nächste Wiederholung morgen',r.level):t('Stufe {0} von 5 · nächste Wiederholung in {1} Tagen',r.level,r.days)}</div>
    ${mascot(lk,null,'col')}</div>`;""")
rep("el.onclick=close;setTimeout(close,1900);","el.onclick=close;setTimeout(close,2600);")

# ---------- Ende
rep("""    ${chips(S.cleared,t('Von der Fehlerliste gestrichen:'))}""","""    ${mascot(S.right===total?'end_perfect':S.right/total>=.6?'end_good':'end_bad',null,'sm')}
    ${chips(S.cleared,t('Von der Fehlerliste gestrichen:'))}""")

# ---------- EN-Wörterbuch
rep("const EN={","const EN={\"Maskottchen Tokek\": \"Mascot Tokek\", \"An\": \"On\", \"Aus\": \"Off\", \"Der Gecko kommentiert deine Antworten mit kleinen Sprüchen.\": \"The gecko comments on your answers with little quips.\", ")
open(p,'w',encoding='utf8').write(s)
print('ok',len(s))
