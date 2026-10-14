p='app.src.html'
s=open(p,encoding='utf-8').read()
css='''.mascot .dw{animation:dwpop .5s cubic-bezier(.2,1.5,.4,1) both}
.mascot .dw svg{transform-origin:50% 90%;will-change:transform}
/* Minimale Schleifen je Stimmung: höchstens ca. 2° und 3,5 % Größe */
.dw.m-haughty svg{animation:dw-haughty 5.2s ease-in-out infinite}
.dw.m-bored svg{animation:dw-bored 6.8s ease-in-out infinite}
.dw.m-annoyed svg{animation:dw-annoyed 3.2s ease-in-out infinite}
.dw.m-sly svg{animation:dw-sly 3.8s ease-in-out infinite}
.dw.m-shades svg{animation:dw-shades 3.2s ease-in-out infinite}
.dw.m-sleep svg{animation:dw-sleep 4.4s ease-in-out infinite}
.dw.m-mean svg{animation:dw-mean 3.6s ease-in-out infinite}
.dw.m-superior svg{animation:dw-superior 5.6s ease-in-out infinite}
.dw.m-uninterested svg{animation:dw-uninterested 7.4s ease-in-out infinite}
.dw.m-surprised svg{animation:dw-surprised 1.7s ease-in-out infinite}
@keyframes dwpop{0%{transform:scale(.86) translateY(5px);opacity:0}55%{transform:scale(1.06);opacity:1}100%{transform:none;opacity:1}}
@keyframes dw-haughty{0%,100%{transform:rotate(-1.2deg) scale(1)}50%{transform:rotate(.8deg) scale(1.02)}}
@keyframes dw-bored{0%,100%{transform:rotate(-1.6deg) translateY(0)}50%{transform:rotate(1.6deg) translateY(1.5px)}}
@keyframes dw-annoyed{0%,60%,100%{transform:none}66%{transform:rotate(-.9deg)}72%{transform:rotate(.9deg)}78%{transform:rotate(-.7deg)}84%{transform:rotate(.6deg)}90%{transform:none}}
@keyframes dw-sly{0%,100%{transform:rotate(0) scale(1)}45%,60%{transform:rotate(2.2deg) scale(1.02)}}
@keyframes dw-shades{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-2px) scale(1.015)}}
@keyframes dw-sleep{0%,100%{transform:scale(1)}50%{transform:scale(1.035)}}
@keyframes dw-mean{0%,100%{transform:scale(1) rotate(-.8deg)}50%{transform:scale(1.03) rotate(.4deg)}}
@keyframes dw-superior{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-2px) rotate(.4deg)}}
@keyframes dw-uninterested{0%,100%{transform:rotate(0)}35%,65%{transform:rotate(1.9deg)}}
@keyframes dw-surprised{0%,100%{transform:scale(1)}40%{transform:scale(1.03)}}
'''
anchor=".dw svg{display:block;width:100%;height:auto;overflow:visible}"
assert anchor in s
s=s.replace(anchor,anchor+"\n"+css,1)
open(p,'w',encoding='utf-8').write(s)
print('ok')
