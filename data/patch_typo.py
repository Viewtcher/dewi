p='/home/claude/kata/app.src.html'
s=open(p,encoding='utf8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,(s.count(old),old[:70])
    s=s.replace(old,new)
rep("""function isCorrect(c,val){
  if(c.dir==='id2gl'){const a=normG(val);return !!a&&gl(c.w).split('/').map(normG).indexOf(a)>-1;}
  const a=normId(val);return !!a&&c.accept.indexOf(a)>-1;
}""","""/* Kulanz bei der Rechtschreibung: erlaubte Tippfehler = Länge / Teiler, Teiler je Stufe. Stufe 5 ist exakt. */
const TYPO_DIV=[4,4,6,9,14,Infinity];
const typoTol=(len,lvl)=>{const d=TYPO_DIV[Math.max(0,Math.min(5,lvl||0))];return d===Infinity?0:Math.floor(len/d);};
function editDist(a,b){   // Damerau-Levenshtein: ein Buchstabendreher zählt als 1 Fehler
  const m=a.length,n=b.length,d=[];
  for(let i=0;i<=m;i++){d[i]=[i];}
  for(let j=1;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++){
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
  }
  return d[m][n];
}
let ANS_CACHE={};
function ownAnswers(dir){   // alle Schreibweisen anderer Wörter: ein anderes echtes Wort wird nie als Tippfehler durchgewunken
  const key=state.lang+dir+state.ui;
  if(!ANS_CACHE[key]){
    const set=new Set();
    curLang().words.forEach(w=>{if(dir==='id2gl')gl(w).split('/').forEach(x=>set.add(normG(x)));else set.add(normId(w.id));});
    ANS_CACHE[key]=set;
  }
  return ANS_CACHE[key];
}
function isCorrect(c,val){
  c.typo=false;c.near=false;
  const id2gl=c.dir==='id2gl';
  const a=id2gl?normG(val):normId(val);
  if(!a)return false;
  const cands=(id2gl?gl(c.w).split('/').map(normG):c.accept).filter(Boolean);
  if(cands.indexOf(a)>-1)return true;
  if(a.length<3)return false;
  const own=ownAnswers(id2gl?'id2gl':'gl2id');
  let best=99,tolBest=0;
  for(const x of cands){
    const d=editDist(a,x),tol=typoTol(x.length,c.lvl);
    if(d<best){best=d;tolBest=tol;}
  }
  if(best<=tolBest&&best>0&&!own.has(a)){c.typo=true;return true;}
  if(best<=tolBest+1&&best>0&&cands[0].length>=4)c.near=true;
  return false;
}""")
rep("    fb.textContent=(left===1?t('Nicht ganz. Noch 1 Versuch.'):t('Nicht ganz. Noch {0} Versuche.',left))","    fb.textContent=(c.near?(left===1?t('Fast! Achte auf die Schreibweise. Noch 1 Versuch.'):t('Fast! Achte auf die Schreibweise. Noch {0} Versuche.',left)):(left===1?t('Nicht ganz. Noch 1 Versuch.'):t('Nicht ganz. Noch {0} Versuche.',left)))")
rep("  let when;\n","  const typoNote=c.typo?`<p class=\"hint\" style=\"margin-top:6px\">${t('Kleiner Tippfehler. Richtig geschrieben: {0}','<b lang=\"'+(c.dir==='gl2id'?L.code.toLowerCase():state.ui)+'\">'+esc(c.dir==='gl2id'?w.id:glFirst(w))+'</b>')}</p>`:'';\n  let when;\n")
rep("<div class=\"pair\"><span lang=\"${L.code.toLowerCase()}\">${esc(w.id)}</span><em>=</em><span lang=\"${state.ui}\">${esc(gl(w))}</span></div>${alts}</div>","<div class=\"pair\"><span lang=\"${L.code.toLowerCase()}\">${esc(w.id)}</span><em>=</em><span lang=\"${state.ui}\">${esc(gl(w))}</span></div>${typoNote}${alts}</div>")
rep("const EN={","const EN={\"Fast! Achte auf die Schreibweise. Noch 1 Versuch.\": \"Almost! Watch the spelling. 1 try left.\", \"Fast! Achte auf die Schreibweise. Noch {0} Versuche.\": \"Almost! Watch the spelling. {0} tries left.\", \"Kleiner Tippfehler. Richtig geschrieben: {0}\": \"Small typo. Correct spelling: {0}\", ")
open(p,'w',encoding='utf8').write(s)
print('ok')
