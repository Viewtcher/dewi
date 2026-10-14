p='app.src.html'
s=open(p,encoding='utf-8').read()
R=[
("--bg:#0d1325; --surface:#141b33; --raised:#1b2444; --line:#27325a; --line-soft:#1e2748;","--bg:#1a0f24; --surface:#251634; --raised:#301d42; --line:#4a2f63; --line-soft:#3a2450;"),
("--text:#ece8dc; --muted:#a0aac9; --faint:#8490b4;","--text:#fbefe9; --muted:#cdb4da; --faint:#aa8fbd;"),
("--accent:#ffc23d; --accent-ink:#1b1403; --accent-soft:rgba(255,194,61,.16);","--accent:#f566b9; --accent-ink:#2a1630; --accent-soft:rgba(245,102,185,.18); --grad:linear-gradient(135deg,#ff92d2,#f566b9);"),
(".btn.primary{background:linear-gradient(135deg,var(--c-yellow),var(--c-orange));border-color:transparent;color:var(--accent-ink);box-shadow:0 4px 0 #b3560f;",".btn.primary{background:var(--grad);border-color:transparent;color:var(--accent-ink);box-shadow:0 4px 0 #a82d7c;"),
("0 4px 0 #b3560f,0 0 0 0 rgba(255,194,61,.55)}50%{box-shadow:0 4px 0 #b3560f,0 0 0 12px rgba(255,194,61,0)}","0 4px 0 #a82d7c,0 0 0 0 rgba(245,102,185,.55)}50%{box-shadow:0 4px 0 #a82d7c,0 0 0 12px rgba(245,102,185,0)}"),
(".seg button[aria-checked=true]{background:linear-gradient(135deg,var(--c-yellow),var(--c-orange));",".seg button[aria-checked=true]{background:var(--grad);"),
("--pcs:rgba(255,194,61,.27)","--pcs:rgba(245,102,185,.3)"),
("linear-gradient(155deg,#1b2652 0%,#2b1f5e 100%);border-color:#3b3a82","linear-gradient(155deg,#3a1b52 0%,#521f63 100%);border-color:#7a3f94"),
("%23e8b13a","%23ff9fd6"),
("box-shadow:0 4px 0 #b9bfd6","box-shadow:0 4px 0 #d8b6e4"),
("color:#0d1325;box-shadow:0 4px 0 #d8b6e4","color:#2a1630;box-shadow:0 4px 0 #d8b6e4"),
("radial-gradient(circle at 50% 44%,#2a1b6b 0%,#120f33 55%,#080c1e 100%)","radial-gradient(circle at 50% 44%,#5a2370 0%,#2a1233 55%,#12081a 100%)"),
("radial-gradient(circle at 35% 30%,#3a2a8c,#150f3d)","radial-gradient(circle at 35% 30%,#7a2f8f,#2a1233)"),
(".lvl .bubble::before{background:#3a3560",".lvl .bubble::before{background:#4a2a63"),
]
for a,b in R:
    assert a in s,a[:50]
    s=s.replace(a,b)
s=s.replace("Farben: Indigo (nila) und Kurkuma (kunyit), wie beim Batik-Färben.","Farben: dunkles Aubergine und Pink passend zu Dewi; Regenbogen-Akzente bleiben.")
open(p,'w',encoding='utf-8').write(s)
b=open('build.py',encoding='utf-8').read()
b=b.replace('content="#0d1325"','content="#1a0f24"').replace('fill=(13,19,37)','fill=(26,15,36)').replace("Image.new('RGB',(S,S),(13,19,37))","Image.new('RGB',(S,S),(26,15,36))")
open('build.py','w',encoding='utf-8').write(b)
