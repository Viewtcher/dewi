import re,os
p='app.src.html'
src=open(p,encoding='utf-8').read()
lines=src.split('\n')
START=re.compile(r'^(function |const |let |/\*|//|render\(\))')
def find(name):
    pats=[f'function {name}(',f'const {name}=',f'let {name}=',f'let {name},',f'let {name};']
    for i,l in enumerate(lines):
        if any(l.startswith(x) for x in pats): return i
    raise SystemExit('nicht gefunden: '+name)
def span(name):
    i=find(name)
    s=i
    while s>0 and lines[s-1].startswith(('/*','//')) and lines[s-1].rstrip().endswith('*/') or (s>0 and lines[s-1].startswith('//')):
        s-=1
    j=i+1
    while j<len(lines) and not START.match(lines[j]): j+=1
    # führende Kommentare des nächsten Blocks gehören nicht dazu
    while j>i+1 and lines[j-1].startswith(('/*','//')): j-=1
    return s,j
def take(names):
    out=[];ranges=[]
    for n in names:
        s,j=span(n);ranges.append((s,j));out.append('\n'.join(lines[s:j]).rstrip()+'\n')
    return out,ranges
def remove(ranges,marker_at=None):
    global lines
    ranges=sorted(set(ranges),reverse=True)
    for s,j in ranges:
        del lines[s:j]
groups={
 'modules/_shared.js':['toGl','toIdl','hlId','hlSlot','PROPER','tokensOf','isProper','tileText','tilesOf','poolOf','distractors','editDist','HEART','hearts','livesHtml','setLives'],
 'modules/intro.js':['showIntro'],
 'modules/blocks.js':['buildPair','showBuild'],
 'modules/typing.js':['hintFor','typoTol','ANS_CACHE','ownAnswers','isCorrect','showQuestion'],
 'modules/swipe.js':['swipeWrong','swKey','showSwipe'],
 'modules/gap.js':['gapParts','gapTiles','showGap'],
 'modules/choice.js':['choiceOptions','showChoice'],
 'rounds.js':['S','startSession','closeSheet','sheetBody','showItem','nextStep','kicker','finish','levelUp','showEnd'],
 'playmodes.js':['MODES','modeLabel','openModes'],
}
# stepsFor, showSentence entfallen
drop=['stepsFor','showSentence']
allr=[];bodies={}
for f,names in groups.items():
    parts,rs=take(names);bodies[f]=parts;allr+=rs
_,dr=take(drop);allr+=dr
# Einfügepunkt: dort, wo startSession stand
ins=span('S')[0]
# Kommentarzeile "Abfrage" am Einfügepunkt
remove(allr)
inc=['modules/_registry.js','rounds.js','playmodes.js','modules/_shared.js','modules/intro.js','modules/blocks.js','modules/typing.js','modules/swipe.js','modules/gap.js','modules/choice.js']
marker='\n'.join(f'/*@include {f}*/' for f in inc)
lines.insert(ins,marker)
os.makedirs('modules',exist_ok=True)
for f,parts in bodies.items():
    open(f,'w',encoding='utf-8').write('\n'.join(parts))
open(p,'w',encoding='utf-8').write('\n'.join(lines))
print('ok',{f:len('\n'.join(b)) for f,b in bodies.items()})
