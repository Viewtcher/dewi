import re
src=open('app.src.html',encoding='utf-8').read()
# Dateien einbinden: /*@include pfad*/ wird durch den Dateiinhalt ersetzt
src=re.sub(r'/\*@include ([\w./-]+)\*/',lambda m:'/* ===== '+m.group(1)+' ===== */\n'+open(m.group(1),encoding='utf-8').read().rstrip()+'\n',src)
m=re.match(r'\s*(<title>.*?</title>)\s*(<link[^>]*>)\s*(<style>.*?</style>)\s*(.*)$',src,re.S)
title,link,style,body=m.groups()
html=f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
{title}
<meta name="theme-color" content="#1a0f24">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="dewi.">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="icon.png">
<link rel="icon" href="icon.png">
{link}
{style}
</head>
<body>
{body}
</body>
</html>
'''
open('index.html','w',encoding='utf-8').write(html)
# icon.png entsteht separat: node data/make_icon.js (Dewi aus der App-Grafik, iOS rundet die Ecken selbst)
print('gebaut',len(html)//1024,'KB')
