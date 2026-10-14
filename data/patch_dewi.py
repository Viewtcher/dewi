import re
p='app.src.html'
s=open(p,encoding='utf-8').read()

# ---- 1) CSS ------------------------------------------------------------
a=s.index('/* ---- Maskottchen Tokek ---- */')
b=s.index('.bubble{position:relative')
css='''/* ---- Maskottchen Dewi ---- */
.mascot{display:flex;align-items:center;gap:10px;margin:2px 0 4px}
.mascot .dw{flex:none;width:104px}
.mascot.sm .dw{width:84px}
.mascot.col{flex-direction:column;text-align:center}
.mascot.col .dw{width:150px}
.dw svg{display:block;width:100%;height:auto;overflow:visible}
'''
s=s[:a]+css+s[b:]
# alte Keyframes für Tokek bleiben unbenutzt -> entfernen
s=re.sub(r'@keyframes (gbob|gbreath|gtilt|gblink|gjump|gz|gtw|gtear)\{[^\n]*\}\n','',s)

# ---- 2) JS: Maskottchen-Block --------------------------------------------
a=s.index('/* ---------- Maskottchen Tokek ---------- */')
b=s.index('/* ---------- Oberfläche ---------- */')
js=open('data/dewi_block.js',encoding='utf-8').read()
s=s[:a]+js+'\n'+s[b:]

# ---- 3) Schalter entfernen --------------------------------------------------
s=re.sub(r'\n  <section class="card set"><div class="eyebrow">\$\{t\(\'Maskottchen Tokek\'\)\}</div>.*?</p></section>','',s,count=1,flags=re.S)
s=s.replace("  $$('[data-q]',app).forEach(b=>b.onclick=()=>{state.quips=b.dataset.q==='1';save();render();});\n",'')
# EN-Einträge der entfernten Texte
for k in ['"Maskottchen Tokek": "Mascot Tokek", ','"An": "On", ','"Aus": "Off", ','"Der Gecko kommentiert deine Antworten mit kleinen Sprüchen.": "The gecko comments on your answers with little quips.", ']:
    assert k in s,k
    s=s.replace(k,'')
open(p,'w',encoding='utf-8').write(s)
print('ok')
