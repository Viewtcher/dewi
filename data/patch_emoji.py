import re
p='app.src.html'
s=open(p,encoding='utf-8').read()
# CSS
a=s.index('.fl{--sh:7px;')
b=s.index('.week{display:flex;gap:8px}')
css='''.fl{--sh:8px;--fs:40px;position:relative;width:46px;height:58px;flex:none;display:grid;place-items:end center}
.fl.big{--sh:14px;--fs:66px;width:76px;height:96px}
.fl .fe{display:block;font-size:var(--fs);line-height:1;padding-bottom:2px;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;transform-origin:50% 92%;filter:drop-shadow(0 0 var(--sh) rgba(255,150,60,.6))}
.fl:not(.off) .fe{animation:femoji 1.7s ease-in-out infinite}
.fl.off .fe{filter:grayscale(1) brightness(.8);opacity:.4}
.fl .fp{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.fl .em{transform-origin:0 0;opacity:0;animation:ember 2.2s ease-out infinite}
.fl .e2{animation-delay:.7s}.fl .e3{animation-delay:1.4s}
@keyframes ember{0%{opacity:0;transform:translateY(12px) scale(.5)}20%{opacity:1}100%{opacity:0;transform:translateY(-26px) scale(.35) rotate(25deg)}}
@keyframes femoji{0%,100%{transform:scale(1,1) rotate(-2deg)}22%{transform:scale(1.04,1.08) rotate(1.5deg)}50%{transform:scale(.97,1.02) rotate(2.2deg)}76%{transform:scale(1.03,1.06) rotate(-1.2deg)}}
'''
s=s[:a]+css+s[b:]
# JS
a=s.index('/* Flamme im Duolingo-Stil')
b=s.index('function burst(')
js='''/* Flamme: iPhone-Feuer-Emoji (🔥), leicht wiegend und pulsierend, dazu drei aufsteigende bunte Funken.
   Bei 0 Tagen ist das Emoji grau und ruhig. */
function flameSvg(streak,big){
  const on=streak>0;
  const em='M0 -5C2.6 -1.4 3.2 1.6 0 5C-3.2 1.6 -2.6 -1.4 0 -5Z';
  const embers=on?[[19,8,'#ff9fd0','e1'],[10,24,'#ffe27a','e2'],[47,12,'#7ff0ff','e3']].map(e=>`<g transform="translate(${e[0]} ${e[1]})"><path class="em ${e[3]}" d="${em}" fill="${e[2]}"/></g>`).join(''):'';
  return `<div class="fl${big?' big':''}${on?'':' off'}" role="img" aria-label="${t('Flamme: {0} {1} in Folge',streak,streak===1?t('Tag'):t('Tage'))}"><span class="fe" aria-hidden="true">\\u{1F525}</span><svg class="fp" viewBox="0 0 64 80" aria-hidden="true">${embers}</svg></div>`;
}
'''
s=s[:a]+js+s[b:]
open(p,'w',encoding='utf-8').write(s)
