p='app.src.html'
s=open(p,encoding='utf-8').read()
old="  right(c){tone(c,784,0,.07,{type:'triangle',v:.3});tone(c,1175,.07,.12,{type:'triangle',v:.3});},          // knapper, frecher Ping\n"
assert old in s
new='''  /* Gewinn wie am Spielautomaten: schneller Aufstieg, Jackpot-Akkord, Münzregen */
  right(c){
    [0,2,4,7,9,12,14,16].forEach((st,i)=>{const f=523*Math.pow(2,st/12);tone(c,f,i*.05,.09,{type:'triangle',v:.2});tone(c,f*2,i*.05,.05,{type:'square',v:.04});});
    [1047,1319,1568,2093].forEach(f=>{tone(c,f,.42,.5,{type:'triangle',v:.17});tone(c,f*2,.42,.3,{v:.06});});
    tone(c,131,.42,.2,{v:.35,to:98});
    [.46,.53,.6,.66,.74,.8,.9].forEach((a,i)=>tone(c,[3136,3951,2637,4186,3520,3136,4699][i],a,.1,{v:.09}));
    noise(c,.44,.3,.06,6500);
  },
  key(c){const f=1000+Math.random()*350;tone(c,f,0,.03,{v:.11,to:f*.65});noise(c,0,.012,.05,3500);},
  keydel(c){tone(c,620,0,.03,{v:.1,to:380});},
'''
s=s.replace(old,new,1)
a="  const scanSnd=()=>{"
assert a in s
s=s.replace(a,'''  document.addEventListener('input',e=>{
    const el=e.target;
    if(!el||!el.matches||!el.matches('input.field,textarea.field')||el.readOnly)return;
    sfx(/^delete/.test(e.inputType||'')?'keydel':'key');
  },true);
'''+a,1)
open(p,'w',encoding='utf-8').write(s)
