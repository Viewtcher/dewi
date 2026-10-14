import re
p='app.src.html'; s=open(p,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)>=1,a[:60]
    s=s.replace(a,b,cnt)

# --- Dewi: Dollar-Augen, Grinsen, Stimmung cash
rep("function dwClosed(cx,sd,up){","""function dwDollar(cx,sd){
  return `<ellipse cx="${cx}" cy="112" rx="19" ry="20" fill="#fff" stroke="${DWC.D}" stroke-width="3"/><circle cx="${cx}" cy="113" r="14.5" fill="#2fcf5e" stroke="#0e7a33" stroke-width="2"/><text x="${cx}" y="121" text-anchor="middle" font-size="22" font-weight="900" font-family="Arial,Helvetica,sans-serif" fill="#ffe27a" stroke="#0e7a33" stroke-width=".8">$</text><path d="M${cx-sd*17} 100 Q${cx-sd*21} 98 ${cx-sd*27} 91 M${cx-sd*19} 108 Q${cx-sd*25} 107 ${cx-sd*30} 102" stroke="${DWC.D}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
}
function dwClosed(cx,sd,up){""")
rep("    evil:`<path","""    grin:`<path d="M87 140 Q100 162 113 140 Q100 146 87 140Z" fill="${R}" stroke="${D}" stroke-width="2.8" stroke-linejoin="round"/><path d="M91 142 Q100 148 109 142 L108 146 Q100 151 92 146Z" fill="#fff"/>`,
    evil:`<path""")
rep("  surprised:{rot:3,","  cash:{rot:-4,bl:[54,80,84,80,8],br:[116,80,146,80,8],dollar:1,m:'grin',x:'cash'},\n  surprised:{rot:3,")
rep("  }else if(c.mask){","  }else if(c.dollar){\n    f+=dwDollar(68,1)+dwDollar(132,-1);\n  }else if(c.mask){")
rep("  if(c.x==='pawr')","  if(c.x==='cash')out+=dwSpark(14,60,1.4)+dwSpark(188,52,1.7)+dwSpark(180,100,1)+dwSpark(22,104,1);\n  if(c.x==='pawr')")
rep("const BLIP={","const BLIP={cash:[700,.05,1.08,'triangle'],")

# --- Sprüche
de='''reels_ready:["Zieh den Hebel. Ich hab Dollarzeichen in den Augen, du hast Vokabeln im Kopf.","Money, money, money. Äh, Vokabeln, meine ich.","Einmal ziehen bitte. Dewi nimmt 10 % Provision.","Hebel runter, Chief. Ich hab heute Glück. Du eher so mittel."],
reels_ok:["Ka-ching! Das war sogar richtig.","Cha-ching. Ich nehm das als Trinkgeld.","Stonks!","Okay, das hat gezahlt. Weiter so."],
reels_bad:["Daneben. Das kostet dich Dewi-Punkte.","Autsch. Das Haus gewinnt. Das Haus bin ich.","Nope. Zweite Chance, weil ich heute großzügig bin.","Falsch. Hauptsache du hast Spaß am Verlieren."],
reels_jackpot:["JACKPOT! Ich will 50 % davon.","Alles richtig?! Okay, das war fast schon… gut.","Jackpot! Ich bin reich. Du leider nicht.","Ka-ching ka-ching ka-ching! Ich liebe dich. Nur gerade."],
reels_lose:["Verzockt. Die Bank gewinnt, wie immer.","Pleite. Lern lieber, bevor du wieder zockst.","Das Haus gewinnt. Das Haus bin ich. Bye."],
reels_win:["Geschafft, und mit Stil. Fast.","Voll im Plus. Ich bin beeindruckt, ein bisschen."],'''
en='''reels_ready:["Pull the lever. I have dollar signs in my eyes, you have words in your head.","Money, money, money. Uh, vocab, I mean.","One pull, please. Dewi takes 10% commission.","Lever down, Chief. I feel lucky today. You, so-so."],
reels_ok:["Ka-ching! That was actually right.","Cha-ching. I'll take that as a tip.","Stonks!","Okay, that paid off. Keep going."],
reels_bad:["Miss. That costs you Dewi points.","Ouch. The house wins. I am the house.","Nope. Second chance, because I'm generous today.","Wrong. At least you enjoy losing."],
reels_jackpot:["JACKPOT! I want 50% of that.","All correct?! Okay, that was almost… good.","Jackpot! I'm rich. You, sadly, are not.","Ka-ching ka-ching ka-ching! I love you. Just right now."],
reels_lose:["Gambled away. The bank wins, as always.","Broke. Study before you gamble again.","The house wins. I am the house. Bye."],
reels_win:["Done, and with style. Almost.","Well in the black. I'm impressed. A little."],'''
# QUIPS de / en : nach dem 'pick:'-Eintrag je Sprache einfügen
i=s.index('const QUIPS={'); 
a=s.index('\npick:[',i); s=s[:a+1]+de+'\n'+s[a+1:]
j=s.index('\nen:{',i); b=s.index('\npick:[',j); s=s[:b+1]+en+'\n'+s[b+1:]
rep("const MOODS={","const MOODS={\n  reels_ready:['cash'],reels_ok:['cash'],reels_bad:['cash'],reels_jackpot:['cash'],reels_lose:['cash'],reels_win:['cash'],")

