import re,sys,glob
seen={};bad=0;cnt={};cat=None
for f in sorted(glob.glob('[0-9]*.txt')):
    for n,l in enumerate(open(f,encoding='utf-8'),1):
        l=l.rstrip('\n')
        if not l.strip():continue
        if l.startswith('## '):cat=l[3:];cnt[cat]=0;continue
        p=[x.strip() for x in l.split('|')]
        if len(p)!=3 or '=' not in p[0]:print(f,n,'FORMAT',l);bad+=1;continue
        w,de=[x.strip() for x in p[0].split('=',1)]
        cnt[cat]+=1
        if w in seen:print(f,n,'DUP',w);bad+=1
        seen[w]=1
        if not re.search(r'(?<![A-Za-z])'+re.escape(w)+r'(?![A-Za-z])',p[1],re.I):print(f,n,'NOTINSENT',w,'|',p[1]);bad+=1
        if len(re.findall(r'\[[^\]]+\]',p[2]))!=1:print(f,n,'SLOT',p[2]);bad+=1
        elif re.search(r'\w\[|\]\w',p[2]):print(f,n,'SLOTPART',p[2]);bad+=1
        if re.search(r'[…–—’“”"]',l):print(f,n,'CHARS',l);bad+=1
print(cnt,'total',sum(cnt.values()),'bad',bad)
