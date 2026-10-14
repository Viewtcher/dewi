import re
p='app.src.html';s=open(p).read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:70]);s=s.replace(old,new)

# 1) Markup: Tab-Beschriftungen übersetzbar
for lab,key in (('Heute','Heute'),('Vokabelheft','Vokabelheft'),('Einstellungen','Einstellungen')):
    rep('</svg>%s</button>'%lab,'</svg><span class="tl" data-k="%s">%s</span></button>'%(key,lab))

# 2) Daten + Helfer nach dem Sätze-Parser
de=''.join(open('data/de%d.txt'%i).read().rstrip('\n')+'\n' for i in (1,2,3))
assert '`' not in de and '${' not in de
EN={
'Heute':'Today','Vokabelheft':'Wordbook','Einstellungen':'Settings','Hauptmenü':'Main menu','Abfrage':'Session',
'Indonesisch':'Indonesian',
'Begrüßung & Höflichkeit':'Greetings & politeness','Pronomen & Fragewörter':'Pronouns & question words','Zahlen':'Numbers','Zeit & Wochentage':'Time & weekdays','Monate':'Months','Familie & Menschen':'Family & people','Essen & Trinken':'Food & drink','Verben':'Verbs','Adjektive & Mengenwörter':'Adjectives & quantities','Orte & Gebäude':'Places & buildings','Richtungen':'Directions','Reisen & Verkehr':'Travel & transport','Körper & Gesundheit':'Body & health','Kleidung & Farben':'Clothes & colors','Natur, Wetter & Tiere':'Nature, weather & animals','Haus & Alltag':'Home & daily life','Geld & Einkaufen':'Money & shopping','Arbeit & Schule':'Work & school','Kleine Wörter':'Small words','Sätze für den Alltag':'Everyday sentences',
'Welche Sprache lernst du?':'Which language are you learning?',
'„Kata“ heißt auf Indonesisch „Wort“. Dein Fortschritt bleibt auf diesem Gerät.':'“Kata” means “word” in Indonesian. Your progress stays on this device.',
'{0} Wörter':'{0} words','Weitere Sprachen lassen sich später ergänzen.':'More languages can be added later.',
'erledigt':'done','offen':'open','Heute dran':'Due today','Wiederholung':'review','Wiederholungen':'reviews','neue Vokabel':'new word','neue Vokabeln':'new words','aus der Fehlerliste':'from the error list','Abfrage starten':'Start session',
'Für heute geschafft.':'All done for today.','Heute ist nichts fällig.':'Nothing is due today.',
'Morgen kommt 1 Wiederholung dran.':'1 review is due tomorrow.','Morgen kommen {0} Wiederholungen dran.':'{0} reviews are due tomorrow.','Morgen steht noch keine Wiederholung an.':'No reviews are due tomorrow yet.',
'Noch eine neue Vokabel':'One more new word','Fehlerliste':'Error list','Wort':'word','Wörter':'words','zum Wiederholen.':'to review.',
'Eins davon ist heute Pflicht.':'One of them is mandatory today.','Die Pflicht für heute ist erledigt.':'Today’s mandatory word is done.','Ab morgen ist täglich ein Wort daraus Pflicht.':'From tomorrow, one word from it is mandatory every day.','Freiwillig weiter üben':'Keep practicing (optional)',
'Stufe {0}':'Level {0}','Noch neu':'Not started','Sprache wechseln':'Change language','Tag':'day','Tage':'days','in Folge':'in a row','Fortschritt':'Progress','{0} von {1} Wörtern begonnen':'{0} of {1} words started',
'Flamme: {0} {1} in Folge':'Flame: {0} {1} in a row',
'Suchen auf Indonesisch oder Deutsch':'Search in Indonesian or German','Suchen auf Indonesisch oder Englisch':'Search in Indonesian or English','Suchen':'Search','Filter':'Filter',
'Alle':'All','Fällig':'Due','Gelernt':'Learned','Neu':'New','Treffer':'matches','Nichts gefunden.':'Nothing found.','fällig':'due','Fehlerliste ×{0}':'Error list ×{0}','Stufe {0} von 5':'Level {0} of 5',
'App-Sprache':'App language','Gilt für die Oberfläche und für die Bedeutungen der Wörter.':'Applies to the interface and to the meanings of the words.',
'Neue Vokabeln pro Tag':'New words per day','Dazu kommen immer alle fälligen Wiederholungen und ein Wort aus der Fehlerliste.':'All due reviews and one word from the error list are always added.',
'Tägliche Erinnerung':'Daily reminder','Eine Web-App kann sich nicht selbst melden. Das übernimmt dein iPhone, die Uhrzeit stellst du dort ein.':'A web app cannot notify you by itself. Your iPhone does that; you set the time there.',
'So richtest du sie ein':'How to set it up',
'Kurzbefehle-App öffnen, Tab „Automation“, „+“, „Tageszeit“.':'Open the Shortcuts app, go to the “Automation” tab, tap “+”, then “Time of Day”.',
'Uhrzeit wählen, „Täglich“, „Sofort ausführen“.':'Choose a time, “Daily”, “Run Immediately”.',
'Aktion „URL öffnen“ mit der Adresse dieser App hinzufügen.':'Add the action “Open URL” with this app’s address.',
'Je nach iOS-Version musst du die Mitteilung antippen oder das iPhone entsperren, damit sich die Seite öffnet.':'Depending on your iOS version you may need to tap the notification or unlock the iPhone for the page to open.',
'Alternative: In der Erinnerungen-App eine tägliche Erinnerung mit der Adresse als Link anlegen.':'Alternative: create a daily reminder in the Reminders app with the address as a link.',
'Sicherung':'Backup','Kopiere den Text in eine Notiz. Zum Wiederherstellen fügst du ihn unten ein.':'Copy the text into a note. To restore, paste it below.',
'Sicherung erstellen':'Create backup','Kopieren':'Copy','Sicherung hier einfügen':'Paste backup here','Sicherung einspielen':'Restore backup',
'Wirklich ersetzen? Nochmal tippen':'Really replace? Tap again','Das ist keine gültige Sicherung.':'This is not a valid backup.','Kopiert.':'Copied.','Text ist markiert. Jetzt manuell kopieren.':'Text is selected. Copy it manually now.',
'Lernsprache':'Learning language','{0} ändern':'Change {0}','Testen':'Testing',
'Simuliert einen späteren Tag, damit du die Wiederholungen siehst. Aktuelles Datum in der App:':'Simulates a later day so you can see the reviews. Current date in the app:',
'Einen Tag vorspulen':'Skip one day ahead','Zurück auf heute':'Back to today','Alles zurücksetzen':'Reset everything','Wirklich alles löschen? Nochmal tippen':'Really delete everything? Tap again',
'Abfrage beenden':'End session','Kennenlernen':'Getting to know','Satz-Übung':'Sentence exercise','Tippen':'Typing',
'Neue Vokabel · Phase {0} von {1}':'New word · phase {0} of {1}','Wiederholung · Stufe {0}':'Review · level {0}',
'ins Deutsche':'into German','ins Englische':'into English','ins Indonesische':'into Indonesian',
'Präg dir das Wort und den Satz ein. Gleich wendest du es an.':'Memorize the word and the sentence. You will use it in a moment.','Weiter':'Next',
'Was bedeutet das markierte Wort?':'What does the highlighted word mean?','Richtig':'Correct','Nicht ganz':'Not quite','Bausteine':'Building blocks',
'Setze den Satz aus den Bausteinen zusammen. Du hast einen Versuch.':'Build the sentence from the blocks. You have one try.','Dein Satz':'Your sentence','Prüfen':'Check',
'Deine Antwort':'Your answer','Antwort tippen':'Type your answer','Versuche übrig':'tries left',
'Nicht ganz. Noch 1 Versuch.':'Not quite. 1 try left.','Nicht ganz. Noch {0} Versuche.':'Not quite. {0} tries left.',' Tipp: beginnt mit „{0}“.':' Hint: starts with “{0}”.',
'Leider falsch':'Wrong','Auch richtig: {0}':'Also correct: {0}',
'Geschafft. Das Wort verlässt die Fehlerliste und kommt morgen wieder (Stufe 1).':'Done. The word leaves the error list and comes back tomorrow (level 1).',
'Stufe {0} von 5. Nächste Wiederholung morgen.':'Level {0} of 5. Next review tomorrow.','Stufe {0} von 5. Nächste Wiederholung in {1} Tagen.':'Level {0} of 5. Next review in {1} days.',
'Das Wort bleibt auf der Fehlerliste (Fehler: {0}).':'The word stays on the error list (errors: {0}).',
'Eine Übung davor war falsch.':'An earlier exercise was wrong.','Das Wort kommt auf die Fehlerliste.':'The word goes on the error list.',
'Gerettet!':'Rescued!','Neues Wort!':'New word!','Level up!':'Level up!','Stufe gehalten':'Level kept',
'Stufe {0} von 5 · nächste Wiederholung morgen':'Level {0} of 5 · next review tomorrow','Stufe {0} von 5 · nächste Wiederholung in {1} Tagen':'Level {0} of 5 · next review in {1} days',
'Abfrage beendet':'Session finished','{0} von {1}':'{0} of {1}','komplett richtig beantwortet':'answered fully correct','Serie verlängert!':'Streak extended!','Die Serie läuft weiter.':'Your streak continues.',
'Von der Fehlerliste gestrichen:':'Removed from the error list:','Neu auf der Fehlerliste:':'New on the error list:','Fertig':'Done',
}
import json
helpers='''
/* Deutsche Bedeutungen und Beispielsätze: Wort | deutsche Bedeutung | deutscher Satz, [Klammer] = deutsches Gegenstück des Wortes */
const DE_RAW=`
'''+de+'''`;
const DE={};
DE_RAW.split('\\n').forEach(l=>{
  const q=l.replace(/\\s*\\|\\s*$/,'').split(' | ');if(q.length<2)return;
  DE[q[0].trim().toLowerCase()]={g:q[1].trim(),tpl:q[2]?q[2].trim():''};
});
Object.values(LANGS).forEach(L=>L.words.forEach(w=>{const d=DE[w.k];w.de=d?d.g:w.en;}));
Object.keys(SENT).forEach(k=>{const d=DE[k];if(d&&d.tpl){SENT[k].det=d.tpl;SENT[k].de=d.tpl.replace(/[\\[\\]]/g,'');}});

/* ---------- Sprache der App (de / en) ---------- */
const EN=%s;
function t(s){
  let r=s;if(state.ui==='en'&&EN[s]!==undefined)r=EN[s];
  if(arguments.length<2)return r;
  const a=arguments;return r.replace(/\\{(\\d)\\}/g,(m,i)=>a[+i+1]);
}
const detectUi=()=>{try{return /^de/i.test(navigator.language||'de')?'de':'en';}catch(e){return 'de';}};
const gl=w=>state.ui==='de'?w.de:w.en;                 // Bedeutung in der gewählten Sprache
const glFirst=w=>gl(w).split(' / ')[0].trim();
function sentOf(w){
  const s=SENT[w.k];if(!s)return null;
  if(state.ui==='de')return s.det?{id:s.id,tpl:s.det,plain:s.de}:null;
  return {id:s.id,tpl:s.tpl,plain:s.en};
}
''' % json.dumps(EN,ensure_ascii=False)
rep("/* ---------- Hilfsfunktionen ---------- */",helpers+"\n/* ---------- Hilfsfunktionen ---------- */")
# normDe nach normEn
rep("const pad=n=>String(n).padStart(2,'0');","""function normDe(s){
  s=s.toLowerCase().replace(/\\([^)]*\\)/g,' ').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');
  s=s.replace(/[^a-z0-9 ]/g,' ').replace(/\\s+/g,' ').trim();
  return s.replace(/^(der|die|das|ein|eine|einen|einem|einer) (?=\\S)/,'');
}
const normG=s=>state.ui==='de'?normDe(s):normEn(s);
const pad=n=>String(n).padStart(2,'0');""")
rep("const dayName=(s,o)=>parse(s).toLocaleDateString('de-DE',o);","const dayName=(s,o)=>parse(s).toLocaleDateString(state.ui==='en'?'en-GB':'de-DE',o);")
# 3) Zustand
rep("const defaults=()=>({v:2,lang:null,","const defaults=()=>({v:2,lang:null,ui:null,")
rep("  if(!state.daily.lt)state.daily.lt=[];\n  state.v=2;","  if(!state.daily.lt)state.daily.lt=[];\n  if(!state.ui&&state.lang)state.ui=detectUi();   // bestehende Nutzer: Sprache des Handys, ohne Nachfrage\n  state.v=2;")
rep('aria-label="Flamme: ${streak} ${streak===1?\'Tag\':\'Tage\'} in Folge"','aria-label="${t(\'Flamme: {0} {1} in Folge\',streak,streak===1?t(\'Tag\'):t(\'Tage\'))}"')
# 4) Oberfläche + Abfrage ersetzen
a=s.index("/* ---------- Oberfläche ---------- */");b=s.index("\nrender();\n})();")
s=s[:a]+open('data/ui_new.js').read()+s[b:]
# 5) CSS
rep(".langrow .code{",".langrow.sug{border-color:var(--accent)}\n.langrow .code{")
rep(".seg button{min-height:48px;",".seg.two{grid-template-columns:1fr 1fr}\n.seg button{min-height:48px;")
open(p,'w').write(s)
print('ok',len(s))