# --- CSS Dewi
rep(".dw.m-surprised svg{animation:dw-surprised 1.7s ease-in-out infinite}",".dw.m-surprised svg{animation:dw-surprised 1.7s ease-in-out infinite}\n.dw.m-cash svg{animation:dw-cash 1.9s ease-in-out infinite}")
rep("@keyframes dw-surprised{","@keyframes dw-cash{0%,100%{transform:rotate(-1.2deg) scale(1)}50%{transform:rotate(1.3deg) scale(1.03)}}\n@keyframes dw-surprised{")

# --- Sounds
rep("  end_good(c){","""  /* Spielautomat */
  tick(c){tone(c,1500,0,.02,{v:.05,to:950});},
  lever(c){for(let i=0;i<6;i++){tone(c,2200-i*160,i*.045,.02,{v:.09,type:'square'});noise(c,i*.045,.012,.05,4000);}tone(c,120,.3,.16,{v:.5,to:55});noise(c,.3,.08,.18,900);},
  whirr(c){noise(c,0,.55,.07,2400);tone(c,170,0,.55,{type:'sawtooth',v:.05,to:520});},
  thunk(c){tone(c,160,0,.1,{v:.45,to:70});noise(c,0,.05,.16,900);},
  rwin(c){tone(c,988,0,.07,{type:'triangle',v:.24});tone(c,1319,.07,.38,{type:'triangle',v:.24});tone(c,2637,.07,.22,{v:.07});tone(c,3136,.12,.18,{v:.05});noise(c,.07,.08,.04,7000);},
  rbad(c){tone(c,110,0,.3,{type:'sawtooth',v:.2,to:88});tone(c,116,0,.3,{type:'square',v:.07,to:92});},
  jackpot(c){
    [0,4,7,12,16,19,24,28,31].forEach((st,i)=>{const f=392*Math.pow(2,st/12);tone(c,f,i*.06,.14,{type:'triangle',v:.2});tone(c,f*2,i*.06,.06,{type:'square',v:.03});});
    [1047,1319,1568,2093,2637].forEach(f=>{tone(c,f,.62,.9,{type:'triangle',v:.16});tone(c,f*2,.62,.4,{v:.05});});
    tone(c,131,.62,.5,{v:.36,to:98});
    for(let i=0;i<18;i++)tone(c,2200+((i*977)%2400),.7+i*.07,.1,{v:.08});
    noise(c,.64,.6,.07,7000);
  },
  end_good(c){""")

# --- Haptik
rep("function sfx(name,delay){","""/* Haptik: Android per vibrate; iPhone (Safari ab iOS 18) über einen versteckten Schalter, dessen Umlegen ein Tick auslöst */
const HAP={el:null};
function haptic(pat){
  try{if(navigator.vibrate&&navigator.vibrate(pat))return;}catch(e){}
  try{
    if(!HAP.el){
      const l=document.createElement('label'),i=document.createElement('input');
      i.type='checkbox';i.setAttribute('switch','');l.setAttribute('aria-hidden','true');
      l.style.cssText='position:fixed;left:-99px;top:-99px;opacity:0;pointer-events:none';
      l.appendChild(i);document.body.appendChild(l);HAP.el=l;
    }
    let at=0;[].concat(pat).forEach((v,k)=>{if(k%2===0){if(at)setTimeout(()=>{try{HAP.el.click();}catch(e){}},at);else HAP.el.click();}at+=v;});
  }catch(e){}
}
window.haptic=haptic;
function sfx(name,delay){""")

# --- Übersetzungen
en_add={
 "Reels":"Reels",
 "Hebel ziehen, Walzen beim richtigen Wort stoppen":"Pull the lever, stop each reel on the right word",
 "Ziehe den Hebel. Tippe dann jede Walze an, sobald das richtige Wort auf der Linie steht.":"Pull the lever. Then tap each reel when the right word is on the line.",
 "Wähle für jede Stelle das richtige Wort.":"Pick the right word for each position.",
 "Hebel ziehen":"Pull the lever",
 "Walze {0} stoppen":"Stop reel {0}",
 "Walze {0}":"Reel {0}",
 "Jackpot!":"Jackpot!",
 "Alles beim ersten Stopp getroffen.":"Every reel hit on the first stop.",
 "Die richtige Lösung":"The correct answer",
}
add=''.join('"%s": "%s",'%(k.replace('"','\\"'),v.replace('"','\\"')) for k,v in en_add.items())
rep('"Fertig": "Done",','"Fertig": "Done",'+add)
rep("/*@include modules/choice.js*/","/*@include modules/choice.js*/\n/*@include modules/reels.js*/")
open(p,'w',encoding='utf-8').write(s)
print('ok')
