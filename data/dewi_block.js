/* ---------- Maskottchen Dewi ---------- */
let dwId=0;
const DWC={D:'#2a1630',HOOD:'#f566b9',HD:'#d044a0',W:'#fffaf2',RED:'#e0295a',LID:'#d3aef0'};
function dwBow(x,y,sc,r){
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${sc})"><path d="M0 0 L-12 -7 Q-15 0 -12 7 Z M0 0 L12 -7 Q15 0 12 7 Z" fill="#fff6f0" stroke="${DWC.D}" stroke-width="2.5" stroke-linejoin="round"/><circle r="3.4" fill="#ffd1e8" stroke="${DWC.D}" stroke-width="2"/></g>`;
}
function dwSpark(x,y,sc){return `<path transform="translate(${x} ${y}) scale(${sc})" d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5Z" fill="#ffe27a" stroke="${DWC.D}" stroke-width="1.6" stroke-linejoin="round"/>`;}
function dwPaw(x){return `<g><ellipse cx="${x}" cy="150" rx="17" ry="15" fill="${DWC.W}" stroke="${DWC.D}" stroke-width="3.5"/><circle cx="${x}" cy="154" r="5" fill="#ff9fb4"/><circle cx="${x-8}" cy="145" r="2.8" fill="#ff9fb4"/><circle cx="${x}" cy="142" r="2.8" fill="#ff9fb4"/><circle cx="${x+8}" cy="145" r="2.8" fill="#ff9fb4"/></g>`;}
function dwBrow(b){
  if(!b)return '';
  const [x1,y1,x2,y2,c]=b;
  return `<path d="M${x1} ${y1} Q${(x1+x2)/2} ${Math.min(y1,y2)-c} ${x2} ${y2}" stroke="${DWC.D}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
}
function dwEye(cx,sd,o){
  const rx=19,ry=20,lid=o.lid||0,px=o.px||0,py=o.py||0,tilt=o.tilt||0,pr=o.pr||7.5,id='dwe'+(++dwId);
  let r=`<clipPath id="${id}"><ellipse cx="${cx}" cy="112" rx="${rx}" ry="${ry}"/></clipPath><ellipse cx="${cx}" cy="112" rx="${rx}" ry="${ry}" fill="#fff" stroke="${DWC.D}" stroke-width="3"/>`;
  r+=`<g clip-path="url(#${id})"><ellipse cx="${cx+px}" cy="${114+py}" rx="14" ry="15.5" fill="#6fb2de"/><ellipse cx="${cx+px}" cy="${118+py}" rx="11" ry="10" fill="#a9dcf2" opacity=".8"/><circle cx="${cx+px}" cy="${114+py}" r="${pr}" fill="${DWC.D}"/><circle cx="${cx+px-5}" cy="${107+py}" r="4.6" fill="#fff"/><circle cx="${cx+px+5}" cy="${121+py}" r="2.2" fill="#fff"/>`;
  if(lid>0){
    const y=112-ry+2*ry*lid;
    r+=`<path d="M${cx-24} ${y-tilt*sd} L${cx+24} ${y+tilt*sd} L${cx+24} 80 L${cx-24} 80 Z" fill="${DWC.LID}"/><path d="M${cx-24} ${y-tilt*sd} L${cx+24} ${y+tilt*sd}" stroke="${DWC.D}" stroke-width="4"/>`;
  }
  r+='</g>';
  r+=`<path d="M${cx-sd*17} 100 Q${cx-sd*21} 98 ${cx-sd*27} 91 M${cx-sd*19} 108 Q${cx-sd*25} 107 ${cx-sd*30} 102" stroke="${DWC.D}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
  return r;
}
function dwClosed(cx,sd,up){
  const p=up?`M${cx-17} 116 Q${cx} 92 ${cx+17} 116`:`M${cx-17} 106 Q${cx} 126 ${cx+17} 106`;
  const y0=up?116:106,y1=up?112:110,y2=up?106:114;
  let r=`<path d="${p}" stroke="${DWC.D}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${cx-sd*17} ${y0} Q${cx-sd*22} ${y1} ${cx-sd*28} ${y2}" stroke="${DWC.D}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
  if(!up)r+=`<ellipse cx="${cx}" cy="105" rx="16" ry="5" fill="${DWC.LID}" opacity=".85"/>`;
  return r;
}
function dwMouth(k){
  const D=DWC.D,R=DWC.RED;
  return {
    smirk:`<path d="M91 143 Q97 148 102 144 Q108 148 113 140" stroke="${D}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M92 144 Q100 152 111 142 Q104 150 92 144Z" fill="${R}" stroke="${D}" stroke-width="1.8" stroke-linejoin="round"/>`,
    pout:`<path d="M91 145 Q100 139 109 145 Q100 152 91 145Z" fill="${R}" stroke="${D}" stroke-width="2.5" stroke-linejoin="round"/>`,
    flat:`<path d="M92 146 L108 146" stroke="${D}" stroke-width="3.4" stroke-linecap="round"/>`,
    tiny:`<path d="M95 146 Q100 144 105 146" stroke="${D}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    osm:`<ellipse cx="100" cy="146" rx="3.8" ry="4.8" fill="${R}" stroke="${D}" stroke-width="2.4"/>`,
    tongue:`<path d="M92 141 Q100 154 108 141" stroke="${D}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M99 148 Q105 146 107 150 Q106 156 101 155 Q98 152 99 148Z" fill="#ff7fa6" stroke="${D}" stroke-width="2" stroke-linejoin="round"/>`,
    evil:`<path d="M87 141 Q100 158 113 141 Q100 147 87 141Z" fill="${R}" stroke="${D}" stroke-width="2.6" stroke-linejoin="round"/><path d="M92 143 L95 150 L98 145Z M102 145 L105 150 L108 143Z" fill="#fff" stroke="${D}" stroke-width="1.8" stroke-linejoin="round"/>`
  }[k];
}
const DWM={
  haughty:{rot:-9,bl:[54,88,84,90,5],br:[116,84,146,76,11],e:{lid:.5,px:2,py:5,tilt:2},m:'smirk'},
  bored:{rot:7,bl:[54,92,84,92,0],br:[116,92,146,92,0],e:{lid:.62,px:6,py:-5},m:'flat',x:'pawr'},
  annoyed:{rot:3,bl:[52,82,84,94,-1],br:[116,94,148,82,-1],e:{lid:.5,py:3,tilt:5},m:'pout',x:'vein'},
  sly:{rot:-7,bl:[54,84,84,86,5],br:[116,78,146,76,10],eL:{lid:.25,px:6,py:2,tilt:-2},wink:1,m:'tongue'},
  shades:{rot:-8,bl:[54,84,84,86,5],br:[116,82,146,78,9],shades:1,m:'smirk',x:'wine'},
  sleep:{rot:-4,mask:1,m:'pout',x:'zz'},
  mean:{rot:-2,bl:[50,80,86,98,-2],br:[114,98,150,80,-2],e:{lid:.5,py:2,tilt:6,pr:4.2},m:'evil',x:'gloom'},
  superior:{rot:-14,bl:[54,88,84,88,4],br:[116,82,146,78,10],closed:1,m:'smirk',x:'spark'},
  uninterested:{rot:8,bl:[54,90,84,90,0],br:[116,90,146,90,0],e:{lid:.38,px:-11,py:6},m:'tiny',x:'pawl'},
  surprised:{rot:3,bl:[54,78,84,76,10],br:[116,76,146,80,12],e:{pr:6},m:'osm',x:'excl'}
};
function dwSvg(mood){
  const c=DWM[mood]||DWM.haughty,D=DWC.D,W=DWC.W,H=DWC.HOOD,HD=DWC.HD;
  let f='';
  f+=dwBrow(c.bl)+dwBrow(c.br);
  if(c.shades){
    f+=`<path d="M34 98 H166 L160 122 Q154 134 132 132 Q114 130 108 114 H92 Q86 130 68 132 Q46 134 40 122Z" fill="#17101e" stroke="${D}" stroke-width="3.5" stroke-linejoin="round"/><path d="M48 106 L66 104 M134 106 L152 104" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".75"/>`;
  }else if(c.mask){
    f+=`<path d="M26 100 Q100 84 174 100 Q180 136 148 138 Q120 140 108 120 H92 Q80 140 52 138 Q20 136 26 100Z" fill="#8a52da" stroke="${D}" stroke-width="3.5" stroke-linejoin="round"/>`;
    [68,132].forEach(x=>{f+=`<ellipse cx="${x}" cy="116" rx="17" ry="11" fill="#fff" stroke="${D}" stroke-width="2.5"/><circle cx="${x}" cy="117" r="7.5" fill="#6fb2de"/><circle cx="${x}" cy="117" r="3.8" fill="${D}"/><circle cx="${x-3}" cy="114" r="2" fill="#fff"/><path d="M${x-17} 108 l-8 -5 M${x+17} 108 l8 -5" stroke="${D}" stroke-width="3" stroke-linecap="round"/>`;});
  }else if(c.closed){
    f+=dwClosed(68,1,false)+dwClosed(132,-1,false);
  }else if(c.wink){
    f+=dwEye(68,1,c.eL)+dwClosed(132,-1,true);
  }else{
    f+=dwEye(68,1,c.e)+dwEye(132,-1,c.e);
  }
  f+=dwMouth(c.m);
  if(c.x==='vein')f+=`<path d="M138 60 q8 0 8 8 M154 60 q-8 0 -8 8 M138 76 q8 0 8 -8 M154 76 q-8 0 -8 -8" stroke="#a80d2e" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  if(c.x==='gloom')f+=`<path d="M66 70 v10 M76 68 v14 M86 70 v10" stroke="${D}" stroke-width="2.6" stroke-linecap="round"/>`;
  let head=`<path d="M26 92 Q22 30 46 16 Q58 10 96 46Z" fill="${H}" stroke="${D}" stroke-width="4" stroke-linejoin="round"/><path d="M44 62 Q42 34 52 28 Q62 30 74 46Z" fill="${HD}"/>`;
  head+=`<path d="M174 92 Q178 30 154 16 Q142 10 104 46Z" fill="${H}" stroke="${D}" stroke-width="4" stroke-linejoin="round"/><path d="M156 62 Q158 34 148 28 Q138 30 126 46Z" fill="${HD}"/>`;
  head+=`<path d="M100 38 C48 38 14 70 14 112 C14 126 18 136 24 146 L14 156 L28 156 C44 176 70 182 100 182 C130 182 156 176 172 156 L186 156 L176 146 C182 136 186 126 186 112 C186 70 152 38 100 38Z" fill="${H}" stroke="${D}" stroke-width="4" stroke-linejoin="round"/>`;
  head+=`<path d="M100 62 C54 62 30 84 30 114 C30 126 34 134 38 140 L30 148 L44 148 C56 164 78 170 100 170 C122 170 144 164 156 148 L170 148 L162 140 C166 134 170 126 170 114 C170 84 146 62 100 62Z" fill="${W}" stroke="${D}" stroke-width="3.5" stroke-linejoin="round"/>`;
  head+=`<ellipse cx="50" cy="132" rx="13" ry="8" fill="#ff9fb4" opacity=".75"/><ellipse cx="150" cy="132" rx="13" ry="8" fill="#ff9fb4" opacity=".75"/>`;
  head+=`<path d="M96 78 q-7 -6 -1 -11 q7 -2 6 4 q-1 4 -5 3" stroke="${D}" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="88" cy="136" r="1.4" fill="#9a7060"/><circle cx="112" cy="136" r="1.4" fill="#9a7060"/><path d="M97 132 Q100 129 103 132 Q100 135 97 132Z" fill="#e0788e" stroke="${D}" stroke-width="1.8"/><circle cx="150" cy="152" r="2" fill="${D}"/>`;
  head+=f;
  head+=dwBow(36,70,1.1,-25)+dwBow(166,62,1.2,20)+dwBow(24,128,.9,-10)+dwBow(56,26,.9,-30);
  [30,170].forEach(x=>{head+=`<path d="M${x} 160 v6" stroke="${D}" stroke-width="2"/><circle cx="${x}" cy="172" r="7.5" fill="#fff" stroke="${D}" stroke-width="2.4"/><circle cx="${x-2}" cy="170" r="2.2" fill="#dfe6f5"/>`;});
  let out=`<g transform="rotate(${c.rot} 100 120)">${head}</g>`;
  if(c.x==='pawr')out+=dwPaw(152);
  if(c.x==='pawl')out+=dwPaw(52);
  if(c.x==='spark')out+=dwSpark(18,52,1.3)+dwSpark(186,40,1.6)+dwSpark(176,96,1);
  if(c.x==='excl')out+=`<rect x="172" y="30" width="9" height="26" rx="4" fill="#ffd23d" stroke="${D}" stroke-width="2.4"/><circle cx="176.5" cy="66" r="5" fill="#ffd23d" stroke="${D}" stroke-width="2.4"/>`;
  if(c.x==='wine')out+=`<g transform="translate(146 120) rotate(12)"><path d="M0 0 H34 Q34 32 17 34 Q0 32 0 0Z" fill="#fff" fill-opacity=".45" stroke="${D}" stroke-width="3.5" stroke-linejoin="round"/><path d="M3 13 H31 Q30 29 17 31 Q4 29 3 13Z" fill="#a1163f"/><path d="M17 34 V52 M7 53 H27" stroke="${D}" stroke-width="3.5" stroke-linecap="round"/></g>`;
  if(c.x==='zz')out+=`<text x="150" y="30" font-size="28" font-weight="bold" fill="#9fb4ff" font-family="sans-serif">Z</text><text x="174" y="10" font-size="19" font-weight="bold" fill="#9fb4ff" font-family="sans-serif">z</text>`;
  return `<div class="dw m-${mood}" aria-hidden="true"><svg viewBox="-6 -2 212 196" focusable="false">${out}</svg></div>`;
}
/* Sprüche: de/en, nach Kategorie; Kategorien mit hi/mid/lo hängen von der Form der letzten Antworten ab */
const QUIPS={
de:{
pick:["Hi, ich bin Dewi. Du lernst, ich urteile. Passt.","Such dir eine Sprache aus. Und bitte nicht random, ich seh alles."],
lang:["Welche Sprache? Mach hin, meine Zeit ist teuer.","Such dir was aus. Ich bewerte deinen Geschmack sowieso."],
home_new:["Ich bin Dewi. Dein erstes Wort wartet. Mal sehen, ob du da überhaupt Bock drauf hast.","Neues Heft, neues Ich? Glaub ich erst, wenn ich's sehe."],
home_due:{hi:["Oh, du schon wieder. Gut, du lieferst ja auch.","Dein Run ist lowkey nice. Versau's nicht."],mid:["Deine Vokabeln warten. Ich auch. Aber nicht ewig, Bro.","Ein paar Minuten, mehr will ich gar nicht. Selbst du schaffst das. Hoffe ich."],lo:["Die Wörter sind schon am Weinen. Ich auch, aber vor Cringe.","Üben hilft. Kein Geheimnis, nur anscheinend neu für dich."]},
home_done:{hi:["Hm, not bad. Du kannst ja doch was.","Okay, das war clean. Sag's keinem, ich habe einen Ruf."],mid:["Fertig für heute. Mid, aber fertig.","Geschafft. Willst du ein Cookie? Gibt's nicht."],lo:["Du hast das echt durchgezogen? Plot Twist.","Fertig. Morgen gern mit weniger Skill Issue."]},
home_sleep:["Streak null. Du bist so aktiv wie mein Interesse an dir.","Zzz. Dein Streak ist tot, ich habe ein Nickerchen gemacht. Beides deine Schuld."],
home_list:["{n} Wörter auf der Fehlerliste. Ich sag nix. Ich guck nur sehr laut.","Deine Fehlerliste ist länger als meine Geduld. Und die ist lang."],
home_streak:["{s} Tage in Folge?! Okay, sheesh. Kurz beeindruckt.","{s} Tage Streak. Wer bist du und warum bist du plötzlich diszipliniert?"],
settings:["Hier drehst du an Schrauben. Bitte nichts kaputt machen, Chaos-Gremlin.","Einstellungen. Ein Ort, an dem du dich besser nicht verläufst.","Reset-Knopf? Würd ich lassen. Ich guck zu."],
intro:["Merk dir das Wort. Ich frag gleich. Und ja, ich merke mir, wenn du's verkackst.","Aufgepasst. Gleich musst du liefern, nicht nur nicken.","Neues Wort. Versuch nicht, es beim ersten Mal zu vergessen."],
ok:{hi:["Wie erwartet. Trotzdem: hm, not bad.","Natürlich. Du hast ja auch eine überragende Lehrerin.","Clean. Weiter so, Main Character."],mid:["Richtig. Siehst du, geht doch.","Passt. Ich bin nicht überrascht. Fast nicht.","Na also, war doch gar nicht so cooked."],lo:["Wait, richtig?! Okay, ich nehm's zurück.","Hm, not bad. Du kannst ja doch was.","Okay okay, das war tatsächlich gut. Nerv mich nicht damit."]},
ok_try2:["Erst beim zweiten Versuch. Zählt trotzdem. Knapp.","Mit Anlauf, ja. Ist okay, aber ich hab's gesehen."],
ok_run:["{n} richtig am Stück. Okay, du bist kurz kein NPC.","Läuft bei dir. Ich bleibe skeptisch, aber sheesh."],
bad:{hi:["Ey, was war das jetzt? Du kannst das besser.","Ein Ausrutscher. Ich tue so, als hätte ich nichts gesehen. Hab ich aber."],mid:["Falsch. Das Wort kommt wieder, wie dein Ex.","Autsch. Skill Issue, aber heilbar.","Nope. Das war nix, Chef."],lo:["Falsch. Ich sag nix. Doch: Ratio.","Das war so mid, dass es wehgetan hat.","Das Wort freut sich schon auf deinen nächsten Fail."]},
bad_rare:["Das hattest du auf Stufe {lv}! Dein Ernst jetzt?","Bro, das konntest du doch. Hat dein Hirn Feierabend gemacht?","Ausgerechnet DAS Wort? Ich bin enttäuscht. Und lowkey amüsiert."],
bad_again:["Zum {n}. Mal. Ich nehm's langsam persönlich.","Fail Nummer {n}. Ich führe Buch. Mit Herz.","„{w}“ und du, das ist wohl eine toxische Beziehung."],
lvl_up:["Level up! Okay, Respekt. Aber nur kurz.","Ey nice, das Wort sitzt. Du bist kurz kein Totalausfall.","Boom. Das Wort so: Ich bin cooked."],
lvl_new:["Neues Wort gelernt. Mein Stolz ist grenzenlos. Also so halb.","Das Wort gehört jetzt dir. Bau keinen Mist damit."],
lvl_saved:["Gerettet! Von der Fehlerliste zurück ins Leben. Redemption Arc.","Na endlich, das Wort darf nach Hause. Wurde auch Zeit."],
lvl_hold:["Stufe gehalten. Solide. Langweilig, aber solide.","Gehalten. Mehr will ich gar nicht. Okay, doch."],
end_perfect:["Alles richtig. Okay, das war schon slay. Sag keinem, dass ich das gesagt hab.","Fehlerfrei. Wer bist du und was hast du mit meinem Schüler gemacht?"],
end_good:["Ganz ordentlich. Ich habe schon cringere Runs gesehen.","Solide. Morgen darfst du mich gern überraschen."],
end_bad:["Naja. Aus Fehlern lernt man. Du lernst heute sehr viel.","Das war… ein Versuch. Morgen nochmal, aber mit Gehirn."]
},
en:{
pick:["Hi, I'm Dewi. You learn, I judge. Deal.","Pick a language. And not randomly, I see everything."],
lang:["Which language? Hurry up, my time is expensive.","Pick something. I'll judge your taste either way."],
home_new:["I'm Dewi. Your first word is waiting. Let's see if you're even motivated.","New notebook, new you? I'll believe it when I see it."],
home_due:{hi:["Oh, you again. Fine, you actually deliver.","Your run is lowkey nice. Don't ruin it."],mid:["Your words are waiting. So am I. But not forever, bro.","A few minutes, that's all I want. Even you can do that. I hope.","Your words are waiting. I'm not."],lo:["The words are already crying. So am I, from cringe.","Practice helps. Not a secret, just apparently news to you."]},
home_done:{hi:["Hm, not bad. You actually can do something.","Okay, that was clean. Tell nobody, I have a reputation."],mid:["Done for today. Mid, but done.","Finished. Want a cookie? There isn't one."],lo:["You actually pulled it off? Plot twist.","Done. Tomorrow with less skill issue, please."]},
home_sleep:["Streak zero. You're as active as my interest in you.","Zzz. Your streak is dead, I took a nap. Both your fault."],
home_list:["{n} words on the error list. I'm not saying anything. I'm just staring loudly.","Your error list is longer than my patience. And that's long."],
home_streak:["{s} days in a row?! Okay, sheesh. Briefly impressed.","{s} day streak. Who are you and why are you suddenly disciplined?"],
settings:["This is where you turn the screws. Don't break anything, chaos gremlin.","Settings. A place you'd better not get lost in.","Reset button? I'd leave it. I'm watching."],
intro:["Remember this word. I'll ask in a second. And yes, I remember when you mess it up.","Pay attention. Soon you have to deliver, not just nod.","New word. Try not to forget it on the first go."],
ok:{hi:["As expected. Still: hm, not bad.","Of course. You have an outstanding teacher.","Clean. Keep going, main character."],mid:["Correct. See, it works.","Fine. I'm not surprised. Almost not.","There you go, wasn't that cooked after all."],lo:["Wait, correct?! Okay, I take it back.","Hm, not bad. You actually can do something.","Okay okay, that was actually good. Don't make it weird."]},
ok_try2:["Only on the second try. Still counts. Barely.","With a run-up, sure. Fine, but I saw that."],
ok_run:["{n} correct in a row. Okay, you're briefly not an NPC.","You're on a roll. I stay skeptical, but sheesh."],
bad:{hi:["Hey, what was that? You can do better.","A slip. I'll pretend I saw nothing. I did, though."],mid:["Wrong. The word will be back, like your ex.","Ouch. Skill issue, but curable.","Nope. That was nothing, chief."],lo:["Wrong. I'm not saying anything. Okay: ratio.","That was so mid it hurt.","The word is already looking forward to your next fail."]},
bad_rare:["You had that on level {lv}! Seriously?","Bro, you knew that. Did your brain clock out?","Of all words, THAT one? I'm disappointed. And lowkey amused."],
bad_again:["For the {n}th time. I'm starting to take it personally.","Fail number {n}. I'm keeping score. With love.","“{w}” and you, that's a toxic relationship."],
lvl_up:["Level up! Okay, respect. But only briefly.","Hey nice, the word sticks. You're briefly not a total loss.","Boom. The word like: I'm cooked."],
lvl_new:["New word learned. My pride is boundless. Well, half.","The word is yours now. Don't do anything dumb with it."],
lvl_saved:["Saved! From the error list back to life. Redemption arc.","Finally, the word may go home. About time."],
lvl_hold:["Level held. Solid. Boring, but solid.","Held. I don't want more. Okay, I do."],
end_perfect:["All correct. Okay, that was kind of slay. Tell nobody I said that.","Flawless. Who are you and what did you do with my student?"],
end_good:["Pretty decent. I've seen cringier runs.","Solid. Feel free to surprise me tomorrow."],
end_bad:["Well. You learn from mistakes. Today you're learning a lot.","That was… an attempt. Again tomorrow, but with a brain."]
}};
const MOODS={
  pick:['haughty'],lang:['superior'],home_new:['sly'],home_due:['annoyed','bored','haughty'],home_done:['shades','sly','superior'],
  home_sleep:['sleep'],home_list:['mean','annoyed'],home_streak:['surprised'],settings:['uninterested','bored'],intro:['superior','haughty'],
  ok:['sly','superior','surprised'],ok_try2:['bored','uninterested'],ok_run:['surprised','sly'],bad:['mean','annoyed','haughty'],bad_rare:['mean','haughty'],
  bad_again:['annoyed','mean'],lvl_up:['surprised','sly'],lvl_new:['sly','superior'],lvl_saved:['superior','haughty'],lvl_hold:['bored','uninterested'],
  end_perfect:['surprised','shades'],end_good:['superior','haughty'],end_bad:['mean','annoyed']
};
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
  const ms=MOODS[kind]||['haughty'];
  const mood=ms[Math.floor(Math.random()*ms.length)];
  return {mood,text:pool[i].replace(/\{(\w+)\}/g,(m,k)=>ctx[k]!==undefined?ctx[k]:m)};
}
function mascot(kind,ctx,cls){
  const q=sayQuip(kind,ctx);
  return `<div class="mascot${cls?' '+cls:''}">${dwSvg(q.mood)}<div class="bubble" role="status">${esc(q.text)}</div></div>`;
}
