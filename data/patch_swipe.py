p='app.src.html'
s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert old in s,old[:70]
    s=s.replace(old,new,1)
blk=open('data/swipe_block.js',encoding='utf-8').read()
rep("function showSentence(){\n  const c=S.cur,w=c.w,s=sentOf(w);\n","function showSentence(){\n  const c=S.cur,w=c.w,s=sentOf(w);\n  if(Math.random()<.3)return showSwipe();   // Swipe taucht zufällig auf\n")
rep("function showSentence(){",blk+"\nfunction showSentence(){")
rep('"Fertig": "Done",','"Fertig": "Done", "Swipe": "Swipe", "Wische die Karte zur richtigen Übersetzung oder tippe sie an.": "Swipe the card toward the right translation or tap it.",')
css='''.swstage{display:flex;justify-content:center;padding:8px 0 4px}
.swcard{position:relative;width:min(100%,300px);min-height:176px;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;border-radius:24px;background:linear-gradient(160deg,var(--raised),var(--surface));border:1.5px solid var(--line);border-bottom-width:4px;font:700 36px/1.15 var(--display);text-wrap:balance;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none;box-shadow:0 14px 34px rgba(0,0,0,.3);transition:transform .3s cubic-bezier(.2,1.25,.4,1),opacity .3s,border-color .15s}
.swcard.long{font-size:25px}
.swcard.drag{transition:border-color .15s;cursor:grabbing}
.swcard.lean{border-color:#f566b9}
.swcard.gone{opacity:0;transition:transform .32s ease-in,opacity .32s}
.swopts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.swb{min-height:70px;display:flex;align-items:center;gap:8px;padding:0 14px;border-radius:14px;border:1.5px solid var(--line);border-bottom-width:3px;background:var(--surface);font-size:17px;font-weight:700;text-align:center;justify-content:center;transition:border-color .15s,background .15s,transform .15s}
.swb i{font-style:normal;color:var(--faint);font-size:20px;flex:none}
.swb span{flex:1;overflow-wrap:anywhere}
.swb.lean{border-color:#f566b9;background:rgba(245,102,185,.14);transform:translateY(-2px)}
.swb.ok{border-color:var(--good);background:var(--good-soft)}
.swb.no{border-color:var(--bad);background:var(--bad-soft);animation:shake .35s}
.swb:disabled{cursor:default}
'''
rep(".opts{display:grid;gap:10px}",css+".opts{display:grid;gap:10px}")
rep("  glitter(c){","  swipe(c){noise(c,0,.14,.1,5000);tone(c,950,0,.13,{v:.05,to:300});},\n  glitter(c){")
open(p,'w',encoding='utf-8').write(s)
print('ok')
