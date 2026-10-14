import re
def sub(path,pairs):
    s=open(path,encoding='utf-8').read()
    for a,b in pairs:
        if a not in s: raise SystemExit('FEHLT in %s: %s'%(path,a[:60]))
        s=s.replace(a,b)
    open(path,'w',encoding='utf-8').write(s)
M='modules/'
# Bausteine
sub(M+'blocks.js',[
 ("done=false,lives=3;","done=false,lives=triesFor('blocks');"),
 ("${livesHtml(3)}\n    <p class=\"hint\">${t('Setze den Satz aus den Bausteinen zusammen. Du hast 3 Leben.')}</p>","${roundLives()}\n    <p class=\"hint\">${t('Setze den Satz aus den Bausteinen zusammen.')}</p>"),
 ("lives--;setLives(lives);","lives--;"),
 ("c.ok=c.ok&&good;\n    A.classList","c.ok=c.ok&&good;settleCard();\n    A.classList"),
 ("<div class=\"pair\">${esc(to)}</div></div>`;","<div class=\"pair\">${esc(to)}</div></div>${resultNote(good)}`;"),
])
# Lückensatz
sub(M+'gap.js',[
 ("let lives=3,done=false;","let lives=triesFor('gap'),done=false;"),
 ("${livesHtml(3)}","${roundLives()}"),
 ("c.ok=c.ok&&good;\n    $('#exfb')","c.ok=c.ok&&good;settleCard();\n    $('#exfb')"),
 ("</p></div>\n      <button class=\"btn primary block\" id=\"nx\"","</p></div>${resultNote(good)}\n      <button class=\"btn primary block\" id=\"nx\""),
 ("lives--;setLives(lives);b.disabled","lives--;b.disabled"),
])
# Auswahl
sub(M+'choice.js',[
 ("let lives=3;","let lives=triesFor('choice');"),
 ("${livesHtml(3)}","${roundLives()}"),
 ("lives--;setLives(lives);b.classList","lives--;b.classList"),
 ("c.ok=c.ok&&good;\n    $('#exfb')","c.ok=c.ok&&good;settleCard();\n    $('#exfb')"),
 ("</p></div>\n      <button class=\"btn primary block\" id=\"nx\"","</p></div>${resultNote(good)}\n      <button class=\"btn primary block\" id=\"nx\""),
])
# Swipe
sub(M+'swipe.js',[
 ("c.ok=c.ok&&good;\n    $('#exfb')","c.ok=c.ok&&good;settleCard();\n    $('#exfb')"),
 ("</p>`:''}</div>\n      <button class=\"btn primary block\" id=\"nx\"","</p>`:''}</div>${resultNote(good)}\n      <button class=\"btn primary block\" id=\"nx\""),
 ("<div class=\"smain\">${kicker(c,'swipe',id2gl?toGl():toIdl())}\n","<div class=\"smain\">${kicker(c,'swipe',id2gl?toGl():toIdl())}${roundLives()}\n"),
])
# Tippen
sub(M+'typing.js',[
 ("    ${livesHtml(3)}\n","    ${roundLives()}\n"),
 ("if(c.tries>=3)return finish(false);\n    const left=3-c.tries,fb=$('#fb');","if(c.tries>=triesFor('typing'))return finish(false);\n    const fb=$('#fb');"),
 ("fb.textContent=(c.near?(left===1?t('Fast! Achte auf die Schreibweise. Noch 1 Versuch.'):t('Fast! Achte auf die Schreibweise. Noch {0} Versuche.',left)):(left===1?t('Nicht ganz. Noch 1 Versuch.'):t('Nicht ganz. Noch {0} Versuche.',left)))+(c.tries===2?t(' Tipp: beginnt mit „{0}“.',hintFor(c)):'');\n    setLives(left);",
  "fb.textContent=(c.near?t('Fast! Achte auf die Schreibweise.'):t('Nicht ganz. Versuch es nochmal.'))+(c.tries===triesFor('typing')-1?t(' Tipp: beginnt mit „{0}“.',hintFor(c)):'');"),
])
# Intro: 3 Sekunden Sperre
sub(M+'intro.js',[
 ("$('#go').onclick=nextStep;","""const go=$('#go');let left=Math.ceil((window.__introMs||0)/1000);
  const lab=()=>{go.textContent=left>0?t('Weiter in {0}',left):t('Weiter');};
  if(left>0){
    go.disabled=true;lab();
    const iv=setInterval(()=>{
      if(!go.isConnected){clearInterval(iv);return;}
      left--;lab();
      if(left<=0){clearInterval(iv);go.disabled=false;}
    },1000);
  }
  go.onclick=nextStep;"""),
 ("${kicker(c,'intro')}","${kicker(c,'intro')}"),
])
print('ok')
