p='/home/claude/kata/app.src.html'; s=open(p,encoding='utf-8').read()
css='''
/* ===== Reels (Spielautomat) ===== */
.rl-ctx{margin:6px 0 0;color:var(--muted);font:500 15px/1.4 var(--body)}.rl-ctx i{font-style:normal;color:var(--c-pink);letter-spacing:2px}
.cab{position:relative;margin:16px auto 8px;max-width:360px;padding:30px 26px 22px;border-radius:28px;background:linear-gradient(160deg,#ff5cac,#e0197d 55%,#b80f66);border:3px solid #ffcf4a;box-shadow:0 0 0 3px #7a0a43,0 9px 0 3px #7a0a43,0 18px 30px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,255,255,.45)}
.cab[data-st=spin]{box-shadow:0 0 0 3px #7a0a43,0 9px 0 3px #7a0a43,0 0 34px 6px rgba(255,92,172,.75),inset 0 2px 0 rgba(255,255,255,.45)}
.cab[data-st=jack]{box-shadow:0 0 0 3px #7a0a43,0 9px 0 3px #7a0a43,0 0 44px 10px rgba(255,210,70,.9),inset 0 2px 0 rgba(255,255,255,.45)}
.bl{position:absolute;display:flex;justify-content:space-between;pointer-events:none}
.bl.bt{left:16px;right:16px;top:8px}.bl.bb{left:16px;right:16px;bottom:6px}.bl.bl2,.bl.br2{top:34px;bottom:30px;flex-direction:column}.bl.bl2{left:7px}.bl.br2{right:7px}
.bl i{width:8px;height:8px;border-radius:50%;background:#ffe27a;box-shadow:0 0 6px 2px rgba(255,226,122,.85)}
.bl i:nth-child(odd){animation:rlb1 .9s steps(1) infinite}.bl i:nth-child(even){animation:rlb2 .9s steps(1) infinite}
.cab[data-st=spin] .bl i{animation-duration:.3s}.cab[data-st=jack] .bl i{animation:rlj .25s steps(1) infinite}
@keyframes rlb1{0%{opacity:1}50%{opacity:.25}}@keyframes rlb2{0%{opacity:.25}50%{opacity:1}}@keyframes rlj{0%{opacity:1;background:#fff}50%{opacity:.4;background:#ffd23d}}
.sign{margin:0 auto 12px;width:max-content;max-width:100%;padding:5px 16px;border-radius:12px;background:#3a0526;border:2px solid #ffcf4a;font:800 17px/1.1 var(--display);letter-spacing:.14em;color:#fff;text-shadow:0 0 6px #ff5cac,0 0 14px #ff5cac,0 0 26px #ff2f94}
.cab[data-st=jack] .sign{color:#fff6c0;text-shadow:0 0 6px #ffd23d,0 0 16px #ffb700,0 0 30px #ff9d00;animation:rlsign .3s steps(1) infinite}.cab[data-st=lose] .sign{opacity:.7;text-shadow:none}
@keyframes rlsign{50%{opacity:.55}}
.cbody{display:flex;gap:10px;align-items:stretch}
.win{position:relative;flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:8px;border-radius:14px;background:#1c0614;border:3px solid #ffcf4a;box-shadow:inset 0 3px 10px rgba(0,0,0,.7)}
.reel{position:relative;height:132px;overflow:hidden;border-radius:8px;background:#fff;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
.reel::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(40,10,30,.55),rgba(40,10,30,0) 32%,rgba(40,10,30,0) 68%,rgba(40,10,30,.55))}
.rw{position:absolute;left:0;right:0;top:0;height:44px;display:flex;align-items:center;justify-content:center;font:700 18px var(--display);color:#2a0c20;white-space:nowrap;will-change:transform}
.reel.rw-m .rw{font-size:16px}.reel.rw-s .rw{font-size:14px}
.reel.ok{background:#c8ffd2}.reel.ok .rw.mid{color:#0a7a2a}
.reel.no{background:#ffc9d1;animation:rlshake .45s}.reel.no .rw.mid{color:#b0102c}
.reel.rev{background:#e8e0ee}.reel.gold{background:linear-gradient(#ffe9a0,#ffd23d)}
@keyframes rlshake{0%,100%{transform:translateX(0)}15%{transform:translateX(-7px)}30%{transform:translateX(7px)}45%{transform:translateX(-6px)}60%{transform:translateX(5px)}80%{transform:translateX(-2px)}}
.cab[data-st=spin] .win{box-shadow:inset 0 3px 10px rgba(0,0,0,.7),0 0 16px rgba(255,92,172,.8)}
.pay{position:absolute;left:4px;right:4px;top:50%;margin-top:-1px;height:0;border-top:2px solid rgba(255,40,70,.9);pointer-events:none;box-shadow:0 0 6px rgba(255,40,70,.9)}
.arr{position:absolute;top:50%;margin-top:-8px;width:0;height:0;border:8px solid transparent;pointer-events:none}
.arr.l{left:-8px;border-left:11px solid #ff2846;border-right:0}.arr.r{right:-8px;border-right:11px solid #ff2846;border-left:0}
.lev{position:relative;width:34px;flex:none}
.lev .track{position:absolute;left:50%;top:6px;bottom:6px;width:10px;margin-left:-5px;border-radius:6px;background:linear-gradient(90deg,#b8860b,#ffe27a,#b8860b);box-shadow:inset 0 0 0 2px #7a0a43}
.knob{position:absolute;left:50%;top:0;width:34px;height:34px;margin-left:-17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff9db8,#e0295a 55%,#8a0f2e);border:2px solid #fff;box-shadow:0 4px 0 #6a0a24,0 0 12px rgba(255,80,120,.8);cursor:grab;touch-action:none;transform:translateY(var(--ly,0px));transition:transform .45s cubic-bezier(.3,1.6,.5,1);animation:rlhint 1.2s ease-in-out infinite}
.knob.drag{transition:none;cursor:grabbing;animation:none}.knob.pulled{animation:none}
.cab:not([data-st=idle]) .knob{animation:none}
@keyframes rlhint{0%,100%{margin-top:0}50%{margin-top:7px}}
.rl-m{margin-top:6px}
.rl-list{display:grid;gap:12px;margin-top:14px}.rl-pick{display:flex;flex-wrap:wrap;gap:8px}.rl-pick .opt{width:auto;flex:1 1 30%}
'''
i=s.index('</style>'); s=s[:i]+css+s[i:]
open(p,'w',encoding='utf-8').write(s); print('css ok')
