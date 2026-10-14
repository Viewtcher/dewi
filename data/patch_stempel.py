import re
p='app.src.html'
s=open(p,encoding='utf-8').read()

# 1) Miene "zufrieden" (geschlossene, nach oben geschwungene Augen) im Dewi-Block
s=s.replace("  surprised:{rot:3,","  content:{rot:-4,bl:[54,86,84,86,4],br:[116,86,146,86,4],cup:1,m:'smirk'},\n  surprised:{rot:3,",1)
assert "content:{rot:-4" in s
s=s.replace("  }else if(c.closed){","  }else if(c.cup){\n    f+=dwClosed(68,1,true)+dwClosed(132,-1,true);\n  }else if(c.closed){",1)
assert "c.cup" in s

# 2) JS-Block vor der Oberfläche
blk=open('data/stamps_block.js',encoding='utf-8').read()
i=s.index('/* ---------- Oberfläche ---------- */')
s=s[:i]+blk+'\n'+s[i:]

# 3) Zustand: stamps
s=s.replace("done:{},quips:true,form:[]});","done:{},quips:true,form:[],stamps:{}});",1)
s=s.replace("  if(state.quips===undefined)state.quips=true;\n","  if(state.quips===undefined)state.quips=true;\n  if(!state.stamps||typeof state.stamps!=='object')state.stamps={};\n",1)
s=s.replace("quips:state.quips,form:state.form}});","quips:state.quips,form:state.form,stamps:state.stamps}});",1)

# 4) Wochenleiste
old=s[s.index("  let week='';\n  for(let i=6;i>=0;i--){"):s.index("  const tomorrow=addDays(t0,1);")]
new='''  let week='',chg=false;
  for(let i=6;i>=0;i--){
    const d=addDays(t0,-i),on=!!state.done[d],lab=dayName(d,{weekday:'long',day:'numeric',month:'long'});
    if(on){
      const had=!!(state.stamps&&state.stamps[d]),mood=stampFor(d);if(!had)chg=true;
      week+=`<button class="day on${i===0?' now':''}" data-stamp="${d}" data-mood="${mood}" aria-label="${esc(lab)}: ${t('erledigt')} · ${t('Marke ansehen')}"><span class="st">${stampSvg(mood,i*.7)}</span><span>${dayName(d,{weekday:'narrow'})}</span></button>`;
    }else{
      week+=`<div class="day${i===0?' now':''}" style="--dc:${WDCOL[parse(d).getDay()]}" aria-label="${esc(lab)}: ${t('offen')}"><i></i><span>${dayName(d,{weekday:'narrow'})}</span></div>`;
    }
  }
  if(chg)save();
'''
s=s.replace(old,new,1)
s=s.replace("function bindHome(){\n","function bindHome(){\n  $$('[data-stamp]',app).forEach(b=>b.onclick=()=>openStamp(b.dataset.stamp,b));\n",1)
# Overlay beim Neuaufbau schließen
s=s.replace("function render(){\n  applyStatic();","function render(){\n  closeStamp();\n  applyStatic();",1)
assert "closeStamp();\n  applyStatic" in s

# 5) CSS
a=s.index('.day{display:grid;justify-items:center;gap:6px;')
b=s.index('.day.now i{outline:2px solid var(--dc);outline-offset:2px}')+len('.day.now i{outline:2px solid var(--dc);outline-offset:2px}')
css='''.day{display:grid;justify-items:center;gap:6px;font-size:11px;color:var(--faint)}
.day i{width:34px;height:34px;border-radius:7px;border:1.5px solid var(--line)}
.day.now span:last-child{color:var(--text);font-weight:700}
.day.now i{outline:2px solid var(--dc);outline-offset:2px}
button.day{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
.day .st{display:block;width:38px;height:38px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.45));transition:transform .15s}
.day .st svg{display:block;width:100%;height:100%;overflow:visible}
button.day:active .st{transform:scale(.93)}
button.day.now .st{outline:2px solid var(--c-orange);outline-offset:1px;border-radius:3px}
/* Große Marke */
html.sv-open,html.sv-open body{overflow:hidden}
.stampview{position:fixed;inset:0;z-index:60;display:grid;place-items:center;animation:svin .22s ease-out}
.sv-back{position:absolute;inset:0;background:radial-gradient(circle at 50% 44%,rgba(70,25,90,.88),rgba(18,8,26,.95))}
.sv-x{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:16px;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--text);font-size:26px;line-height:1;z-index:2}
.sv-stage{position:relative;display:grid;justify-items:center;gap:16px;padding:20px;max-width:100%}
.sv-card{width:min(74vw,320px);aspect-ratio:1;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;--lift:0;
  filter:drop-shadow(0 calc(10px + 26px*var(--lift)) calc(14px + 22px*var(--lift)) rgba(0,0,0,.55)) drop-shadow(0 0 18px rgba(120,220,255,.28))}
.sv-card.held{cursor:grabbing;transition:none}
.sv-card.back{transition:transform .55s cubic-bezier(.2,1.7,.4,1),filter .4s}
.sv-idle{width:100%;height:100%;animation:svfloat 5s ease-in-out infinite;transform-style:preserve-3d}
.sv-card.held .sv-idle{animation:none}
.sv-idle svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}
.sv-cap{display:grid;gap:2px;text-align:center;font-size:15px;color:var(--muted)}
.sv-cap b{color:var(--text);font:700 18px var(--display)}
.sv-hint{font-size:13px;color:var(--faint);text-align:center}
@keyframes svfloat{0%,100%{transform:perspective(500px) rotateY(-7deg) rotateX(4deg)}50%{transform:perspective(500px) rotateY(7deg) rotateX(-4deg)}}
@keyframes svin{from{opacity:0}to{opacity:1}}'''
s=s[:a]+css+s[b:]

# 6) Englisch
add={'Schelmisch':'Sly','Cool':'Cool','Überlegen':'Superior','Überheblich':'Haughty','Überrascht':'Surprised','Gemein':'Mean','Gelangweilt':'Bored','Zufrieden':'Content','Genervt':'Annoyed','Schlafend':'Sleeping','Marke ansehen':'View stamp','Schließen':'Close','Ziehen, um die Marke anzuheben und zu neigen.':'Drag to lift and tilt the stamp.'}
ins=''.join(f', "{k}": "{v}"' for k,v in add.items() if f'"{k}":' not in s)
assert '"Fertig": "Done"};' in s
s=s.replace('"Fertig": "Done"};','"Fertig": "Done"'+ins+'};',1)
open(p,'w',encoding='utf-8').write(s)
print('ok')
