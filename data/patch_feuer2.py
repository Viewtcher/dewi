import re
old=open('data/app.src.v19.bak.html',encoding='utf-8').read()
s=open('app.src.html',encoding='utf-8').read()
# --- CSS: alter Block (v19) ohne Farbdrehung
a=old.index('.fl{--sh:7px;');b=old.index('.week{display:flex;gap:8px}')
css=old[a:b]
css=css.replace('.fl:not(.off){animation:flhue 7s linear infinite}\n','')
css=re.sub(r'@keyframes flhue\{.*?\}\}\n','',css,flags=re.S)
a=s.index('.fl{--sh:8px;');b=s.index('.week{display:flex;gap:8px}')
s=s[:a]+css+s[b:]
# --- JS: alter Block (v19) mit neuen Formen und Verlauf unten->oben
a=old.index('/* Flamme im Duolingo-Stil');b=old.index('function burst(')
js=old[a:b]
a2=js.index('const FLAME_PATHS=[');b2=js.index('];',a2)+2
paths='''const FLAME_PATHS=[
 'M32 78C16 78 7 66 9 52C10 44 15 38 19 33C20 38 22 41 25 42C24 30 29 17 38 6C39 14 43 20 47 26C52 33 56 42 55 54C54 68 46 78 32 78Z',
 'M32 75C21 75 15 67 16 58C17 51 21 47 25 42C26 47 28 49 31 50C31 42 34 35 38 30C40 36 46 41 47 53C48 67 42 75 32 75Z',
 'M32 73C25 73 22 68 23 63C24 58 28 55 32 50C32 53 35 55 37 55C40 58 42 62 41 66C40 71 37 73 32 73Z',
 'M32 73C28 73 26 70 27 67C28 64 30 62 32 60C34 62 37 64 37 67C37 70 36 73 32 73Z'
];'''
js=js[:a2]+paths+js[b2:]
js=js.replace("grad(1,['#a888ff','#5aa9ff','#35dcd2','#6ee77a','#ffc23d','#ff8a3d','#ff3d7f'])","grad(1,['#ff3d7f','#ff8a3d','#ffc23d','#6ee77a','#35dcd2','#5aa9ff','#a888ff'])")
js=js.replace("grad(2,['#b79bff','#79b8ff','#4fe8dc','#86f08e','#ffd45c','#ffa14d','#ff6b9b'])","grad(2,['#ff6b9b','#ffa14d','#ffd45c','#86f08e','#4fe8dc','#79b8ff','#b79bff'])")
js=js.replace("grad(3,['#e2d5ff','#bfe0ff','#aef9ee','#d2ffc4','#ffee8a','#ffd27a','#ffb3cf'])","grad(3,['#ffb3cf','#ffd27a','#ffee8a','#d2ffc4','#aef9ee','#bfe0ff','#e2d5ff'])")
assert '#ff3d7f\',\'#ff8a3d' in js
js=js.replace('Flamme im Duolingo-Stil: vier Schichten desselben Umrisses','Flamme nach dem Vorbild des iPhone-Feuer-Emojis (Spitze nach rechts, Zunge links, helle Kernflamme)')
a=s.index('/* Flamme: iPhone-Feuer-Emoji');b=s.index('function burst(')
s=s[:a]+js+s[b:]
open('app.src.html','w',encoding='utf-8').write(s)
